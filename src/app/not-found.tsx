'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function NotFound() {
  const { lang } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-amber-100">
          <div className="text-7xl mb-4 select-none">🍋</div>
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
            404 — {lang === 'mr' ? 'पृष्ठ सापडले नाही' : 'Page Not Found'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-3">
            {lang === 'mr'
              ? 'हे लिंबू बागेत उपलब्ध नाही!'
              : 'This Page Is Not In Our Orchard!'}
          </h1>
          <p className="text-stone-600 text-sm mb-8 leading-relaxed">
            {lang === 'mr'
              ? 'तुम्ही शोधत असलेले पृष्ठ हलवले गेले आहे किंवा अस्तित्वात नाही. ताज्या लिंबू खरेदीसाठी खालील पर्यायांवर क्लिक करा.'
              : 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-stone-900 text-white font-medium rounded-xl hover:bg-stone-800 transition text-sm shadow-md"
            >
              {lang === 'mr' ? 'मुख्यपृष्ठ' : 'Back to Home'}
            </Link>
            <Link
              href="/shop"
              className="px-6 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition text-sm shadow-md"
            >
              {lang === 'mr' ? 'ताजे लिंबू खरेदी करा' : 'Shop Fresh Lemons'}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}