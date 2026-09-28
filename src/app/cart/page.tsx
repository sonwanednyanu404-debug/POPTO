'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import { useCartStore, useToastStore, useAuthStore } from '@/lib/store';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, ShieldCheck, Truck } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { t, lang } = useTranslation();
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCartStore();
  const { addToast } = useToastStore();
  const { user } = useAuthStore();

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const subtotal = totalPrice();
  const deliveryFee = subtotal > 499 || subtotal === 0 ? 0 : 49;
  const finalTotal = Math.max(0, subtotal - discount + deliveryFee);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), orderAmount: subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setDiscount(data.discount);
        setAppliedCoupon(data.code);
        addToast({ message: data.message, type: 'success' });
      } else {
        addToast({ message: data.message || 'Invalid coupon code', type: 'error' });
      }
    } catch {
      addToast({ message: 'Error validating coupon', type: 'error' });
    }
    setApplyingCoupon(false);
  };

  const handleCheckout = () => {
    if (!user) {
      addToast({
        message: lang === 'en' ? 'Please log in to proceed to checkout' : 'खरेदी पूर्ण करण्यासाठी कृपया लॉगिन करा',
        type: 'warning',
      });
      router.push('/login?redirect=/checkout');
      return;
    }
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-lemon-100 flex items-center justify-center text-4xl mb-6">
          🛒
        </div>
        <h2 className="text-2xl font-bold text-charcoal-900 mb-2">
          {lang === 'en' ? 'Your Lemon Cart is Empty' : 'आपली लिंबू कार्ट रिकामी आहे'}
        </h2>
        <p className="text-charcoal-500 mb-8 max-w-md">
          {lang === 'en'
            ? 'Explore our fresh farm-harvested lemons directly from verified Maharashtra orchards.'
            : 'महाराष्ट्रातील स्थानिक बागांमधून थेट ताजी दर्जेदार लिंबे निवडा.'}
        </p>
        <Link href="/shop" className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 shadow-md">
          <ShoppingBag className="w-4 h-4" />
          {lang === 'en' ? 'Start Shopping' : 'खरेदी सुरू करा'}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 mb-8 flex items-center gap-3">
          <span>{lang === 'en' ? 'Shopping Cart' : 'खरेदी कार्ट'}</span>
          <span className="text-sm font-semibold bg-leaf-100 text-leaf-800 px-3 py-1 rounded-full">
            {items.length} {lang === 'en' ? 'items' : 'वस्तू'}
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-charcoal-100">
              <div className="divide-y divide-charcoal-100">
                {items.map((item) => {
                  const product = item.product;
                  const name = lang === 'mr' && product?.name_mr ? product.name_mr : product?.name_en || 'Fresh Lemons';
                  const price = product?.price || 0;
                  const itemTotal = price * item.quantity;
                  const imgUrl = (product as any)?.images?.[0]?.url || (product as any)?.primary_image || (product as any)?.image;

                  return (
                    <div key={item.product_id} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-20 h-20 rounded-2xl bg-lemon-50 border border-charcoal-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {imgUrl ? (
                            <img src={imgUrl} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-3xl">🍋</span>
                          )}
                        </div>
                        <div>
                          <Link href={`/shop/${item.product_id}`} className="font-bold text-charcoal-900 hover:text-leaf-700 transition-colors line-clamp-1">
                            {name}
                          </Link>
                          <div className="text-xs text-charcoal-500 mt-0.5">
                            ₹{price} / {product?.unit || 'kg'}
                          </div>
                          <div className="text-sm font-bold text-leaf-700 mt-1">
                            ₹{itemTotal}
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                        <div className="flex items-center border border-charcoal-200 rounded-xl px-2 py-1 bg-sand-50/50">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-charcoal-200 rounded-lg text-charcoal-600 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-bold text-sm text-charcoal-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-charcoal-200 rounded-lg text-charcoal-600 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.product_id)}
                          className="text-charcoal-400 hover:text-red-500 p-2 transition-colors rounded-lg hover:bg-red-50"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Clear Cart Button */}
            <div className="flex justify-between items-center px-2">
              <Link href="/shop" className="text-sm font-semibold text-leaf-700 hover:text-leaf-800 inline-flex items-center gap-1">
                ← {lang === 'en' ? 'Continue Shopping' : 'आणखी खरेदी करा'}
              </Link>
              <button
                onClick={clearCart}
                className="text-xs text-charcoal-400 hover:text-red-600 underline font-medium"
              >
                {lang === 'en' ? 'Clear Entire Cart' : 'सर्व कार्ट रिकामी करा'}
              </button>
            </div>
          </div>

          {/* Order Summary & Coupon */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-charcoal-100">
              <h2 className="text-lg font-bold text-charcoal-900 mb-5">
                {lang === 'en' ? 'Order Summary' : 'ऑर्डर सारांश'}
              </h2>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="mb-6">
                <label className="block text-xs font-semibold text-charcoal-600 mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-leaf-600" />
                  {lang === 'en' ? 'Have a Promo / Kisan Code?' : 'प्रोमो / किसान कोड आहे का?'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. LEMON10, POPTO50"
                    className="flex-1 px-3.5 py-2 border border-charcoal-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 uppercase tracking-wider"
                  />
                  <button
                    type="submit"
                    disabled={applyingCoupon || !couponCode}
                    className="bg-charcoal-900 hover:bg-charcoal-800 disabled:opacity-50 text-white text-xs font-bold px-4 rounded-xl transition-colors"
                  >
                    {applyingCoupon ? '...' : (lang === 'en' ? 'Apply' : 'लागू करा')}
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-leaf-700 font-semibold mt-1.5">
                    ✓ Code {appliedCoupon} applied (-₹{discount})
                  </p>
                )}
              </form>

              {/* Cost Lines */}
              <div className="space-y-3 text-sm border-t border-charcoal-100 pt-4 mb-6">
                <div className="flex justify-between text-charcoal-600">
                  <span>{lang === 'en' ? 'Subtotal' : 'उपएकूण'}</span>
                  <span className="font-semibold text-charcoal-900">₹{subtotal}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-leaf-700 font-medium">
                    <span>{lang === 'en' ? 'Discount' : 'सूट'}</span>
                    <span>-₹{discount}</span>
                  </div>
                )}

                <div className="flex justify-between text-charcoal-600">
                  <span>{lang === 'en' ? 'Cold-Chain Delivery' : 'शीत-शृंखला वितरण'}</span>
                  {deliveryFee === 0 ? (
                    <span className="text-leaf-700 font-bold uppercase text-xs bg-leaf-50 px-2 py-0.5 rounded">
                      FREE (Orders &gt; ₹499)
                    </span>
                  ) : (
                    <span className="font-semibold text-charcoal-900">₹{deliveryFee}</span>
                  )}
                </div>

                <div className="border-t border-charcoal-100 pt-4 flex justify-between items-baseline">
                  <span className="text-base font-bold text-charcoal-900">
                    {lang === 'en' ? 'Total Amount' : 'एकूण रक्कम'}
                  </span>
                  <span className="text-2xl font-extrabold text-charcoal-900">
                    ₹{finalTotal}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base font-bold shadow-md shadow-leaf-700/20"
              >
                <span>{lang === 'en' ? 'Proceed to Checkout' : 'खरेदी पूर्ण करण्यासाठी पुढे जा'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Assurance Badges */}
            <div className="bg-sand-100/60 rounded-2xl p-4 border border-charcoal-100/80 space-y-3 text-xs text-charcoal-600">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-leaf-700 flex-shrink-0" />
                <span>100% Quality & Weight Guarantee from Maharashtra Farms</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-leaf-700 flex-shrink-0" />
                <span>Fresh Harvested Dispatch within 24-48 Hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
