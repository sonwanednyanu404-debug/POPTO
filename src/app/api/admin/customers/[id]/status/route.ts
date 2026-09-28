import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/middleware';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { isActive } = body;

    const db = getDb();
    const targetUser = db.prepare('SELECT id, role FROM users WHERE id = ?').get(params.id) as { id: string; role: string } | undefined;
    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (targetUser.role === 'superadmin') {
      return NextResponse.json({ error: 'Cannot deactivate superadmin' }, { status: 400 });
    }

    const now = new Date().toISOString().replace('T', ' ').split('.')[0];
    db.prepare('UPDATE users SET is_active = ?, updated_at = ? WHERE id = ?').run(isActive ? 1 : 0, now, params.id);

    return NextResponse.json({
      success: true,
      message: `Customer ${isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    console.error('Error updating customer status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
