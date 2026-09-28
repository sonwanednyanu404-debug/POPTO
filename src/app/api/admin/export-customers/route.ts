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
    const customers = db.prepare(`
      SELECT u.id, u.email, u.full_name, u.mobile, u.role, u.is_active, u.created_at,
             COUNT(DISTINCT o.id) as total_orders,
             COALESCE(SUM(o.total_amount), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `).all() as any[];

    // Generate CSV
    const headers = ['User ID', 'Full Name', 'Email', 'Mobile', 'Role', 'Status', 'Total Orders', 'Total Spent (INR)', 'Registered At'];
    const rows = customers.map((c) => [
      c.id,
      `"${(c.full_name || '').replace(/"/g, '""')}"`,
      `"${c.email}"`,
      c.mobile || '',
      c.role,
      c.is_active ? 'Active' : 'Inactive',
      c.total_orders,
      c.total_spent,
      c.created_at,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="popto-customers.csv"',
      },
    });
  } catch (error) {
    console.error('Error exporting customers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
