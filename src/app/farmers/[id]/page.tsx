'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { ProductCard } from '@/components/ProductCard';
import { MapPin, Star, ShieldCheck, ArrowLeft, Sprout, Leaf, Award } from 'lucide-react';

export default function FarmerProfilePage() {
  const { id } = useParams();
  const { t, lang } = useTranslation();
  const [farmer, setFarmer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/farmers/${id}`);
        const data = await res.json();
        if (data.success) setFarmer(data.data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-leaf-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-charcoal-900 mb-2">Farmer Not Found</h2>
        <Link href="/farmers" className="btn-primary inline-flex items-center gap-2 text-xs px-5 py-2.5">
          <ArrowLeft className="w-4 h-4" /> Back to Farmers
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/farmers" className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-leaf-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> {lang === 'en' ? 'Back to All Farmers' : 'सर्व शेतकऱ्यांकडे जा'}
        </Link>

        {/* Hero Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-charcoal-100 mb-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-leaf-100 text-leaf-800 flex items-center justify-center text-4xl shadow-inner flex-shrink-0">
                👨‍🌾
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
                    {farmer.farm_name || farmer.name}
                  </h1>
                  {farmer.is_verified === 1 && (
                    <span className="inline-flex items-center text-xs font-bold text-leaf-700 bg-leaf-50 px-2.5 py-1 rounded-full border border-leaf-200">
                      <ShieldCheck className="w-4 h-4 mr-1" /> Verified Grove
                    </span>
                  )}
                </div>
                <p className="text-sm text-charcoal-600 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-leaf-600" />
                  <span>{farmer.district}, Maharashtra • Owner: {farmer.name}</span>
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-charcoal-500">
                  <span className="flex items-center gap-1 font-bold text-charcoal-800">
                    <Star className="w-3.5 h-3.5 fill-lemon-500 text-lemon-500" />
                    {farmer.rating ? Number(farmer.rating).toFixed(1) : '5.0'} Rating
                  </span>
                  <span>•</span>
                  <span>{farmer.products?.length || 0} Harvest Varieties</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-charcoal-100">
            <h3 className="text-xs font-bold text-charcoal-500 uppercase tracking-wider mb-2">
              {lang === 'en' ? 'Orchard & Farm Story' : 'बाग व शेत कहाणी'}
            </h3>
            <p className="text-charcoal-700 text-sm leading-relaxed max-w-4xl">
              {farmer.story || farmer.description || (lang === 'en'
                ? 'Cultivating authentic Kagzi and Seedless lemons with drip irrigation and organic bio-fertilizers. Focused on maximum natural juice extraction, zero synthetic chemical ripening, and sustainable soil stewardship across rural Maharashtra.'
                : 'ठिबक सिंचन आणि सेंद्रिय खतांचा वापर करून अस्सल कागदी लिंबू लागवड. रासायनिक प्रक्रिया विरहित नैसर्गिक उत्पादन.')}
            </p>
          </div>
        </div>

        {/* Harvested Produce by this Farmer */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 mb-6">
            {lang === 'en' ? 'Available Lemon Harvests from this Farm' : 'या बागेतील उपलब्ध लिंबू उत्पादने'}
          </h2>

          {farmer.products && farmer.products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {farmer.products.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 text-center border border-charcoal-100">
              <p className="text-charcoal-500 text-sm">
                {lang === 'en' ? 'No active lemon listings currently from this farm.' : 'या बागेतून सध्या कोणतीही उत्पादने उपलब्ध नाहीत.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
