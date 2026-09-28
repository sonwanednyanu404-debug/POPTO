import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { getDb } = await import('@/lib/db');
    const db = getDb();

    const fullUser = db.prepare(
      'SELECT id, email, full_name, mobile, role, avatar_url, email_verified, is_active, preferred_language, created_at FROM users WHERE id = ?'
    ).get(user.userId) as Record<string, unknown> | undefined;

    if (!fullUser || !fullUser.is_active) {
      return NextResponse.json({ error: 'Account not found or deactivated' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: fullUser.id,
        email: fullUser.email,
        full_name: fullUser.full_name,
        mobile: fullUser.mobile,
        role: fullUser.role,
        avatar_url: fullUser.avatar_url,
        email_verified: !!fullUser.email_verified,
        preferred_language: fullUser.preferred_language,
        created_at: fullUser.created_at,
      },
    });
  } catch (error) {
    console.error('Auth/me error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
