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
    const today = new Date().toISOString().split('T')[0];

    const stats = {
      totalRevenue: (db.prepare("SELECT COALESCE(SUM(total), 0) as v FROM orders WHERE payment_status = 'paid'").get() as {v:number}).v,
      totalOrders: (db.prepare('SELECT COUNT(*) as v FROM orders').get() as {v:number}).v,
      totalCustomers: (db.prepare("SELECT COUNT(*) as v FROM users WHERE role = 'customer'").get() as {v:number}).v,
      totalFarmers: (db.prepare('SELECT COUNT(*) as v FROM sellers').get() as {v:number}).v,
      totalProducts: (db.prepare('SELECT COUNT(*) as v FROM products WHERE is_active = 1').get() as {v:number}).v,
      lowStockProducts: (db.prepare('SELECT COUNT(*) as v FROM products WHERE stock <= low_stock_threshold AND is_active = 1').get() as {v:number}).v,
      newCustomersToday: (db.prepare("SELECT COUNT(*) as v FROM users WHERE role = 'customer' AND created_at LIKE ?").get(`${today}%`) as {v:number}).v,
      todayOrders: (db.prepare('SELECT COUNT(*) as v FROM orders WHERE created_at LIKE ?').get(`${today}%`) as {v:number}).v,
      todayRevenue: (db.prepare("SELECT COALESCE(SUM(total), 0) as v FROM orders WHERE payment_status = 'paid' AND created_at LIKE ?").get(`${today}%`) as {v:number}).v,
      todayLogins: (db.prepare("SELECT COUNT(*) as v FROM login_activity WHERE action = 'login' AND status = 'success' AND created_at LIKE ?").get(`${today}%`) as {v:number}).v,
      failedLogins: (db.prepare("SELECT COUNT(*) as v FROM login_activity WHERE action = 'failed_login' AND created_at LIKE ?").get(`${today}%`) as {v:number}).v,
    };

    const recentOrders = db.prepare(`
      SELECT o.id, o.order_number, o.total, o.status, o.created_at, u.full_name as customer_name
      FROM orders o JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC LIMIT 5
    `).all();

    const recentLogins = db.prepare(`
      SELECT la.*, u.full_name FROM login_activity la 
      LEFT JOIN users u ON la.user_id = u.id 
      ORDER BY la.created_at DESC LIMIT 10
    `).all();

    // Revenue chart data (last 7 days)
    const revenueChart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayRevenue = (db.prepare("SELECT COALESCE(SUM(total), 0) as v FROM orders WHERE payment_status = 'paid' AND created_at LIKE ?").get(`${dateStr}%`) as {v:number}).v;
      const dayOrders = (db.prepare("SELECT COUNT(*) as v FROM orders WHERE created_at LIKE ?").get(`${dateStr}%`) as {v:number}).v;
      revenueChart.push({ date: dateStr, revenue: dayRevenue, orders: dayOrders });
    }

    // Online / recently active users (within last 15 minutes = online, 1 hour = recently active)
    const onlineUsers = db.prepare(`
      SELECT DISTINCT u.id, u.full_name, u.role, la.created_at as last_seen
      FROM login_activity la JOIN users u ON la.user_id = u.id
      WHERE la.action = 'login' AND la.status = 'success' AND la.created_at > datetime('now', '-15 minutes')
    `).all();

    const recentlyActiveUsers = db.prepare(`
      SELECT DISTINCT u.id, u.full_name, u.role, la.created_at as last_seen
      FROM login_activity la JOIN users u ON la.user_id = u.id
      WHERE la.action = 'login' AND la.status = 'success' AND la.created_at > datetime('now', '-1 hour')
      AND u.id NOT IN (SELECT DISTINCT user_id FROM login_activity WHERE action = 'login' AND status = 'success' AND created_at > datetime('now', '-15 minutes') AND user_id IS NOT NULL)
    `).all();

    return NextResponse.json({
      success: true,
      data: {
        stats,
        recentOrders,
        recentLogins,
        revenueChart,
        onlineUsers,
        recentlyActiveUsers,
      },
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
