import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthUser, parseUserAgent } from '@/lib/auth/middleware';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { v4 as uuid } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
    }

    const db = getDb();
    const dbUser = db.prepare('SELECT id, password_hash, email, role FROM users WHERE id = ?').get(user.userId) as {
      id: string;
      password_hash: string;
      email: string;
      role: string;
    } | undefined;

    if (!dbUser || !verifyPassword(currentPassword, dbUser.password_hash)) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
    }

    const newHash = hashPassword(newPassword);
    const now = new Date().toISOString().replace('T', ' ').split('.')[0];
    db.prepare('UPDATE users SET password_hash = ?, force_password_change = 0, updated_at = ? WHERE id = ?').run(newHash, now, user.userId);

    // Real security logging
    const ua = req.headers.get('user-agent') || '';
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const { device, browser, os } = parseUserAgent(ua);

    db.prepare(
      `INSERT INTO login_activity (id, user_id, email, role, action, status, ip_address, user_agent, device_type, browser, os, created_at)
       VALUES (?, ?, ?, ?, 'password_change', 'success', ?, ?, ?, ?, ?, ?)`
    ).run(uuid(), user.userId, dbUser.email, dbUser.role, ip, ua, device, browser, os, now);

    db.prepare(
      `INSERT INTO security_events (id, user_id, event_type, description, severity, ip_address, created_at)
       VALUES (?, ?, 'password_change', 'User successfully changed password', 'info', ?, ?)`
    ).run(uuid(), user.userId, ip, now);

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
