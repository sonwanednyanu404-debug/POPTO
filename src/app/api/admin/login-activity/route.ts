import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const db = getDb();
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all';
    const search = searchParams.get('search') || searchParams.get('q') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';
    const isExport = searchParams.get('export') === 'csv';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25')));

    let where = 'WHERE 1=1';
    const params: unknown[] = [];

    if (search.trim()) {
      const term = `%${search.trim()}%`;
      where += ` AND (la.email LIKE ? OR la.ip_address LIKE ? OR la.device_type LIKE ? OR la.browser LIKE ? OR la.os LIKE ? OR la.id LIKE ? OR u.full_name LIKE ?)`;
      params.push(term, term, term, term, term, term, term);
    }

    if (filter === 'today') {
      where += ` AND la.created_at LIKE ?`;
      params.push(`${new Date().toISOString().split('T')[0]}%`);
    } else if (filter === '7days') {
      where += ` AND la.created_at > datetime('now', '-7 days')`;
    } else if (filter === '30days') {
      where += ` AND la.created_at > datetime('now', '-30 days')`;
    }

    if (status === 'success' || filter === 'success') {
      where += ` AND la.status = 'success'`;
    } else if (status === 'failed' || filter === 'failed') {
      where += ` AND la.status = 'failed'`;
    }

    if (role) {
      where += ` AND la.role = ?`;
      params.push(role);
    }

    // Explicit columns selection - NEVER include password or password hashes
    const selectCols = `
      la.id,
      la.user_id,
      la.email,
      la.role,
      la.action,
      la.status,
      la.ip_address,
      la.user_agent,
      la.device_type,
      la.browser,
      la.os,
      la.country,
      la.created_at,
      u.full_name
    `;

    if (isExport) {
      const allRows = db.prepare(`
        SELECT ${selectCols}
        FROM login_activity la
        LEFT JOIN users u ON la.user_id = u.id
        ${where}
        ORDER BY la.created_at DESC
        LIMIT 1000
      `).all(...params) as any[];

      const headers = ['Event ID', 'Email', 'Full Name', 'Role', 'Action', 'Status', 'IP Address', 'Device Type', 'OS', 'Browser', 'Date & Time'];
      const csvLines = [headers.join(',')];

      for (const row of allRows) {
        const safe = (val: unknown) => `"${String(val ?? '').replace(/"/g, '""')}"`;
        csvLines.push([
          safe(row.id),
          safe(row.email),
          safe(row.full_name || ''),
          safe(row.role || 'Unauthenticated'),
          safe(row.action),
          safe(row.status?.toUpperCase()),
          safe(row.ip_address),
          safe(row.device_type || 'Desktop'),
          safe(row.os || 'Windows'),
          safe(row.browser || 'Browser'),
          safe(row.created_at)
        ].join(','));
      }

      return new NextResponse(csvLines.join('\n'), {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="popto-login-activity.csv"',
        },
      });
    }

    const { total } = db.prepare(`
      SELECT COUNT(*) as total
      FROM login_activity la
      LEFT JOIN users u ON la.user_id = u.id
      ${where}
    `).get(...params) as { total: number };

    const activity = db.prepare(`
      SELECT ${selectCols}
      FROM login_activity la
      LEFT JOIN users u ON la.user_id = u.id
      ${where}
      ORDER BY la.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, (page - 1) * limit);

    return NextResponse.json({
      success: true,
      data: activity,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit
    });
  } catch (error) {
    console.error('Login activity error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
