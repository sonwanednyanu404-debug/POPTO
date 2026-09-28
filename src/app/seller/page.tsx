'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import { useAuthStore } from '@/lib/store';
import { Sprout, Package, TrendingUp, AlertTriangle, Plus, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function SellerDashboardPage() {
  const router = useRouter();
  const { t, lang } = useTranslation();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/seller');
      return;
    }
    if (user.role !== 'seller' && user.role !== 'admin' && user.role !== 'superadmin') {
      router.push('/account');
      return;
    }

    async function load() {
      try {
        const res = await fetch('/api/products?limit=50');
        const data = await res.json();
        if (data.data) {
          setProducts(data.data);
          const totalStock = data.data.reduce((sum: number, p: any) => sum + (p.stock || 0), 0);
          const totalSold = data.data.reduce((sum: number, p: any) => sum + (p.total_sold || 0), 0);
          const estRevenue = data.data.reduce((sum: number, p: any) => sum + ((p.total_sold || 0) * (p.price || 0)), 0);

          setStats({
            count: data.data.length,
            totalStock,
            totalSold,
            estRevenue,
          });
        }
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-leaf-100 text-leaf-800 font-bold px-2.5 py-0.5 rounded-full uppercase">
                Farmer & Seller Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
              {lang === 'en' ? 'Grove Operations Dashboard' : 'शेतकरी डॅशबोर्ड'}
            </h1>
            <p className="text-sm text-charcoal-500">Welcome, {user.full_name}</p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/seller/products"
              className="btn-primary text-xs px-5 py-2.5 flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'en' ? 'Add Lemon Harvest' : 'नवीन लिंबू उत्पादन जोडा'}</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-charcoal-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-charcoal-500 uppercase">Live Varieties</span>
              <div className="w-8 h-8 rounded-xl bg-lemon-100 flex items-center justify-center text-sm">🍋</div>
            </div>
            <span className="text-3xl font-extrabold text-charcoal-900">{stats?.count || 0}</span>
            <span className="text-xs text-charcoal-400 block mt-1">Active lemon listings</span>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-charcoal-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-charcoal-500 uppercase">Total Harvest Sold</span>
              <div className="w-8 h-8 rounded-xl bg-leaf-100 text-leaf-700 flex items-center justify-center text-sm font-bold">Kg</div>
            </div>
            <span className="text-3xl font-extrabold text-charcoal-900">{stats?.totalSold || 0}</span>
            <span className="text-xs text-charcoal-400 block mt-1">Directly dispatched</span>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-charcoal-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-charcoal-500 uppercase">Available Stock</span>
              <div className="w-8 h-8 rounded-xl bg-sand-100 flex items-center justify-center text-sm">📦</div>
            </div>
            <span className="text-3xl font-extrabold text-charcoal-900">{stats?.totalStock || 0}</span>
            <span className="text-xs text-charcoal-400 block mt-1">In crates ready to ship</span>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-charcoal-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-charcoal-500 uppercase">Est. Direct Revenue</span>
              <div className="w-8 h-8 rounded-xl bg-leaf-50 text-leaf-700 flex items-center justify-center text-sm font-bold">₹</div>
            </div>
            <span className="text-3xl font-extrabold text-charcoal-900">₹{stats?.estRevenue || 0}</span>
            <span className="text-xs text-leaf-700 font-semibold block mt-1">0% Middleman Deduction</span>
          </div>
        </div>

        {/* Harvest Listings Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-charcoal-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-charcoal-900">
              {lang === 'en' ? 'Your Lemon Listings' : 'तुमची लिंबू उत्पादने'}
            </h2>
            <Link href="/seller/products" className="text-xs font-bold text-leaf-700 hover:text-leaf-800">
              Manage All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-charcoal-100 text-charcoal-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Variety</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Sold</th>
                  <th className="py-3 px-4">Organic</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {products.slice(0, 5).map((p) => (
                  <tr key={p.id} className="hover:bg-sand-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-charcoal-900 flex items-center gap-2">
                      <span>🍋</span>
                      <span>{p.name_en}</span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-charcoal-800">₹{p.price} / {p.unit}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold ${
                        p.stock < 20 ? 'bg-red-50 text-red-700' : 'bg-leaf-50 text-leaf-700'
                      }`}>
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-charcoal-600 font-medium">{p.total_sold || 0}</td>
                    <td className="py-4 px-4">
                      {p.is_organic ? (
                        <span className="text-leaf-700 font-semibold">✓ Yes</span>
                      ) : (
                        <span className="text-charcoal-400">No</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/shop/${p.slug || p.id}`}
                        className="text-leaf-700 hover:underline font-bold"
                      >
                        Preview
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
