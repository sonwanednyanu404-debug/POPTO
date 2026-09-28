import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { parseUserAgent } from '@/lib/auth/middleware';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, mobile, password } = await req.json();

    // Validation
    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'Full name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    if (mobile && !/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json({ error: 'Invalid Indian mobile number' }, { status: 400 });
    }

    const db = getDb();

    // Check if email exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const userId = uuid();
    const passwordHash = hashPassword(password);
    const now = new Date().toISOString().replace('T', ' ').split('.')[0];

    db.prepare(
      `INSERT INTO users (id, email, password_hash, full_name, mobile, role, email_verified, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, 'customer', 0, 1, ?, ?)`
    ).run(userId, email.toLowerCase(), passwordHash, fullName, mobile || null, now, now);

    // Log activity
    const ua = req.headers.get('user-agent') || '';
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const { device, browser, os } = parseUserAgent(ua);
    
    db.prepare(
      `INSERT INTO login_activity (id, user_id, email, role, action, status, ip_address, user_agent, device_type, browser, os, country, created_at)
       VALUES (?, ?, ?, 'customer', 'account_creation', 'success', ?, ?, ?, ?, ?, 'India', ?)`
    ).run(uuid(), userId, email.toLowerCase(), ip, ua, device, browser, os, now);

    const token = signToken({ userId, email: email.toLowerCase(), role: 'customer', fullName });

    const response = NextResponse.json({
      success: true,
      token,
      user: { id: userId, email: email.toLowerCase(), full_name: fullName, role: 'customer', mobile },
    });

    // Set cookie
    response.cookies.set('popto_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
