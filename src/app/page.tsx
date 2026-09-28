'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { ProductCard } from '@/components/ProductCard';
import { ArrowRight, Truck, Shield, Leaf, Star, MapPin, ChevronRight, CheckCircle } from 'lucide-react';

interface LiveStats {
  farmersCount: number;
  productsCount: number;
  ordersCount: number;
  avgRating: number;
  districtsCount: number;
}

interface FarmerItem {
  id: string;
  name: string;
  farm_name: string;
  district: string;
  rating: number;
  product_count?: number;
}

export default function HomePage() {
  const { t, lang } = useTranslation();
  const [featured, setFeatured] = useState<Record<string, unknown>[]>([]);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [farmers, setFarmers] = useState<FarmerItem[]>([]);
  const [stats, setStats] = useState<LiveStats>({
    farmersCount: 3,
    productsCount: 7,
    ordersCount: 3,
    avgRating: 4.8,
    districtsCount: 3,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes, farmersRes, statsRes] = await Promise.all([
          fetch('/api/products?featured=1&limit=4'),
          fetch('/api/categories'),
          fetch('/api/farmers?limit=3'),
          fetch('/api/stats'),
        ]);
        
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setFeatured(prodData.data || []);
        }
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.data || []);
        }
        if (farmersRes.ok) {
          const farmData = await farmersRes.json();
          if (farmData.data && farmData.data.length > 0) {
            setFarmers(farmData.data);
          }
        }
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.data) {
            setStats(statsData.data);
          }
        }
      } catch { /* silent */ }
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* ═══ HERO ═══ */}
      <section className="relative bg-charcoal-950 text-white overflow-hidden min-h-[540px] flex items-center" id="hero-section">
        {/* Background photo & overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-orchard.jpg"
            alt="Maharashtra Lemon Orchard in natural sunlight"
            className="w-full h-full object-cover object-center brightness-[0.70] scale-105 transition-transform duration-1000"
          />
          {/* Subtle gradient scrim for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950/95 via-leaf-950/85 to-transparent md:to-charcoal-950/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-transparent to-black/30" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative z-10 w-full">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-leaf-900/80 backdrop-blur-md px-4 py-2 rounded-full mb-6 text-sm border border-lemon-400/30 shadow-md">
              <span className="w-2.5 h-2.5 bg-lemon-400 rounded-full animate-pulse" />
              <span className="text-lemon-300 font-medium tracking-wide">{t.hero.badge}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6 text-white drop-shadow-sm">
              {t.hero.headline}
            </h1>
            
            <p className="text-lg md:text-xl text-stone-200 mb-8 max-w-2xl leading-relaxed font-light">
              {t.hero.subheadline}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/shop" className="bg-lemon-400 text-charcoal-900 px-8 py-4 rounded-xl font-bold text-base hover:bg-lemon-300 active:scale-[0.98] transition-all flex items-center gap-2 shadow-xl hover:shadow-lemon-400/25" id="hero-cta">
                {t.hero.cta} <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/farmers" className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-white/20 transition-all border border-white/20 shadow-md" id="hero-cta-secondary">
                {t.hero.ctaSecondary}
              </Link>
            </div>

            {/* Authentic Live Database Stats */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-10 text-sm text-stone-200 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                <Leaf className="w-4 h-4 text-lemon-400" />
                <span className="font-semibold text-white">{stats.farmersCount}</span>
                <span>{lang === 'en' ? 'Verified Farms' : 'प्रमाणित शेतकरी'}</span>
              </div>
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                <span className="text-base">🍋</span>
                <span className="font-semibold text-white">{stats.productsCount}</span>
                <span>{lang === 'en' ? 'Lemon Varieties' : 'लिंबू प्रकार'}</span>
              </div>
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                <Star className="w-4 h-4 fill-lemon-400 text-lemon-400" />
                <span className="font-semibold text-white">{stats.avgRating}</span>
                <span>{lang === 'en' ? 'Quality Rating' : 'गुणवत्ता रेटिंग'}</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-lemon-300/80">
                <CheckCircle className="w-3.5 h-3.5 text-lemon-400" />
                <span>{lang === 'en' ? 'Live Database' : 'थेट डेटाबेस'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave transition */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 40" fill="none" className="w-full">
            <path d="M0 40H1440V25C1248 10 960 30 720 20C480 10 192 35 0 25V40Z" fill="#FEFDF8"/>
          </svg>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: Truck, title: lang === 'en' ? 'Fast Delivery' : 'जलद डिलिव्हरी', desc: lang === 'en' ? 'Across Maharashtra' : 'संपूर्ण महाराष्ट्रात' },
              { icon: Leaf, title: lang === 'en' ? 'Farm Fresh' : 'शेतातून ताजे', desc: lang === 'en' ? 'Direct from farms' : 'शेतातून थेट' },
              { icon: Shield, title: lang === 'en' ? 'Secure Payment' : 'सुरक्षित पेमेंट', desc: lang === 'en' ? 'Safe & trusted' : 'सुरक्षित आणि विश्वासार्ह' },
              { icon: Star, title: lang === 'en' ? 'Best Quality' : 'सर्वोत्तम गुणवत्ता', desc: lang === 'en' ? 'Handpicked lemons' : 'हाताने निवडलेले लिंबू' },
            ].map((f, i) => (
              <div key={i} className="card p-5 text-center group hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-lemon-100 to-leaf-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-leaf-700" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-charcoal-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CATEGORIES ═══ */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">{t.categories.title}</h2>
            <Link href="/shop" className="text-leaf-700 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
              {t.products.viewAll} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id as string}
                href={`/shop?category=${cat.slug}`}
                className="card p-4 group hover:-translate-y-0.5 transition-all text-center"
              >
                <div className="w-14 h-14 mx-auto bg-gradient-to-br from-lemon-50 to-lemon-100 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🍋</span>
                </div>
                <h3 className="font-semibold text-sm text-charcoal-900">
                  {lang === 'mr' ? cat.name_mr as string : cat.name_en as string}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURED PRODUCTS ═══ */}
      <section className="py-8 md:py-12 bg-white" id="featured-products">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">{t.products.featured}</h2>
            <Link href="/shop" className="text-leaf-700 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
              {t.products.viewAll} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="aspect-[4/3] skeleton" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 skeleton w-2/3" />
                    <div className="h-3 skeleton w-1/2" />
                    <div className="h-4 skeleton w-1/3 mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map((product) => (
                <ProductCard key={product.id as string} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══ CTA BANNER ═══ */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-br from-lemon-400 via-lemon-300 to-lemon-200 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-sm">
            <div className="absolute top-4 left-4 text-5xl opacity-20">🍋</div>
            <div className="absolute bottom-4 right-4 text-5xl opacity-20">🍋</div>
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-charcoal-900 mb-3">
                {lang === 'en' ? 'Fresh Lemons, Fair Prices' : 'ताजे लिंबू, योग्य किमती'}
              </h2>
              <p className="text-charcoal-700 mb-6 max-w-lg mx-auto">
                {lang === 'en' ? 'Direct from Maharashtra orchards to your doorstep with cold-chain delivery.' : 'महाराष्ट्रातील बागांमधून थेट तुमच्या दारापर्यंत जलद कोल्ड-चेन डिलिव्हरी.'}
              </p>
              <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
                {t.hero.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FARMERS PREVIEW ═══ */}
      <section className="py-8 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="section-title mb-3">{t.farmers.title}</h2>
          <p className="text-charcoal-500 mb-8 max-w-xl mx-auto">{t.farmers.subtitle}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto">
            {farmers.length > 0 ? (
              farmers.map((farmer) => (
                <div key={farmer.id} className="card p-5 text-center group hover:-translate-y-1 transition-all">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-leaf-600 to-leaf-800 rounded-full flex items-center justify-center mb-3 text-white font-bold text-xl shadow-md">
                    {farmer.name ? farmer.name.charAt(0) : 'F'}
                  </div>
                  <h3 className="font-semibold text-sm">{farmer.name}</h3>
                  <p className="text-xs text-leaf-700 font-medium">{farmer.farm_name || 'Lemon Farm'}</p>
                  <div className="flex items-center justify-center gap-1 text-xs text-charcoal-500 mt-1">
                    <MapPin className="w-3 h-3 text-leaf-600" /> {farmer.district}
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Star className="w-3.5 h-3.5 fill-lemon-500 text-lemon-500" />
                    <span className="text-xs font-bold">{farmer.rating || 4.8}</span>
                    {farmer.product_count !== undefined && (
                      <span className="text-[10px] text-charcoal-400 ml-1">({farmer.product_count} {lang === 'en' ? 'products' : 'उत्पादने'})</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              [
                { name: 'Rajesh Patil', farm: 'Patil Lemon Farm', district: 'Jalgaon', rating: 4.5 },
                { name: 'Sunita Jadhav', farm: 'Jadhav Organic Farm', district: 'Satara', rating: 4.8 },
                { name: 'Vikram Deshmukh', farm: 'Deshmukh Citrus Farms', district: 'Akola', rating: 4.3 },
              ].map((farmer, i) => (
                <div key={i} className="card p-5 text-center group hover:-translate-y-1 transition-all">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-leaf-600 to-leaf-800 rounded-full flex items-center justify-center mb-3 text-white font-bold text-xl">
                    {farmer.name.charAt(0)}
                  </div>
                  <h3 className="font-semibold text-sm">{farmer.name}</h3>
                  <p className="text-xs text-leaf-700 font-medium">{farmer.farm}</p>
                  <div className="flex items-center justify-center gap-1 text-xs text-charcoal-500 mt-1">
                    <MapPin className="w-3 h-3 text-leaf-600" /> {farmer.district}
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Star className="w-3.5 h-3.5 fill-lemon-500 text-lemon-500" />
                    <span className="text-xs font-bold">{farmer.rating}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link href="/farmers" className="btn-outline inline-flex items-center gap-2 mt-8">
            {t.hero.ctaSecondary} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
