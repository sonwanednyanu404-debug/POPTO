'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { useAuthStore } from '@/lib/store';
import {
  User,
  Package,
  Heart,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';

export default function AccountOverviewPage() {
  const router = useRouter();
  const { t, lang } = useTranslation();
  const { user, logout } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/account');
      return;
    }

    async function load() {
      try {
        const res = await fetch('/api/orders', {
          headers: { Authorization: `Bearer ${localStorage.getItem('popto_token')}` },
        });
        const data = await res.json();
        if (data.data) setOrders(data.data.slice(0, 3));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-sand-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-charcoal-100 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lemon-400 to-leaf-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
              {user.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-charcoal-900">{user.full_name}</h1>
                <span className="text-xs bg-leaf-100 text-leaf-800 px-2.5 py-0.5 rounded-full font-semibold uppercase">
                  {user.role}
                </span>
              </div>
              <p className="text-sm text-charcoal-500 mt-0.5">{user.email} • {user.mobile || 'No mobile set'}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="px-4 py-2 border border-charcoal-200 hover:bg-charcoal-50 text-charcoal-700 rounded-xl text-xs font-semibold transition-colors"
            >
              {lang === 'en' ? 'Log Out' : 'लॉग आउट'}
            </button>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Link
            href="/account/orders"
            className="bg-white rounded-3xl p-6 shadow-sm border border-charcoal-100 hover:border-leaf-500 transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-leaf-50 text-leaf-700 flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-charcoal-900 text-base">
                  {lang === 'en' ? 'My Orders' : 'माझ्या ऑर्डर्स'}
                </h3>
                <p className="text-xs text-charcoal-500">Track & view history</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-charcoal-400 group-hover:text-leaf-600 transition-colors" />
          </Link>

          <Link
            href="/account/wishlist"
            className="bg-white rounded-3xl p-6 shadow-sm border border-charcoal-100 hover:border-leaf-500 transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-charcoal-900 text-base">
                  {lang === 'en' ? 'Saved Wishlist' : 'इच्छासूची'}
                </h3>
                <p className="text-xs text-charcoal-500">Favorite lemon varieties</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-charcoal-400 group-hover:text-leaf-600 transition-colors" />
          </Link>

          <Link
            href="/account/addresses"
            className="bg-white rounded-3xl p-6 shadow-sm border border-charcoal-100 hover:border-leaf-500 transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-lemon-100 text-charcoal-900 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-charcoal-900 text-base">
                  {lang === 'en' ? 'Delivery Addresses' : 'पत्ते व्यवस्थापन'}
                </h3>
                <p className="text-xs text-charcoal-500">Maharashtra locations</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-charcoal-400 group-hover:text-leaf-600 transition-colors" />
          </Link>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-charcoal-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-charcoal-900">
              {lang === 'en' ? 'Recent Orders' : 'अलीकडील ऑर्डर्स'}
            </h2>
            <Link
              href="/account/orders"
              className="text-xs font-semibold text-leaf-700 hover:text-leaf-800 flex items-center gap-1"
            >
              {lang === 'en' ? 'View All' : 'सर्व पहा'} →
            </Link>
          </div>

          {loading ? (
            <p className="text-xs text-charcoal-400">Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-charcoal-500 mb-4">
                {lang === 'en' ? 'You haven’t placed any orders yet.' : 'आपण अद्याप कोणतीही ऑर्डर दिलेली नाही.'}
              </p>
              <Link href="/shop" className="btn-primary inline-flex items-center gap-2 text-xs px-5 py-2.5">
                <ShoppingBag className="w-3.5 h-3.5" />
                {lang === 'en' ? 'Explore Fresh Lemons' : 'ताजी लिंबे खरेदी करा'}
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-charcoal-100">
              {orders.map((ord) => (
                <div key={ord.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-charcoal-900 text-sm">#{ord.order_number || ord.id.slice(0, 8)}</span>
                      <span className="bg-leaf-100 text-leaf-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-500 mt-1">
                      {ord.created_at} • ₹{ord.total} • {ord.item_count || 1} items
                    </p>
                  </div>
                  <Link
                    href={`/orders/${ord.id}`}
                    className="text-xs font-bold text-leaf-700 hover:text-leaf-800 border border-leaf-200 px-4 py-2 rounded-xl hover:bg-leaf-50 transition-colors"
                  >
                    {lang === 'en' ? 'Track Order' : 'ट्रॅक करा'}
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
