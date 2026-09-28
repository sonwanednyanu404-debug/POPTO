import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const db = getDb();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const location = searchParams.get('location') || '';
    const isNew = searchParams.get('isNew') === '1';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    let where = "WHERE u.role = 'customer'";
    const params: unknown[] = [];

    if (search) {
      where += ` AND (u.full_name LIKE ? OR u.email LIKE ? OR u.mobile LIKE ? OR u.id LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status === 'active') where += ` AND u.is_active = 1`;
    if (status === 'inactive') where += ` AND u.is_active = 0`;
    if (status === 'verified') where += ` AND u.email_verified = 1`;
    if (status === 'unverified') where += ` AND u.email_verified = 0`;
    if (isNew) where += ` AND u.created_at >= datetime('now', '-7 days')`;
    if (location) {
      where += ` AND EXISTS (SELECT 1 FROM addresses a WHERE a.user_id = u.id AND (a.district LIKE ? OR a.city LIKE ?))`;
      params.push(`%${location}%`, `%${location}%`);
    }
    if (startDate) {
      where += ` AND u.created_at >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      where += ` AND u.created_at <= ?`;
      params.push(`${endDate} 23:59:59`);
    }

    const { total } = db.prepare(`SELECT COUNT(*) as total FROM users u ${where}`).get(...params) as { total: number };

    const customers = db.prepare(`
      SELECT u.id, u.full_name, u.email, u.mobile, u.email_verified, u.is_active, u.created_at, u.updated_at,
        (SELECT created_at FROM login_activity WHERE user_id = u.id AND action = 'login' AND status = 'success' ORDER BY created_at DESC LIMIT 1) as last_login,
        (SELECT city FROM addresses WHERE user_id = u.id AND is_default = 1 LIMIT 1) as city,
        (SELECT district FROM addresses WHERE user_id = u.id AND is_default = 1 LIMIT 1) as district,
        (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as total_orders,
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE user_id = u.id AND payment_status = 'paid') as total_spent,
        (SELECT COUNT(*) FROM wishlists WHERE user_id = u.id) as wishlist_count
      FROM users u ${where}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, (page - 1) * limit);

    return NextResponse.json({ success: true, data: customers, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Admin customers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
