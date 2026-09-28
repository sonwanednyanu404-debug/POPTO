import { getDb } from './index';
import { hashSync } from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import fs from 'fs';
import path from 'path';

async function seed() {
  console.log('🍋 POPTO Database Seeding');
  console.log('══════════════════════════════');

  const db = getDb();

  // Apply schema first if needed
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    db.exec(fs.readFileSync(schemaPath, 'utf-8'));
  }

  // Check if already seeded
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (existingUsers.count > 0) {
    console.log('⚠️  Database already has data. Skipping seed.');
    db.close();
    return;
  }

  const now = new Date().toISOString().replace('T', ' ').split('.')[0];

  // ── USERS ──────────────────────────────────────────
  const adminId = uuid();
  const editorId = uuid();
  const farmer1Id = uuid();
  const farmer2Id = uuid();
  const farmer3Id = uuid();
  const customer1Id = uuid();
  const customer2Id = uuid();
  const customer3Id = uuid();
  const customer4Id = uuid();
  const customer5Id = uuid();

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@popto.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeThisAdminPassword';
  const editorEmail = process.env.EDITOR_EMAIL || 'editor@popto.local';
  const editorPassword = process.env.EDITOR_PASSWORD || 'ChangeThisEditorPassword';

  const insertUser = db.prepare(
    `INSERT INTO users (id, email, password_hash, full_name, mobile, role, email_verified, is_active, force_password_change, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`
  );

  const usersTransaction = db.transaction(() => {
    insertUser.run(adminId, adminEmail, hashSync(adminPassword, 10), 'POPTO Admin', '9876543210', 'superadmin', 1, 1, 1, now, now);
    insertUser.run(editorId, editorEmail, hashSync(editorPassword, 10), 'POPTO Editor', '9876543211', 'editor', 1, 1, 1, now, now);
    insertUser.run(farmer1Id, 'rajesh.patil@example.com', hashSync('Farmer@123', 10), 'Rajesh Patil', '9823456701', 'seller', 1, 1, 0, now, now);
    insertUser.run(farmer2Id, 'sunita.jadhav@example.com', hashSync('Farmer@123', 10), 'Sunita Jadhav', '9823456702', 'seller', 1, 1, 0, now, now);
    insertUser.run(farmer3Id, 'vikram.deshmukh@example.com', hashSync('Farmer@123', 10), 'Vikram Deshmukh', '9823456703', 'seller', 1, 1, 0, now, now);
    insertUser.run(customer1Id, 'rahul.sharma@example.com', hashSync('Customer@123', 10), 'Rahul Sharma', '9898765401', 'customer', 1, 1, 0, now, now);
    insertUser.run(customer2Id, 'priya.kulkarni@example.com', hashSync('Customer@123', 10), 'Priya Kulkarni', '9898765402', 'customer', 1, 1, 0, now, now);
    insertUser.run(customer3Id, 'amit.more@example.com', hashSync('Customer@123', 10), 'Amit More', '9898765403', 'customer', 1, 1, 0, now, now);
    insertUser.run(customer4Id, 'sneha.pawar@example.com', hashSync('Customer@123', 10), 'Sneha Pawar', '9898765404', 'customer', 1, 1, 0, now, now);
    insertUser.run(customer5Id, 'deepak.chavan@example.com', hashSync('Customer@123', 10), 'Deepak Chavan', '9898765405', 'customer', 0, 1, 0, now, now);
  });
  usersTransaction();
  console.log('✅ Users seeded');

  // ── SELLERS/FARMERS ──────────────────────────────────
  const seller1Id = uuid();
  const seller2Id = uuid();
  const seller3Id = uuid();

  const insertSeller = db.prepare(
    `INSERT INTO sellers (id, user_id, farm_name, description, story, district, city, is_verified, is_approved, rating, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
  );

  const sellersTransaction = db.transaction(() => {
    insertSeller.run(seller1Id, farmer1Id, 'Patil Lemon Farm', 'Premium quality lemons grown with traditional Maharashtra farming methods.', 'Our family has been growing lemons in the Jalgaon district for over 40 years. We follow sustainable farming practices passed down through generations.', 'Jalgaon', 'Jalgaon', 1, 1, 4.5, now, now);
    insertSeller.run(seller2Id, farmer2Id, 'Jadhav Organic Farm', 'Certified organic lemons from the foothills of Sahyadri.', 'Started organic farming in 2015 after seeing the harmful effects of pesticides. Our farm in Satara uses only natural fertilizers.', 'Satara', 'Satara', 1, 1, 4.8, now, now);
    insertSeller.run(seller3Id, farmer3Id, 'Deshmukh Citrus Farms', 'Large-scale lemon production with modern agricultural techniques.', 'We combine modern farming technology with traditional wisdom to produce the freshest lemons in Maharashtra.', 'Akola', 'Akola', 1, 1, 4.3, now, now);
  });
  sellersTransaction();
  console.log('✅ Sellers/Farmers seeded');

  // ── CATEGORIES ──────────────────────────────────────
  const cat1Id = uuid();
  const cat2Id = uuid();
  const cat3Id = uuid();
  const cat4Id = uuid();
  const cat5Id = uuid();
  const cat6Id = uuid();
  const cat7Id = uuid();
  const cat8Id = uuid();

  const insertCategory = db.prepare(
    `INSERT INTO categories (id, name_en, name_mr, slug, description_en, description_mr, sort_order, is_active, created_at) VALUES (?,?,?,?,?,?,?,?,?)`
  );

  const categoriesTransaction = db.transaction(() => {
    insertCategory.run(cat1Id, 'Fresh Lemons', 'ताजे लिंबू', 'fresh-lemons', 'Freshly picked lemons from Maharashtra farms', 'महाराष्ट्रातील शेतातून ताजे तोडलेले लिंबू', 1, 1, now);
    insertCategory.run(cat2Id, 'Farm Fresh Lemons', 'शेतातील ताजे लिंबू', 'farm-fresh', 'Directly from farm to your doorstep', 'शेतातून थेट तुमच्या दारापर्यंत', 2, 1, now);
    insertCategory.run(cat3Id, 'Organic Lemons', 'सेंद्रिय लिंबू', 'organic-lemons', 'Certified organic lemons grown without pesticides', 'कीटकनाशकांशिवाय उगवलेले प्रमाणित सेंद्रिय लिंबू', 3, 1, now);
    insertCategory.run(cat4Id, 'Premium Lemons', 'प्रीमियम लिंबू', 'premium-lemons', 'Hand-selected premium quality lemons', 'हाताने निवडलेले प्रीमियम दर्जाचे लिंबू', 4, 1, now);
    insertCategory.run(cat5Id, 'Small Packs', 'छोटे पॅक', 'small-packs', 'Perfect for small families', 'छोट्या कुटुंबांसाठी योग्य', 5, 1, now);
    insertCategory.run(cat6Id, 'Family Packs', 'कुटुंब पॅक', 'family-packs', 'Value packs for the whole family', 'संपूर्ण कुटुंबासाठी मूल्य पॅक', 6, 1, now);
    insertCategory.run(cat7Id, 'Bulk Orders', 'मोठ्या प्रमाणात ऑर्डर', 'bulk-orders', 'Bulk lemon orders for businesses and events', 'व्यवसाय आणि कार्यक्रमांसाठी मोठ्या प्रमाणात लिंबू ऑर्डर', 7, 1, now);
    insertCategory.run(cat8Id, 'Farmer Direct', 'शेतकरी थेट', 'farmer-direct', 'Buy directly from farmers', 'शेतकऱ्यांकडून थेट खरेदी करा', 8, 1, now);
  });
  categoriesTransaction();
  console.log('✅ Categories seeded');

  // ── PRODUCTS ──────────────────────────────────────
  const prod1Id = uuid();
  const prod2Id = uuid();
  const prod3Id = uuid();
  const prod4Id = uuid();
  const prod5Id = uuid();
  const prod6Id = uuid();
  const prod7Id = uuid();

  const insertProduct = db.prepare(
    `INSERT INTO products (id, seller_id, category_id, name_en, name_mr, slug, description_en, description_mr, price, compare_price, unit, weight_value, stock, low_stock_threshold, is_organic, is_farm_fresh, is_featured, is_active, rating, review_count, total_sold, harvest_info, freshness_info, delivery_info, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  );

  const productsTransaction = db.transaction(() => {
    insertProduct.run(prod1Id, seller1Id, cat1Id, 'Fresh Maharashtra Lemons', 'ताजे महाराष्ट्र लिंबू', 'fresh-maharashtra-lemons', 'Juicy, vibrant yellow lemons freshly picked from Jalgaon farms. Perfect for daily cooking, pickles, and refreshing drinks.', 'जळगाव शेतातून ताजे तोडलेले रसदार, चमकदार पिवळे लिंबू. दररोजच्या स्वयंपाकासाठी, लोणच्यासाठी आणि ताजेतवाने पेयांसाठी योग्य.', 80, 100, 'kg', 1, 500, 50, 0, 1, 1, 1, 4.5, 24, 340, 'Harvested within 24 hours of dispatch', 'Stays fresh for 7-10 days when refrigerated', 'Delivery within 2-3 days across Maharashtra', now, now);
    insertProduct.run(prod2Id, seller2Id, cat4Id, 'Premium Farm Lemons', 'प्रीमियम शेती लिंबू', 'premium-farm-lemons', 'Hand-selected premium lemons from Satara. Larger size, extra juicy, perfect citrus flavor.', 'सातारा येथील हाताने निवडलेले प्रीमियम लिंबू. मोठा आकार, अतिरिक्त रसदार, परिपूर्ण लिंबू चव.', 120, 150, 'kg', 1, 300, 30, 0, 1, 1, 1, 4.8, 18, 220, 'Hand-picked at peak ripeness', 'Guaranteed fresh for 10-14 days', 'Express delivery in 1-2 days', now, now);
    insertProduct.run(prod3Id, seller2Id, cat3Id, 'Organic Fresh Lemons', 'सेंद्रिय ताजे लिंबू', 'organic-fresh-lemons', 'Certified organic lemons grown without any chemical pesticides or fertilizers. Pure, natural, and healthy.', 'कोणत्याही रासायनिक कीटकनाशके किंवा खतांशिवाय उगवलेले प्रमाणित सेंद्रिय लिंबू. शुद्ध, नैसर्गिक आणि आरोग्यदायी.', 150, null, 'kg', 1, 200, 20, 1, 1, 1, 1, 4.9, 12, 180, 'Organically grown, harvested fresh', 'Best consumed within 7 days', 'Eco-friendly packaging, 2-3 day delivery', now, now);
    insertProduct.run(prod4Id, seller1Id, cat5Id, 'Fresh Lemon Pack', 'ताजे लिंबू पॅक', 'fresh-lemon-pack-500g', 'A small pack of fresh lemons, perfect for weekly needs. Convenient 500g pack.', 'ताजे लिंबूचा छोटा पॅक, साप्ताहिक गरजांसाठी योग्य. सोयीस्कर 500 ग्रॅम पॅक.', 60, 75, '500g', 0.5, 800, 80, 0, 1, 0, 1, 4.3, 32, 520, 'Packed fresh daily', 'Stays fresh for 5-7 days', 'Standard delivery in 2-3 days', now, now);
    insertProduct.run(prod5Id, seller3Id, cat8Id, 'Farmer Direct Lemon Box', 'शेतकरी थेट लिंबू बॉक्स', 'farmer-direct-lemon-box', 'Premium 3kg box of lemons sourced directly from Akola farms. Best value for families.', 'अकोला शेतातून थेट आणलेला प्रीमियम 3 किलो लिंबू बॉक्स. कुटुंबांसाठी सर्वोत्तम मूल्य.', 299, 350, '3kg', 3, 150, 15, 0, 1, 1, 1, 4.6, 15, 130, 'Direct from farm, no middlemen', 'Fresh for 10-14 days', 'Free delivery on orders above ₹250', now, now);
    insertProduct.run(prod6Id, seller2Id, cat6Id, 'Premium Lemon Box', 'प्रीमियम लिंबू बॉक्स', 'premium-lemon-box-5kg', 'Our best-selling family pack. 5kg of hand-selected premium quality lemons.', 'आमचा सर्वाधिक विक्री होणारा कुटुंब पॅक. हाताने निवडलेल्या प्रीमियम दर्जाच्या 5 किलो लिंबूं.', 499, 600, '5kg', 5, 100, 10, 0, 1, 1, 1, 4.7, 10, 90, 'Curated selection of finest lemons', 'Guaranteed freshness on delivery', 'Priority shipping, 1-2 day delivery', now, now);
    insertProduct.run(prod7Id, seller3Id, cat7Id, 'Bulk Fresh Lemons', 'मोठ्या प्रमाणात ताजे लिंबू', 'bulk-fresh-lemons-10kg', 'Bulk pack of 10kg lemons for restaurants, juice shops, and events. Best wholesale price.', 'रेस्टॉरंट, ज्यूस शॉप आणि कार्यक्रमांसाठी 10 किलो लिंबूचा बल्क पॅक. सर्वोत्तम घाऊक किंमत.', 999, 1200, '10kg', 10, 50, 5, 0, 1, 0, 1, 4.4, 8, 45, 'Bulk harvested to order', 'Sorted and graded for consistency', 'Scheduled delivery, contact for custom orders', now, now);
  });
  productsTransaction();
  console.log('✅ Products seeded');

  // ── PRODUCT IMAGES ──────────────────────────────────
  const insertImage = db.prepare(
    `INSERT INTO product_images (id, product_id, url, alt_text, is_primary, sort_order, created_at) VALUES (?,?,?,?,?,?,?)`
  );

  const imagesTransaction = db.transaction(() => {
    insertImage.run(uuid(), prod1Id, '/images/products/fresh-lemons-1.jpg', 'Fresh Maharashtra Lemons', 1, 0, now);
    insertImage.run(uuid(), prod1Id, '/images/products/fresh-lemons-2.jpg', 'Fresh lemons in basket', 0, 1, now);
    insertImage.run(uuid(), prod2Id, '/images/products/premium-lemons-1.jpg', 'Premium Farm Lemons', 1, 0, now);
    insertImage.run(uuid(), prod3Id, '/images/products/organic-lemons-1.jpg', 'Organic Fresh Lemons', 1, 0, now);
    insertImage.run(uuid(), prod4Id, '/images/products/lemon-pack-1.jpg', 'Fresh Lemon Pack', 1, 0, now);
    insertImage.run(uuid(), prod5Id, '/images/products/farmer-box-1.jpg', 'Farmer Direct Lemon Box', 1, 0, now);
    insertImage.run(uuid(), prod6Id, '/images/products/premium-box-1.jpg', 'Premium Lemon Box', 1, 0, now);
    insertImage.run(uuid(), prod7Id, '/images/products/bulk-lemons-1.jpg', 'Bulk Fresh Lemons', 1, 0, now);
  });
  imagesTransaction();
  console.log('✅ Product images seeded');

  // ── ADDRESSES ──────────────────────────────────────
  const insertAddress = db.prepare(
    `INSERT INTO addresses (id, user_id, full_name, mobile, house_flat, street, area, city, district, state, pin_code, is_default, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
  );

  const addressTransaction = db.transaction(() => {
    insertAddress.run(uuid(), customer1Id, 'Rahul Sharma', '9898765401', 'Flat 204, Sunshine Apartments', 'MG Road', 'Koregaon Park', 'Pune', 'Pune', 'Maharashtra', '411001', 1, now);
    insertAddress.run(uuid(), customer2Id, 'Priya Kulkarni', '9898765402', 'Row House 12', 'Baner Road', 'Baner', 'Pune', 'Pune', 'Maharashtra', '411045', 1, now);
    insertAddress.run(uuid(), customer3Id, 'Amit More', '9898765403', '3rd Floor, Ocean View', 'Linking Road', 'Bandra West', 'Mumbai', 'Mumbai', 'Maharashtra', '400050', 1, now);
    insertAddress.run(uuid(), customer4Id, 'Sneha Pawar', '9898765404', 'Plot 45, Sector 12', 'Nashik Road', 'Satpur', 'Nashik', 'Nashik', 'Maharashtra', '422007', 1, now);
  });
  addressTransaction();
  console.log('✅ Addresses seeded');

  // ── ORDERS ──────────────────────────────────────
  const order1Id = uuid();
  const order2Id = uuid();
  const order3Id = uuid();

  const insertOrder = db.prepare(
    `INSERT INTO orders (id, order_number, user_id, address_snapshot, subtotal, delivery_fee, discount, tax, total, status, payment_status, payment_method, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  );

  const ordersTransaction = db.transaction(() => {
    insertOrder.run(order1Id, 'POPTO-2026-0001', customer1Id, JSON.stringify({ full_name: 'Rahul Sharma', mobile: '9898765401', city: 'Pune', district: 'Pune', pin_code: '411001' }), 240, 40, 0, 14, 294, 'delivered', 'paid', 'cod', '2026-09-15 10:30:00', '2026-09-18 14:20:00');
    insertOrder.run(order2Id, 'POPTO-2026-0002', customer2Id, JSON.stringify({ full_name: 'Priya Kulkarni', mobile: '9898765402', city: 'Pune', district: 'Pune', pin_code: '411045' }), 499, 0, 50, 27, 476, 'shipped', 'paid', 'online', '2026-09-19 15:45:00', '2026-09-20 09:00:00');
    insertOrder.run(order3Id, 'POPTO-2026-0003', customer3Id, JSON.stringify({ full_name: 'Amit More', mobile: '9898765403', city: 'Mumbai', district: 'Mumbai', pin_code: '400050' }), 150, 50, 0, 12, 212, 'confirmed', 'paid', 'online', '2026-09-21 08:15:00', '2026-09-21 09:00:00');
  });
  ordersTransaction();
  console.log('✅ Orders seeded');

  // ── ORDER ITEMS ──────────────────────────────────
  const insertOrderItem = db.prepare(
    `INSERT INTO order_items (id, order_id, product_id, seller_id, product_name, product_image, price, quantity, unit, total, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`
  );

  const orderItemsTransaction = db.transaction(() => {
    insertOrderItem.run(uuid(), order1Id, prod1Id, seller1Id, 'Fresh Maharashtra Lemons', '/images/products/fresh-lemons-1.jpg', 80, 3, 'kg', 240, '2026-09-15 10:30:00');
    insertOrderItem.run(uuid(), order2Id, prod6Id, seller2Id, 'Premium Lemon Box', '/images/products/premium-box-1.jpg', 499, 1, '5kg', 499, '2026-09-19 15:45:00');
    insertOrderItem.run(uuid(), order3Id, prod3Id, seller2Id, 'Organic Fresh Lemons', '/images/products/organic-lemons-1.jpg', 150, 1, 'kg', 150, '2026-09-21 08:15:00');
  });
  orderItemsTransaction();
  console.log('✅ Order items seeded');

  // ── ORDER STATUS HISTORY ──────────────────────────
  const insertStatusHistory = db.prepare(
    `INSERT INTO order_status_history (id, order_id, status, note, created_by, created_at) VALUES (?,?,?,?,?,?)`
  );

  const statusHistoryTransaction = db.transaction(() => {
    insertStatusHistory.run(uuid(), order1Id, 'pending', 'Order placed', customer1Id, '2026-09-15 10:30:00');
    insertStatusHistory.run(uuid(), order1Id, 'confirmed', 'Order confirmed by seller', farmer1Id, '2026-09-15 11:00:00');
    insertStatusHistory.run(uuid(), order1Id, 'packed', 'Order packed and ready', farmer1Id, '2026-09-16 09:00:00');
    insertStatusHistory.run(uuid(), order1Id, 'shipped', 'Dispatched from Jalgaon', farmer1Id, '2026-09-16 14:00:00');
    insertStatusHistory.run(uuid(), order1Id, 'out_for_delivery', 'Out for delivery in Pune', null, '2026-09-18 10:00:00');
    insertStatusHistory.run(uuid(), order1Id, 'delivered', 'Delivered successfully', null, '2026-09-18 14:20:00');
    insertStatusHistory.run(uuid(), order2Id, 'pending', 'Order placed', customer2Id, '2026-09-19 15:45:00');
    insertStatusHistory.run(uuid(), order2Id, 'confirmed', 'Order confirmed', farmer2Id, '2026-09-19 16:30:00');
    insertStatusHistory.run(uuid(), order2Id, 'packed', 'Packed for shipping', farmer2Id, '2026-09-20 08:00:00');
    insertStatusHistory.run(uuid(), order2Id, 'shipped', 'Shipped from Satara', farmer2Id, '2026-09-20 09:00:00');
    insertStatusHistory.run(uuid(), order3Id, 'pending', 'Order placed', customer3Id, '2026-09-21 08:15:00');
    insertStatusHistory.run(uuid(), order3Id, 'confirmed', 'Order confirmed', farmer2Id, '2026-09-21 09:00:00');
  });
  statusHistoryTransaction();
  console.log('✅ Order status history seeded');

  // ── REVIEWS ──────────────────────────────────────
  const insertReview = db.prepare(
    `INSERT INTO reviews (id, product_id, user_id, order_id, rating, comment, is_verified_purchase, is_approved, created_at) VALUES (?,?,?,?,?,?,?,?,?)`
  );

  const reviewsTransaction = db.transaction(() => {
    insertReview.run(uuid(), prod1Id, customer1Id, order1Id, 5, 'Excellent quality lemons! Very fresh and juicy. Will order again.', 1, 1, '2026-09-18 16:00:00');
    insertReview.run(uuid(), prod1Id, customer3Id, null, 4, 'Good lemons, slightly smaller than expected but very fresh.', 0, 1, '2026-09-10 10:00:00');
    insertReview.run(uuid(), prod2Id, customer2Id, null, 5, 'These premium lemons are worth every rupee. Amazing quality!', 1, 1, '2026-09-12 14:00:00');
    insertReview.run(uuid(), prod3Id, customer4Id, null, 5, 'Best organic lemons I have ever tasted. Truly chemical-free.', 1, 1, '2026-09-08 11:00:00');
    insertReview.run(uuid(), prod5Id, customer1Id, null, 4, 'Great value for money. Direct from farmer, no middleman.', 1, 1, '2026-09-05 09:00:00');
  });
  reviewsTransaction();
  console.log('✅ Reviews seeded');

  // ── WISHLISTS ──────────────────────────────────────
  const insertWishlist = db.prepare(
    `INSERT INTO wishlists (id, user_id, product_id, created_at) VALUES (?,?,?,?)`
  );

  const wishlistTransaction = db.transaction(() => {
    insertWishlist.run(uuid(), customer1Id, prod3Id, now);
    insertWishlist.run(uuid(), customer1Id, prod6Id, now);
    insertWishlist.run(uuid(), customer2Id, prod1Id, now);
    insertWishlist.run(uuid(), customer3Id, prod5Id, now);
    insertWishlist.run(uuid(), customer4Id, prod2Id, now);
  });
  wishlistTransaction();
  console.log('✅ Wishlists seeded');

  // ── COUPONS ──────────────────────────────────────
  const insertCoupon = db.prepare(
    `INSERT INTO coupons (id, code, description, discount_type, discount_value, min_order_amount, max_uses, used_count, is_active, expires_at, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`
  );

  const couponsTransaction = db.transaction(() => {
    insertCoupon.run(uuid(), 'WELCOME10', 'Welcome offer - 10% off your first order', 'percentage', 10, 100, 1000, 23, 1, '2027-03-31 23:59:59', now);
    insertCoupon.run(uuid(), 'LEMON50', 'Flat ₹50 off on orders above ₹300', 'fixed', 50, 300, 500, 8, 1, '2026-12-31 23:59:59', now);
    insertCoupon.run(uuid(), 'FRESH20', '20% off on organic lemons', 'percentage', 20, 200, 200, 5, 1, '2026-12-31 23:59:59', now);
  });
  couponsTransaction();
  console.log('✅ Coupons seeded');

  // ── NOTIFICATIONS ──────────────────────────────────
  const insertNotification = db.prepare(
    `INSERT INTO notifications (id, user_id, title_en, title_mr, message_en, message_mr, type, link, is_read, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)`
  );

  const notificationsTransaction = db.transaction(() => {
    insertNotification.run(uuid(), customer1Id, 'Order Delivered', 'ऑर्डर डिलिव्हर झाली', 'Your order POPTO-2026-0001 has been delivered successfully.', 'तुमची ऑर्डर POPTO-2026-0001 यशस्वीरीत्या डिलिव्हर झाली.', 'order', '/account/orders', 1, '2026-09-18 14:20:00');
    insertNotification.run(uuid(), customer2Id, 'Order Shipped', 'ऑर्डर पाठवली', 'Your order POPTO-2026-0002 has been shipped from Satara.', 'तुमची ऑर्डर POPTO-2026-0002 सातारा येथून पाठवली गेली.', 'order', '/account/orders', 0, '2026-09-20 09:00:00');
    insertNotification.run(uuid(), customer3Id, 'Order Confirmed', 'ऑर्डर पुष्टी', 'Your order POPTO-2026-0003 has been confirmed.', 'तुमची ऑर्डर POPTO-2026-0003 ची पुष्टी झाली.', 'order', '/account/orders', 0, '2026-09-21 09:00:00');
  });
  notificationsTransaction();
  console.log('✅ Notifications seeded');

  // ── LOGIN ACTIVITY ──────────────────────────────────
  const insertActivity = db.prepare(
    `INSERT INTO login_activity (id, user_id, email, role, action, status, ip_address, user_agent, device_type, browser, os, country, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
  );

  const activityTransaction = db.transaction(() => {
    insertActivity.run(uuid(), customer1Id, 'rahul.sharma@example.com', 'customer', 'login', 'success', '103.21.12.45', 'Mozilla/5.0 (Linux; Android 13)', 'Mobile', 'Chrome', 'Android', 'India', '2026-09-21 10:42:00');
    insertActivity.run(uuid(), customer2Id, 'priya.kulkarni@example.com', 'customer', 'login', 'success', '49.36.78.112', 'Mozilla/5.0 (iPhone; iOS 17)', 'Mobile', 'Safari', 'iOS', 'India', '2026-09-21 09:15:00');
    insertActivity.run(uuid(), adminId, adminEmail, 'superadmin', 'login', 'success', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0)', 'Desktop', 'Chrome', 'Windows', 'India', '2026-09-21 08:00:00');
    insertActivity.run(uuid(), null, 'unknown@example.com', null, 'failed_login', 'failed', '185.23.45.67', 'Mozilla/5.0 (Windows NT 10.0)', 'Desktop', 'Firefox', 'Windows', 'Unknown', '2026-09-21 03:22:00');
    insertActivity.run(uuid(), customer3Id, 'amit.more@example.com', 'customer', 'login', 'success', '103.87.56.23', 'Mozilla/5.0 (Macintosh)', 'Desktop', 'Safari', 'macOS', 'India', '2026-09-20 22:30:00');
    insertActivity.run(uuid(), editorId, editorEmail, 'editor', 'login', 'success', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0)', 'Desktop', 'Edge', 'Windows', 'India', '2026-09-20 14:00:00');
    insertActivity.run(uuid(), farmer1Id, 'rajesh.patil@example.com', 'seller', 'login', 'success', '103.45.78.90', 'Mozilla/5.0 (Linux; Android 12)', 'Mobile', 'Chrome', 'Android', 'India', '2026-09-20 07:30:00');
    insertActivity.run(uuid(), customer1Id, 'rahul.sharma@example.com', 'customer', 'account_creation', 'success', '103.21.12.45', 'Mozilla/5.0 (Linux; Android 13)', 'Mobile', 'Chrome', 'Android', 'India', '2026-09-01 12:00:00');
  });
  activityTransaction();
  console.log('✅ Login activity seeded');

  // ── SITE CONTENT ──────────────────────────────────
  const insertContent = db.prepare(
    `INSERT INTO site_content (id, key, value_en, value_mr, type, updated_at) VALUES (?,?,?,?,?,?)`
  );

  const contentTransaction = db.transaction(() => {
    insertContent.run(uuid(), 'hero_headline', 'Fresh Maharashtra Lemons, Delivered to You', 'महाराष्ट्रातील ताजे लिंबू, थेट तुमच्या घरापर्यंत', 'text', now);
    insertContent.run(uuid(), 'hero_subheadline', 'Discover fresh lemons from trusted farmers and sellers across Maharashtra.', 'महाराष्ट्रातील विश्वासार्ह शेतकरी आणि विक्रेत्यांकडून ताजे लिंबू शोधा.', 'text', now);
    insertContent.run(uuid(), 'hero_cta', 'Shop Lemons', 'लिंबू खरेदी करा', 'text', now);
    insertContent.run(uuid(), 'hero_cta_secondary', 'Meet Farmers', 'शेतकऱ्यांना भेटा', 'text', now);
  });
  contentTransaction();
  console.log('✅ Site content seeded');

  console.log('');
  console.log('══════════════════════════════');
  console.log('🍋 POPTO database seeded successfully!');
  console.log('══════════════════════════════');
  console.log('');
  console.log('Demo accounts:');
  console.log(`  Admin:    ${adminEmail} / ${adminPassword}`);
  console.log(`  Editor:   ${editorEmail} / ${editorPassword}`);
  console.log('  Customer: rahul.sharma@example.com / Customer@123');
  console.log('  Farmer:   rajesh.patil@example.com / Farmer@123');
  console.log('');

  db.close();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
