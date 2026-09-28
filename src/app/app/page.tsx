'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { Smartphone, Download, QrCode, CheckCircle2, ArrowRight, Share2, Sparkles, Copy, Check } from 'lucide-react';

export default function AppDownloadPage() {
  const { lang } = useTranslation();
  const [copied, setCopied] = useState(false);

  const appUrl = 'https://popto.vercel.app';

  const copyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-leaf-950 via-leaf-900 to-leaf-950 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-leaf-300 mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-white font-medium">Mobile App & QR Code</span>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-leaf-800/80 border border-leaf-700/60 text-lemon-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Official POPTO Mobile App' : 'अधिकृत POPTO मोबाईल ॲप'}</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-4">
            {lang === 'en' ? 'Get POPTO on Your Phone' : 'तुमच्या मोबाईलवर POPTO मिळवा'}
          </h1>
          <p className="text-leaf-200 text-base sm:text-lg leading-relaxed">
            {lang === 'en'
              ? 'Scan the QR code below with any smartphone camera or Google Lens to instantly access Maharashtra’s premier lemon marketplace.'
              : 'महाराष्ट्रातील सर्वोत्तम लिंबू मार्केटप्लेस थेट वापरण्यासाठी खालील QR कोड कोणत्याही स्मार्टफोन कॅमेऱ्याने स्कॅन करा.'}
          </p>
        </div>

        {/* Main Card with QR Code */}
        <div className="bg-white text-charcoal-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-leaf-800/20 max-w-3xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* QR Section */}
            <div className="flex flex-col items-center justify-center p-6 bg-cream-50 rounded-2xl border border-charcoal-200/60 text-center">
              <div className="relative p-4 bg-white rounded-2xl shadow-md border border-leaf-100 mb-4">
                <img
                  src="/images/popto-app-qr.png"
                  alt="POPTO Mobile QR Code"
                  className="w-56 h-56 object-contain rounded-xl"
                  id="popto-app-qr-image"
                />
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-leaf-700 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow">
                  Scan With Phone
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-charcoal-600 font-medium mt-2">
                <QrCode className="w-4 h-4 text-leaf-700" />
                <span>Camera / Google Lens / Scanner</span>
              </div>
            </div>

            {/* Quick Actions & Instructions */}
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="font-display font-bold text-xl text-charcoal-900 mb-1">
                  {lang === 'en' ? 'Instant Mobile Access' : 'झटपट मोबाईल प्रवेश'}
                </h3>
                <p className="text-xs text-charcoal-500">
                  {lang === 'en' ? 'No app store installation required. Fast, lightweight, and works offline.' : 'ॲप स्टोअरची गरज नाही. जलद, हलके आणि थेट काम करते.'}
                </p>
              </div>

              {/* URL Box with copy */}
              <div className="p-3 bg-charcoal-50 rounded-xl border border-charcoal-200 flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-leaf-800 truncate">{appUrl}</span>
                <button
                  onClick={copyLink}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-leaf-700 hover:bg-leaf-800 text-white text-xs font-medium transition-colors flex-shrink-0"
                  id="copy-app-link-btn"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-lemon-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              {/* 3 Step Guide */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-leaf-100 text-leaf-800 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                  <div>
                    <p className="text-xs font-semibold text-charcoal-800">
                      {lang === 'en' ? 'Scan the QR code' : 'QR कोड स्कॅन करा'}
                    </p>
                    <p className="text-[11px] text-charcoal-500">
                      {lang === 'en' ? 'Open your phone camera and point it at the code.' : 'तुमच्या फोनचा कॅमेरा उघडा आणि कोडकडे रोखा.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-leaf-100 text-leaf-800 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                  <div>
                    <p className="text-xs font-semibold text-charcoal-800">
                      {lang === 'en' ? 'Open Website in Browser' : 'ब्राउझरमध्ये उघडा'}
                    </p>
                    <p className="text-[11px] text-charcoal-500">
                      {lang === 'en' ? 'Tap the link banner to launch POPTO on Chrome or Safari.' : 'Chrome किंवा Safari वर POPTO सुरू करण्यासाठी लिंकवर टॅप करा.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-leaf-100 text-leaf-800 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                  <div>
                    <p className="text-xs font-semibold text-charcoal-800">
                      {lang === 'en' ? 'Add to Home Screen (Install App)' : 'होम स्क्रीनवर जोडा (ॲप इन्स्टॉल करा)'}
                    </p>
                    <p className="text-[11px] text-charcoal-500">
                      {lang === 'en' ? 'Tap browser menu (⋮) -> "Install App" or "Add to Home Screen" for a full native app icon.' : 'मेनू (⋮) वर टॅप करा -> "Add to Home Screen" निवडा.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href={appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-leaf-700 hover:bg-leaf-800 text-white text-xs font-bold transition-all shadow-md"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Open POPTO Web App' : 'वेब ॲप उघडा'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Technical & EAS Build Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="bg-leaf-900/60 border border-leaf-700/40 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-lemon-300 font-bold text-sm mb-2">
              <Download className="w-4 h-4" />
              <span>Android Standalone APK (EAS)</span>
            </div>
            <p className="text-xs text-leaf-200 leading-relaxed mb-3">
              The project includes full React Native / Expo configuration in <code className="bg-leaf-950 px-1 py-0.5 rounded text-[11px]">/mobile</code>. You can build a direct APK using EAS:
            </p>
            <div className="bg-leaf-950 p-2.5 rounded-xl border border-leaf-800 text-[11px] font-mono text-lemon-200 overflow-x-auto">
              cd mobile &amp;&amp; npx eas-cli build -p android --profile preview
            </div>
          </div>

          <div className="bg-leaf-900/60 border border-leaf-700/40 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-lemon-300 font-bold text-sm mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Production Live Endpoints</span>
            </div>
            <p className="text-xs text-leaf-200 leading-relaxed mb-3">
              Both the web application and mobile app are connected to the production cloud API:
            </p>
            <div className="bg-leaf-950 p-2.5 rounded-xl border border-leaf-800 text-[11px] font-mono text-leaf-300">
              https://popto.vercel.app/api
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
