'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import { useAuthStore, useToastStore } from '@/lib/store';
import { Edit3, CheckCircle2, Shield, Eye, ArrowRight, Star } from 'lucide-react';

export default function EditorDashboardPage() {
  const router = useRouter();
  const { t, lang } = useTranslation();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/editor');
      return;
    }
    if (!['editor', 'admin', 'superadmin'].includes(user.role)) {
      router.push('/account');
      return;
    }

    async function load() {
      try {
        const res = await fetch('/api/products?limit=50');
        const data = await res.json();
        if (data.data) setProducts(data.data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  return (
    <div className="min-h-screen bg-sand-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-leaf-100 text-leaf-800 font-bold px-2.5 py-0.5 rounded-full uppercase">
                Content & Editorial Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
              Lemon Catalog Content Quality Control
            </h1>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Review English & Marathi product titles, harvest descriptions, and produce standards
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-charcoal-100">
          <h2 className="text-base font-bold text-charcoal-900 mb-6">
            Active Catalog Listings ({products.length})
          </h2>

          <div className="divide-y divide-charcoal-100">
            {products.map((p) => (
              <div key={p.id} className="py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-lemon-50 border border-charcoal-100 flex items-center justify-center text-3xl flex-shrink-0">
                    🍋
                  </div>
                  <div>
                    <h3 className="font-bold text-charcoal-900 text-base">{p.name_en}</h3>
                    {p.name_mr && (
                      <p className="text-xs text-leaf-800 font-medium">{p.name_mr}</p>
                    )}
                    <p className="text-xs text-charcoal-500 line-clamp-1 mt-1">
                      {p.description_en || 'No description provided.'}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-charcoal-500">
                      <span>Price: <strong>₹{p.price} / {p.unit}</strong></span>
                      <span>•</span>
                      <span>Stock: <strong>{p.stock}</strong></span>
                      <span>•</span>
                      <span>Origin: <strong>{p.seller_district || 'Solapur'}, MH</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <Link
                    href={`/shop/${p.slug || p.id}`}
                    className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Live</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
