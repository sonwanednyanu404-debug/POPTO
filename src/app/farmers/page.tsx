'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { MapPin, Star, ShieldCheck, ArrowRight, Sprout } from 'lucide-react';

export default function FarmersDirectoryPage() {
  const { t, lang } = useTranslation();
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/farmers');
        const data = await res.json();
        if (data.data) setFarmers(data.data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-sand-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-leaf-100 text-leaf-800 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <Sprout className="w-4 h-4" />
            {lang === 'en' ? 'Direct From The Soil' : 'थेट शेतातून'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight mb-4">
            {lang === 'en' ? 'Meet Our Maharashtra Lemon Farmers' : 'भेटा महाराष्ट्रातील लिंबू उत्पादक शेतकर्‍यांना'}
          </h1>
          <p className="text-charcoal-600 text-base leading-relaxed">
            {lang === 'en'
              ? 'Connecting you directly with multigenerational lemon orchards in Solapur, Ahmednagar, Jalgaon, and Nagpur. No middlemen. Maximum fairness.'
              : 'सोलापूर, अहमदनगर, जळगाव आणि नागपूरमधील बागायतदारांशी थेट संवाद. मध्यस्थांशिवाय अस्सल लिंबे.'}
          </p>
        </div>

        {/* Farmers Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-leaf-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {farmers.map((f) => (
              <div
                key={f.id}
                className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-charcoal-100 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-leaf-100 flex items-center justify-center text-3xl flex-shrink-0 shadow-inner">
                        👨‍🌾
                      </div>
                      <div>
                        <h3 className="font-bold text-charcoal-900 text-base">{f.farm_name || f.name}</h3>
                        <p className="text-xs text-charcoal-500">{f.name}</p>
                      </div>
                    </div>
                    {f.is_verified === 1 && (
                      <span className="inline-flex items-center text-[11px] font-bold text-leaf-700 bg-leaf-50 px-2.5 py-1 rounded-full border border-leaf-200">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-charcoal-600 mb-4">
                    <span className="flex items-center gap-1 font-medium text-leaf-800">
                      <MapPin className="w-3.5 h-3.5 text-leaf-600" />
                      {f.district}, Maharashtra
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-lemon-500 text-lemon-500" />
                      <strong>{f.rating ? Number(f.rating).toFixed(1) : '5.0'}</strong>
                    </span>
                  </div>

                  <p className="text-xs text-charcoal-600 line-clamp-3 leading-relaxed mb-6">
                    {f.description || (lang === 'en' ? 'Pioneering organic and sustainable Kagzi lemon orchards with high juice density and direct harvest packaging.' : 'रसाळ कागदी लिंबू उत्पादनातील अनुभवी शेतकरी.')}
                  </p>
                </div>

                <div className="pt-4 border-t border-charcoal-100 flex items-center justify-between">
                  <span className="text-xs text-charcoal-500 font-medium">
                    {f.product_count || 1} {lang === 'en' ? 'Active Varieties' : 'उपलब्ध प्रकार'}
                  </span>
                  <Link
                    href={`/farmers/${f.id}`}
                    className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
                  >
                    <span>{lang === 'en' ? 'View Grove & Produce' : 'बाग व उत्पादने पहा'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
