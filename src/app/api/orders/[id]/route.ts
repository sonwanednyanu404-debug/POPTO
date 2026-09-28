import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/middleware';
import { v4 as uuid } from 'uuid';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const db = getDb();

    let order;
    let items;

    if (['admin', 'superadmin'].includes(user.role)) {
      order = db.prepare('SELECT o.*, u.full_name as customer_name, u.email as customer_email FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?').get(id);
      items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);
    } else if (user.role === 'seller') {
      const seller = db.prepare('SELECT id FROM sellers WHERE user_id = ?').get(user.userId) as { id: string } | undefined;
      if (!seller) return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 });
      
      const hasSellerItems = db.prepare('SELECT 1 FROM order_items WHERE order_id = ? AND seller_id = ? LIMIT 1').get(id, seller.id);
      if (!hasSellerItems) return NextResponse.json({ error: 'Order not found or access denied' }, { status: 403 });

      order = db.prepare('SELECT o.*, u.full_name as customer_name FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?').get(id);
      // Filter items to seller's permitted products
      items = db.prepare('SELECT * FROM order_items WHERE order_id = ? AND seller_id = ?').all(id, seller.id);
    } else {
      order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(id, user.userId);
      items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);
    }

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const history = db.prepare('SELECT osh.*, u.full_name as updated_by_name FROM order_status_history osh LEFT JOIN users u ON osh.created_by = u.id WHERE osh.order_id = ? ORDER BY osh.created_at ASC').all(id);

    return NextResponse.json({ success: true, data: { ...order, items, status_history: history } });
  } catch (error) {
    console.error('Order detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
