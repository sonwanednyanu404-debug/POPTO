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
    const items = db.prepare(`
      SELECT ci.*, p.name_en, p.name_mr, p.price, p.compare_price, p.unit, p.stock, p.is_active,
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image,
        s.farm_name, s.district as seller_district
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN sellers s ON p.seller_id = s.id
      WHERE ci.user_id = ? AND ci.saved_for_later = 0
      ORDER BY ci.created_at DESC
    `).all(user.userId);

    const saved = db.prepare(`
      SELECT ci.*, p.name_en, p.name_mr, p.price, p.unit, p.stock,
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ? AND ci.saved_for_later = 1
    `).all(user.userId);

    return NextResponse.json({ success: true, items, saved });
  } catch (error) {
    console.error('Cart GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { productId, quantity = 1 } = await req.json();
    const db = getDb();

    const product = db.prepare('SELECT id, stock, is_active FROM products WHERE id = ?').get(productId) as Record<string, unknown> | undefined;
    if (!product || !product.is_active) return NextResponse.json({ error: 'Product not available' }, { status: 400 });
    if ((product.stock as number) < quantity) return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });

    const existing = db.prepare('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?').get(user.userId, productId) as Record<string, unknown> | undefined;
    const now = new Date().toISOString().replace('T', ' ').split('.')[0];

    if (existing) {
      db.prepare('UPDATE cart_items SET quantity = quantity + ?, saved_for_later = 0, updated_at = ? WHERE id = ?').run(quantity, now, existing.id);
    } else {
      db.prepare('INSERT INTO cart_items (id, user_id, product_id, quantity, saved_for_later, created_at, updated_at) VALUES (?,?,?,?,0,?,?)').run(uuid(), user.userId, productId, quantity, now, now);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cart POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { productId, quantity, savedForLater } = await req.json();
    const db = getDb();
    const now = new Date().toISOString().replace('T', ' ').split('.')[0];

    if (quantity !== undefined) {
      if (quantity <= 0) {
        db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(user.userId, productId);
      } else {
        db.prepare('UPDATE cart_items SET quantity = ?, updated_at = ? WHERE user_id = ? AND product_id = ?').run(quantity, now, user.userId, productId);
      }
    }

    if (savedForLater !== undefined) {
      db.prepare('UPDATE cart_items SET saved_for_later = ?, updated_at = ? WHERE user_id = ? AND product_id = ?').run(savedForLater ? 1 : 0, now, user.userId, productId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cart PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
