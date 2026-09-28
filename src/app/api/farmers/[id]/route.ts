import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const farmer = db.prepare(`
      SELECT s.*, u.full_name as name, u.avatar_url, u.email
      FROM sellers s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ? OR s.user_id = ?
    `).get(params.id, params.id) as Record<string, unknown> | undefined;

    if (!farmer) {
      return NextResponse.json({ error: 'Farmer not found' }, { status: 404 });
    }

    const products = db.prepare(`
      SELECT p.*,
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM products p
      WHERE p.seller_id = ? AND p.is_active = 1
      ORDER BY p.created_at DESC
    `).all(farmer.id);

    return NextResponse.json({
      success: true,
      data: {
        ...farmer,
        products,
      },
    });
  } catch (error) {
    console.error('Error fetching farmer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
