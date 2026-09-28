'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  const { t, lang } = useTranslation();

  return (
    <div className="min-h-screen bg-sand-50/50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-leaf-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-charcoal-100">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 mb-2">
            {lang === 'en' ? 'Terms & Conditions' : 'नियम आणि अटी'}
          </h1>
          <p className="text-xs text-charcoal-400 mb-8">POPTO Lemon Marketplace Platform Terms</p>

          <div className="space-y-6 text-xs sm:text-sm text-charcoal-700 leading-relaxed">
            <section>
              <h2 className="text-base font-bold text-charcoal-900 mb-2">1. Exclusive Focus on Maharashtra Lemons</h2>
              <p>
                POPTO is an exclusive agricultural marketplace connecting verified Maharashtra lemon groves (Solapur, Ahmednagar, Jalgaon, Pune, Nagpur) with retail customers, bulk catering services, and commercial establishments.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-charcoal-900 mb-2">2. Pricing & Currency</h2>
              <p>
                All prices listed across the platform are denominated in Indian National Rupees (INR ₹) and are inclusive of standard agricultural handling fees. Applicable GST and delivery charges are calculated transparently at checkout.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-charcoal-900 mb-2">3. Produce Quality & Replacement</h2>
              <p>
                Because lemons are perishable farm produce, customers receiving defective or damaged lemons during transit can report quality issues within 24 hours of delivery with photographic evidence for immediate replacement or full refund.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
