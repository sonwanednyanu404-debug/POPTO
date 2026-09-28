'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { MapPin, Phone, Mail } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-charcoal-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-leaf-950 shadow-md">
                <img src="/images/popto-logo.png" alt="POPTO Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl">POPTO</h3>
                <p className="text-[10px] text-charcoal-400 tracking-wider uppercase">{t.tagline}</p>
              </div>
            </div>
            <p className="text-sm text-charcoal-400 leading-relaxed mb-4">{t.footer.aboutText}</p>
            <div className="flex items-center gap-2 text-xs text-charcoal-400">
              <MapPin className="w-3.5 h-3.5" /> Maharashtra, India
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-lemon-400">{t.footer.quickLinks}</h4>
            <ul className="space-y-2">
              <li><Link href="/shop" className="text-sm text-charcoal-400 hover:text-white transition-colors">{t.nav.shop}</Link></li>
              <li><Link href="/farmers" className="text-sm text-charcoal-400 hover:text-white transition-colors">{t.nav.farmers}</Link></li>
              <li><Link href="/about" className="text-sm text-charcoal-400 hover:text-white transition-colors">{t.nav.about}</Link></li>
              <li><Link href="/contact" className="text-sm text-charcoal-400 hover:text-white transition-colors">{t.nav.contact}</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-lemon-400">{t.footer.customerService}</h4>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-sm text-charcoal-400 hover:text-white transition-colors">{t.footer.help}</Link></li>
              <li><Link href="/shipping-policy" className="text-sm text-charcoal-400 hover:text-white transition-colors">{t.footer.shipping}</Link></li>
              <li><Link href="/refund-policy" className="text-sm text-charcoal-400 hover:text-white transition-colors">{t.footer.refund}</Link></li>
              <li><Link href="/cancellation-policy" className="text-sm text-charcoal-400 hover:text-white transition-colors">{t.footer.cancellation}</Link></li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-lemon-400">{t.footer.legal}</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-sm text-charcoal-400 hover:text-white transition-colors">{t.footer.privacy}</Link></li>
              <li><Link href="/terms" className="text-sm text-charcoal-400 hover:text-white transition-colors">{t.footer.terms}</Link></li>
            </ul>
            <div className="mt-4 space-y-2">
              <a href="mailto:support@popto.in" className="flex items-center gap-2 text-sm text-charcoal-400 hover:text-white">
                <Mail className="w-3.5 h-3.5" /> support@popto.in
              </a>
              <a href="tel:+919876543210" className="flex items-center gap-2 text-sm text-charcoal-400 hover:text-white">
                <Phone className="w-3.5 h-3.5" /> +91 98765 43210
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-charcoal-500">{t.footer.copyright}</p>
          <p className="text-xs text-charcoal-500">{t.footer.madeWith}</p>
        </div>
      </div>
    </footer>
  );
}
