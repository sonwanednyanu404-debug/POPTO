import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/middleware';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user || !['admin', 'superadmin', 'editor'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const db = getDb();
    const customer = db.prepare(`
      SELECT id, email, full_name, mobile, role, is_active, preferred_language, email_verified, created_at, updated_at
      FROM users WHERE id = ?
    `).get(params.id);

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const addresses = db.prepare('SELECT * FROM addresses WHERE user_id = ?').all(params.id);
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(params.id);
    const loginActivity = db.prepare('SELECT * FROM login_activity WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(params.id);
    const wishlist = db.prepare(`
      SELECT w.*, p.name_en, p.name_mr, p.price, p.unit
      FROM wishlists w JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ?
    `).all(params.id);
    const reviews = db.prepare(`
      SELECT r.*, p.name_en as product_name
      FROM reviews r JOIN products p ON r.product_id = p.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `).all(params.id);

    const stats = db.prepare(`
      SELECT COUNT(*) as total_orders, COALESCE(SUM(total), 0) as total_spent FROM orders WHERE user_id = ?
    `).get(params.id) as { total_orders: number; total_spent: number };

    const lastLogin = db.prepare(`
      SELECT created_at FROM login_activity WHERE user_id = ? AND action = 'login' AND status = 'success' ORDER BY created_at DESC LIMIT 1
    `).get(params.id) as { created_at: string } | undefined;

    return NextResponse.json({
      success: true,
      data: {
        ...customer,
        total_orders: stats?.total_orders || 0,
        total_spent: stats?.total_spent || 0,
        last_login: lastLogin?.created_at || null,
        addresses,
        orders,
        loginActivity,
        wishlist,
        reviews,
      },
    });
  } catch (error) {
    console.error('Error fetching customer detail:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
