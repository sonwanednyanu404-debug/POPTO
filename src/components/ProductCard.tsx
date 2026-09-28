'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { useCartStore, useToastStore, useAuthStore } from '@/lib/store';
import { ShoppingCart, Heart, Star, MapPin, Leaf, Sprout } from 'lucide-react';

interface ProductCardProps {
  product: Record<string, unknown>;
}

export function ProductCard({ product }: ProductCardProps) {
  const { t, lang } = useTranslation();
  const { addItem } = useCartStore();
  const { addToast } = useToastStore();
  const { user } = useAuthStore();

  const name = lang === 'mr' && product.name_mr ? product.name_mr as string : product.name_en as string;
  const price = product.price as number;
  const comparePrice = product.compare_price as number | null;
  const stock = product.stock as number;
  const rating = product.rating as number;
  const reviewCount = product.review_count as number;
  const image = product.primary_image as string || product.image as string;
  const isOrganic = !!product.is_organic;
  const isFarmFresh = !!product.is_farm_fresh;
  const unit = product.unit as string || 'kg';
  const sellerName = product.seller_name as string || product.farm_name as string || '';
  const district = product.seller_district as string || '';
  const slug = product.slug as string || product.id as string;

  const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      addToast({ message: lang === 'en' ? 'Please login to add items to cart' : 'कार्टमध्ये आयटम जोडण्यासाठी कृपया लॉगिन करा', type: 'warning' });
      return;
    }

    addItem({
      id: '',
      user_id: user.id,
      product_id: product.id as string,
      quantity: 1,
      saved_for_later: false,
      product: {
        id: product.id as string,
        name_en: product.name_en as string,
        name_mr: product.name_mr as string || '',
        price,
        unit,
        images: image ? [{ id: '', product_id: product.id as string, url: image, is_primary: true, sort_order: 0 }] : [],
      } as never,
    });

    addToast({ message: lang === 'en' ? 'Added to cart!' : 'कार्टमध्ये जोडले!', type: 'success' });

    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('popto_token')}` },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
    } catch { /* silent */ }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      addToast({ message: lang === 'en' ? 'Please login first' : 'कृपया प्रथम लॉगिन करा', type: 'warning' });
      return;
    }
    try {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('popto_token')}` },
        body: JSON.stringify({ productId: product.id }),
      });
      addToast({ message: lang === 'en' ? 'Added to wishlist!' : 'इच्छासूचीमध्ये जोडले!', type: 'success' });
    } catch { /* silent */ }
  };

  return (
    <Link href={`/shop/${slug}`} className="card group overflow-hidden flex flex-col" id={`product-card-${product.id}`}>
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-lemon-50 to-leaf-50 overflow-hidden">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl opacity-50">🍋</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
          )}
          {isOrganic && (
            <span className="bg-leaf-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Leaf className="w-3 h-3" /> {t.products.organic}
            </span>
          )}
          {isFarmFresh && !isOrganic && (
            <span className="bg-lemon-500 text-charcoal-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sprout className="w-3 h-3" /> {t.products.farmFresh}
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button onClick={handleWishlist} className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-sm">
          <Heart className="w-4 h-4 text-charcoal-500 hover:text-red-500" />
        </button>

        {/* Stock status */}
        {stock <= 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-charcoal-900 text-sm font-bold px-4 py-2 rounded-full">{t.products.outOfStock}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Seller & Location */}
        <div className="flex items-center gap-1.5 text-xs text-charcoal-500 mb-1.5">
          {sellerName && <span className="truncate">{sellerName}</span>}
          {district && (
            <>
              <span>·</span>
              <span className="flex items-center gap-0.5 truncate"><MapPin className="w-3 h-3" /> {district}</span>
            </>
          )}
        </div>

        {/* Name */}
        <h3 className="font-semibold text-sm text-charcoal-900 line-clamp-2 group-hover:text-leaf-700 transition-colors mb-2">
          {name}
        </h3>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center gap-0.5 bg-leaf-50 px-1.5 py-0.5 rounded">
              <Star className="w-3 h-3 fill-lemon-500 text-lemon-500" />
              <span className="text-xs font-bold text-leaf-800">{rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-charcoal-400">({reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="mt-auto flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-charcoal-900">₹{price}</span>
              <span className="text-xs text-charcoal-500">/ {unit}</span>
            </div>
            {comparePrice && comparePrice > price && (
              <span className="text-xs text-charcoal-400 line-through">₹{comparePrice}</span>
            )}
          </div>

          {stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="w-9 h-9 bg-leaf-700 text-white rounded-xl flex items-center justify-center hover:bg-leaf-800 active:scale-95 transition-all"
              title={t.products.addToCart}
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
