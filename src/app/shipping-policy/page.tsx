'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { Truck, ArrowLeft, ShieldCheck, ThermometerSnowflake } from 'lucide-react';

export default function ShippingPolicyPage() {
  const { t, lang } = useTranslation();

  return (
    <div className="min-h-screen bg-sand-50/50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-leaf-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-charcoal-100">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="w-6 h-6 text-leaf-700" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
              {lang === 'en' ? 'Fresh Cold-Chain Shipping Policy' : 'शीत-शृंखला वितरण धोरण'}
            </h1>
          </div>
          <p className="text-xs text-charcoal-400 mb-8">Maharashtra 24-48 Hour Direct Orchard Fulfillment</p>

          <div className="space-y-6 text-xs sm:text-sm text-charcoal-700 leading-relaxed">
            <section>
              <h2 className="text-base font-bold text-charcoal-900 mb-2">1. Regional Coverage</h2>
              <p>
                POPTO ships exclusively across all 36 districts of Maharashtra, including major urban centers (Pune, Mumbai, Thane, Navi Mumbai, Nagpur, Nashik, Aurangabad, Solapur, Kolhapur) as well as rural talukas.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-charcoal-900 mb-2">2. Harvest-to-Door Timelines</h2>
              <p>
                Lemons are hand-picked in the early morning dew to preserve essential citrus oils. Baskets and crates are sorted, weight-verified, and dispatched on refrigerated or aerated transport within 12 hours of harvest, reaching customer destinations in 24 to 48 hours.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-charcoal-900 mb-2">3. Shipping Fees & Free Delivery</h2>
              <p>
                Orders above ₹499 qualify for <strong>FREE Standard Shipping</strong> across Maharashtra. Orders below ₹499 carry a standard shipping fee of ₹49. Express next-morning delivery is available for eligible pin codes at ₹60.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
