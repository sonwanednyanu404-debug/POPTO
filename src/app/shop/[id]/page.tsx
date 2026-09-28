'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { useCartStore, useToastStore, useAuthStore, useWishlistStore } from '@/lib/store';
import { ProductCard } from '@/components/ProductCard';
import {
  Star,
  MapPin,
  Leaf,
  Sprout,
  ShieldCheck,
  Truck,
  Heart,
  ShoppingCart,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Share2,
} from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t, lang } = useTranslation();
  const { addItem, setOpen } = useCartStore();
  const { addToast } = useToastStore();
  const { user } = useAuthStore();
  const { isInWishlist, addItem: addWishlist, removeItem: removeWishlist } = useWishlistStore();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'farmer' | 'reviews' | 'delivery'>('desc');

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (data.success && data.data) {
          setProduct(data.data);
          const primary = data.data.images?.find((img: any) => img.is_primary)?.url || data.data.images?.[0]?.url;
          setActiveImage(primary || '');
        }
      } catch (err) {
        console.error('Failed to load product', err);
      }
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-lemon-400 border-t-leaf-600 rounded-full animate-spin mb-4" />
        <p className="text-charcoal-500 font-medium">
          {lang === 'en' ? 'Loading fresh lemon details...' : 'ताजे लिंबू तपशील लोड होत आहेत...'}
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-charcoal-900 mb-2">
          {lang === 'en' ? 'Product Not Found' : 'उत्पादन सापडले नाही'}
        </h2>
        <p className="text-charcoal-600 mb-6">
          {lang === 'en' ? 'The lemon variety you are looking for is unavailable.' : 'आपण शोधत असलेले लिंबू उत्पादन उपलब्ध नाही.'}
        </p>
        <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> {lang === 'en' ? 'Back to Shop' : 'परत दुकानात जा'}
        </Link>
      </div>
    );
  }

  const name = lang === 'mr' && product.name_mr ? product.name_mr : product.name_en;
  const description = lang === 'mr' && product.description_mr ? product.description_mr : product.description_en;
  const price = Number(product.price);
  const comparePrice = product.compare_price ? Number(product.compare_price) : null;
  const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
  const inWish = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (!user) {
      addToast({
        message: lang === 'en' ? 'Please log in to add items to cart' : 'कृपया कार्टमध्ये जोडण्यासाठी लॉगिन करा',
        type: 'warning',
      });
      router.push('/login');
      return;
    }

    addItem({
      id: '',
      user_id: user.id,
      product_id: product.id,
      quantity,
      saved_for_later: false,
      product: {
        id: product.id,
        name_en: product.name_en,
        name_mr: product.name_mr || '',
        price,
        unit: product.unit || 'kg',
        images: product.images || [],
      } as any,
    });

    addToast({
      message: `${quantity} ${product.unit || 'kg'} ${name} ${lang === 'en' ? 'added to cart!' : 'कार्टमध्ये जोडले!'}`,
      type: 'success',
    });
    setOpen(true);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      addToast({
        message: lang === 'en' ? 'Please log in to save to wishlist' : 'कृपया इच्छासूचीसाठी लॉगिन करा',
        type: 'warning',
      });
      return;
    }

    if (inWish) {
      removeWishlist(product.id);
      addToast({ message: lang === 'en' ? 'Removed from wishlist' : 'इच्छासूचीतून काढले', type: 'info' });
    } else {
      addWishlist(product.id);
      try {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('popto_token')}`,
          },
          body: JSON.stringify({ productId: product.id }),
        });
        addToast({ message: lang === 'en' ? 'Saved to wishlist!' : 'इच्छासूचीमध्ये जोडले!', type: 'success' });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addToast({
        message: lang === 'en' ? 'Please log in to write a review' : 'कृपया पुनरावलोकन लिहिण्यासाठी लॉगिन करा',
        type: 'warning',
      });
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('popto_token')}`,
        },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast({
          message: lang === 'en' ? 'Review submitted successfully!' : 'पुनरावलोकन यशस्वीपणे पाठवले!',
          type: 'success',
        });
        setReviewComment('');
        // Reload product details to show new review
        const reloadRes = await fetch(`/api/products/${product.id}`);
        const reloadData = await reloadRes.json();
        if (reloadData.data) setProduct(reloadData.data);
      } else {
        addToast({ message: data.error || 'Failed to submit review', type: 'error' });
      }
    } catch {
      addToast({ message: 'Error submitting review', type: 'error' });
    }
    setSubmittingReview(false);
  };

  return (
    <div className="min-h-screen bg-sand-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-charcoal-500 mb-6">
          <Link href="/" className="hover:text-leaf-700">
            {lang === 'en' ? 'Home' : 'मुख्यपृष्ठ'}
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-leaf-700">
            {lang === 'en' ? 'Shop Lemons' : 'लिंबू खरेदी करा'}
          </Link>
          <span>/</span>
          <span className="text-charcoal-900 font-medium truncate max-w-xs">{name}</span>
        </nav>

        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-charcoal-100">
          {/* Gallery */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-lemon-50 border border-charcoal-100 shadow-inner">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={name}
                  className="w-full h-full object-cover object-center transition-all duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl">🍋</div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {discount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                    -{discount}% OFF
                  </span>
                )}
                {product.is_organic === 1 && (
                  <span className="bg-leaf-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                    <Leaf className="w-3.5 h-3.5" /> {lang === 'en' ? 'Certified Organic' : 'प्रमाणित सेंद्रिय'}
                  </span>
                )}
                {product.is_farm_fresh === 1 && (
                  <span className="bg-lemon-500 text-charcoal-900 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                    <Sprout className="w-3.5 h-3.5" /> {lang === 'en' ? 'Farm Fresh' : 'शेत ताजे'}
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={handleWishlistToggle}
                className={`absolute top-4 right-4 p-2.5 rounded-full shadow-md backdrop-blur-md transition-colors ${
                  inWish ? 'bg-red-50 text-red-500' : 'bg-white/80 text-charcoal-600 hover:text-red-500'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${inWish ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img: any) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img.url)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      activeImage === img.url ? 'border-leaf-600 ring-2 ring-leaf-200' : 'border-charcoal-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={img.alt_text || name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Actions */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Farmer Info Header */}
              {product.seller_name && (
                <div className="flex items-center gap-2 mb-2 text-sm text-leaf-700 font-medium">
                  <MapPin className="w-4 h-4 text-leaf-600" />
                  <span>
                    {product.farm_name || product.seller_name}
                    {product.seller_district ? ` • ${product.seller_district}, Maharashtra` : ''}
                  </span>
                  {product.seller_verified === 1 && (
                    <span className="inline-flex items-center text-xs text-leaf-600 bg-leaf-50 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5 mr-0.5" /> Verified Farmer
                    </span>
                  )}
                </div>
              )}

              <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900 mb-3">{name}</h1>

              {/* Rating & Reviews Count */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1 bg-lemon-100 text-charcoal-900 px-2.5 py-1 rounded-lg text-sm font-semibold">
                  <Star className="w-4 h-4 fill-lemon-500 text-lemon-500" />
                  <span>{product.rating ? Number(product.rating).toFixed(1) : '5.0'}</span>
                </div>
                <span className="text-sm text-charcoal-500">
                  ({product.reviews_count || product.review_count || product.reviews?.length || 0}{' '}
                  {lang === 'en' ? 'verified reviews' : 'ग्राहक अभिप्राय'})
                </span>
                <span className="text-charcoal-300">|</span>
                <span className="text-sm text-leaf-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {product.stock > 0
                    ? `${lang === 'en' ? 'In Stock' : 'उपलब्ध'} (${product.stock} ${product.unit || 'kg'})`
                    : lang === 'en' ? 'Out of Stock' : 'साठा संपला'}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6 bg-sand-50/80 p-4 rounded-2xl border border-charcoal-100">
                <span className="text-3xl sm:text-4xl font-extrabold text-charcoal-900">
                  ₹{price}
                </span>
                <span className="text-sm text-charcoal-500">/ {product.unit || 'kg'}</span>
                {comparePrice && comparePrice > price && (
                  <span className="text-lg text-charcoal-400 line-through">₹{comparePrice}</span>
                )}
                {discount > 0 && (
                  <span className="text-sm font-bold text-leaf-700 bg-leaf-100 px-2.5 py-0.5 rounded-full">
                    {lang === 'en' ? `Save ₹${comparePrice! - price}` : `₹${comparePrice! - price} बचत`}
                  </span>
                )}
              </div>

              {/* Short Description */}
              <p className="text-charcoal-600 leading-relaxed mb-6">
                {description || (lang === 'en' ? 'Juicy, sun-ripened authentic Maharashtra lemons harvested directly from verified local orchards.' : 'स्थानिक शेतातून थेट काढलेले रसाळ आणि ताजे अस्सल महाराष्ट्रीयन लिंबू.')}
              </p>

              {/* Harvest & Quality Attributes */}
              <div className="grid grid-cols-2 gap-3 mb-6 text-xs sm:text-sm">
                <div className="bg-leaf-50/60 border border-leaf-100 p-3 rounded-xl flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-leaf-700 flex-shrink-0" />
                  <div>
                    <div className="text-charcoal-500 text-[11px]">{lang === 'en' ? 'Harvest Date' : 'काढणी दिनांक'}</div>
                    <div className="font-semibold text-charcoal-800">{product.harvest_info || 'Within 24-48 Hours'}</div>
                  </div>
                </div>
                <div className="bg-lemon-50/60 border border-lemon-200 p-3 rounded-xl flex items-center gap-2">
                  <Truck className="w-4 h-4 text-lemon-700 flex-shrink-0" />
                  <div>
                    <div className="text-charcoal-500 text-[11px]">{lang === 'en' ? 'Delivery' : 'डिलिव्हरी'}</div>
                    <div className="font-semibold text-charcoal-800">{product.delivery_info || 'Fast Maharashtra Shipping'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="border-t border-charcoal-100 pt-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4">
                {/* Quantity */}
                <div className="flex items-center justify-between border border-charcoal-200 rounded-xl px-4 py-2 bg-white sm:w-36">
                  <span className="text-xs text-charcoal-500 sm:hidden">Qty:</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-charcoal-100 text-charcoal-700 font-bold"
                    >
                      -
                    </button>
                    <span className="font-bold text-charcoal-900 w-6 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock || 50, quantity + 1))}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-charcoal-100 text-charcoal-700 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5 shadow-md shadow-leaf-700/20"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{lang === 'en' ? 'Add to Cart' : 'कार्टमध्ये जोडा'}</span>
                </button>

                {/* Buy Now */}
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="bg-charcoal-900 hover:bg-charcoal-800 text-white font-semibold px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <span>{lang === 'en' ? 'Buy Now' : 'त्वरित खरेदी करा'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-charcoal-500 px-1">
                <span>🛡️ {lang === 'en' ? '100% Genuine Maharashtra Quality' : '१००% अस्सल महाराष्ट्र गुणवत्ता'}</span>
                <span>📦 {lang === 'en' ? 'Direct Farm Packaging' : 'थेट शेतातून पॅकिंग'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs Section */}
        <div className="mt-12 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-charcoal-100">
          {/* Tab Navigation */}
          <div className="flex border-b border-charcoal-200 overflow-x-auto gap-8 mb-6">
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-4 font-semibold text-sm sm:text-base border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'desc' ? 'border-leaf-600 text-leaf-700' : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
              }`}
            >
              {lang === 'en' ? 'Description & Specs' : 'वर्णन आणि तपशील'}
            </button>
            <button
              onClick={() => setActiveTab('farmer')}
              className={`pb-4 font-semibold text-sm sm:text-base border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'farmer' ? 'border-leaf-600 text-leaf-700' : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
              }`}
            >
              {lang === 'en' ? 'Farmer & Grove Story' : 'शेतकरी व बाग माहिती'}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 font-semibold text-sm sm:text-base border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'reviews' ? 'border-leaf-600 text-leaf-700' : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
              }`}
            >
              {lang === 'en' ? `Customer Reviews (${product.reviews?.length || 0})` : `ग्राहक पुनरावलोकने (${product.reviews?.length || 0})`}
            </button>
            <button
              onClick={() => setActiveTab('delivery')}
              className={`pb-4 font-semibold text-sm sm:text-base border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'delivery' ? 'border-leaf-600 text-leaf-700' : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
              }`}
            >
              {lang === 'en' ? 'Freshness & Shipping' : 'ताजेपणा व वितरण'}
            </button>
          </div>

          {/* Tab Content */}
          <div className="py-2">
            {activeTab === 'desc' && (
              <div className="space-y-4 max-w-3xl text-charcoal-700 leading-relaxed">
                <p>{description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="border border-charcoal-100 rounded-xl p-4 bg-sand-50/50">
                    <span className="text-xs text-charcoal-400 block uppercase font-medium">Category</span>
                    <span className="font-semibold text-charcoal-900">{product.category_name_en || 'Kagzi Lemons'}</span>
                  </div>
                  <div className="border border-charcoal-100 rounded-xl p-4 bg-sand-50/50">
                    <span className="text-xs text-charcoal-400 block uppercase font-medium">Farming Method</span>
                    <span className="font-semibold text-charcoal-900">{product.is_organic ? '100% Organic certified' : 'Traditional farm grown'}</span>
                  </div>
                  <div className="border border-charcoal-100 rounded-xl p-4 bg-sand-50/50">
                    <span className="text-xs text-charcoal-400 block uppercase font-medium">Origin</span>
                    <span className="font-semibold text-charcoal-900">{product.seller_district || 'Solapur'}, Maharashtra</span>
                  </div>
                  <div className="border border-charcoal-100 rounded-xl p-4 bg-sand-50/50">
                    <span className="text-xs text-charcoal-400 block uppercase font-medium">Shelf Life</span>
                    <span className="font-semibold text-charcoal-900">14-21 Days in cool storage</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'farmer' && (
              <div className="max-w-2xl bg-sand-50/60 p-6 rounded-2xl border border-charcoal-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-leaf-100 flex items-center justify-center text-3xl">
                    👨‍🌾
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-charcoal-900">{product.farm_name || product.seller_name}</h3>
                    <p className="text-sm text-charcoal-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-leaf-600" />
                      {product.seller_district || 'Solapur'}, Maharashtra
                    </p>
                  </div>
                </div>
                <p className="text-charcoal-700 leading-relaxed mb-4">
                  {product.seller_description || (lang === 'en'
                    ? 'Dedicated lemon cultivation with traditional agro-ecological practices ensuring natural acidity, aromatic zest, and zero chemical waxes.'
                    : 'पारंपरिक कृषी पद्धती वापरून लिंबू लागवड, नैसर्गिक आंबटपणा आणि रासायनिक मेण नसलेले ताजे उत्पादन.')}
                </p>
                <Link
                  href={`/farmers/${product.seller_id || product.sid || ''}`}
                  className="text-leaf-700 hover:text-leaf-800 font-semibold text-sm inline-flex items-center gap-1"
                >
                  {lang === 'en' ? 'View all produce from this farmer →' : 'या शेतकऱ्याची सर्व उत्पादने पहा →'}
                </Link>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Reviews List */}
                <div className="space-y-4">
                  {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map((rev: any) => (
                      <div key={rev.id} className="border-b border-charcoal-100 pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-charcoal-900">{rev.user_name || 'Verified Customer'}</span>
                            {rev.is_verified_purchase === 1 && (
                              <span className="text-[11px] bg-leaf-50 text-leaf-700 px-2 py-0.5 rounded-full font-medium">
                                ✓ Verified Buyer
                              </span>
                            )}
                          </div>
                          <div className="flex text-lemon-500">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'text-charcoal-200'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-charcoal-600 text-sm">{rev.comment}</p>
                        <span className="text-xs text-charcoal-400 mt-1 block">{rev.created_at}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-charcoal-500 italic">
                      {lang === 'en' ? 'No reviews yet. Be the first to review this lemon variety!' : 'अद्याप कोणतेही पुनरावलोकन नाही. पहिले पुनरावलोकन आपण द्या!'}
                    </p>
                  )}
                </div>

                {/* Review Form */}
                <div className="bg-sand-50 p-6 rounded-2xl border border-charcoal-100 max-w-xl">
                  <h4 className="font-bold text-charcoal-900 mb-3">
                    {lang === 'en' ? 'Write a Review' : 'पुनरावलोकन लिहा'}
                  </h4>
                  {user ? (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-600 mb-1">
                          {lang === 'en' ? 'Your Rating' : 'आपले रेटिंग'}
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setReviewRating(star)}
                              className="text-2xl transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-6 h-6 ${star <= reviewRating ? 'fill-lemon-400 text-lemon-500' : 'text-charcoal-300'}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-charcoal-600 mb-1">
                          {lang === 'en' ? 'Your Review' : 'आपला अभिप्राय'}
                        </label>
                        <textarea
                          rows={3}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder={lang === 'en' ? 'Tell other lemon buyers about taste, juice content, and freshness...' : 'रस आणि ताजेपणाबद्दल इतर ग्राहकांना सांगा...'}
                          className="w-full px-3 py-2 border border-charcoal-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="btn-primary text-sm px-5 py-2.5"
                      >
                        {submittingReview
                          ? (lang === 'en' ? 'Submitting...' : 'पाठवत आहे...')
                          : (lang === 'en' ? 'Submit Review' : 'पुनरावलोकन पाठवा')}
                      </button>
                    </form>
                  ) : (
                    <div className="text-sm text-charcoal-600">
                      <span>{lang === 'en' ? 'Please ' : 'कृपया '}</span>
                      <Link href="/login" className="text-leaf-700 font-semibold underline">
                        {lang === 'en' ? 'login' : 'लॉगिन करा'}
                      </Link>
                      <span>{lang === 'en' ? ' to share your feedback.' : ' अभिप्राय देण्यासाठी.'}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'delivery' && (
              <div className="max-w-2xl space-y-4 text-charcoal-700 text-sm leading-relaxed">
                <div className="flex gap-3">
                  <Truck className="w-5 h-5 text-leaf-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-charcoal-900 mb-1">
                      {lang === 'en' ? 'Maharashtra Cold-Chain Direct Delivery' : 'महाराष्ट्र थेट शीत-शृंखला वितरण'}
                    </h4>
                    <p>
                      {lang === 'en'
                        ? 'All lemon orders are sorted within 12 hours of harvest and dispatched in ventilated breathable eco-crates across Pune, Mumbai, Nagpur, Nashik, Aurangabad, and Solapur within 24 to 48 hours.'
                        : 'सर्व लिंबू ऑर्डर काढणीनंतर १२ तासांच्या आत क्रमवारी लावून २४ ते ४८ तासांच्या आत पोहोचवल्या जातात.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {product.related && product.related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-charcoal-900 mb-6">
              {lang === 'en' ? 'More Lemon Varieties You Might Like' : 'इतर संबंधित लिंबू प्रकार'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {product.related.map((rel: any) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
