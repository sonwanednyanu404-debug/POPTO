import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    
    const farmersRow = db.prepare('SELECT COUNT(*) as count FROM sellers').get() as { count: number };
    const productsRow = db.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').get() as { count: number };
    const reviewsRow = db.prepare('SELECT COUNT(*) as count, ROUND(AVG(rating), 1) as avgRating FROM reviews WHERE is_approved = 1').get() as { count: number; avgRating: number | null };
    const districtsRow = db.prepare('SELECT COUNT(DISTINCT district) as count FROM sellers WHERE district IS NOT NULL').get() as { count: number };
    const ordersRow = db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number };

    return NextResponse.json({
      success: true,
      data: {
        farmersCount: farmersRow.count,
        productsCount: productsRow.count,
        ordersCount: ordersRow.count,
        avgRating: reviewsRow.avgRating || 4.8,
        reviewCount: reviewsRow.count,
        districtsCount: districtsRow.count || 3,
        isLiveDb: true,
      },
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch live stats' }, { status: 500 });
  }
}
