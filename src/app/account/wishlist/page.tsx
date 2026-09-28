'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import { useAuthStore, useToastStore, useCartStore } from '@/lib/store';
import { Heart, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';

export default function WishlistPage() {
  const router = useRouter();
  const { t, lang } = useTranslation();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const { addItem, setOpen } = useCartStore();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/account/wishlist');
      return;
    }

    async function load() {
      try {
        const res = await fetch('/api/wishlist', {
          headers: { Authorization: `Bearer ${localStorage.getItem('popto_token')}` },
        });
        const data = await res.json();
        if (data.data) setProducts(data.data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const handleRemove = async (productId: string) => {
    try {
      await fetch(`/api/wishlist?productId=${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('popto_token')}` },
      });
      setProducts(products.filter((p) => p.id !== productId && p.product_id !== productId));
      addToast({ message: 'Removed from wishlist', type: 'info' });
    } catch {
      addToast({ message: 'Error removing item', type: 'error' });
    }
  };

  const handleMoveToCart = (prod: any) => {
    addItem({
      id: '',
      user_id: user?.id || '',
      product_id: prod.id || prod.product_id,
      quantity: 1,
      saved_for_later: false,
      product: {
        id: prod.id || prod.product_id,
        name_en: prod.name_en,
        name_mr: prod.name_mr || '',
        price: prod.price,
        unit: prod.unit || 'kg',
        images: [{ id: '', product_id: prod.id || prod.product_id, url: prod.image_url || prod.image || '', is_primary: true, sort_order: 0 }],
      } as any,
    });
    addToast({ message: 'Added to cart!', type: 'success' });
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-sand-50/50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Link href="/account" className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-leaf-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> {lang === 'en' ? 'Back to Account' : 'परत खात्याकडे'}
        </Link>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 mb-8 flex items-center gap-3">
          <span>{lang === 'en' ? 'My Saved Lemon Wishlist' : 'माझी सेव्ह केलेली लिंबू यादी'}</span>
          <span className="text-sm font-semibold bg-red-100 text-red-700 px-3 py-1 rounded-full">
            {products.length} {lang === 'en' ? 'items' : 'वस्तू'}
          </span>
        </h1>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-charcoal-100">
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                ❤️
              </div>
              <h3 className="text-base font-bold text-charcoal-900 mb-1">Your Wishlist is Empty</h3>
              <p className="text-xs text-charcoal-500 mb-6">Save your favorite lemon varieties for quick access later.</p>
              <Link href="/shop" className="btn-primary text-xs px-6 py-2.5">
                Browse Lemons
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p) => {
                const name = lang === 'mr' && p.name_mr ? p.name_mr : p.name_en;
                const img = p.primary_image || p.image_url || p.image;
                return (
                  <div key={p.id} className="border border-charcoal-100 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-lemon-50 mb-3 flex items-center justify-center">
                        {img ? (
                          <img src={img} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-4xl">🍋</span>
                        )}
                      </div>
                      <Link href={`/shop/${p.id}`} className="font-bold text-charcoal-900 hover:text-leaf-700 text-sm line-clamp-1">
                        {name}
                      </Link>
                      <p className="text-xs font-semibold text-leaf-700 mt-1">₹{p.price} / {p.unit || 'kg'}</p>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-charcoal-100">
                      <button
                        onClick={() => handleMoveToCart(p)}
                        className="btn-primary flex-1 text-xs py-2 flex items-center justify-center gap-1.5"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                      <button
                        onClick={() => handleRemove(p.id)}
                        className="p-2 border border-charcoal-200 hover:bg-red-50 hover:text-red-500 rounded-xl text-charcoal-400 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
