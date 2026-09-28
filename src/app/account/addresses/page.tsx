'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import { useAuthStore, useToastStore } from '@/lib/store';
import { MapPin, Plus, Trash2, CheckCircle2, ArrowLeft } from 'lucide-react';

const MAHARASHTRA_DISTRICTS = [
  'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad (Chhatrapati Sambhajinagar)', 'Beed', 'Bhandara', 'Buldhana',
  'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur',
  'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad (Dharashiv)',
  'Palghar', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur',
  'Thane', 'Wardha', 'Washim', 'Yavatmal'
];

export default function AddressesPage() {
  const router = useRouter();
  const { t, lang } = useTranslation();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    mobile: '',
    houseFlat: '',
    street: '',
    area: '',
    city: '',
    district: 'Pune',
    pinCode: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/account/addresses');
      return;
    }
    load();
  }, [user]);

  const load = async () => {
    try {
      const res = await fetch('/api/addresses', {
        headers: { Authorization: `Bearer ${localStorage.getItem('popto_token')}` },
      });
      const data = await res.json();
      if (data.data) setAddresses(data.data);
    } catch {
      setAddresses([]);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('popto_token')}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        addToast({ message: 'Address added successfully', type: 'success' });
        setShowForm(false);
        setForm({ fullName: '', mobile: '', houseFlat: '', street: '', area: '', city: '', district: 'Pune', pinCode: '' });
        load();
      }
    } catch {
      addToast({ message: 'Failed to add address', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('popto_token')}` },
      });
      addToast({ message: 'Address removed', type: 'info' });
      load();
    } catch {
      addToast({ message: 'Failed to delete address', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-sand-50/50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Link href="/account" className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-leaf-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> {lang === 'en' ? 'Back to Account' : 'परत खात्याकडे'}
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
            {lang === 'en' ? 'Saved Delivery Addresses' : 'सेव्ह केलेले पत्ते'}
          </h1>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'en' ? 'Add New Address' : 'नवीन पत्ता जोडा'}</span>
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-charcoal-100 mb-8">
            <h2 className="text-lg font-bold text-charcoal-900 mb-4">Add Maharashtra Address</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-3.5 py-2 border border-charcoal-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-600 mb-1">Mobile</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    className="w-full px-3.5 py-2 border border-charcoal-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-600 mb-1">House / Flat</label>
                  <input
                    type="text"
                    required
                    value={form.houseFlat}
                    onChange={(e) => setForm({ ...form, houseFlat: e.target.value })}
                    className="w-full px-3.5 py-2 border border-charcoal-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-600 mb-1">Street / Area</label>
                  <input
                    type="text"
                    required
                    value={form.street}
                    onChange={(e) => setForm({ ...form, street: e.target.value })}
                    className="w-full px-3.5 py-2 border border-charcoal-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-600 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3.5 py-2 border border-charcoal-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-600 mb-1">District</label>
                  <select
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="w-full px-3.5 py-2 border border-charcoal-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 bg-white"
                  >
                    {MAHARASHTRA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-600 mb-1">PIN Code</label>
                  <input
                    type="text"
                    required
                    pattern="[0-9]{6}"
                    value={form.pinCode}
                    onChange={(e) => setForm({ ...form, pinCode: e.target.value })}
                    className="w-full px-3.5 py-2 border border-charcoal-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-charcoal-200 rounded-xl text-xs font-semibold text-charcoal-600"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs px-5 py-2">
                  Save Address
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-white rounded-3xl p-6 shadow-sm border border-charcoal-100 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <span className="font-bold text-charcoal-900 text-sm">{addr.full_name}</span>
                  {addr.is_default === 1 && (
                    <span className="text-[10px] bg-leaf-100 text-leaf-800 font-bold px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  {addr.house_flat}, {addr.street}, {addr.area}<br />
                  {addr.city}, {addr.district} - {addr.pin_code}
                </p>
                <p className="text-xs font-medium text-charcoal-500 mt-2">📞 {addr.mobile}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-charcoal-100 flex justify-end">
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
