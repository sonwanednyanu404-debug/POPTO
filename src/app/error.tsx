'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log safe error telemetry without exposing secrets
    console.error('POPTO Application Error:', error.message || 'Unknown error');
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4 py-16">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl shadow-xl border border-stone-200">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          !
        </div>
        <h1 className="text-2xl font-extrabold text-stone-900 mb-2">
          Something Went Wrong / काहीतरी चूक झाली
        </h1>
        <p className="text-stone-600 text-sm mb-6 leading-relaxed">
          We encountered a temporary issue while loading this page. Please try again or return to the main storefront.
          <br />
          <span className="text-xs text-stone-500 mt-1 block">
            कृपया पुन्हा प्रयत्न करा किंवा मुख्य पानावर परत जा.
          </span>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-sm transition shadow-md"
          >
            Try Again / पुन्हा प्रयत्न करा
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-xl text-sm transition shadow-md"
          >
            Home / मुख्यपृष्ठ
          </Link>
        </div>
      </div>
    </div>
  );
}