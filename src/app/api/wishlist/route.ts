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
      SELECT w.*, p.name_en, p.name_mr, p.price, p.compare_price, p.unit, p.stock, p.rating, p.is_active,
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image,
        s.farm_name, s.district as seller_district
      FROM wishlists w JOIN products p ON w.product_id = p.id LEFT JOIN sellers s ON p.seller_id = s.id
      WHERE w.user_id = ? ORDER BY w.created_at DESC
    `).all(user.userId);
    return NextResponse.json({ success: true, items });
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { productId } = await req.json();
    const db = getDb();
    const exists = db.prepare('SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?').get(user.userId, productId);
    if (exists) return NextResponse.json({ success: true, message: 'Already in wishlist' });
    db.prepare('INSERT INTO wishlists (id, user_id, product_id, created_at) VALUES (?,?,?,?)').run(uuid(), user.userId, productId, new Date().toISOString().replace('T', ' ').split('.')[0]);
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { productId } = await req.json();
    const db = getDb();
    db.prepare('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?').run(user.userId, productId);
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
