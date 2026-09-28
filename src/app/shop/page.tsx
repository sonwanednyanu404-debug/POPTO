'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import { ProductCard } from '@/components/ProductCard';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';

function ShopContent() {
  const { t, lang } = useTranslation();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [district, setDistrict] = useState(searchParams.get('district') || '');
  const [sort, setSort] = useState('newest');
  const [organic, setOrganic] = useState(false);
  const [farmFresh, setFarmFresh] = useState(false);
  const [inStock, setInStock] = useState(false);
  const [minRating, setMinRating] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '12');
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (district) params.set('district', district);
      if (sort) params.set('sort', sort);
      if (organic) params.set('organic', '1');
      if (farmFresh) params.set('farmFresh', '1');
      if (inStock) params.set('inStock', '1');
      if (minRating) params.set('minRating', minRating);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch { setProducts([]); }
    setLoading(false);
  }, [page, search, category, district, sort, organic, farmFresh, inStock, minRating, minPrice, maxPrice]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.data || [])).catch(() => {});
  }, []);

  // Debounced search
  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const clearFilters = () => {
    setSearch(''); setSearchInput(''); setCategory(''); setDistrict(''); setSort('newest');
    setOrganic(false); setFarmFresh(false); setInStock(false); setMinRating('');
    setMinPrice(''); setMaxPrice(''); setPage(1);
  };

  const hasFilters = search || category || district || organic || farmFresh || inStock || minRating || minPrice || maxPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">{t.nav.shop}</h1>
          <p className="text-sm text-charcoal-500 mt-1">{total} {lang === 'en' ? 'products' : 'उत्पादने'}</p>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="btn-ghost flex items-center gap-2 lg:hidden">
          <SlidersHorizontal className="w-4 h-4" /> {t.filters.title}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <aside className={`${showFilters ? 'fixed inset-0 z-40 bg-white p-4 overflow-y-auto lg:static lg:bg-transparent lg:p-0 lg:z-auto' : 'hidden lg:block'} w-full lg:w-64 flex-shrink-0`}>
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h2 className="font-bold text-lg">{t.filters.title}</h2>
            <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-5">
            {/* Categories */}
            <div>
              <h3 className="font-semibold text-sm mb-2">{t.categories.title}</h3>
              <div className="space-y-1">
                <button onClick={() => { setCategory(''); setPage(1); }} className={`block text-sm w-full text-left px-3 py-1.5 rounded-lg ${!category ? 'bg-leaf-50 text-leaf-700 font-medium' : 'text-charcoal-600 hover:bg-charcoal-50'}`}>
                  {t.common.all}
                </button>
                {categories.map((cat) => (
                  <button key={cat.id as string} onClick={() => { setCategory(cat.slug as string); setPage(1); }} className={`block text-sm w-full text-left px-3 py-1.5 rounded-lg ${category === cat.slug ? 'bg-leaf-50 text-leaf-700 font-medium' : 'text-charcoal-600 hover:bg-charcoal-50'}`}>
                    {lang === 'mr' ? cat.name_mr as string : cat.name_en as string}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-semibold text-sm mb-2">{t.filters.priceRange}</h3>
              <div className="flex gap-2">
                <input type="number" value={minPrice} onChange={(e) => { setMinPrice(e.target.value); setPage(1); }} placeholder="₹ Min" className="input-field text-xs py-2" />
                <input type="number" value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }} placeholder="₹ Max" className="input-field text-xs py-2" />
              </div>
            </div>

            {/* District Filter */}
            <div>
              <h3 className="font-semibold text-sm mb-2">{lang === 'en' ? 'Maharashtra District' : 'महाराष्ट्र जिल्हा'}</h3>
              <select
                value={district}
                onChange={(e) => { setDistrict(e.target.value); setPage(1); }}
                className="input-field text-xs py-2 w-full"
              >
                <option value="">{lang === 'en' ? 'All Districts' : 'सर्व जिल्हे'}</option>
                {['Solapur', 'Jalgaon', 'Ahmednagar', 'Satara', 'Akola', 'Nagpur', 'Pune', 'Nashik', 'Amravati', 'Nanded', 'Kolhapur', 'Aurangabad'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Minimum Rating */}
            <div>
              <h3 className="font-semibold text-sm mb-2">{lang === 'en' ? 'Minimum Rating' : 'किमान रेटिंग'}</h3>
              <select
                value={minRating}
                onChange={(e) => { setMinRating(e.target.value); setPage(1); }}
                className="input-field text-xs py-2 w-full"
              >
                <option value="">{lang === 'en' ? 'All Ratings' : 'सर्व रेटिंग्स'}</option>
                <option value="4.5">4.5★ &amp; {lang === 'en' ? 'above' : 'अधिक'}</option>
                <option value="4.0">4.0★ &amp; {lang === 'en' ? 'above' : 'अधिक'}</option>
                <option value="3.5">3.5★ &amp; {lang === 'en' ? 'above' : 'अधिक'}</option>
              </select>
            </div>

            {/* Toggle Badges */}
            <div className="space-y-2 pt-2 border-t border-charcoal-100">
              {/* Organic */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={organic} onChange={(e) => { setOrganic(e.target.checked); setPage(1); }} className="w-4 h-4 rounded border-charcoal-300 text-leaf-600 focus:ring-leaf-500" />
                <span className="text-sm">{t.filters.organic}</span>
              </label>

              {/* Farm Fresh */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={farmFresh} onChange={(e) => { setFarmFresh(e.target.checked); setPage(1); }} className="w-4 h-4 rounded border-charcoal-300 text-leaf-600 focus:ring-leaf-500" />
                <span className="text-sm">{lang === 'en' ? 'Farm Fresh' : 'शेतातून ताजे'}</span>
              </label>

              {/* In Stock */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={inStock} onChange={(e) => { setInStock(e.target.checked); setPage(1); }} className="w-4 h-4 rounded border-charcoal-300 text-leaf-600 focus:ring-leaf-500" />
                <span className="text-sm">{lang === 'en' ? 'In Stock Only' : 'केवळ शिल्लक साठा'}</span>
              </label>
            </div>

            {hasFilters && (
              <button onClick={clearFilters} className="text-sm text-red-600 font-medium hover:underline block pt-2">
                {t.filters.clearAll}
              </button>
            )}
          </div>

          <button onClick={() => setShowFilters(false)} className="btn-primary w-full mt-4 lg:hidden">{t.filters.apply}</button>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Sort & Search */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t.nav.search}
              className="input-field flex-1"
            />
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="input-field pr-8 appearance-none cursor-pointer text-sm"
              >
                <option value="newest">{t.filters.newest}</option>
                <option value="price_asc">{t.filters.priceLowHigh}</option>
                <option value="price_desc">{t.filters.priceHighLow}</option>
                <option value="popular">{t.filters.popularity}</option>
                <option value="rating">{t.filters.topRated}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400 pointer-events-none" />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="card overflow-hidden">
                  <div className="aspect-[4/3] skeleton" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 skeleton w-3/4" />
                    <div className="h-3 skeleton w-1/2" />
                    <div className="h-4 skeleton w-1/3 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-6xl block mb-4">🍋</span>
              <p className="font-semibold text-charcoal-600">{t.products.noProducts}</p>
              {hasFilters && (
                <button onClick={clearFilters} className="btn-outline mt-4">{t.filters.clearAll}</button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map(p => <ProductCard key={p.id as string} product={p} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${page === i + 1 ? 'bg-leaf-700 text-white' : 'bg-white border border-charcoal-200 hover:bg-charcoal-50'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-leaf-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <ShopContent />
    </Suspense>
  );
}
