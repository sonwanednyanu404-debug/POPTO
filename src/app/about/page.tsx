'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { Sprout, ShieldCheck, Truck, Users, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const { t, lang } = useTranslation();

  return (
    <div className="min-h-screen bg-sand-50/50 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-leaf-100 text-leaf-800 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            🍋 POPTO — From Farmers to Buyers
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-charcoal-900 tracking-tight mb-4">
            {lang === 'en'
              ? 'Maharashtra’s Dedicated Lemon Marketplace'
              : 'महाराष्ट्राचे अस्सल लिंबू डिजिटल मार्केटप्लेस'}
          </h1>
          <p className="text-charcoal-600 text-base leading-relaxed">
            {lang === 'en'
              ? 'POPTO was born with a singular mission: empower Maharashtra citrus growers by eliminating predatory middlemen and delivering freshest handpicked Kagzi and Seedless lemons directly to homes, food businesses, and caterers within 24 to 48 hours of harvest.'
              : 'दलालांना दूर सारून महाराष्ट्रातील शेतकऱ्यांचा ताजा कागदी लिंबू थेट ग्राहकांपर्यंत पोहोचवणे हेच POPTO चे ध्येय आहे.'}
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-charcoal-100 text-center">
            <div className="w-14 h-14 rounded-2xl bg-leaf-100 text-leaf-700 flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
              👨‍🌾
            </div>
            <h3 className="font-extrabold text-charcoal-900 text-lg mb-2">
              {lang === 'en' ? 'Direct Farmer Benefit' : 'शेतकऱ्यांना थेट मोबदला'}
            </h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              {lang === 'en'
                ? 'Farmers set their fair price, receive transparent payouts, and retain maximum value for their hard work in Maharashtra orchards.'
                : 'शेतकऱ्यांना त्यांच्या कष्टाचा योग्य दर मिळतो, पारदर्शक व्यवहारासह.'}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-charcoal-100 text-center">
            <div className="w-14 h-14 rounded-2xl bg-lemon-100 text-charcoal-900 flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
              🌱
            </div>
            <h3 className="font-extrabold text-charcoal-900 text-lg mb-2">
              {lang === 'en' ? 'Authentic Quality & Juice' : 'दर्जेदार व रसाळ लिंबू'}
            </h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              {lang === 'en'
                ? 'Only authentic Maharashtra lemon varieties with high juice yield, natural acidity, thin skin, and zero chemical wax treatments.'
                : 'पातळ साल, भरपूर रस आणि कोणतीही रासायनिक प्रक्रिया न केलेले अस्सल लिंबू.'}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-charcoal-100 text-center">
            <div className="w-14 h-14 rounded-2xl bg-sand-100 text-charcoal-700 flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
              🚚
            </div>
            <h3 className="font-extrabold text-charcoal-900 text-lg mb-2">
              {lang === 'en' ? '24-48h Farm Dispatch' : '२४-४८ तासांत घरपोच'}
            </h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              {lang === 'en'
                ? 'Carefully packed in breathable eco-crates and transported across Pune, Mumbai, Nagpur, Nashik, and Solapur.'
                : 'काढणीनंतर लगेच पॅकिंग करून संपूर्ण महाराष्ट्रात सुरक्षित वितरण.'}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-leaf-800 to-leaf-950 text-white rounded-3xl p-8 sm:p-12 text-center shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
            {lang === 'en' ? 'Experience the Real Taste of Maharashtra Lemons' : 'अस्सल महाराष्ट्रीयन लिंबाची चव अनुभवा'}
          </h2>
          <p className="text-white/80 text-sm max-w-xl mx-auto mb-6">
            Join hundreds of families and businesses enjoying garden-fresh lemons delivered straight from verified farmers.
          </p>
          <Link href="/shop" className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 shadow-lg">
            <span>{lang === 'en' ? 'Explore Fresh Lemons' : 'लिंबे खरेदी करा'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
