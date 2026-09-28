'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { useAuthStore, useToastStore } from '@/lib/store';
import { Mail, Phone, MapPin, Send, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const { t, lang } = useTranslation();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState('');
  const [priority, setPriority] = useState('normal');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addToast({
        message: lang === 'en' ? 'Please log in to submit a support inquiry' : 'कृपया तक्रार/विचारणेसाठी लॉगिन करा',
        type: 'warning',
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('popto_token')}`,
        },
        body: JSON.stringify({ subject, message, orderId, priority }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        addToast({ message: data.message, type: 'success' });
      } else {
        addToast({ message: data.error || 'Failed to submit', type: 'error' });
      }
    } catch {
      addToast({ message: 'Network error submitting ticket', type: 'error' });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-sand-50/50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 mb-3">
            {lang === 'en' ? 'Contact & Farmer Support' : 'संपर्क व शेतकरी मदत'}
          </h1>
          <p className="text-sm text-charcoal-600">
            {lang === 'en'
              ? 'Have questions about harvest batches, bulk business orders, or shipping? Our Maharashtra support team is here for you.'
              : 'मोठ्या प्रमाणातील ऑर्डर्स किंवा वितरणाबाबत काही प्रश्न असल्यास आमच्याशी संपर्क साधा.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Info Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-charcoal-100 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-leaf-100 text-leaf-700 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-charcoal-900 text-sm">POPTO Headquarters</h4>
                <p className="text-xs text-charcoal-600 mt-0.5">
                  Agricultural Produce Hub, Solapur-Pune Corridor, Maharashtra, India
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-leaf-100 text-leaf-700 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-charcoal-900 text-sm">Direct Email</h4>
                <p className="text-xs text-charcoal-600 mt-0.5">support@popto.local</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-leaf-100 text-leaf-700 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-charcoal-900 text-sm">Kisan Helpline</h4>
                <p className="text-xs text-charcoal-600 mt-0.5">1800-POPT-LEMON (Mon-Sat, 8am-7pm)</p>
              </div>
            </div>

            <div className="p-4 bg-sand-50 rounded-2xl border border-charcoal-100 text-xs text-charcoal-600">
              ⚡ <strong>Quick Note:</strong> All lemon orders undergo pre-dispatch weight calibration and defect elimination.
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-charcoal-100">
            {submitted ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-leaf-100 text-leaf-700 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-charcoal-900 mb-2">Inquiry Received</h3>
                <p className="text-xs text-charcoal-500 max-w-sm mx-auto mb-6">
                  Thank you! Our customer care representative will respond via email shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setSubject('');
                    setMessage('');
                  }}
                  className="btn-primary text-xs px-5 py-2.5"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-bold text-charcoal-900 text-base mb-2">Send us a Message</h3>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Bulk restaurant order inquiry, Delivery status"
                    className="w-full px-3.5 py-2.5 border border-charcoal-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-leaf-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                      Related Order ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="e.g. POPTO-2026-0001"
                      className="w-full px-3.5 py-2 border border-charcoal-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-leaf-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">Urgency Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3.5 py-2 border border-charcoal-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-leaf-500"
                    >
                      <option value="low">Low (General Query)</option>
                      <option value="normal">Normal</option>
                      <option value="high">High (Delivery related)</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details about your question or requirement..."
                    className="w-full px-3.5 py-2.5 border border-charcoal-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-leaf-500"
                  />
                </div>

                <div className="pt-2 flex justify-between items-center">
                  {!user && (
                    <span className="text-xs text-red-500">
                      Please <Link href="/login" className="underline font-bold">log in</Link> to submit tickets.
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={submitting || !user}
                    className="btn-primary text-xs px-6 py-2.5 flex items-center gap-1.5 ml-auto shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
