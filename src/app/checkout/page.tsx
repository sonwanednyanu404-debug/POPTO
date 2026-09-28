'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { useCartStore, useToastStore, useAuthStore } from '@/lib/store';
import { MapPin, Plus, CheckCircle2, Truck, CreditCard, Banknote, QrCode, ShieldCheck, ArrowLeft } from 'lucide-react';

const MAHARASHTRA_DISTRICTS = [
  'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad (Chhatrapati Sambhajinagar)', 'Beed', 'Bhandara', 'Buldhana',
  'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur',
  'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad (Dharashiv)',
  'Palghar', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur',
  'Thane', 'Wardha', 'Washim', 'Yavatmal'
];

export default function CheckoutPage() {
  const router = useRouter();
  const { t, lang } = useTranslation();
  const { items, totalPrice, clearCart } = useCartStore();
  const { addToast } = useToastStore();
  const { user } = useAuthStore();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // New Address Form
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    mobile: '',
    houseFlat: '',
    street: '',
    area: '',
    city: '',
    district: 'Pune',
    pinCode: '',
  });

  // Delivery & Payment
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card'>('cod');

  const subtotal = totalPrice();
  const deliveryFee = deliveryMethod === 'express' ? 60 : (subtotal >= 499 ? 0 : 49);
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/addresses', {
        headers: { Authorization: `Bearer ${localStorage.getItem('popto_token')}` },
      });
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        setAddresses(data.data);
        const def = data.data.find((a: any) => a.is_default) || data.data[0];
        setSelectedAddressId(def.id);
      } else {
        setShowNewAddress(true);
      }
    } catch {
      setAddresses([]);
    }
    setLoading(false);
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('popto_token')}`,
        },
        body: JSON.stringify(newAddress),
      });
      const data = await res.json();
      if (res.ok) {
        addToast({ message: 'Address saved', type: 'success' });
        await loadAddresses();
        setShowNewAddress(false);
      } else {
        addToast({ message: data.error || 'Failed to save address', type: 'error' });
      }
    } catch {
      addToast({ message: 'Error saving address', type: 'error' });
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId && !showNewAddress) {
      addToast({ message: 'Please select a delivery address', type: 'warning' });
      return;
    }

    if (items.length === 0) {
      addToast({ message: 'Cart is empty', type: 'warning' });
      router.push('/shop');
      return;
    }

    setSubmitting(true);
    try {
      // Step 1: Ensure cart items are synced with server cart_items table
      for (const it of items) {
        await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('popto_token')}`,
          },
          body: JSON.stringify({ productId: it.product_id, quantity: it.quantity }),
        });
      }

      // Step 2: Post Order
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('popto_token')}`,
        },
        body: JSON.stringify({
          addressId: selectedAddressId,
          deliveryMethod,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (res.ok && data.data?.id) {
        clearCart();
        addToast({
          message: lang === 'en' ? 'Order placed successfully!' : 'ऑर्डर यशस्वीरीत्या दिली गेली!',
          type: 'success',
        });
        router.push(`/checkout/confirmation/${data.data.id}`);
      } else {
        addToast({ message: data.error || 'Failed to place order', type: 'error' });
      }
    } catch {
      addToast({ message: 'Network error placing order', type: 'error' });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-sand-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-leaf-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> {lang === 'en' ? 'Back to Cart' : 'परत कार्टकडे'}
        </Link>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 mb-8">
          {lang === 'en' ? 'Secure Checkout' : 'सुरक्षित चेकआउट'}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Form: Address + Shipping + Payment */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Address Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-charcoal-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-leaf-100 text-leaf-800 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h2 className="text-lg font-bold text-charcoal-900">
                    {lang === 'en' ? 'Delivery Address (Maharashtra)' : 'डिलिव्हरी पत्ता (महाराष्ट्र)'}
                  </h2>
                </div>
                {!showNewAddress && addresses.length > 0 && (
                  <button
                    onClick={() => setShowNewAddress(true)}
                    className="text-xs font-semibold text-leaf-700 hover:text-leaf-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> {lang === 'en' ? 'Add New Address' : 'नवीन पत्ता जोडा'}
                  </button>
                )}
              </div>

              {/* Existing Addresses */}
              {!showNewAddress && addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-leaf-600 bg-leaf-50/40 shadow-sm'
                          : 'border-charcoal-100 hover:border-charcoal-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-charcoal-900 text-sm">{addr.full_name}</span>
                        {selectedAddressId === addr.id && (
                          <CheckCircle2 className="w-4 h-4 text-leaf-600" />
                        )}
                      </div>
                      <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                        {addr.house_flat}, {addr.street}, {addr.area}<br />
                        {addr.city}, {addr.district} - {addr.pin_code}
                      </p>
                      <p className="text-xs font-medium text-charcoal-500 mt-2">📞 {addr.mobile}</p>
                    </div>
                  ))}
                </div>
              ) : (
                /* New Address Form */
                <form onSubmit={handleCreateAddress} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-600 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={newAddress.fullName}
                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                        className="w-full px-3.5 py-2 border border-charcoal-200 rounded-xl text-sm focus:ring-2 focus:ring-leaf-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-600 mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        value={newAddress.mobile}
                        onChange={(e) => setNewAddress({ ...newAddress, mobile: e.target.value })}
                        className="w-full px-3.5 py-2 border border-charcoal-200 rounded-xl text-sm focus:ring-2 focus:ring-leaf-500 focus:outline-none"
                        placeholder="10-digit mobile number"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-600 mb-1">House / Flat / Building</label>
                      <input
                        type="text"
                        required
                        value={newAddress.houseFlat}
                        onChange={(e) => setNewAddress({ ...newAddress, houseFlat: e.target.value })}
                        className="w-full px-3.5 py-2 border border-charcoal-200 rounded-xl text-sm focus:ring-2 focus:ring-leaf-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-600 mb-1">Street / Landmark</label>
                      <input
                        type="text"
                        required
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        className="w-full px-3.5 py-2 border border-charcoal-200 rounded-xl text-sm focus:ring-2 focus:ring-leaf-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-600 mb-1">City / Taluka</label>
                      <input
                        type="text"
                        required
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full px-3.5 py-2 border border-charcoal-200 rounded-xl text-sm focus:ring-2 focus:ring-leaf-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-600 mb-1">District</label>
                      <select
                        value={newAddress.district}
                        onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                        className="w-full px-3.5 py-2 border border-charcoal-200 rounded-xl text-sm focus:ring-2 focus:ring-leaf-500 focus:outline-none bg-white"
                      >
                        {MAHARASHTRA_DISTRICTS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-600 mb-1">PIN Code</label>
                      <input
                        type="text"
                        required
                        pattern="[0-9]{6}"
                        value={newAddress.pinCode}
                        onChange={(e) => setNewAddress({ ...newAddress, pinCode: e.target.value })}
                        className="w-full px-3.5 py-2 border border-charcoal-200 rounded-xl text-sm focus:ring-2 focus:ring-leaf-500 focus:outline-none"
                        placeholder="6 digits"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowNewAddress(false)}
                        className="px-4 py-2 border border-charcoal-200 text-charcoal-600 rounded-xl text-sm font-semibold"
                      >
                        Cancel
                      </button>
                    )}
                    <button type="submit" className="btn-primary text-sm px-6 py-2">
                      Save & Use This Address
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* 2. Delivery Options */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-charcoal-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-leaf-100 text-leaf-800 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h2 className="text-lg font-bold text-charcoal-900">
                  {lang === 'en' ? 'Delivery Speed' : 'वितरण पद्धत'}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setDeliveryMethod('standard')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    deliveryMethod === 'standard'
                      ? 'border-leaf-600 bg-leaf-50/40'
                      : 'border-charcoal-100 hover:border-charcoal-300'
                  }`}
                >
                  <Truck className="w-5 h-5 text-leaf-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-charcoal-900 text-sm">Standard Farm Dispatch</div>
                    <p className="text-xs text-charcoal-500 mt-0.5">24 - 48 Hours across Maharashtra</p>
                    <div className="text-xs font-semibold text-leaf-700 mt-2">
                      {subtotal >= 499 ? 'FREE (Orders > ₹499)' : '₹49'}
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setDeliveryMethod('express')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    deliveryMethod === 'express'
                      ? 'border-leaf-600 bg-leaf-50/40'
                      : 'border-charcoal-100 hover:border-charcoal-300'
                  }`}
                >
                  <Truck className="w-5 h-5 text-lemon-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-charcoal-900 text-sm">Express Cold-Chain Next Day</div>
                    <p className="text-xs text-charcoal-500 mt-0.5">Guaranteed next morning arrival</p>
                    <div className="text-xs font-semibold text-charcoal-900 mt-2">₹60</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-charcoal-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-leaf-100 text-leaf-800 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h2 className="text-lg font-bold text-charcoal-900">
                  {lang === 'en' ? 'Payment Method' : 'पेमेंट पर्याय'}
                </h2>
              </div>

              <div className="space-y-3">
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'cod' ? 'border-leaf-600 bg-leaf-50/30' : 'border-charcoal-100 hover:border-charcoal-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="text-leaf-600 focus:ring-leaf-500"
                    />
                    <div className="flex items-center gap-2">
                      <Banknote className="w-5 h-5 text-leaf-700" />
                      <span className="font-bold text-sm text-charcoal-900">
                        {lang === 'en' ? 'Cash on Delivery (COD)' : 'डिलिव्हरीवर रोख (COD)'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-charcoal-500">Pay when fresh lemons arrive</span>
                </label>

                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'upi' ? 'border-leaf-600 bg-leaf-50/30' : 'border-charcoal-100 hover:border-charcoal-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="text-leaf-600 focus:ring-leaf-500"
                    />
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-leaf-700" />
                      <span className="font-bold text-sm text-charcoal-900">
                        Instant UPI (GPay, PhonePe, Paytm, BHIM)
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-leaf-700 font-semibold">Fast & Zero Fee</span>
                </label>

                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'card' ? 'border-leaf-600 bg-leaf-50/30' : 'border-charcoal-100 hover:border-charcoal-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="text-leaf-600 focus:ring-leaf-500"
                    />
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-leaf-700" />
                      <span className="font-bold text-sm text-charcoal-900">
                        Credit / Debit Card / Net Banking
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-charcoal-500">Secure simulated gateway</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-charcoal-100">
              <h3 className="font-bold text-charcoal-900 text-base mb-4">
                {lang === 'en' ? 'Items in Order' : 'ऑर्डरमधील वस्तू'} ({items.length})
              </h3>

              <div className="divide-y divide-charcoal-100 max-h-60 overflow-y-auto mb-4 pr-1">
                {items.map((it) => (
                  <div key={it.product_id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🍋</span>
                      <span className="font-medium text-charcoal-800 line-clamp-1 max-w-[140px]">
                        {it.product?.name_en || 'Lemons'}
                      </span>
                      <span className="text-charcoal-400">×{it.quantity}</span>
                    </div>
                    <span className="font-bold text-charcoal-900">
                      ₹{(it.product?.price || 0) * it.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 text-xs text-charcoal-600 border-t border-charcoal-100 pt-4 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-charcoal-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery ({deliveryMethod})</span>
                  <span className="font-semibold text-charcoal-900">₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between items-baseline border-t border-charcoal-100 pt-3">
                  <span className="text-sm font-bold text-charcoal-900">Total Payable</span>
                  <span className="text-xl font-extrabold text-charcoal-900">₹{total}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="btn-primary w-full py-4 text-base font-bold shadow-lg shadow-leaf-700/20"
              >
                {submitting
                  ? (lang === 'en' ? 'Processing Order...' : 'ऑर्डर प्रक्रिया सुरू आहे...')
                  : (lang === 'en' ? `Place Order • ₹${total}` : `ऑर्डर द्या • ₹${total}`)}
              </button>
            </div>

            <div className="bg-sand-100/60 rounded-2xl p-4 border border-charcoal-100/80 text-xs text-charcoal-600 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-leaf-700 flex-shrink-0" />
              <span>Direct farmer benefit: 100% genuine farm produce delivered to your doorstep.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
