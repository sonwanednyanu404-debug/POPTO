import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || !['admin', 'superadmin', 'editor'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const db = getDb();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let sql = `
      SELECT o.*, u.full_name as customer_name, u.email as customer_email, u.mobile as customer_mobile
      FROM orders o
      JOIN users u ON o.user_id = u.id
    `;
    const params: (string | number)[] = [];

    if (status && status !== 'all') {
      sql += ' WHERE o.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const orders = db.prepare(sql).all(...params) as any[];

    // Attach items for each order
    const getItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
    for (const ord of orders) {
      ord.items = getItems.all(ord.id);
    }

    let countSql = 'SELECT COUNT(*) as c FROM orders';
    const countParams: string[] = [];
    if (status && status !== 'all') {
      countSql += ' WHERE status = ?';
      countParams.push(status);
    }
    const total = (db.prepare(countSql).get(...countParams) as { c: number }).c;

    return NextResponse.json({
      success: true,
      data: orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
