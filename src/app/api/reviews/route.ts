import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/middleware';
import { v4 as uuid } from 'uuid';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const db = getDb();
    const reviews = db.prepare(`
      SELECT r.*, u.full_name as user_name, u.avatar_url
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ? AND r.is_approved = 1
      ORDER BY r.created_at DESC
    `).all(productId);

    const stats = db.prepare(`
      SELECT COUNT(*) as count, AVG(rating) as avg_rating
      FROM reviews
      WHERE product_id = ? AND is_approved = 1
    `).get(productId) as { count: number; avg_rating: number | null };

    return NextResponse.json({
      success: true,
      data: reviews,
      total: stats?.count || 0,
      avgRating: stats?.avg_rating ? Math.round(stats.avg_rating * 10) / 10 : 0,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { productId, rating, comment, orderId } = body;

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid product or rating (1-5)' }, { status: 400 });
    }

    const db = getDb();

    // Check if verified purchase
    const verifiedOrder = db.prepare(`
      SELECT o.id FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ? AND oi.product_id = ? AND o.status IN ('delivered', 'confirmed', 'shipped')
      LIMIT 1
    `).get(user.userId, productId) as { id: string } | undefined;

    const isVerified = verifiedOrder ? 1 : 0;
    const reviewId = uuid();
    const now = new Date().toISOString().replace('T', ' ').split('.')[0];

    // Check existing review
    const existing = db.prepare('SELECT id FROM reviews WHERE user_id = ? AND product_id = ?').get(user.userId, productId);
    if (existing) {
      return NextResponse.json({ error: 'You have already reviewed this lemon variety' }, { status: 409 });
    }

    db.prepare(`
      INSERT INTO reviews (id, product_id, user_id, order_id, rating, comment, is_verified_purchase, is_approved, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(reviewId, productId, user.userId, orderId || verifiedOrder?.id || null, Math.round(rating), comment || '', isVerified, now);

    // Update product rating and review count
    const agg = db.prepare(`
      SELECT COUNT(*) as count, AVG(rating) as avg_rating
      FROM reviews WHERE product_id = ? AND is_approved = 1
    `).get(productId) as { count: number; avg_rating: number };

    db.prepare(`
      UPDATE products SET rating = ?, reviews_count = ?, updated_at = ? WHERE id = ?
    `).run(Math.round((agg.avg_rating || 0) * 10) / 10, agg.count, now, productId);

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      data: { id: reviewId, rating, comment, is_verified_purchase: isVerified },
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
