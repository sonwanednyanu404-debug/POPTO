import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthUser, parseUserAgent } from '@/lib/auth/middleware';
import { v4 as uuid } from 'uuid';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized. Only Super Admin can change user roles.' }, { status: 403 });
    }

    const body = await req.json();
    const { role } = body;
    const allowedRoles = ['customer', 'seller', 'editor', 'admin', 'superadmin'];

    if (!role || !allowedRoles.includes(role)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${allowedRoles.join(', ')}` }, { status: 400 });
    }

    const db = getDb();
    const target = db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(params.id) as {
      id: string;
      email: string;
      role: string;
    } | undefined;

    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const oldRole = target.role;
    const now = new Date().toISOString().replace('T', ' ').split('.')[0];

    db.prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?').run(role, now, params.id);

    // If changing to seller, make sure sellers record exists
    if (role === 'seller') {
      const existingSeller = db.prepare('SELECT id FROM sellers WHERE user_id = ?').get(params.id);
      if (!existingSeller) {
        db.prepare(`
          INSERT INTO sellers (id, user_id, farm_name, district, is_approved, is_verified, created_at, updated_at)
          VALUES (?, ?, 'Maharashtra Lemon Grove', 'Solapur', 1, 1, ?, ?)
        `).run(uuid(), params.id, now, now);
      }
    }

    // Log role change in login_activity & audit_logs
    const ua = req.headers.get('user-agent') || '';
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const { device, browser, os } = parseUserAgent(ua);

    db.prepare(
      `INSERT INTO login_activity (id, user_id, email, role, action, status, ip_address, user_agent, device_type, browser, os, country, created_at)
       VALUES (?, ?, ?, ?, 'role_changed', 'success', ?, ?, ?, ?, ?, 'India', ?)`
    ).run(uuid(), target.id, target.email, role, ip, ua, device, browser, os, now);

    db.prepare(
      `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, created_at)
       VALUES (?, ?, 'role_change', 'user', ?, ?, ?, ?, ?)`
    ).run(uuid(), user.userId, target.id, oldRole, role, ip, now);

    return NextResponse.json({ success: true, message: `User role updated from ${oldRole} to ${role}` });
  } catch (error) {
    console.error('Role update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
