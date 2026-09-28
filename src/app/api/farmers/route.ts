import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const sellers = db.prepare(`
      SELECT s.*, u.full_name as name, u.avatar_url,
        (SELECT COUNT(*) FROM products WHERE seller_id = s.id AND is_active = 1) as product_count
      FROM sellers s JOIN users u ON s.user_id = u.id
      WHERE s.is_approved = 1
      ORDER BY s.rating DESC
      LIMIT ? OFFSET ?
    `).all(limit, (page - 1) * limit);

    const total = (db.prepare('SELECT COUNT(*) as c FROM sellers WHERE is_approved = 1').get() as {c:number}).c;

    return NextResponse.json({ success: true, data: sellers, total });
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
