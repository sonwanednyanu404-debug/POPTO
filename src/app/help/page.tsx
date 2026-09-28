'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { useAuthStore, useToastStore } from '@/lib/store';
import { HelpCircle, ArrowLeft, Send, CheckCircle2, MessageSquare, PhoneCall, Mail } from 'lucide-react';

export default function HelpPage() {
  const { lang } = useTranslation();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [subject, setSubject] = useState('');
  const [orderId, setOrderId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      addToast({
        message: lang === 'en' ? 'Please fill in subject and message' : 'कृपया विषय आणि संदेश प्रविष्ट करा',
        type: 'warning',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user ? { Authorization: `Bearer ${localStorage.getItem('popto_token')}` } : {}),
        },
        body: JSON.stringify({
          subject,
          orderId: orderId.trim() || undefined,
          message,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        addToast({
          message: lang === 'en' ? 'Support request submitted successfully!' : 'मदत विनंती यशस्वीरीत्या पाठवली गेली!',
          type: 'success',
        });
      } else {
        addToast({
          message: lang === 'en' ? 'Failed to submit request' : 'विनंती पाठवण्यात त्रुटी आली',
          type: 'error',
        });
      }
    } catch {
      addToast({
        message: lang === 'en' ? 'Network error' : 'नेटवर्क त्रुटी',
        type: 'error',
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-sand-50/50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-leaf-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> {lang === 'en' ? 'Back to Home' : 'मुख्यपृष्ठावर परत जा'}
        </Link>

        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-charcoal-100">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="w-6 h-6 text-leaf-700" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
              {lang === 'en' ? 'Customer Support & Helpdesk' : 'ग्राहक मदत आणि तक्रार निवारण'}
            </h1>
          </div>
          <p className="text-xs text-charcoal-400 mb-8">
            {lang === 'en' ? 'Dedicated assistance for Maharashtra farmers and lemon buyers' : 'महाराष्ट्र शेतकरी आणि लिंबू ग्राहकांसाठी २४/७ मदत'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-sand-50/60 border border-charcoal-100 text-center">
              <Mail className="w-5 h-5 mx-auto text-leaf-700 mb-1.5" />
              <span className="text-xs font-bold text-charcoal-900 block">Email Support</span>
              <span className="text-[11px] text-charcoal-500">support@popto.in</span>
            </div>
            <div className="p-4 rounded-2xl bg-sand-50/60 border border-charcoal-100 text-center">
              <PhoneCall className="w-5 h-5 mx-auto text-leaf-700 mb-1.5" />
              <span className="text-xs font-bold text-charcoal-900 block">Helpline</span>
              <span className="text-[11px] text-charcoal-500">+91 98220 12345</span>
            </div>
            <div className="p-4 rounded-2xl bg-sand-50/60 border border-charcoal-100 text-center">
              <MessageSquare className="w-5 h-5 mx-auto text-leaf-700 mb-1.5" />
              <span className="text-xs font-bold text-charcoal-900 block">Hours</span>
              <span className="text-[11px] text-charcoal-500">Mon - Sat: 8 AM - 8 PM</span>
            </div>
          </div>

          {submitted ? (
            <div className="p-8 rounded-2xl bg-leaf-50 border border-leaf-200 text-center">
              <CheckCircle2 className="w-10 h-10 text-leaf-600 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-leaf-900 mb-1">
                {lang === 'en' ? 'Thank you! Your ticket is registered.' : 'धन्यवाद! तुमची तक्रार नोंदवली गेली आहे.'}
              </h2>
              <p className="text-xs text-leaf-700 max-w-md mx-auto">
                {lang === 'en'
                  ? 'Our regional Maharashtra support team will review your order and get back to you within 4 hours.'
                  : 'आमची महाराष्ट्र मदत चमू आपल्या समस्येचे पुनरावलोकन करून ४ तासांत संपर्क साधेल.'}
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setSubject('');
                  setOrderId('');
                  setMessage('');
                }}
                className="btn-primary mt-6 text-xs px-6 py-2.5"
              >
                {lang === 'en' ? 'Submit Another Query' : 'दुसरी विचारणा नोंदवा'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  {lang === 'en' ? 'Subject / Issue Type' : 'विषय / समस्येचा प्रकार'} *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={lang === 'en' ? 'e.g. Delayed Delivery, Quality Query, Order Change' : 'उदा. डिलिव्हरी उशीर, गुणवत्ता प्रश्न, ऑर्डर बदल'}
                  className="input-field text-xs py-2.5 w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  {lang === 'en' ? 'Order ID (Optional)' : 'ऑर्डर आयडी (ऐच्छिक)'}
                </label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. POPTO-2026-0004"
                  className="input-field text-xs py-2.5 w-full font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  {lang === 'en' ? 'Message / Details' : 'तपशीलवार संदेश'} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={lang === 'en' ? 'Describe your issue or question regarding your lemon shipment...' : 'आपल्या लिंबू ऑर्डरबाबत आपली समस्या किंवा प्रश्न येथे लिहा...'}
                  className="input-field text-xs py-2.5 w-full"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary text-xs px-8 py-3 flex items-center justify-center gap-2 font-bold w-full sm:w-auto"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? (lang === 'en' ? 'Submitting...' : 'पाठवत आहे...') : (lang === 'en' ? 'Send Message' : 'संदेश पाठवा')}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
