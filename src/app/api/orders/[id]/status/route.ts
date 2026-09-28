import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/middleware';
import { v4 as uuid } from 'uuid';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(params.id) as { id: string; user_id: string; status: string } | undefined;
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Permissions: admin, superadmin, editor or seller
    const isStaff = ['admin', 'superadmin', 'editor'].includes(user.role);
    let isSeller = false;
    if (user.role === 'seller') {
      const sellerItem = db.prepare(`
        SELECT oi.id FROM order_items oi
        JOIN sellers s ON oi.seller_id = s.id
        WHERE oi.order_id = ? AND s.user_id = ?
        LIMIT 1
      `).get(params.id, user.userId);
      if (sellerItem) isSeller = true;
    }

    if (!isStaff && !isSeller) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { status, note } = body;
    const validStatuses = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    const now = new Date().toISOString().replace('T', ' ').split('.')[0];

    db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?').run(status, now, params.id);

    db.prepare(`
      INSERT INTO order_status_history (id, order_id, status, note, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(uuid(), params.id, status, note || `Status changed to ${status}`, user.userId, now);

    // Create notification for customer
    db.prepare(`
      INSERT INTO notifications (id, user_id, title_en, title_mr, message_en, message_mr, type, link, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'order', ?, ?)
    `).run(
      uuid(),
      order.user_id,
      `Order Status: ${status.toUpperCase()}`,
      `ऑर्डर स्थिती: ${status.toUpperCase()}`,
      `Your POPTO lemon order #${params.id.slice(0, 8)} is now ${status}.`,
      `तुमची POPTO लिंबू ऑर्डर #${params.id.slice(0, 8)} आता ${status} आहे.`,
      `/account/orders`,
      now
    );

    return NextResponse.json({ success: true, message: `Order updated to ${status}` });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
