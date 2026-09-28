// POPTO Mobile API Client
// Connects React Native / Expo to the shared POPTO Next.js API & SQLite DB
import { Platform } from 'react-native';

const DEFAULT_BASE_URL = 'https://reduce-its-tool-presents.trycloudflare.com/api';
let dynamicApiUrl = process.env.EXPO_PUBLIC_API_URL || DEFAULT_BASE_URL;

export const getApiUrl = () => dynamicApiUrl;
export const setBaseUrl = (url: string) => {
  dynamicApiUrl = url.endsWith('/api') ? url : `${url.replace(/\/$/, '')}/api`;
};

const authHeaders = (token?: string | null) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export const mobileApi = {
  getBaseUrl: () => dynamicApiUrl,
  setBaseUrl,

  // Public Stats & Catalog
  getStats: async () => {
    try {
      const res = await fetch(`${dynamicApiUrl}/stats`);
      return await res.json();
    } catch {
      return { success: false, data: { farmersCount: 3, productsCount: 7, ordersCount: 4, avgRating: 4.6 } };
    }
  },

  getProducts: async (params?: Record<string, string>) => {
    try {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      const res = await fetch(`${dynamicApiUrl}/products${query}`);
      return await res.json();
    } catch (e) {
      console.warn('API getProducts failed, returning fallback', e);
      return { success: false, data: [] };
    }
  },

  getProduct: async (id: string) => {
    try {
      const res = await fetch(`${dynamicApiUrl}/products/${id}`);
      return await res.json();
    } catch {
      return { success: false, error: 'Network error' };
    }
  },

  getFarmers: async () => {
    try {
      const res = await fetch(`${dynamicApiUrl}/farmers`);
      return await res.json();
    } catch {
      return { success: false, data: [] };
    }
  },

  // Auth
  login: async (email: string, pass: string) => {
    try {
      const res = await fetch(`${dynamicApiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password: pass }),
      });
      return await res.json();
    } catch {
      return { error: 'Unable to reach POPTO server at ' + dynamicApiUrl };
    }
  },

  signup: async (fullName: string, email: string, mobile: string, pass: string) => {
    try {
      const res = await fetch(`${dynamicApiUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email: email.trim().toLowerCase(), mobile, password: pass }),
      });
      return await res.json();
    } catch {
      return { error: 'Unable to reach POPTO server at ' + dynamicApiUrl };
    }
  },

  // Cart
  getCart: async (token: string) => {
    try {
      const res = await fetch(`${dynamicApiUrl}/cart`, { headers: authHeaders(token) });
      return await res.json();
    } catch {
      return { success: false, data: { items: [], subtotal: 0 } };
    }
  },

  addToCart: async (token: string, productId: string, quantity = 1) => {
    try {
      const res = await fetch(`${dynamicApiUrl}/cart`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ productId, quantity }),
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  // Wishlist
  getWishlist: async (token: string) => {
    try {
      const res = await fetch(`${dynamicApiUrl}/wishlist`, { headers: authHeaders(token) });
      return await res.json();
    } catch {
      return { success: false, data: [] };
    }
  },

  toggleWishlist: async (token: string, productId: string) => {
    try {
      const res = await fetch(`${dynamicApiUrl}/wishlist`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ productId }),
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  // Addresses
  getAddresses: async (token: string) => {
    try {
      const res = await fetch(`${dynamicApiUrl}/addresses`, { headers: authHeaders(token) });
      return await res.json();
    } catch {
      return { success: false, data: [] };
    }
  },

  // Orders
  getOrders: async (token: string) => {
    try {
      const res = await fetch(`${dynamicApiUrl}/orders`, { headers: authHeaders(token) });
      return await res.json();
    } catch {
      return { success: false, data: [] };
    }
  },

  getOrder: async (token: string, id: string) => {
    try {
      const res = await fetch(`${dynamicApiUrl}/orders/${id}`, { headers: authHeaders(token) });
      return await res.json();
    } catch {
      return { success: false, error: 'Network error' };
    }
  },

  createOrder: async (token: string, orderData: { addressId: string; paymentMethod: string; couponCode?: string; deliveryMethod?: string }) => {
    try {
      const res = await fetch(`${dynamicApiUrl}/orders`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(orderData),
      });
      return await res.json();
    } catch {
      return { success: false, error: 'Network error' };
    }
  },

  // Notifications
  getNotifications: async (token: string) => {
    try {
      const res = await fetch(`${dynamicApiUrl}/notifications`, { headers: authHeaders(token) });
      return await res.json();
    } catch {
      return { success: false, data: [] };
    }
  },
};

