'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { useAuthStore, useToastStore } from '@/lib/store';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { t, lang } = useTranslation();
  const { setUser, setToken } = useAuthStore();
  const { addToast } = useToastStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      addToast({ message: 'Password must be at least 8 characters', type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, mobile, password }),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('popto_token', data.token);
        setToken(data.token);
        setUser(data.user);

        addToast({
          message: lang === 'en' ? `Welcome to POPTO, ${data.user.full_name}!` : `POPTO मध्ये आपले स्वागत आहे, ${data.user.full_name}!`,
          type: 'success',
        });
        router.push('/account');
      } else {
        addToast({ message: data.error || 'Signup failed', type: 'error' });
      }
    } catch {
      addToast({ message: 'Network error during signup', type: 'error' });
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
          {lang === 'en' ? 'Create Customer Account' : 'नवीन ग्राहक खाते तयार करा'}
        </h2>
        <p className="mt-2 text-sm text-charcoal-600">
          {lang === 'en' ? 'Buy directly from certified Maharashtra lemon groves' : 'महाराष्ट्रातील प्रमाणित बागांमधून थेट लिंबे खरेदी करा'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-sm border border-charcoal-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                {lang === 'en' ? 'Full Name' : 'पूर्ण नाव'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kulkarni"
                  className="w-full pl-10 pr-4 py-2.5 border border-charcoal-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 text-charcoal-900"
                />
              </div>
            </div>

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
                {lang === 'en' ? 'Mobile Number (10 Digits)' : 'मोबाईल नंबर (१० आकडे)'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  pattern="[6-9][0-9]{9}"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="w-full pl-10 pr-4 py-2.5 border border-charcoal-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 text-charcoal-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                {lang === 'en' ? 'Password (min. 8 characters)' : 'पासवर्ड (किमान ८ अक्षरे)'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
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
              className="btn-primary w-full py-3 mt-4 text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-leaf-700/20"
            >
              {loading
                ? (lang === 'en' ? 'Creating Account...' : 'खाते तयार होत आहे...')
                : (lang === 'en' ? 'Create Account' : 'खाते तयार करा')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 border-t border-charcoal-100 pt-6 text-center text-xs text-charcoal-600">
            <span>{lang === 'en' ? 'Already have an account? ' : 'आधीच खाते आहे? '}</span>
            <Link href="/login" className="text-leaf-700 hover:text-leaf-800 font-bold underline">
              {lang === 'en' ? 'Sign In' : 'साइन इन करा'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
