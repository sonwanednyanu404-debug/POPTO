'use client';

import { useTranslation } from '@/lib/i18n/context';
import { useCartStore, useToastStore } from '@/lib/store';
import { X, ShoppingCart, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function CartDrawer() {
  const { t } = useTranslation();
  const { items, isOpen, setOpen, updateQuantity, removeItem, totalPrice } = useCartStore();
  const { addToast } = useToastStore();

  if (!isOpen) return null;

  const subtotal = totalPrice();
  const deliveryFee = subtotal >= 250 ? 0 : 40;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = subtotal + deliveryFee + tax;

  const handleUpdateQty = async (productId: string, qty: number) => {
    updateQuantity(productId, qty);
    try {
      await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('popto_token')}` },
        body: JSON.stringify({ productId, quantity: qty }),
      });
    } catch { /* silent */ }
  };

  const handleRemove = async (productId: string) => {
    removeItem(productId);
    addToast({ message: 'Item removed from cart', type: 'info' });
    try {
      await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('popto_token')}` },
        body: JSON.stringify({ productId, quantity: 0 }),
      });
    } catch { /* silent */ }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setOpen(false)} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-premium flex flex-col animate-slide-down">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-charcoal-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-leaf-700" />
            <h2 className="font-display font-bold text-lg">{t.cart.title}</h2>
            <span className="badge-green">{items.length}</span>
          </div>
          <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-charcoal-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="w-16 h-16 text-charcoal-200 mb-4" />
              <p className="font-semibold text-charcoal-600">{t.cart.empty}</p>
              <p className="text-sm text-charcoal-400 mt-1">{t.cart.emptyMessage}</p>
              <Link href="/shop" className="btn-primary mt-4 text-sm" onClick={() => setOpen(false)}>
                {t.cart.shopNow}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.product_id} className="flex gap-3 p-3 rounded-xl bg-charcoal-50">
                  <div className="w-16 h-16 rounded-lg bg-lemon-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.product?.images?.[0]?.url ? (
                      <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">🍋</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-charcoal-900 truncate">
                      {item.product?.name_en || 'Lemon Product'}
                    </p>
                    <p className="text-xs text-charcoal-500">{item.product?.unit || 'kg'}</p>
                    <p className="text-sm font-bold text-leaf-700 mt-1">₹{item.product?.price || 0}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button onClick={() => handleRemove(item.product_id)} className="text-charcoal-400 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-1 bg-white rounded-lg border border-charcoal-200">
                      <button onClick={() => handleUpdateQty(item.product_id, item.quantity - 1)} className="p-1 hover:bg-charcoal-50 rounded-l-lg" disabled={item.quantity <= 1}>
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                      <button onClick={() => handleUpdateQty(item.product_id, item.quantity + 1)} className="p-1 hover:bg-charcoal-50 rounded-r-lg">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary & Checkout */}
        {items.length > 0 && (
          <div className="border-t border-charcoal-100 p-4 space-y-3">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-charcoal-500">{t.cart.subtotal}</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-charcoal-500">{t.cart.deliveryFee}</span><span>{deliveryFee === 0 ? t.cart.free : `₹${deliveryFee}`}</span></div>
              <div className="flex justify-between"><span className="text-charcoal-500">{t.cart.tax}</span><span>₹{tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-charcoal-200">
                <span>{t.cart.total}</span><span className="text-leaf-700">₹{total.toFixed(2)}</span>
              </div>
            </div>
            <Link href="/checkout" className="btn-primary w-full flex items-center justify-center gap-2" onClick={() => setOpen(false)}>
              {t.cart.checkout} <ArrowRight className="w-4 h-4" />
            </Link>
            <button onClick={() => setOpen(false)} className="btn-ghost w-full text-center">
              {t.cart.continueShopping}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
