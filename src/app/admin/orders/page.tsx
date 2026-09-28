'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import { useAuthStore, useToastStore } from '@/lib/store';
import { Package, Filter, Clock, ArrowLeft, CheckCircle2, ChevronRight, Eye, RefreshCw } from 'lucide-react';

const STATUSES = ['all', 'pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const router = useRouter();
  const { t, lang } = useTranslation();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Status update modal / active order
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/orders?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('popto_token')}` },
      });
      const data = await res.json();
      if (data.data) {
        setOrders(data.data);
        setTotal(data.total);
      }
    } catch {
      setOrders([]);
    }
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/admin/orders');
      return;
    }
    loadOrders();
  }, [user, loadOrders]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !newStatus) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('popto_token')}`,
        },
        body: JSON.stringify({ status: newStatus, note: statusNote }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast({ message: data.message, type: 'success' });
        setSelectedOrder(null);
        setStatusNote('');
        loadOrders();
      } else {
        addToast({ message: data.error || 'Failed to update status', type: 'error' });
      }
    } catch {
      addToast({ message: 'Error updating order status', type: 'error' });
    }
    setUpdating(false);
  };

  return (
    <div className="min-h-screen bg-sand-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-leaf-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Admin Overview
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
              Orders Operations & Fulfillment
            </h1>
            <p className="text-xs text-charcoal-500 mt-1">
              Fulfill customer produce requests and update Maharashtra logistics status ({total} orders)
            </p>
          </div>

          <button
            onClick={loadOrders}
            className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Orders</span>
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
          {STATUSES.map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-leaf-700 text-white shadow-sm'
                  : 'bg-white text-charcoal-600 hover:bg-sand-100 border border-charcoal-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-charcoal-100">
          {loading ? (
            <div className="py-16 flex justify-center">
              <div className="w-8 h-8 border-4 border-leaf-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-charcoal-400 text-sm">
              No orders found matching &ldquo;{statusFilter}&rdquo;.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-charcoal-100 text-charcoal-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Produce Items</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-sand-50/50 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-charcoal-900">
                        #{o.order_number || o.id.slice(0, 8)}
                        <span className="text-[10px] text-charcoal-400 font-normal block">{o.created_at}</span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-charcoal-800">
                        <div>{o.customer_name}</div>
                        <div className="text-[11px] text-charcoal-400 font-normal">{o.customer_email}</div>
                      </td>
                      <td className="py-4 px-4 text-charcoal-600">
                        {o.items && o.items.length > 0 ? (
                          <span>
                            🍋 {o.items[0].product_name}
                            {o.items.length > 1 && ` +${o.items.length - 1} more`}
                          </span>
                        ) : (
                          <span>Produce items</span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-extrabold text-charcoal-900">₹{o.total}</td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-charcoal-700 uppercase block">{o.payment_method}</span>
                        <span className="text-[10px] text-charcoal-400 uppercase">{o.payment_status}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-leaf-100 text-leaf-800 font-bold px-2.5 py-0.5 rounded-full uppercase text-[10px]">
                          {o.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(o);
                            setNewStatus(o.status);
                          }}
                          className="btn-primary text-[11px] px-3 py-1.5 shadow-sm"
                        >
                          Update Status
                        </button>
                        <Link
                          href={`/orders/${o.id}`}
                          className="text-charcoal-600 hover:text-leaf-700 text-[11px] font-bold inline-flex items-center ml-2"
                        >
                          <Eye className="w-3.5 h-3.5 mr-0.5" /> Track
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Update Status Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-charcoal-100">
              <h3 className="font-bold text-base text-charcoal-900 mb-2">
                Update Order #{selectedOrder.order_number || selectedOrder.id.slice(0, 8)}
              </h3>
              <p className="text-xs text-charcoal-500 mb-6">
                Updating will automatically notify customer ({selectedOrder.customer_name}) and log in history.
              </p>

              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-charcoal-200 rounded-xl text-xs bg-white uppercase font-bold focus:outline-none focus:ring-2 focus:ring-leaf-500"
                  >
                    <option value="pending">PENDING</option>
                    <option value="confirmed">CONFIRMED</option>
                    <option value="processing">PROCESSING (HARVESTING)</option>
                    <option value="packed">PACKED (IN ECO-CRATE)</option>
                    <option value="shipped">SHIPPED (IN TRANSIT)</option>
                    <option value="delivered">DELIVERED</option>
                    <option value="cancelled">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">Status Note (Optional)</label>
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Dispatched via cold van from Solapur"
                    className="w-full px-3.5 py-2 border border-charcoal-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-leaf-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-charcoal-100">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 border border-charcoal-200 rounded-xl text-xs font-bold text-charcoal-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="btn-primary text-xs px-5 py-2"
                  >
                    {updating ? 'Saving...' : 'Save & Notify Customer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
