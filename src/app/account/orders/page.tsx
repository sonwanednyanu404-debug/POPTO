'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import { useAuthStore } from '@/lib/store';
import { Package, ArrowLeft, ExternalLink, Clock, ChevronRight } from 'lucide-react';

export default function AccountOrdersPage() {
  const router = useRouter();
  const { t, lang } = useTranslation();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/account/orders');
      return;
    }

    async function load() {
      try {
        const res = await fetch('/api/orders', {
          headers: { Authorization: `Bearer ${localStorage.getItem('popto_token')}` },
        });
        const data = await res.json();
        if (data.data) setOrders(data.data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  return (
    <div className="min-h-screen bg-sand-50/50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Link href="/account" className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-leaf-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> {lang === 'en' ? 'Back to Account' : 'परत खात्याकडे'}
        </Link>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 mb-8">
          {lang === 'en' ? 'My Order History' : 'माझ्या ऑर्डर्सचा इतिहास'}
        </h1>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-charcoal-100">
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-leaf-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-lemon-100 text-charcoal-800 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                📦
              </div>
              <h3 className="text-base font-bold text-charcoal-900 mb-1">No Orders Found</h3>
              <p className="text-xs text-charcoal-500 mb-6">You haven’t ordered any lemons yet.</p>
              <Link href="/shop" className="btn-primary text-xs px-6 py-2.5">
                Start Shopping Lemons
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-charcoal-100">
              {orders.map((ord) => (
                <div key={ord.id} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-charcoal-900 text-base">
                        #{ord.order_number || ord.id.slice(0, 8)}
                      </span>
                      <span className="bg-leaf-100 text-leaf-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{ord.created_at}</span>
                      <span>•</span>
                      <span>Payment: <strong className="uppercase">{ord.payment_method}</strong></span>
                    </p>
                    <div className="text-sm font-extrabold text-charcoal-900 pt-1">
                      Total: ₹{ord.total}
                    </div>
                  </div>

                  <Link
                    href={`/orders/${ord.id}`}
                    className="btn-primary text-xs px-5 py-2.5 flex items-center gap-1.5 shadow-sm"
                  >
                    <span>{lang === 'en' ? 'Track Live Timeline' : 'थेट ट्रॅकिंग पहा'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
