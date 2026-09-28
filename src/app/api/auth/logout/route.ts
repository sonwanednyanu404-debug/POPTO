import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, parseUserAgent } from '@/lib/auth/middleware';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    
    if (user) {
      const { getDb } = await import('@/lib/db');
      const db = getDb();
      const ua = req.headers.get('user-agent') || '';
      const ip = req.headers.get('x-forwarded-for') || 'unknown';
      const { device, browser, os } = parseUserAgent(ua);
      const now = new Date().toISOString().replace('T', ' ').split('.')[0];
      
      db.prepare(
        `INSERT INTO login_activity (id, user_id, email, role, action, status, ip_address, user_agent, device_type, browser, os, created_at)
         VALUES (?, ?, ?, ?, 'logout', 'success', ?, ?, ?, ?, ?, ?)`
      ).run(uuid(), user.userId, user.email, user.role, ip, ua, device, browser, os, now);
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    response.cookies.set('popto_token', '', { path: '/', maxAge: 0 });
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    const response = NextResponse.json({ success: true });
    response.cookies.set('popto_token', '', { path: '/', maxAge: 0 });
    return response;
  }
}
