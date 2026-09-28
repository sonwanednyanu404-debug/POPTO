'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import { useAuthStore } from '@/lib/store';
import {
  Users,
  Package,
  TrendingUp,
  ShieldAlert,
  Clock,
  Activity,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { t, lang } = useTranslation();
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/admin');
      return;
    }
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      router.push('/account');
      return;
    }

    async function load() {
      try {
        const res = await fetch('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${localStorage.getItem('popto_token')}` },
        });
        const resData = await res.json();
        if (resData.success) setData(resData.data);
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
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-leaf-100 text-leaf-800 font-bold px-2.5 py-0.5 rounded-full uppercase">
                {user.role} control panel
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
              POPTO Platform Administration
            </h1>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Live Maharashtra Lemon Marketplace Intelligence & Governance
            </p>
          </div>

          {/* Quick Nav Pill Links */}
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/customers"
              className="bg-white hover:bg-leaf-50 text-charcoal-800 hover:text-leaf-700 border border-charcoal-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors"
            >
              👥 Customers
            </Link>
            <Link
              href="/admin/login-activity"
              className="bg-white hover:bg-leaf-50 text-charcoal-800 hover:text-leaf-700 border border-charcoal-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors"
            >
              🔐 Login Activity
            </Link>
            <Link
              href="/admin/orders"
              className="bg-white hover:bg-leaf-50 text-charcoal-800 hover:text-leaf-700 border border-charcoal-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors"
            >
              📦 Orders
            </Link>
            <Link
              href="/seller/products"
              className="bg-white hover:bg-leaf-50 text-charcoal-800 hover:text-leaf-700 border border-charcoal-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors"
            >
              🍋 Lemon Catalog
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-4 border-leaf-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-charcoal-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-charcoal-500 uppercase">Total Revenue</span>
                  <div className="w-8 h-8 rounded-xl bg-leaf-50 text-leaf-700 flex items-center justify-center font-bold text-sm">
                    ₹
                  </div>
                </div>
                <span className="text-3xl font-extrabold text-charcoal-900">
                  ₹{data?.stats?.totalRevenue || 0}
                </span>
                <span className="text-[11px] text-leaf-700 font-semibold block mt-1">
                  Today: ₹{data?.stats?.todayRevenue || 0}
                </span>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-charcoal-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-charcoal-500 uppercase">Total Orders</span>
                  <div className="w-8 h-8 rounded-xl bg-lemon-100 text-charcoal-900 flex items-center justify-center font-bold text-sm">
                    📦
                  </div>
                </div>
                <span className="text-3xl font-extrabold text-charcoal-900">
                  {data?.stats?.totalOrders || 0}
                </span>
                <span className="text-[11px] text-charcoal-500 font-medium block mt-1">
                  {data?.stats?.todayOrders || 0} placed today
                </span>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-charcoal-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-charcoal-500 uppercase">Real Customers</span>
                  <div className="w-8 h-8 rounded-xl bg-sand-100 text-charcoal-700 flex items-center justify-center text-sm">
                    👥
                  </div>
                </div>
                <span className="text-3xl font-extrabold text-charcoal-900">
                  {data?.stats?.totalCustomers || 0}
                </span>
                <span className="text-[11px] text-charcoal-500 font-medium block mt-1">
                  From {data?.stats?.totalFarmers || 0} verified groves
                </span>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-charcoal-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-charcoal-500 uppercase">Auth Security</span>
                  <div className="w-8 h-8 rounded-xl bg-leaf-50 text-leaf-700 flex items-center justify-center text-sm">
                    🛡️
                  </div>
                </div>
                <span className="text-3xl font-extrabold text-charcoal-900">
                  {data?.stats?.todayLogins || 0}
                </span>
                <span className="text-[11px] text-charcoal-500 font-medium block mt-1">
                  {data?.stats?.failedLogins || 0} failed login attempts logged
                </span>
              </div>
            </div>

            {/* Quick Links Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Recent Orders */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-charcoal-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-charcoal-900 text-base flex items-center gap-2">
                    <Package className="w-4 h-4 text-leaf-600" />
                    <span>Recent Customer Orders</span>
                  </h3>
                  <Link href="/admin/orders" className="text-xs font-bold text-leaf-700 hover:text-leaf-800">
                    View All →
                  </Link>
                </div>

                <div className="divide-y divide-charcoal-100">
                  {data?.recentOrders && data.recentOrders.length > 0 ? (
                    data.recentOrders.map((ord: any) => (
                      <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-charcoal-900">
                              #{ord.order_number || ord.id.slice(0, 8)}
                            </span>
                            <span className="bg-leaf-100 text-leaf-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                              {ord.status}
                            </span>
                          </div>
                          <span className="text-charcoal-500 text-[11px]">{ord.customer_name} • {ord.created_at}</span>
                        </div>
                        <span className="font-extrabold text-charcoal-900">₹{ord.total}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-charcoal-400 py-4">No recent orders.</p>
                  )}
                </div>
              </div>

              {/* Real Login Activity Snapshot */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-charcoal-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-charcoal-900 text-base flex items-center gap-2">
                    <Activity className="w-4 h-4 text-leaf-600" />
                    <span>Real Login Activity Audit</span>
                  </h3>
                  <Link href="/admin/login-activity" className="text-xs font-bold text-leaf-700 hover:text-leaf-800">
                    Full Logs →
                  </Link>
                </div>

                <div className="divide-y divide-charcoal-100">
                  {data?.recentLogins && data.recentLogins.length > 0 ? (
                    data.recentLogins.slice(0, 5).map((log: any) => (
                      <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-charcoal-900">{log.email}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              log.status === 'success' ? 'bg-leaf-100 text-leaf-800' : 'bg-red-100 text-red-700'
                            }`}>
                              {log.status}
                            </span>
                          </div>
                          <span className="text-charcoal-500 text-[11px]">
                            {log.action} • {log.ip_address} • {log.device_type || 'Desktop'}
                          </span>
                        </div>
                        <span className="text-[10px] text-charcoal-400">{log.created_at}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-charcoal-400 py-4">No login logs recorded yet.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
