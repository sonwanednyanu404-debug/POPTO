import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const addresses = db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC').all(user.userId);
    return NextResponse.json({ success: true, data: addresses });
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const db = getDb();
    const { v4: uuid } = await import('uuid');

    // Validate PIN code (6 digits)
    if (!/^\d{6}$/.test(body.pin_code)) {
      return NextResponse.json({ error: 'Invalid PIN code' }, { status: 400 });
    }
    // Validate mobile
    if (!/^[6-9]\d{9}$/.test(body.mobile)) {
      return NextResponse.json({ error: 'Invalid mobile number' }, { status: 400 });
    }

    const id = uuid();
    const now = new Date().toISOString().replace('T', ' ').split('.')[0];

    // If this is the first address or marked as default, clear other defaults
    if (body.is_default) {
      db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(user.userId);
    }

    const existingAddresses = db.prepare('SELECT COUNT(*) as c FROM addresses WHERE user_id = ?').get(user.userId) as {c:number};
    const isDefault = body.is_default || existingAddresses.c === 0 ? 1 : 0;

    db.prepare(`
      INSERT INTO addresses (id, user_id, full_name, mobile, house_flat, street, area, city, district, state, pin_code, is_default, created_at, updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(id, user.userId, body.full_name, body.mobile, body.house_flat || '', body.street || '', body.area || '', body.city, body.district, 'Maharashtra', body.pin_code, isDefault, now, now);

    return NextResponse.json({ success: true, data: { id } }, { status: 201 });
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
