import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader, TokenPayload } from './jwt';
import { cookies } from 'next/headers';

export type Role = 'customer' | 'seller' | 'editor' | 'admin' | 'superadmin';

const ROLE_HIERARCHY: Record<Role, number> = {
  customer: 1,
  seller: 2,
  editor: 3,
  admin: 4,
  superadmin: 5,
};

export function hasRole(userRole: string, requiredRole: Role): boolean {
  return (ROLE_HIERARCHY[userRole as Role] || 0) >= ROLE_HIERARCHY[requiredRole];
}

export function hasExactRole(userRole: string, roles: Role[]): boolean {
  return roles.includes(userRole as Role);
}

// Extract user from request (from Authorization header or cookie)
export async function getAuthUser(req: NextRequest): Promise<TokenPayload | null> {
  // Try Authorization header first
  const authHeader = req.headers.get('authorization');
  const headerToken = getTokenFromHeader(authHeader);
  if (headerToken) {
    return verifyToken(headerToken);
  }

  // Try cookie
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get('popto_token')?.value;
  if (cookieToken) {
    return verifyToken(cookieToken);
  }

  return null;
}

// Middleware helper for protected API routes
export function requireAuth(allowedRoles?: Role[]) {
  return async (req: NextRequest): Promise<{ user: TokenPayload } | NextResponse> => {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (allowedRoles && !hasExactRole(user.role, allowedRoles)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return { user };
  };
}

// Parse user agent string for login activity
export function parseUserAgent(ua: string): { device: string; browser: string; os: string } {
  let device = 'Desktop';
  let browser = 'Unknown';
  let os = 'Unknown';

  // Device
  if (/Mobile|Android|iPhone|iPad/i.test(ua)) {
    device = /iPad|Tablet/i.test(ua) ? 'Tablet' : 'Mobile';
  }

  // Browser
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua)) browser = 'Safari';
  else if (/Opera|OPR/i.test(ua)) browser = 'Opera';

  // OS
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS/i.test(ua)) os = 'macOS';
  else if (/iPhone|iPad/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Linux/i.test(ua)) os = 'Linux';

  return { device, browser, os };
}
