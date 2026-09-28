'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { useAuthStore, useToastStore } from '@/lib/store';
import {
  User,
  MapPin,
  Package,
  Activity,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
} from 'lucide-react';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t, lang } = useTranslation();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=/admin/customers/${id}`);
      return;
    }
    load();
  }, [user, id]);

  const load = async () => {
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('popto_token')}` },
      });
      const data = await res.json();
      if (data.data) setCustomer(data.data);
    } catch {
      setCustomer(null);
    }
    setLoading(false);
  };

  const handleToggleStatus = async () => {
    try {
      const res = await fetch(`/api/admin/customers/${customer.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('popto_token')}`,
        },
        body: JSON.stringify({ isActive: customer.is_active === 1 ? false : true }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast({ message: data.message, type: 'success' });
        load();
      }
    } catch {
      addToast({ message: 'Error updating customer status', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-leaf-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-charcoal-900 mb-2">Customer Not Found</h2>
        <Link href="/admin/customers" className="btn-primary inline-flex items-center gap-2 text-xs px-5 py-2.5">
          <ArrowLeft className="w-4 h-4" /> Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/admin/customers" className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-leaf-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Customer List
        </Link>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-charcoal-100 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lemon-400 to-leaf-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
              {customer.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-charcoal-900">{customer.full_name}</h1>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                  customer.is_active === 1 ? 'bg-leaf-100 text-leaf-800' : 'bg-red-100 text-red-700'
                }`}>
                  {customer.is_active === 1 ? 'Active Account' : 'Deactivated'}
                </span>
              </div>
              <p className="text-xs text-charcoal-500 mt-1">
                {customer.email} • Mobile: {customer.mobile || 'None'} • Preferred Language: {customer.preferred_language?.toUpperCase() || 'EN'}
              </p>
              <p className="text-[11px] text-charcoal-400 mt-0.5">
                Registered on: {customer.created_at} • User ID: <span className="font-mono">{customer.id}</span>
              </p>
            </div>
          </div>

          <div>
            <button
              onClick={handleToggleStatus}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm ${
                customer.is_active === 1
                  ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                  : 'btn-primary'
              }`}
            >
              {customer.is_active === 1 ? 'Deactivate Customer' : 'Reactivate Customer'}
            </button>
          </div>
        </div>

        {/* Customer Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-charcoal-100 shadow-sm">
            <span className="text-[10px] text-charcoal-400 font-bold uppercase block">Customer ID</span>
            <span className="text-xs font-mono font-bold text-charcoal-800 truncate block mt-0.5" title={customer.id}>
              {customer.id}
            </span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-charcoal-100 shadow-sm">
            <span className="text-[10px] text-charcoal-400 font-bold uppercase block">Last Login Time</span>
            <span className="text-xs font-bold text-charcoal-900 block mt-0.5">
              {customer.last_login || 'No recorded login'}
            </span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-charcoal-100 shadow-sm">
            <span className="text-[10px] text-charcoal-400 font-bold uppercase block">Total Orders</span>
            <span className="text-base font-extrabold text-charcoal-900 block mt-0.5">
              {customer.total_orders || customer.orders?.length || 0}
            </span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-charcoal-100 shadow-sm">
            <span className="text-[10px] text-charcoal-400 font-bold uppercase block">Total Spending</span>
            <span className="text-base font-extrabold text-leaf-700 block mt-0.5">
              ₹{customer.total_spent || 0}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Saved Addresses */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-charcoal-100">
            <h2 className="text-base font-bold text-charcoal-900 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-leaf-600" />
              <span>Registered Delivery Addresses ({customer.addresses?.length || 0})</span>
            </h2>

            <div className="space-y-3">
              {customer.addresses && customer.addresses.length > 0 ? (
                customer.addresses.map((addr: any) => (
                  <div key={addr.id} className="p-3.5 rounded-2xl bg-sand-50/60 border border-charcoal-100 text-xs text-charcoal-700">
                    <span className="font-bold text-charcoal-900 block">{addr.full_name}</span>
                    <p className="mt-0.5">{addr.house_flat}, {addr.street}, {addr.city}, {addr.district} - {addr.pin_code}</p>
                    <span className="text-[11px] text-charcoal-500 mt-1 block">Phone: {addr.mobile}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-charcoal-400">No saved addresses on file.</p>
              )}
            </div>
          </div>

          {/* Customer Orders */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-charcoal-100">
            <h2 className="text-base font-bold text-charcoal-900 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-leaf-600" />
              <span>Orders Placed ({customer.orders?.length || 0})</span>
            </h2>

            <div className="divide-y divide-charcoal-100 max-h-72 overflow-y-auto pr-1">
              {customer.orders && customer.orders.length > 0 ? (
                customer.orders.map((o: any) => (
                  <div key={o.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-charcoal-900 block">
                        #{o.order_number || o.id.slice(0, 8)}
                      </span>
                      <span className="text-[11px] text-charcoal-400">{o.created_at}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-charcoal-900 block">₹{o.total}</span>
                      <span className="text-[10px] font-bold text-leaf-700 uppercase bg-leaf-50 px-2 py-0.5 rounded">
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-charcoal-400 py-2">No orders placed yet.</p>
              )}
            </div>
          </div>

          {/* Customer Wishlist */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-charcoal-100">
            <h2 className="text-base font-bold text-charcoal-900 mb-4 flex items-center gap-2">
              <span className="text-base">❤️</span>
              <span>Saved Wishlist ({customer.wishlist?.length || 0})</span>
            </h2>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {customer.wishlist && customer.wishlist.length > 0 ? (
                customer.wishlist.map((w: any) => (
                  <div key={w.id} className="p-3 rounded-xl bg-sand-50/60 border border-charcoal-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-charcoal-900 block">{w.name_en}</span>
                      <span className="text-[11px] text-charcoal-500">₹{w.price} / {w.unit}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-leaf-700 bg-leaf-50 px-2 py-0.5 rounded">In Wishlist</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-charcoal-400 py-2">No items currently in wishlist.</p>
              )}
            </div>
          </div>

          {/* Customer Reviews */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-charcoal-100">
            <h2 className="text-base font-bold text-charcoal-900 mb-4 flex items-center gap-2">
              <span className="text-base">⭐</span>
              <span>Submitted Reviews ({customer.reviews?.length || 0})</span>
            </h2>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {customer.reviews && customer.reviews.length > 0 ? (
                customer.reviews.map((r: any) => (
                  <div key={r.id} className="p-3 rounded-xl bg-sand-50/60 border border-charcoal-100 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-charcoal-900">{r.product_name}</span>
                      <span className="font-bold text-lemon-600">{r.rating} ★</span>
                    </div>
                    <p className="text-charcoal-600 text-[11px] italic">&ldquo;{r.comment}&rdquo;</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-charcoal-400 py-2">No reviews submitted yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Real Customer Login History */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-charcoal-100">
          <h2 className="text-base font-bold text-charcoal-900 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-leaf-600" />
            <span>Real Customer Login History (from Database)</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-charcoal-100 text-charcoal-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Device / Browser</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {customer.loginActivity && customer.loginActivity.length > 0 ? (
                  customer.loginActivity.map((log: any) => (
                    <tr key={log.id} className="hover:bg-sand-50/50">
                      <td className="py-3 px-4 font-semibold text-charcoal-800">{log.action}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          log.status === 'success' ? 'bg-leaf-100 text-leaf-800' : 'bg-red-100 text-red-700'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-charcoal-600">{log.ip_address}</td>
                      <td className="py-3 px-4 text-charcoal-500">{log.device_type || 'Desktop'} • {log.browser || 'Browser'}</td>
                      <td className="py-3 px-4 text-right text-charcoal-400 text-[11px]">{log.created_at}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 px-4 text-center text-charcoal-400">
                      No recorded login activity for this user.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
