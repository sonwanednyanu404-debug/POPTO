'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { XCircle, ArrowLeft, Clock, ShieldCheck } from 'lucide-react';

export default function CancellationPolicyPage() {
  const { lang } = useTranslation();

  return (
    <div className="min-h-screen bg-sand-50/50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-leaf-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-charcoal-100">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-6 h-6 text-red-600" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
              {lang === 'en' ? 'Cancellation Policy' : 'ऑर्डर रद्द करण्याचे धोरण'}
            </h1>
          </div>
          <p className="text-xs text-charcoal-400 mb-8">
            {lang === 'en' ? 'Maharashtra Fresh Agricultural Produce Guidelines' : 'महाराष्ट्र ताजी कृषी उत्पादने मार्गदर्शक तत्त्वे'}
          </p>

          <div className="space-y-6 text-xs sm:text-sm text-charcoal-700 leading-relaxed">
            <section>
              <h2 className="text-base font-bold text-charcoal-900 mb-2">
                {lang === 'en' ? '1. Cancellation Window' : '१. ऑर्डर रद्द करण्याची मुदत'}
              </h2>
              <p>
                {lang === 'en'
                  ? 'Because lemons are fresh agricultural harvest, orders can be cancelled free of charge at any time while the order status is "Pending" or "Confirmed", prior to orchard harvesting and packing.'
                  : 'लिंबू हे ताजे शेती उत्पादन असल्याने, जोपर्यंत ऑर्डर स्थिती "प्रलंबित" किंवा "पुष्टी झाली" आहे, तोपर्यंत तोडणी आणि पॅकिंगपूर्वी विनामूल्य रद्द केली जाऊ शकते.'}
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-charcoal-900 mb-2">
                {lang === 'en' ? '2. Once Dispatched' : '२. बागेतून रवाना झाल्यानंतर'}
              </h2>
              <p>
                {lang === 'en'
                  ? 'Once an order has been marked "Packed" or "Shipped", cancellation is not permitted due to the perishable nature of citrus fruits and cold-chain vehicle reservation across Maharashtra routes.'
                  : 'ऑर्डर "पॅक केले" किंवा "रवाना झाले" म्हणून चिन्हांकित झाल्यानंतर, लिंबू नाशवंत असल्याने आणि वाहतूक आरक्षित असल्याने ऑर्डर रद्द करण्याची परवानगी नाही.'}
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-charcoal-900 mb-2">
                {lang === 'en' ? '3. How to Cancel' : '३. ऑर्डर कशी रद्द करावी'}
              </h2>
              <p>
                {lang === 'en'
                  ? 'You can request cancellation directly from your customer dashboard under "My Orders", or reach our Maharashtra helpdesk at support@popto.in with your unique Order ID.'
                  : 'तुम्ही तुमच्या "माझ्या ऑर्डर्स" डॅशबोर्डवरून थेट ऑर्डर रद्द करू शकता किंवा तुमच्या ऑर्डर आयडीसह support@popto.in वर संपर्क साधू शकता.'}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
