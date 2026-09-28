'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { CheckCircle2, Package, Truck, ArrowRight, Home, ShieldCheck } from 'lucide-react';

export default function OrderConfirmationPage() {
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
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-leaf-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50/50 py-12">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="w-20 h-20 bg-leaf-100 text-leaf-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <h1 className="text-3xl font-extrabold text-charcoal-900 mb-2">
          {lang === 'en' ? 'Order Confirmed!' : 'ऑर्डर निश्चित झाली!'}
        </h1>
        <p className="text-charcoal-600 mb-6">
          {lang === 'en'
            ? 'Thank you for supporting Maharashtra lemon farmers directly. Your fresh produce order has been received.'
            : 'महाराष्ट्रातील लिंबू उत्पादक शेतकऱ्यांना थेट पाठिंबा दिल्याबद्दल धन्यवाद. तुमची ऑर्डर मिळाली आहे.'}
        </p>

        {order && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-charcoal-100 text-left mb-8 space-y-6">
            <div className="flex items-center justify-between border-b border-charcoal-100 pb-4">
              <div>
                <span className="text-xs text-charcoal-400 block font-medium">Order Number</span>
                <span className="font-mono font-bold text-charcoal-900">{order.order_number}</span>
              </div>
              <span className="bg-leaf-100 text-leaf-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                {order.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-charcoal-400 block">Total Paid / Due</span>
                <span className="font-extrabold text-charcoal-900 text-base">₹{order.total}</span>
              </div>
              <div>
                <span className="text-charcoal-400 block">Payment Method</span>
                <span className="font-semibold text-charcoal-800 uppercase">{order.payment_method}</span>
              </div>
            </div>

            {/* Items */}
            <div className="border-t border-charcoal-100 pt-4">
              <h4 className="text-xs font-bold text-charcoal-500 uppercase tracking-wider mb-3">
                Items ({order.items?.length || 0})
              </h4>
              <div className="space-y-2">
                {order.items?.map((it: any) => (
                  <div key={it.id} className="flex justify-between text-xs py-1">
                    <span className="text-charcoal-800 font-medium">
                      🍋 {it.product_name} × {it.quantity} {it.unit}
                    </span>
                    <span className="font-bold text-charcoal-900">₹{it.total}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline info */}
            <div className="bg-sand-50 rounded-2xl p-4 border border-charcoal-100 text-xs text-charcoal-600 space-y-2">
              <div className="flex items-center gap-2 text-leaf-800 font-semibold">
                <Truck className="w-4 h-4" />
                <span>Estimated Delivery: Within 24-48 Hours</span>
              </div>
              <p>Direct farm cold-chain dispatch scheduled from Solapur/Ahmednagar orchards.</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/orders/${id}`}
            className="btn-primary w-full sm:w-auto px-6 py-3 flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            <span>{lang === 'en' ? 'Track Live Order' : 'थेट ऑर्डर ट्रॅक करा'}</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 border border-charcoal-200 hover:bg-charcoal-50 text-charcoal-700 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>{lang === 'en' ? 'Return to Home' : 'मुख्यपृष्ठावर जा'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
