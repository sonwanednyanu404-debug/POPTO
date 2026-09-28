'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { useAuthStore, useToastStore } from '@/lib/store';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const { t, lang } = useTranslation();
  const { setUser, setToken } = useAuthStore();
  const { addToast } = useToastStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDemoLogins, setShowDemoLogins] = useState(false);

  // Quick preset accounts for pair programming / tester convenience
  const quickLogins = [
    { label: 'Customer', email: 'rahul.sharma@example.com', pass: 'Customer@123', role: 'customer' },
    { label: 'Farmer / Seller', email: 'rajesh.patil@example.com', pass: 'Farmer@123', role: 'seller' },
    { label: 'POPTO Editor', email: 'editor@popto.local', pass: 'ChangeThisEditorPassword', role: 'editor' },
    { label: 'Super Admin', email: 'admin@popto.local', pass: 'ChangeThisAdminPassword', role: 'superadmin' },
  ];

  const handleQuickLogin = (cred: typeof quickLogins[0]) => {
    setEmail(cred.email);
    setPassword(cred.pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast({ message: 'Please enter email and password', type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('popto_token', data.token);
        setToken(data.token);
        setUser(data.user);

        addToast({
          message: lang === 'en' ? `Welcome back, ${data.user.full_name}!` : `पुन्हा स्वागत आहे, ${data.user.full_name}!`,
          type: 'success',
        });

        // Role-based routing
        if (redirectUrl) {
          router.push(redirectUrl);
        } else if (data.user.role === 'superadmin' || data.user.role === 'admin') {
          router.push('/admin');
        } else if (data.user.role === 'editor') {
          router.push('/editor');
        } else if (data.user.role === 'seller') {
          router.push('/seller');
        } else {
          router.push('/account');
        }
      } else {
        addToast({ message: data.error || 'Login failed', type: 'error' });
      }
    } catch {
      addToast({ message: 'Network error during login', type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-sand-50/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-lemon-400 to-leaf-600 rounded-2xl flex items-center justify-center text-2xl shadow-md">
            🍋
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
          {lang === 'en' ? 'Sign in to POPTO' : 'POPTO मध्ये साइन इन करा'}
        </h2>
        <p className="mt-2 text-sm text-charcoal-600">
          {lang === 'en' ? 'Maharashtra’s Lemon-Only Digital Marketplace' : 'महाराष्ट्राचे विशेष लिंबू डिजिटल मार्केटप्लेस'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-sm border border-charcoal-100">
          {/* Quick Test Logins Toggle (For Testing / Pair Programming) */}
          <div className="mb-6 bg-sand-50 p-3 rounded-2xl border border-charcoal-100">
            <button
              type="button"
              onClick={() => setShowDemoLogins(!showDemoLogins)}
              className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 hover:text-charcoal-800 flex items-center justify-between w-full"
            >
              <span>⚡ {lang === 'en' ? 'Testing & Demo Mode' : 'चाचणी पद्धत'}</span>
              <span className="text-[10px] text-leaf-700 font-semibold underline">
                {showDemoLogins ? (lang === 'en' ? 'Hide Accounts' : 'लपवा') : (lang === 'en' ? 'Show Test Accounts' : 'खाती दाखवा')}
              </span>
            </button>
            {showDemoLogins && (
              <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2.5 border-t border-charcoal-200/60">
                {quickLogins.map((cred) => (
                  <button
                    type="button"
                    key={cred.label}
                    onClick={() => handleQuickLogin(cred)}
                    className="text-left px-2.5 py-1.5 rounded-lg bg-white border border-charcoal-200 hover:border-leaf-600 hover:bg-leaf-50/30 text-xs font-medium text-charcoal-800 transition-colors flex items-center justify-between"
                  >
                    <span className="truncate">{cred.label}</span>
                    <span className="text-[10px] text-leaf-700 font-bold">Fill</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                {lang === 'en' ? 'Email Address' : 'ईमेल पत्ता'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-charcoal-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 text-charcoal-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                {lang === 'en' ? 'Password' : 'पासवर्ड'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-charcoal-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 text-charcoal-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-charcoal-400 hover:text-charcoal-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-2 text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-leaf-700/20"
            >
              {loading
                ? (lang === 'en' ? 'Signing in...' : 'साइन इन होत आहे...')
                : (lang === 'en' ? 'Sign In' : 'साइन इन करा')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 border-t border-charcoal-100 pt-6 text-center text-xs text-charcoal-600">
            <span>{lang === 'en' ? "Don't have an account? " : 'खाते नाही? '}</span>
            <Link href="/signup" className="text-leaf-700 hover:text-leaf-800 font-bold underline">
              {lang === 'en' ? 'Create Customer Account' : 'नवीन खाते तयार करा'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-leaf-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
