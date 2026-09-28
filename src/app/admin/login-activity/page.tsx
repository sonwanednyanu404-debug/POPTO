'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import { useAuthStore } from '@/lib/store';
import {
  Activity,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  KeyRound
} from 'lucide-react';

export default function AdminLoginActivityPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [activity, setActivity] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (search.trim()) params.set('search', search.trim());
      if (filter && filter !== 'all') params.set('filter', filter);
      if (statusFilter) params.set('status', statusFilter);
      if (role) params.set('role', role);

      const token = localStorage.getItem('popto_token');
      const res = await fetch(`/api/admin/login-activity?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setActivity(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages || 1);
      } else {
        setActivity([]);
        setTotal(0);
        setTotalPages(1);
      }
    } catch {
      setActivity([]);
      setTotal(0);
      setTotalPages(1);
    }
    setLoading(false);
  }, [page, search, filter, statusFilter, role]);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/admin/login-activity');
      return;
    }
    if (!['admin', 'superadmin'].includes(user.role)) {
      router.push('/');
      return;
    }
    loadLogs();
  }, [user, loadLogs, router]);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      params.set('export', 'csv');
      if (search.trim()) params.set('search', search.trim());
      if (filter && filter !== 'all') params.set('filter', filter);
      if (statusFilter) params.set('status', statusFilter);
      if (role) params.set('role', role);

      const token = localStorage.getItem('popto_token');
      const res = await fetch(`/api/admin/login-activity?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `popto-login-activity-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error('CSV Export error:', e);
    }
    setExporting(false);
  };

  const getDeviceIcon = (device?: string) => {
    const d = (device || '').toLowerCase();
    if (d.includes('mobile') || d.includes('phone') || d.includes('android') || d.includes('iphone')) {
      return <Smartphone className="w-3.5 h-3.5 text-leaf-600 inline mr-1" />;
    }
    if (d.includes('tablet') || d.includes('ipad')) {
      return <Tablet className="w-3.5 h-3.5 text-blue-600 inline mr-1" />;
    }
    return <Monitor className="w-3.5 h-3.5 text-charcoal-500 inline mr-1" />;
  };

  return (
    <div className="min-h-screen bg-sand-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-leaf-700 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Admin Overview
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-leaf-100 text-leaf-800 text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin-Only Security Audit</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
              Login & Authentication Activity
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
              Live audit stream of all customer, seller, editor, and administrator sign-in attempts ({total} logged events).
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
            <button
              onClick={handleExportCsv}
              disabled={exporting || loading}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-charcoal-200 bg-white text-charcoal-700 hover:bg-sand-100 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              title="Download sanitized CSV audit trail"
            >
              <Download className="w-3.5 h-3.5 text-charcoal-600" />
              <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
            </button>

            <button
              onClick={loadLogs}
              className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Security Privacy Notice Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-xs text-amber-900 flex items-start gap-3">
          <KeyRound className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Zero Password Disclosure Policy: </span>
            This audit console displays only non-sensitive login telemetry (timestamps, device, IP, and status). Plaintext passwords, password hashes, and session keys are cryptographically guarded and never stored, logged, or exposed in any audit data.
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-charcoal-100 mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by email, name, IP address, device, or Event ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-charcoal-200 rounded-xl text-xs bg-white focus:outline-none focus:border-leaf-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-charcoal-200 rounded-xl text-xs bg-white focus:outline-none"
            >
              <option value="all">All Timelines</option>
              <option value="today">Today Only</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-charcoal-200 rounded-xl text-xs bg-white focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="success">Success Only</option>
              <option value="failed">Failed Only</option>
            </select>

            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-charcoal-200 rounded-xl text-xs bg-white focus:outline-none"
            >
              <option value="">All Roles</option>
              <option value="customer">Customers</option>
              <option value="seller">Farmers / Sellers</option>
              <option value="editor">Editors</option>
              <option value="admin">Admins</option>
              <option value="superadmin">Super Admins</option>
            </select>
          </div>
        </div>

        {/* Activity Table */}
        <div className="bg-white rounded-3xl p-4 sm:p-8 shadow-sm border border-charcoal-100">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-leaf-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs text-charcoal-500">Querying secure audit records...</p>
            </div>
          ) : activity.length === 0 ? (
            <div className="py-16 text-center text-charcoal-400 text-sm">
              No matching authentication logs found matching your filters.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-charcoal-100 text-charcoal-400 uppercase font-semibold text-[11px]">
                    <tr>
                      <th className="py-3 px-3">EMAIL / USER</th>
                      <th className="py-3 px-3">ROLE</th>
                      <th className="py-3 px-3">DATE / TIME</th>
                      <th className="py-3 px-3">STATUS</th>
                      <th className="py-3 px-3">DEVICE</th>
                      <th className="py-3 px-3">OS</th>
                      <th className="py-3 px-3">BROWSER</th>
                      <th className="py-3 px-3">IP ADDRESS</th>
                      <th className="py-3 px-3 text-right">EVENT ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-100">
                    {activity.map((a) => (
                      <tr key={a.id} className="hover:bg-sand-50/50 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-charcoal-900">{a.email}</div>
                          {a.full_name && (
                            <div className="text-[11px] text-charcoal-500 font-normal">{a.full_name}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="bg-sand-100 text-charcoal-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
                            {a.role || 'Unauth'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-charcoal-700 whitespace-nowrap">
                          <div className="font-medium">{a.created_at?.split(' ')[0] || a.created_at}</div>
                          <div className="text-[11px] text-charcoal-400">{a.created_at?.split(' ')[1] || ''}</div>
                        </td>
                        <td className="py-3.5 px-3">
                          {a.status === 'success' ? (
                            <span className="bg-leaf-100 text-leaf-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 whitespace-nowrap">
                              <CheckCircle2 className="w-3 h-3 text-leaf-700" /> SUCCESS
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 whitespace-nowrap">
                              <XCircle className="w-3 h-3 text-red-600" /> FAILED
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-charcoal-600 whitespace-nowrap">
                          {getDeviceIcon(a.device_type)}
                          <span>{a.device_type || 'Desktop'}</span>
                        </td>
                        <td className="py-3.5 px-3 text-charcoal-600 font-medium whitespace-nowrap">
                          {a.os || 'Windows'}
                        </td>
                        <td className="py-3.5 px-3 text-charcoal-600 font-medium whitespace-nowrap">
                          {a.browser || 'Browser'}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-charcoal-700 text-[11px] whitespace-nowrap">
                          {a.ip_address || 'unknown'}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <span className="font-mono text-[10px] text-charcoal-400 bg-sand-50 px-1.5 py-0.5 rounded">
                            {a.id ? a.id.slice(0, 8) : '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              <div className="mt-6 pt-4 border-t border-charcoal-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-charcoal-500">
                  Showing <span className="font-bold text-charcoal-800">{activity.length}</span> of <span className="font-bold text-charcoal-800">{total}</span> total events (Page {page} of {totalPages})
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || loading}
                    className="px-3 py-1.5 rounded-lg border border-charcoal-200 text-xs font-semibold text-charcoal-700 hover:bg-sand-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                  </button>

                  <span className="text-xs font-bold text-charcoal-700 px-2">
                    {page} / {totalPages}
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages || loading}
                    className="px-3 py-1.5 rounded-lg border border-charcoal-200 text-xs font-semibold text-charcoal-700 hover:bg-sand-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
