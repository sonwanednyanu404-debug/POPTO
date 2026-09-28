'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  ArrowLeft,
  Calendar,
  CreditCard,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

const ORDER_STEPS = [
  { key: 'pending', title: 'Order Placed', desc: 'Received & sent to farm' },
  { key: 'confirmed', title: 'Confirmed', desc: 'Approved by farmer grove' },
  { key: 'processing', title: 'Harvesting', desc: 'Freshly handpicked' },
  { key: 'packed', title: 'Packed', desc: 'Sorted in breathable crate' },
  { key: 'shipped', title: 'In Transit', desc: 'On road across Maharashtra' },
  { key: 'delivered', title: 'Delivered', desc: 'Arrived at your door' },
];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const { t, lang } = useTranslation();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('popto_token')}` },
        });
        const data = await res.json();
        if (data.success) setOrder(data.data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-leaf-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-charcoal-500">Loading order timeline...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-charcoal-900 mb-2">Order Not Found</h2>
        <p className="text-charcoal-500 mb-6">Could not find tracking details for this order ID.</p>
        <Link href="/account/orders" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </Link>
      </div>
    );
  }

  // Parse address snapshot
  let address: any = null;
  try {
    address = typeof order.address_snapshot === 'string' ? JSON.parse(order.address_snapshot) : order.address_snapshot;
  } catch {}

  const currentStatusIndex = ORDER_STEPS.findIndex((s) => s.key === order.status);
  const activeIdx = currentStatusIndex === -1 ? 0 : currentStatusIndex;

  return (
    <div className="min-h-screen bg-sand-50/50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/account/orders" className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-leaf-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> {lang === 'en' ? 'Back to Order History' : 'मागील ऑर्डरकडे जा'}
        </Link>

        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-charcoal-100 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-extrabold text-charcoal-900">
                Order #{order.order_number || (order.id && order.id.slice(0, 8))}
              </h1>
              <span className="bg-leaf-100 text-leaf-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                {order.status}
              </span>
            </div>
            <p className="text-xs text-charcoal-500 mt-1">
              Placed on {order.created_at} • Payment: <strong className="uppercase">{order.payment_method} ({order.payment_status})</strong>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-charcoal-400 block">Total Amount</span>
            <span className="text-2xl font-extrabold text-charcoal-900">₹{order.total}</span>
          </div>
        </div>

        {/* Visual Progress Stepper */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-charcoal-100 mb-8">
          <h2 className="text-base font-bold text-charcoal-900 mb-6">
            {lang === 'en' ? 'Live Harvest & Delivery Timeline' : 'थेट काढणी व वितरण प्रगती'}
          </h2>

          <div className="relative">
            {/* Horizontal Line for Desktop */}
            <div className="hidden md:block absolute top-5 left-8 right-8 h-1 bg-charcoal-100 z-0">
              <div
                className="h-full bg-leaf-600 transition-all duration-500"
                style={{ width: `${(activeIdx / (ORDER_STEPS.length - 1)) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 relative z-10">
              {ORDER_STEPS.map((step, idx) => {
                const isPassed = idx <= activeIdx;
                const isCurrent = idx === activeIdx;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-colors mb-2 ${
                        isPassed
                          ? 'bg-leaf-600 text-white shadow-md shadow-leaf-600/30'
                          : 'bg-charcoal-100 text-charcoal-400'
                      } ${isCurrent ? 'ring-4 ring-leaf-200' : ''}`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>
                    <span className={`text-xs font-bold leading-tight ${isCurrent ? 'text-leaf-800' : 'text-charcoal-800'}`}>
                      {step.title}
                    </span>
                    <span className="text-[10px] text-charcoal-400 mt-0.5 leading-tight">{step.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Details & Delivery Address */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Items */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-charcoal-100 space-y-4">
            <h3 className="font-bold text-charcoal-900 text-sm uppercase tracking-wider">
              {lang === 'en' ? 'Ordered Produce' : 'ऑर्डर केलेली उत्पादने'} ({order.items?.length || 0})
            </h3>
            <div className="divide-y divide-charcoal-100">
              {order.items?.map((it: any) => (
                <div key={it.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-lemon-50 border border-charcoal-100 flex items-center justify-center text-xl overflow-hidden flex-shrink-0">
                      {it.product_image ? (
                        <img src={it.product_image} alt={it.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <span>🍋</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-charcoal-900 text-sm">{it.product_name}</h4>
                      <p className="text-xs text-charcoal-500">
                        {it.quantity} {it.unit} × ₹{it.price}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-charcoal-900">₹{it.total}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-charcoal-100 pt-4 space-y-2 text-xs text-charcoal-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-charcoal-900">₹{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-leaf-700 font-medium">
                  <span>Coupon Discount</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Cold-Chain Delivery</span>
                <span className="font-semibold text-charcoal-900">₹{order.delivery_fee}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-charcoal-900 border-t border-charcoal-100 pt-2">
                <span>Total</span>
                <span className="text-base text-leaf-700">₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Shipping Info & Log */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-charcoal-100">
              <h3 className="font-bold text-charcoal-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-leaf-600" />
                <span>Delivery Address</span>
              </h3>
              {address ? (
                <div className="text-xs text-charcoal-600 space-y-1">
                  <p className="font-bold text-charcoal-900">{address.full_name || address.fullName}</p>
                  <p>{address.house_flat || address.houseFlat}, {address.street}</p>
                  <p>{address.city}, {address.district} - {address.pin_code || address.pinCode}</p>
                  <p className="font-medium text-charcoal-700 pt-1">📞 {address.mobile}</p>
                </div>
              ) : (
                <p className="text-xs text-charcoal-400 italic">Address snapshot stored securely.</p>
              )}
            </div>

            {/* Status History Log */}
            {order.status_history && order.status_history.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-charcoal-100">
                <h3 className="font-bold text-charcoal-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-leaf-600" />
                  <span>Activity Log</span>
                </h3>
                <div className="space-y-3">
                  {order.status_history.map((hist: any) => (
                    <div key={hist.id} className="text-xs border-l-2 border-leaf-500 pl-3 py-0.5">
                      <span className="font-semibold text-charcoal-800 uppercase block">{hist.status}</span>
                      <p className="text-charcoal-500 text-[11px]">{hist.note}</p>
                      <span className="text-[10px] text-charcoal-400">{hist.created_at}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
