// API service layer for client-side API calls
const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('popto_token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// ── Auth ──
export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: Record<string, unknown> }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  signup: (data: { fullName: string; email: string; mobile: string; password: string }) =>
    request<{ token: string; user: Record<string, unknown> }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request<{ user: Record<string, unknown> }>('/auth/me'),
};

// ── Products ──
export const productsApi = {
  list: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ data: Record<string, unknown>[]; total: number; page: number; totalPages: number }>(`/products${query}`);
  },
  get: (id: string) => request<{ data: Record<string, unknown> }>(`/products/${id}`),
  create: (data: Record<string, unknown>) =>
    request('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/products/${id}`, { method: 'DELETE' }),
};

// ── Cart ──
export const cartApi = {
  get: () => request<{ items: Record<string, unknown>[] }>('/cart'),
  add: (productId: string, quantity: number) =>
    request('/cart', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  update: (productId: string, quantity: number) =>
    request('/cart', { method: 'PUT', body: JSON.stringify({ productId, quantity }) }),
  remove: (productId: string) =>
    request(`/cart/${productId}`, { method: 'DELETE' }),
};

// ── Orders ──
export const ordersApi = {
  list: () => request<{ data: Record<string, unknown>[] }>('/orders'),
  get: (id: string) => request<{ data: Record<string, unknown> }>(`/orders/${id}`),
  create: (data: Record<string, unknown>) =>
    request<{ data: Record<string, unknown> }>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) =>
    request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// ── Wishlist ──
export const wishlistApi = {
  get: () => request<{ items: Record<string, unknown>[] }>('/wishlist'),
  add: (productId: string) =>
    request('/wishlist', { method: 'POST', body: JSON.stringify({ productId }) }),
  remove: (productId: string) =>
    request(`/wishlist/${productId}`, { method: 'DELETE' }),
};

// ── Addresses ──
export const addressApi = {
  list: () => request<{ data: Record<string, unknown>[] }>('/addresses'),
  create: (data: Record<string, unknown>) =>
    request('/addresses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    request(`/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/addresses/${id}`, { method: 'DELETE' }),
};

// ── Reviews ──
export const reviewsApi = {
  list: (productId: string) => request<{ data: Record<string, unknown>[] }>(`/reviews?productId=${productId}`),
  create: (data: Record<string, unknown>) =>
    request('/reviews', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Notifications ──
export const notificationsApi = {
  list: () => request<{ data: Record<string, unknown>[] }>('/notifications'),
  markRead: (id: string) =>
    request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => request('/notifications/read-all', { method: 'PUT' }),
};

// ── Admin ──
export const adminApi = {
  dashboard: () => request<{ data: Record<string, unknown> }>('/admin/dashboard'),
  customers: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ data: Record<string, unknown>[]; total: number }>(`/admin/customers${query}`);
  },
  customerDetail: (id: string) => request<{ data: Record<string, unknown> }>(`/admin/customers/${id}`),
  loginActivity: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ data: Record<string, unknown>[]; total: number }>(`/admin/login-activity${query}`);
  },
  exportCustomers: () => request<{ csv: string }>('/admin/export-customers'),
  updateCustomerStatus: (id: string, isActive: boolean) =>
    request(`/admin/customers/${id}/status`, { method: 'PUT', body: JSON.stringify({ isActive }) }),
};

// ── Coupons ──
export const couponsApi = {
  validate: (code: string, orderAmount: number) =>
    request<{ valid: boolean; discount: number }>('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, orderAmount }),
    }),
};

// ── Support ──
export const supportApi = {
  create: (data: Record<string, unknown>) =>
    request('/support', { method: 'POST', body: JSON.stringify(data) }),
  list: () => request<{ data: Record<string, unknown>[] }>('/support'),
};
