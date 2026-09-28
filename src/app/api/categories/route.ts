import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const categories = db.prepare('SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC').all();
    return NextResponse.json({ success: true, data: categories });
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
