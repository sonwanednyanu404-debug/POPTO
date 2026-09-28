import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/middleware';
import { v4 as uuid } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    let tickets;

    if (['admin', 'superadmin', 'editor'].includes(user.role)) {
      tickets = db.prepare(`
        SELECT st.*, u.full_name as user_name, u.email as user_email
        FROM support_tickets st
        JOIN users u ON st.user_id = u.id
        ORDER BY st.created_at DESC
        LIMIT 100
      `).all();
    } else {
      tickets = db.prepare(`
        SELECT * FROM support_tickets
        WHERE user_id = ?
        ORDER BY created_at DESC
      `).all(user.userId);
    }

    return NextResponse.json({ success: true, data: tickets });
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { subject, message, orderId, priority = 'normal' } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    const db = getDb();
    const ticketId = uuid();
    const now = new Date().toISOString().replace('T', ' ').split('.')[0];

    db.prepare(`
      INSERT INTO support_tickets (id, user_id, order_id, subject, message, priority, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'open', ?, ?)
    `).run(ticketId, user.userId, orderId || null, subject, message, priority, now, now);

    return NextResponse.json({
      success: true,
      message: 'Support ticket submitted successfully. Our team will respond shortly.',
      data: { id: ticketId, subject, status: 'open' },
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
