'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { RefreshCw, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function RefundPolicyPage() {
  const { lang } = useTranslation();

  return (
    <div className="min-h-screen bg-sand-50/50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-leaf-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-charcoal-100">
          <div className="flex items-center gap-3 mb-2">
            <RefreshCw className="w-6 h-6 text-leaf-700" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
              {lang === 'en' ? 'Refund & Quality Guarantee Policy' : 'परतावा आणि गुणवत्ता हमी धोरण'}
            </h1>
          </div>
          <p className="text-xs text-charcoal-400 mb-8">
            {lang === 'en' ? '100% Farm-Fresh Guarantee Across Maharashtra' : 'संपूर्ण महाराष्ट्रात १००% शेतातून ताजी गुणवत्ता हमी'}
          </p>

          <div className="space-y-6 text-xs sm:text-sm text-charcoal-700 leading-relaxed">
            <section>
              <h2 className="text-base font-bold text-charcoal-900 mb-2">
                {lang === 'en' ? '1. Fresh Quality Guarantee' : '१. ताजेपणाची हमी'}
              </h2>
              <p>
                {lang === 'en'
                  ? 'We take pride in delivering healthy, vibrant Kagzi and citrus lemons directly from verified Maharashtra orchards. If you receive produce damaged in transit or compromised quality, we offer a 24-hour hassle-free replacement or refund.'
                  : 'आम्ही महाराष्ट्रातील प्रमाणित बागांमधून थेट दर्जेदार कागदी लिंबू पोहोचवतो. वाहतुकीत नुकसान झाल्यास किंवा गुणवत्ता समाधानकारक नसल्यास, आम्ही २४ तासांत विनामूल्य बदलून देतो किंवा परतावा देतो.'}
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-charcoal-900 mb-2">
                {lang === 'en' ? '2. Refund Processing' : '२. परतावा प्रक्रिया'}
              </h2>
              <p>
                {lang === 'en'
                  ? 'Approved refunds are initiated immediately and credited to the original payment method within 3 to 5 business days via standard Indian banking networks.'
                  : 'मंजूर झालेला परतावा त्वरित सुरू केला जातो आणि ३ ते ५ कामकाजाच्या दिवसांत मूळ पेमेंट खात्यात जमा केला जातो.'}
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-charcoal-900 mb-2">
                {lang === 'en' ? '3. Reporting an Issue' : '३. समस्येची तक्रार कशी करावी'}
              </h2>
              <p>
                {lang === 'en'
                  ? 'Simply capture a photo of the shipment and submit a ticket via our Help page or write to support@popto.in within 24 hours of delivery.'
                  : 'डिलिव्हरीनंतर २४ तासांच्या आत मालाचा फोटो काढून आमच्या मदत पृष्ठावर किंवा support@popto.in वर पाठवा.'}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
