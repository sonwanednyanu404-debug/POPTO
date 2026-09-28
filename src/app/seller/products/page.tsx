'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import { useAuthStore, useToastStore } from '@/lib/store';
import { Plus, Trash2, Edit2, ArrowLeft, X, Check, Sprout, Leaf } from 'lucide-react';

export default function SellerProductsPage() {
  const router = useRouter();
  const { t, lang } = useTranslation();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Product Form
  const [form, setForm] = useState({
    name_en: '',
    name_mr: '',
    description_en: '',
    description_mr: '',
    price: '',
    compare_price: '',
    stock: '',
    unit: 'kg',
    is_organic: false,
    is_farm_fresh: true,
    harvest_info: 'Freshly harvested today',
    delivery_info: '24-48 hr cold chain delivery across Maharashtra',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/seller/products');
      return;
    }
    load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products?limit=100');
      const data = await res.json();
      if (data.data) setProducts(data.data);
    } catch {
      setProducts([]);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name_en || !form.price || !form.stock) {
      addToast({ message: 'Name, price, and stock are required', type: 'warning' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('popto_token')}`,
        },
        body: JSON.stringify({
          name_en: form.name_en,
          name_mr: form.name_mr || form.name_en,
          description_en: form.description_en,
          description_mr: form.description_mr,
          price: parseFloat(form.price),
          compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
          stock: parseInt(form.stock),
          unit: form.unit,
          is_organic: form.is_organic ? 1 : 0,
          is_farm_fresh: form.is_farm_fresh ? 1 : 0,
          harvest_info: form.harvest_info,
          delivery_info: form.delivery_info,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        addToast({ message: 'Lemon batch listed successfully!', type: 'success' });
        setShowModal(false);
        setForm({
          name_en: '',
          name_mr: '',
          description_en: '',
          description_mr: '',
          price: '',
          compare_price: '',
          stock: '',
          unit: 'kg',
          is_organic: false,
          is_farm_fresh: true,
          harvest_info: 'Freshly harvested today',
          delivery_info: '24-48 hr cold chain delivery across Maharashtra',
        });
        load();
      } else {
        addToast({ message: data.error || 'Failed to create product', type: 'error' });
      }
    } catch {
      addToast({ message: 'Error submitting listing', type: 'error' });
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this lemon listing?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('popto_token')}` },
      });
      if (res.ok) {
        addToast({ message: 'Product removed', type: 'info' });
        load();
      }
    } catch {
      addToast({ message: 'Failed to delete product', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-sand-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/seller" className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-leaf-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> {lang === 'en' ? 'Back to Dashboard' : 'परत डॅशबोर्डकडे'}
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
              {lang === 'en' ? 'Manage Lemon Produce' : 'लिंबू उत्पादने व्यवस्थापन'}
            </h1>
            <p className="text-xs text-charcoal-500 mt-1">Real-time inventory and pricing on POPTO</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary text-xs px-5 py-2.5 flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'en' ? 'List New Lemon Variety' : 'नवीन लिंबू प्रकार जोडा'}</span>
          </button>
        </div>

        {/* Modal for Creating New Lemon Listing */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-charcoal-100">
              <div className="flex items-center justify-between pb-4 border-b border-charcoal-100 mb-6">
                <h3 className="font-extrabold text-lg text-charcoal-900 flex items-center gap-2">
                  <span>🍋</span>
                  <span>List Lemon Batch</span>
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-charcoal-400 hover:text-charcoal-700 rounded-xl hover:bg-charcoal-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                      Variety Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name_en}
                      onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                      placeholder="e.g. Premium Kagzi Lemon"
                      className="w-full px-3.5 py-2 border border-charcoal-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                      Variety Name (Marathi / मराठी)
                    </label>
                    <input
                      type="text"
                      value={form.name_mr}
                      onChange={(e) => setForm({ ...form, name_mr: e.target.value })}
                      placeholder="उदा. प्रीमियम कागदी लिंबू"
                      className="w-full px-3.5 py-2 border border-charcoal-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                      Price (INR ₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.5"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="80"
                      className="w-full px-3.5 py-2 border border-charcoal-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                      Compare Price (₹)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.compare_price}
                      onChange={(e) => setForm({ ...form, compare_price: e.target.value })}
                      placeholder="100"
                      className="w-full px-3.5 py-2 border border-charcoal-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                      Stock Quantity *
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        required
                        min="1"
                        value={form.stock}
                        onChange={(e) => setForm({ ...form, stock: e.target.value })}
                        placeholder="100"
                        className="w-full px-3.5 py-2 border border-r-0 border-charcoal-200 rounded-l-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500"
                      />
                      <select
                        value={form.unit}
                        onChange={(e) => setForm({ ...form, unit: e.target.value })}
                        className="px-2 py-2 border border-charcoal-200 rounded-r-xl text-xs bg-sand-50 focus:outline-none"
                      >
                        <option value="kg">kg</option>
                        <option value="crate (15kg)">crate</option>
                        <option value="box (5kg)">box</option>
                        <option value="pack (12 pcs)">pack</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={form.description_en}
                    onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                    placeholder="Freshly harvested aroma, juicy pulp, thin peel..."
                    className="w-full px-3.5 py-2 border border-charcoal-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500"
                  />
                </div>

                <div className="flex items-center gap-6 py-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-charcoal-700">
                    <input
                      type="checkbox"
                      checked={form.is_organic}
                      onChange={(e) => setForm({ ...form, is_organic: e.target.checked })}
                      className="rounded text-leaf-600 focus:ring-leaf-500"
                    />
                    <span>🌿 100% Certified Organic</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-charcoal-700">
                    <input
                      type="checkbox"
                      checked={form.is_farm_fresh}
                      onChange={(e) => setForm({ ...form, is_farm_fresh: e.target.checked })}
                      className="rounded text-leaf-600 focus:ring-leaf-500"
                    />
                    <span>🌱 Farm Fresh Guaranteed</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-charcoal-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-charcoal-200 rounded-xl text-xs font-bold text-charcoal-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary text-xs px-6 py-2"
                  >
                    {submitting ? 'Listing...' : 'Save & Publish'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Listings Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-charcoal-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-charcoal-100 text-charcoal-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Variety</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Sold</th>
                  <th className="py-3 px-4">Attributes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-sand-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-charcoal-900 flex items-center gap-2">
                      <span className="text-lg">🍋</span>
                      <div>
                        <div>{p.name_en}</div>
                        {p.name_mr && <div className="text-[10px] text-charcoal-400">{p.name_mr}</div>}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-charcoal-900">
                      ₹{p.price} / {p.unit}
                      {p.compare_price && (
                        <span className="text-charcoal-400 line-through text-[10px] block">₹{p.compare_price}</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                        p.stock <= 10 ? 'bg-red-50 text-red-700' : 'bg-leaf-50 text-leaf-700'
                      }`}>
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-charcoal-600 font-medium">{p.total_sold || 0}</td>
                    <td className="py-4 px-4 space-x-1">
                      {p.is_organic === 1 && (
                        <span className="bg-leaf-100 text-leaf-800 text-[10px] font-bold px-2 py-0.5 rounded">Organic</span>
                      )}
                      {p.is_farm_fresh === 1 && (
                        <span className="bg-lemon-100 text-charcoal-800 text-[10px] font-bold px-2 py-0.5 rounded">Fresh</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <Link
                        href={`/shop/${p.slug || p.id}`}
                        className="text-leaf-700 hover:underline font-bold"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-500 hover:text-red-700 font-bold ml-2"
                        title="Delete"
                      >
                        Delete
                      </button>
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
