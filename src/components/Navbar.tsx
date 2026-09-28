'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { useAuthStore, useCartStore } from '@/lib/store';
import { Search, ShoppingCart, Heart, User, Menu, X, Globe, ChevronDown, LogOut, Package, Settings, Bell, LayoutDashboard } from 'lucide-react';

export function Navbar() {
  const { t, lang, setLang } = useTranslation();
  const { user, logout } = useAuthStore();
  const { totalItems, toggleCart } = useCartStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch { /* ignore */ }
    logout();
    setProfileOpen(false);
    window.location.href = '/';
  };

  const cartCount = totalItems();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-charcoal-100">
      {/* Top bar */}
      <div className="bg-leaf-800 text-white text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <span className="hidden sm:inline">🍋 {lang === 'en' ? "Maharashtra's #1 Lemon Marketplace" : "महाराष्ट्राचे #1 लिंबू मार्केटप्लेस"}</span>
          <span className="sm:hidden">🍋 POPTO</span>
          <div className="flex items-center gap-4">
            <Link href="/app" className="flex items-center gap-1 text-lemon-300 hover:text-white transition-colors font-medium text-xs" id="mobile-app-nav-link">
              <span>📱</span>
              <span>{lang === 'en' ? 'Mobile App & QR' : 'मोबाईल ॲप & QR'}</span>
            </Link>
            <button
            onClick={() => setLang(lang === 'en' ? 'mr' : 'en')}
            className="flex items-center gap-1.5 hover:text-lemon-300 transition-colors"
            id="language-switcher"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="font-medium">{lang === 'en' ? 'EN' : 'मराठी'}</span>
            <span className="text-white/60">|</span>
            <span className="text-white/70">{lang === 'en' ? 'मराठी' : 'EN'}</span>
          </button>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0" id="logo-link">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-leaf-900">
              <img src="/images/popto-logo.png" alt="POPTO Logo" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-xl text-charcoal-900 leading-none">POPTO</h1>
              <p className="text-[9px] text-charcoal-500 font-medium tracking-wider uppercase leading-none mt-0.5">{t.brandSubtitle}</p>
            </div>
          </Link>

          {/* Search bar - desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.nav.search}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-200 bg-charcoal-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:border-transparent text-sm transition-all"
                id="search-input"
              />
            </div>
          </form>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-1">
            <Link href="/" className="btn-ghost text-xs">{t.nav.home}</Link>
            <Link href="/shop" className="btn-ghost text-xs">{t.nav.shop}</Link>
            <Link href="/farmers" className="btn-ghost text-xs">{t.nav.farmers}</Link>
            <Link href="/about" className="btn-ghost text-xs">{t.nav.about}</Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Link href="/account/wishlist" className="p-2 rounded-lg hover:bg-charcoal-50 transition-colors relative" id="wishlist-link" title={t.nav.wishlist}>
              <Heart className="w-5 h-5 text-charcoal-600" />
            </Link>
            
            <button onClick={toggleCart} className="p-2 rounded-lg hover:bg-charcoal-50 transition-colors relative" id="cart-button" title={t.nav.cart}>
              <ShoppingCart className="w-5 h-5 text-charcoal-600" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-leaf-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-charcoal-50 transition-colors"
                  id="profile-button"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-leaf-500 to-leaf-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{user.full_name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-charcoal-500 hidden sm:block" />
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-premium border border-charcoal-100 z-50 animate-slide-down overflow-hidden">
                      <div className="px-4 py-3 border-b border-charcoal-100">
                        <p className="font-semibold text-sm">{user.full_name}</p>
                        <p className="text-xs text-charcoal-500">{user.email}</p>
                        <span className="badge-green text-[10px] mt-1">{user.role}</span>
                      </div>
                      <div className="py-1">
                        <Link href="/account" className="flex items-center gap-3 px-4 py-2.5 hover:bg-charcoal-50 text-sm" onClick={() => setProfileOpen(false)}>
                          <User className="w-4 h-4 text-charcoal-400" /> {t.nav.myAccount}
                        </Link>
                        <Link href="/account/orders" className="flex items-center gap-3 px-4 py-2.5 hover:bg-charcoal-50 text-sm" onClick={() => setProfileOpen(false)}>
                          <Package className="w-4 h-4 text-charcoal-400" /> {t.nav.myOrders}
                        </Link>
                        <Link href="/account/notifications" className="flex items-center gap-3 px-4 py-2.5 hover:bg-charcoal-50 text-sm" onClick={() => setProfileOpen(false)}>
                          <Bell className="w-4 h-4 text-charcoal-400" /> {t.nav.notifications}
                        </Link>
                        {['admin', 'superadmin'].includes(user.role) && (
                          <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 hover:bg-charcoal-50 text-sm text-leaf-700 font-medium" onClick={() => setProfileOpen(false)}>
                            <LayoutDashboard className="w-4 h-4" /> {t.nav.admin}
                          </Link>
                        )}
                        {user.role === 'editor' && (
                          <Link href="/editor" className="flex items-center gap-3 px-4 py-2.5 hover:bg-charcoal-50 text-sm text-leaf-700 font-medium" onClick={() => setProfileOpen(false)}>
                            <Settings className="w-4 h-4" /> {t.nav.editor}
                          </Link>
                        )}
                        {user.role === 'seller' && (
                          <Link href="/seller" className="flex items-center gap-3 px-4 py-2.5 hover:bg-charcoal-50 text-sm text-leaf-700 font-medium" onClick={() => setProfileOpen(false)}>
                            <LayoutDashboard className="w-4 h-4" /> {t.nav.seller}
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-charcoal-100 py-1">
                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 w-full">
                          <LogOut className="w-4 h-4" /> {t.nav.logout}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login" className="btn-primary text-xs py-2 px-4" id="login-link">
                {t.nav.login}
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg hover:bg-charcoal-50" id="mobile-menu-toggle">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="md:hidden mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.nav.search}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-200 bg-charcoal-50 text-sm"
              id="mobile-search-input"
            />
          </div>
        </form>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-charcoal-100 animate-slide-down">
            <div className="flex flex-col gap-1">
              <Link href="/" className="px-3 py-2.5 rounded-lg hover:bg-charcoal-50 text-sm font-medium" onClick={() => setMobileOpen(false)}>{t.nav.home}</Link>
              <Link href="/shop" className="px-3 py-2.5 rounded-lg hover:bg-charcoal-50 text-sm font-medium" onClick={() => setMobileOpen(false)}>{t.nav.shop}</Link>
              <Link href="/farmers" className="px-3 py-2.5 rounded-lg hover:bg-charcoal-50 text-sm font-medium" onClick={() => setMobileOpen(false)}>{t.nav.farmers}</Link>
              <Link href="/about" className="px-3 py-2.5 rounded-lg hover:bg-charcoal-50 text-sm font-medium" onClick={() => setMobileOpen(false)}>{t.nav.about}</Link>
              <Link href="/contact" className="px-3 py-2.5 rounded-lg hover:bg-charcoal-50 text-sm font-medium" onClick={() => setMobileOpen(false)}>{t.nav.contact}</Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
