// ══════════════════════════════════════════════════════════
// POPTO — Shared TypeScript Types
// ══════════════════════════════════════════════════════════

export type Role = 'customer' | 'seller' | 'editor' | 'admin' | 'superadmin';
export type Language = 'en' | 'mr';

export interface User {
  id: string;
  email: string;
  full_name: string;
  mobile?: string;
  role: Role;
  avatar_url?: string;
  email_verified: boolean;
  is_active: boolean;
  preferred_language: Language;
  created_at: string;
  updated_at: string;
}

export interface Seller {
  id: string;
  user_id: string;
  farm_name?: string;
  description?: string;
  story?: string;
  district: string;
  city?: string;
  is_verified: boolean;
  is_approved: boolean;
  rating: number;
  total_sales: number;
  created_at: string;
  user?: User;
}

export interface Category {
  id: string;
  name_en: string;
  name_mr: string;
  slug: string;
  description_en?: string;
  description_mr?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  seller_id: string;
  category_id?: string;
  name_en: string;
  name_mr: string;
  slug: string;
  description_en?: string;
  description_mr?: string;
  price: number;
  compare_price?: number;
  unit: string;
  weight_value?: number;
  stock: number;
  low_stock_threshold: number;
  is_organic: boolean;
  is_farm_fresh: boolean;
  is_featured: boolean;
  is_active: boolean;
  rating: number;
  review_count: number;
  total_sold: number;
  harvest_info?: string;
  freshness_info?: string;
  delivery_info?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  images?: ProductImage[];
  seller?: Seller;
  category?: Category;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  mobile: string;
  house_flat?: string;
  street?: string;
  area?: string;
  city: string;
  district: string;
  state: string;
  pin_code: string;
  is_default: boolean;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  saved_for_later: boolean;
  product?: Product;
}

export type OrderStatus = 'pending' | 'confirmed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  address_snapshot: string;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  tax: number;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: string;
  coupon_code?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  status_history?: OrderStatusHistory[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  seller_id: string;
  product_name: string;
  product_image?: string;
  price: number;
  quantity: number;
  unit: string;
  total: number;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: string;
  note?: string;
  created_by?: string;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  order_id?: string;
  rating: number;
  comment?: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
  user?: { full_name: string; avatar_url?: string };
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_uses?: number;
  used_count: number;
  is_active: boolean;
  expires_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title_en: string;
  title_mr?: string;
  message_en: string;
  message_mr?: string;
  type: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface LoginActivity {
  id: string;
  user_id?: string;
  email: string;
  role?: string;
  action: string;
  status: string;
  ip_address?: string;
  user_agent?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  country?: string;
  created_at: string;
  user?: { full_name: string };
}

export interface SupportTicket {
  id: string;
  user_id: string;
  order_id?: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  admin_reply?: string;
  resolved_at?: string;
  created_at: string;
  user?: { full_name: string; email: string };
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard analytics
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalFarmers: number;
  totalProducts: number;
  lowStockProducts: number;
  newCustomersToday: number;
  todayOrders: number;
  todayRevenue: number;
  todayLogins: number;
  failedLogins: number;
}
