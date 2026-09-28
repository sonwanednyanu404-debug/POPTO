import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { parseUserAgent } from '@/lib/auth/middleware';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const db = getDb();
    const ua = req.headers.get('user-agent') || '';
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const { device, browser, os } = parseUserAgent(ua);
    const now = new Date().toISOString().replace('T', ' ').split('.')[0];

    const user = db.prepare(
      'SELECT id, email, password_hash, full_name, mobile, role, avatar_url, email_verified, is_active, preferred_language, force_password_change, created_at FROM users WHERE email = ?'
    ).get(email.toLowerCase()) as Record<string, unknown> | undefined;

    if (!user) {
      // Log failed login
      db.prepare(
        `INSERT INTO login_activity (id, user_id, email, action, status, ip_address, user_agent, device_type, browser, os, created_at)
         VALUES (?, NULL, ?, 'failed_login', 'failed', ?, ?, ?, ?, ?, ?)`
      ).run(uuid(), email.toLowerCase(), ip, ua, device, browser, os, now);

      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (!user.is_active) {
      return NextResponse.json({ error: 'Account is deactivated. Please contact support.' }, { status: 403 });
    }

    if (!verifyPassword(password, user.password_hash as string)) {
      // Log failed login
      db.prepare(
        `INSERT INTO login_activity (id, user_id, email, role, action, status, ip_address, user_agent, device_type, browser, os, created_at)
         VALUES (?, ?, ?, ?, 'failed_login', 'failed', ?, ?, ?, ?, ?, ?)`
      ).run(uuid(), user.id, email.toLowerCase(), user.role, ip, ua, device, browser, os, now);

      // Log security event for repeated failures
      const recentFails = db.prepare(
        `SELECT COUNT(*) as count FROM login_activity WHERE email = ? AND action = 'failed_login' AND created_at > datetime('now', '-1 hour')`
      ).get(email.toLowerCase()) as { count: number };

      if (recentFails.count >= 5) {
        db.prepare(
          `INSERT INTO security_events (id, user_id, event_type, description, severity, ip_address, created_at)
           VALUES (?, ?, 'multiple_failed_logins', ?, 'warning', ?, ?)`
        ).run(uuid(), user.id, `${recentFails.count} failed login attempts in the last hour`, ip, now);
      }

      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Log successful login
    db.prepare(
      `INSERT INTO login_activity (id, user_id, email, role, action, status, ip_address, user_agent, device_type, browser, os, country, created_at)
       VALUES (?, ?, ?, ?, 'login', 'success', ?, ?, ?, ?, ?, 'India', ?)`
    ).run(uuid(), user.id, email.toLowerCase(), user.role, ip, ua, device, browser, os, now);

    // Update last login
    db.prepare('UPDATE users SET updated_at = ? WHERE id = ?').run(now, user.id);

    const token = signToken({
      userId: user.id as string,
      email: user.email as string,
      role: user.role as string,
      fullName: user.full_name as string,
    });

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        mobile: user.mobile,
        avatar_url: user.avatar_url,
        email_verified: !!user.email_verified,
        preferred_language: user.preferred_language,
        force_password_change: !!user.force_password_change,
      },
    });

    response.cookies.set('popto_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
