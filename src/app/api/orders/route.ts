import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/middleware';
import { v4 as uuid } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    let orders: unknown[];

    if (['admin', 'superadmin'].includes(user.role)) {
      // Admin sees authorized orders
      orders = db.prepare(`
        SELECT o.*, 
          (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
          u.full_name as customer_name, u.email as customer_email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
      `).all();
    } else if (user.role === 'seller') {
      // Seller sees only permitted seller-related orders
      const seller = db.prepare('SELECT id FROM sellers WHERE user_id = ?').get(user.userId) as { id: string } | undefined;
      if (!seller) {
        orders = [];
      } else {
        orders = db.prepare(`
          SELECT DISTINCT o.*, 
            (SELECT COUNT(*) FROM order_items WHERE order_id = o.id AND seller_id = ?) as item_count,
            u.full_name as customer_name
          FROM orders o
          JOIN order_items oi ON oi.order_id = o.id
          JOIN users u ON o.user_id = u.id
          WHERE oi.seller_id = ?
          ORDER BY o.created_at DESC
        `).all(seller.id, seller.id);
      }
    } else {
      // Customer sees own orders only
      orders = db.prepare(`
        SELECT o.*, 
          (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
        FROM orders o WHERE o.user_id = ? ORDER BY o.created_at DESC
      `).all(user.userId);
    }

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { addressId, paymentMethod = 'cod', couponCode, deliveryMethod = 'standard' } = await req.json();
    const db = getDb();
    const now = new Date().toISOString().replace('T', ' ').split('.')[0];

    // Get cart items
    const cartItems = db.prepare(`
      SELECT ci.*, p.price, p.name_en, p.unit, p.stock, p.seller_id,
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
      FROM cart_items ci JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ? AND ci.saved_for_later = 0
    `).all(user.userId) as Record<string, unknown>[];

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Get address
    const address = db.prepare('SELECT * FROM addresses WHERE id = ? AND user_id = ?').get(addressId, user.userId) as Record<string, unknown> | undefined;
    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 400 });
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of cartItems) {
      if ((item.stock as number) < (item.quantity as number)) {
        return NextResponse.json({ error: `Insufficient stock for ${item.name_en}` }, { status: 400 });
      }
      subtotal += (item.price as number) * (item.quantity as number);
    }

    const deliveryFee = deliveryMethod === 'express' ? 60 : (subtotal >= 250 ? 0 : 40);
    let discount = 0;

    // Apply coupon
    if (couponCode) {
      const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(couponCode) as Record<string, unknown> | undefined;
      if (coupon) {
        if (coupon.expires_at && new Date(coupon.expires_at as string) < new Date()) {
          return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 });
        }
        if (coupon.min_order_amount && subtotal < (coupon.min_order_amount as number)) {
          return NextResponse.json({ error: `Minimum order amount is ₹${coupon.min_order_amount}` }, { status: 400 });
        }
        if (coupon.discount_type === 'percentage') {
          discount = subtotal * (coupon.discount_value as number) / 100;
        } else {
          discount = coupon.discount_value as number;
        }
        // Update coupon usage
        db.prepare('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?').run(coupon.id);
        db.prepare('INSERT INTO coupon_usage (id, coupon_id, user_id, created_at) VALUES (?,?,?,?)').run(uuid(), coupon.id, user.userId, now);
      }
    }

    const tax = Math.round((subtotal - discount) * 0.05 * 100) / 100; // 5% GST
    const total = Math.round((subtotal + deliveryFee - discount + tax) * 100) / 100;

    // Generate order number
    const orderCount = (db.prepare('SELECT COUNT(*) as c FROM orders').get() as { c: number }).c;
    const orderNumber = `POPTO-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, '0')}`;

    const orderId = uuid();

    // Create order
    db.prepare(`
      INSERT INTO orders (id, order_number, user_id, address_snapshot, subtotal, delivery_fee, discount, tax, total, status, payment_status, payment_method, coupon_code, created_at, updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(orderId, orderNumber, user.userId, JSON.stringify(address), subtotal, deliveryFee, discount, tax, total, 'pending', paymentMethod === 'cod' ? 'pending' : 'paid', paymentMethod, couponCode || null, now, now);

    // Create order items and update stock
    for (const item of cartItems) {
      db.prepare(`
        INSERT INTO order_items (id, order_id, product_id, seller_id, product_name, product_image, price, quantity, unit, total, created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
      `).run(uuid(), orderId, item.product_id, item.seller_id, item.name_en, item.image || null, item.price, item.quantity, item.unit, (item.price as number) * (item.quantity as number), now);

      db.prepare('UPDATE products SET stock = stock - ?, total_sold = total_sold + ? WHERE id = ?').run(item.quantity, item.quantity, item.product_id);
    }

    // Add status history
    db.prepare(`INSERT INTO order_status_history (id, order_id, status, note, created_by, created_at) VALUES (?,?,?,?,?,?)`).run(uuid(), orderId, 'pending', 'Order placed', user.userId, now);

    // Clear cart
    db.prepare('DELETE FROM cart_items WHERE user_id = ? AND saved_for_later = 0').run(user.userId);

    // Create notification
    db.prepare(`INSERT INTO notifications (id, user_id, title_en, title_mr, message_en, message_mr, type, link, created_at) VALUES (?,?,?,?,?,?,?,?,?)`).run(uuid(), user.userId, 'Order Placed', 'ऑर्डर दिली', `Your order ${orderNumber} has been placed successfully.`, `तुमची ऑर्डर ${orderNumber} यशस्वीरीत्या दिली गेली.`, 'order', `/account/orders/${orderId}`, now);

    return NextResponse.json({ success: true, data: { id: orderId, orderNumber } }, { status: 201 });
  } catch (error) {
    console.error('Order create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
