import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/middleware';
import { v4 as uuid } from 'uuid';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const district = searchParams.get('district') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const organic = searchParams.get('organic') || '';
    const farmFresh = searchParams.get('farmFresh') || '';
    const inStock = searchParams.get('inStock') || '';
    const minRating = searchParams.get('minRating') || '';
    const unit = searchParams.get('unit') || '';
    const sort = searchParams.get('sort') || 'newest';
    const featured = searchParams.get('featured') || '';
    const sellerId = searchParams.get('sellerId') || '';

    let where = 'WHERE p.is_active = 1';
    const params: unknown[] = [];

    if (search) {
      where += ` AND (p.name_en LIKE ? OR p.name_mr LIKE ? OR p.description_en LIKE ? OR p.description_mr LIKE ? OR p.variety LIKE ? OR s.farm_name LIKE ? OR u.full_name LIKE ? OR s.district LIKE ?)`;
      const sTerm = `%${search}%`;
      params.push(sTerm, sTerm, sTerm, sTerm, sTerm, sTerm, sTerm, sTerm);
    }
    if (category) {
      where += ` AND c.slug = ?`;
      params.push(category);
    }
    if (district) {
      where += ` AND s.district = ?`;
      params.push(district);
    }
    if (minPrice) {
      where += ` AND p.price >= ?`;
      params.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      where += ` AND p.price <= ?`;
      params.push(parseFloat(maxPrice));
    }
    if (organic === '1') {
      where += ` AND p.is_organic = 1`;
    }
    if (farmFresh === '1') {
      where += ` AND p.is_farm_fresh = 1`;
    }
    if (inStock === '1') {
      where += ` AND p.stock > 0`;
    }
    if (minRating) {
      where += ` AND p.rating >= ?`;
      params.push(parseFloat(minRating));
    }
    if (unit) {
      where += ` AND p.unit = ?`;
      params.push(unit);
    }
    if (featured === '1') {
      where += ` AND p.is_featured = 1`;
    }
    if (sellerId) {
      where += ` AND p.seller_id = ?`;
      params.push(sellerId);
    }

    let orderBy = 'ORDER BY p.created_at DESC';
    switch (sort) {
      case 'price_asc': orderBy = 'ORDER BY p.price ASC'; break;
      case 'price_desc': orderBy = 'ORDER BY p.price DESC'; break;
      case 'popular': orderBy = 'ORDER BY p.total_sold DESC'; break;
      case 'rating': orderBy = 'ORDER BY p.rating DESC'; break;
      case 'newest': orderBy = 'ORDER BY p.created_at DESC'; break;
    }

    const countSql = `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN sellers s ON p.seller_id = s.id ${where}`;
    const { total } = db.prepare(countSql).get(...params) as { total: number };

    const offset = (page - 1) * limit;
    const sql = `
      SELECT p.*, 
        c.name_en as category_name_en, c.name_mr as category_name_mr, c.slug as category_slug,
        s.farm_name, s.district as seller_district, s.is_verified as seller_verified,
        u.full_name as seller_name,
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN sellers s ON p.seller_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      ${where}
      ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const products = db.prepare(sql).all(...params, limit, offset);

    return NextResponse.json({
      success: true,
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Products list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || !['seller', 'editor', 'admin', 'superadmin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const db = getDb();
    const id = uuid();
    const now = new Date().toISOString().replace('T', ' ').split('.')[0];
    const slug = body.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + id.slice(0, 6);

    let sellerId = body.seller_id;
    if (user.role === 'seller') {
      const seller = db.prepare('SELECT id FROM sellers WHERE user_id = ?').get(user.userId) as { id: string } | undefined;
      if (!seller) return NextResponse.json({ error: 'Seller profile not found' }, { status: 400 });
      sellerId = seller.id;
    }

    db.prepare(`
      INSERT INTO products (id, seller_id, category_id, name_en, name_mr, slug, description_en, description_mr, price, compare_price, unit, weight_value, stock, low_stock_threshold, is_organic, is_farm_fresh, is_featured, is_active, harvest_info, freshness_info, delivery_info, created_at, updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(id, sellerId, body.category_id || null, body.name_en, body.name_mr || body.name_en, slug, body.description_en || '', body.description_mr || '', body.price, body.compare_price || null, body.unit || 'kg', body.weight_value || null, body.stock || 0, body.low_stock_threshold || 10, body.is_organic ? 1 : 0, body.is_farm_fresh ? 1 : 0, body.is_featured ? 1 : 0, 1, body.harvest_info || '', body.freshness_info || '', body.delivery_info || '', now, now);

    // Audit log
    db.prepare(`INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, new_value, created_at) VALUES (?,?,?,?,?,?,?)`).run(uuid(), user.userId, 'create', 'product', id, JSON.stringify({ name: body.name_en, price: body.price }), now);

    return NextResponse.json({ success: true, data: { id, slug } }, { status: 201 });
  } catch (error) {
    console.error('Product create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
