import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/middleware';
import { v4 as uuid } from 'uuid';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();

    const product = db.prepare(`
      SELECT p.*, 
        c.name_en as category_name_en, c.name_mr as category_name_mr, c.slug as category_slug,
        s.id as sid, s.farm_name, s.description as seller_description, s.district as seller_district, s.city as seller_city, s.is_verified as seller_verified, s.rating as seller_rating,
        u.full_name as seller_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN sellers s ON p.seller_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE p.id = ? OR p.slug = ?
    `).get(id, id) as Record<string, unknown> | undefined;

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const images = db.prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order').all(product.id);
    const reviews = db.prepare(`
      SELECT r.*, u.full_name as user_name 
      FROM reviews r LEFT JOIN users u ON r.user_id = u.id 
      WHERE r.product_id = ? AND r.is_approved = 1 
      ORDER BY r.created_at DESC LIMIT 10
    `).all(product.id);

    const related = db.prepare(`
      SELECT p.*, 
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
        s.farm_name, s.district as seller_district, u.full_name as seller_name
      FROM products p
      LEFT JOIN sellers s ON p.seller_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE p.category_id = ? AND p.id != ? AND p.is_active = 1
      LIMIT 4
    `).all(product.category_id, product.id);

    return NextResponse.json({
      success: true,
      data: { ...product, images, reviews, related },
    });
  } catch (error) {
    console.error('Product detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req);
    if (!user || !['seller', 'editor', 'admin', 'superadmin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const db = getDb();
    const now = new Date().toISOString().replace('T', ' ').split('.')[0];

    // Get old values for audit
    const old = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!old) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    // Enforce seller ownership
    if (user.role === 'seller') {
      const seller = db.prepare('SELECT id FROM sellers WHERE user_id = ?').get(user.userId) as { id: string } | undefined;
      if (!seller || old.seller_id !== seller.id) {
        return NextResponse.json({ error: 'Forbidden: You can only edit your own products' }, { status: 403 });
      }
    }

    const fields: string[] = [];
    const values: unknown[] = [];

    const updatable = ['name_en', 'name_mr', 'description_en', 'description_mr', 'price', 'compare_price', 'unit', 'weight_value', 'stock', 'low_stock_threshold', 'is_organic', 'is_farm_fresh', 'is_featured', 'is_active', 'category_id', 'harvest_info', 'freshness_info', 'delivery_info'];

    for (const field of updatable) {
      if (body[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(body[field]);
      }
    }

    if (fields.length > 0) {
      fields.push('updated_at = ?');
      values.push(now);
      values.push(id);
      db.prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`).run(...values);

      db.prepare(`INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, created_at) VALUES (?,?,?,?,?,?,?,?)`).run(uuid(), user.userId, 'update', 'product', id, JSON.stringify(old), JSON.stringify(body), now);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req);
    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const db = getDb();
    const now = new Date().toISOString().replace('T', ' ').split('.')[0];

    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    db.prepare(`INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, created_at) VALUES (?,?,?,?,?,?)`).run(uuid(), user.userId, 'delete', 'product', id, now);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Product delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
