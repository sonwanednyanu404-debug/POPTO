import { create } from 'zustand';
import type { User, CartItem, Product } from '@/types';

// ══════════════════════════════════════════════════════
// Auth Store
// ══════════════════════════════════════════════════════

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    set({ user: null, token: null });
    document.cookie = 'popto_token=; path=/; max-age=0';
    localStorage.removeItem('popto_token');
  },
}));

// ══════════════════════════════════════════════════════
// Cart Store
// ══════════════════════════════════════════════════════

interface CartState {
  items: (CartItem & { product?: Product })[];
  isOpen: boolean;
  isLoading: boolean;
  setItems: (items: (CartItem & { product?: Product })[]) => void;
  addItem: (item: CartItem & { product?: Product }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  isLoading: false,
  setItems: (items) => set({ items }),
  addItem: (item) => {
    const items = get().items;
    const existing = items.find((i) => i.product_id === item.product_id);
    if (existing) {
      set({
        items: items.map((i) =>
          i.product_id === item.product_id ? { ...i, quantity: i.quantity + item.quantity } : i
        ),
      });
    } else {
      set({ items: [...items, item] });
    }
  },
  removeItem: (productId) => {
    set({ items: get().items.filter((i) => i.product_id !== productId) });
  },
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set({
      items: get().items.map((i) =>
        i.product_id === productId ? { ...i, quantity } : i
      ),
    });
  },
  clearCart: () => set({ items: [] }),
  toggleCart: () => set({ isOpen: !get().isOpen }),
  setOpen: (open) => set({ isOpen: open }),
  setLoading: (isLoading) => set({ isLoading }),
  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalPrice: () =>
    get().items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0),
}));

// ══════════════════════════════════════════════════════
// Wishlist Store
// ══════════════════════════════════════════════════════

interface WishlistState {
  items: string[]; // product IDs
  setItems: (items: string[]) => void;
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  setItems: (items) => set({ items }),
  addItem: (productId) => {
    if (!get().items.includes(productId)) {
      set({ items: [...get().items, productId] });
    }
  },
  removeItem: (productId) => {
    set({ items: get().items.filter((id) => id !== productId) });
  },
  isInWishlist: (productId) => get().items.includes(productId),
}));

// ══════════════════════════════════════════════════════
// Toast Store
// ══════════════════════════════════════════════════════

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2);
    const newToast = { ...toast, id };
    set({ toasts: [...get().toasts, newToast] });
    setTimeout(() => {
      get().removeToast(id);
    }, toast.duration || 4000);
  },
  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
}));
