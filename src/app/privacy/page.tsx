'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  const { t, lang } = useTranslation();

  return (
    <div className="min-h-screen bg-sand-50/50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-leaf-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-charcoal-100">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 mb-2">
            {lang === 'en' ? 'Privacy Policy' : 'गोपनीयता धोरण'}
          </h1>
          <p className="text-xs text-charcoal-400 mb-8">Effective Date: September 2026 • POPTO Digital AgriTech</p>

          <div className="space-y-6 text-xs sm:text-sm text-charcoal-700 leading-relaxed">
            <section>
              <h2 className="text-base font-bold text-charcoal-900 mb-2">1. Information We Collect</h2>
              <p>
                POPTO collects minimal personal data necessary to facilitate farmer-to-buyer lemon commerce in Maharashtra, including your full name, mobile number, delivery address in Maharashtra, email address, and order transaction history.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-charcoal-900 mb-2">2. Security & Real Authentication</h2>
              <p>
                Passwords are automatically hashed using cryptographically secure bcrypt algorithms before storage. Authentication tokens are securely encrypted JWT strings. We maintain audit logs of authentication events (IP addresses, login statuses, device types) strictly for fraud prevention and account security.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-charcoal-900 mb-2">3. Direct Delivery Sharing</h2>
              <p>
                Your delivery address is shared only with verified Maharashtra logistics partners and partner farmers solely for packaging and cold-chain route dispatch. We never sell your personal contact information to third-party marketing entities.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
