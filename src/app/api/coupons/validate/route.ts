import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, orderAmount } = body;

    if (!code) {
      return NextResponse.json({ valid: false, message: 'Coupon code is required' }, { status: 400 });
    }

    const db = getDb();
    const coupon = db.prepare(`
      SELECT * FROM coupons
      WHERE UPPER(code) = UPPER(?) AND is_active = 1
    `).get(code) as {
      id: string;
      code: string;
      discount_type: 'percentage' | 'fixed';
      discount_value: number;
      min_order_amount: number;
      max_uses: number | null;
      used_count: number;
      expires_at: string | null;
    } | undefined;

    if (!coupon) {
      return NextResponse.json({ valid: false, message: 'Invalid or expired coupon code' }, { status: 404 });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, message: 'This coupon has expired' }, { status: 400 });
    }

    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ valid: false, message: 'This coupon has reached its usage limit' }, { status: 400 });
    }

    const subtotal = Number(orderAmount) || 0;
    if (subtotal < coupon.min_order_amount) {
      return NextResponse.json({
        valid: false,
        message: `Minimum order amount of ₹${coupon.min_order_amount} required to use this coupon`,
      }, { status: 400 });
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = Math.round((subtotal * coupon.discount_value) / 100);
    } else {
      discount = Math.min(coupon.discount_value, subtotal);
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      message: `Coupon ${coupon.code} applied! You saved ₹${discount}`,
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({ valid: false, message: 'Failed to validate coupon' }, { status: 500 });
  }
}
