'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import { useAuthStore, useToastStore } from '@/lib/store';
import {
  Users,
  Search,
  Download,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Power,
} from 'lucide-react';

export default function AdminCustomersPage() {
  const router = useRouter();
  const { t, lang } = useTranslation();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '15');
      if (search) params.set('search', search);
      if (status) params.set('status', status);

      const res = await fetch(`/api/admin/customers?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('popto_token')}` },
      });
      const data = await res.json();
      if (data.data) {
        setCustomers(data.data);
        setTotal(data.total);
      }
    } catch {
      setCustomers([]);
    }
    setLoading(false);
  }, [page, search, status]);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/admin/customers');
      return;
    }
    loadCustomers();
  }, [user, loadCustomers]);

  const handleToggleStatus = async (id: string, currentStatus: number) => {
    try {
      const res = await fetch(`/api/admin/customers/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('popto_token')}`,
        },
        body: JSON.stringify({ isActive: currentStatus === 1 ? false : true }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast({ message: data.message, type: 'success' });
        loadCustomers();
      } else {
        addToast({ message: data.error || 'Failed to update', type: 'error' });
      }
    } catch {
      addToast({ message: 'Error updating customer status', type: 'error' });
    }
  };

  const handleExportCSV = () => {
    window.open('/api/admin/export-customers', '_blank');
  };

  return (
    <div className="min-h-screen bg-sand-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-leaf-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Admin Overview
        </Link>

        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
              Customer Accounts & Governance
            </h1>
            <p className="text-xs text-charcoal-500 mt-1">
              Live customer accounts registered in Maharashtra database ({total} total)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="bg-white hover:bg-leaf-50 text-charcoal-800 hover:text-leaf-700 border border-charcoal-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-charcoal-100 mb-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, or mobile..."
              className="w-full pl-10 pr-4 py-2 border border-charcoal-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-leaf-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-charcoal-200 rounded-xl text-xs bg-white text-charcoal-700 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-charcoal-100">
          {loading ? (
            <div className="py-16 flex justify-center">
              <div className="w-8 h-8 border-4 border-leaf-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : customers.length === 0 ? (
            <div className="py-12 text-center text-charcoal-500 text-sm">
              No matching customer accounts found in the database.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-charcoal-100 text-charcoal-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Orders / Spent</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Login</th>
                    <th className="py-3 px-4">Registered</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-sand-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <Link
                          href={`/admin/customers/${c.id}`}
                          className="font-bold text-charcoal-900 hover:text-leaf-700 transition-colors block"
                        >
                          {c.full_name}
                        </Link>
                        <span className="text-[10px] text-charcoal-400 font-mono">{c.id.slice(0, 8)}...</span>
                      </td>
                      <td className="py-4 px-4 text-charcoal-600">
                        <div>{c.email}</div>
                        <div className="text-[11px] text-charcoal-400">{c.mobile || 'No mobile'}</div>
                      </td>
                      <td className="py-4 px-4 text-charcoal-600">
                        {c.district ? `${c.district}, MH` : (c.city || 'Maharashtra')}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-charcoal-900">{c.total_orders || 0} orders</span>
                        <span className="text-[11px] text-charcoal-500 block">₹{c.total_spent || 0} spent</span>
                      </td>
                      <td className="py-4 px-4">
                        {c.is_active === 1 ? (
                          <span className="bg-leaf-100 text-leaf-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-charcoal-600 text-[11px]">
                        {c.last_login ? (
                          <span>{c.last_login.split(' ')[0]}</span>
                        ) : (
                          <span className="text-charcoal-400 italic">Never</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-charcoal-500 text-[11px]">
                        {c.created_at?.split(' ')[0] || c.created_at}
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <Link
                          href={`/admin/customers/${c.id}`}
                          className="text-leaf-700 hover:underline font-bold"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(c.id, c.is_active)}
                          className={`font-bold ml-2 ${
                            c.is_active === 1 ? 'text-red-500 hover:text-red-700' : 'text-leaf-700 hover:text-leaf-900'
                          }`}
                        >
                          {c.is_active === 1 ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
