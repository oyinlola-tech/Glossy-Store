import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';

const supportChannels = [
  {
    title: 'General Support',
    detail: 'Questions about products, stock availability, or your account.',
    time: 'Typical response: within 24 hours',
  },
  {
    title: 'Order Assistance',
    detail: 'Help with order status, delivery updates, and fulfillment issues.',
    time: 'Typical response: same business day',
  },
  {
    title: 'Payments & Billing',
    detail: 'Payment verification, billing errors, and refund clarification.',
    time: 'Typical response: within 1 business day',
  },
];

export function ContactPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    message: '',
  });
  const isGuest = !user;
  const isValidEmail = /\S+@\S+\.\S+/.test(form.email.trim());
  const isValidName = form.name.trim().length >= 2;
  const messageLength = form.message.trim().length;
  const isValidMessage = messageLength >= 5 && messageLength <= 5000;
  const isFormValid = isGuest ? isValidName && isValidEmail && isValidMessage : isValidMessage;

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: user.name || prev.name,
      email: user.email || prev.email,
    }));
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error(isGuest ? 'Enter a valid name, email, and message' : 'Message must be between 5 and 5000 characters');
      return;
    }
    setLoading(true);
    try {
      await api.submitContact({
        name: form.name.trim() || undefined,
        email: form.email.trim() || undefined,
        message: form.message.trim(),
      });
      toast.success('Message sent successfully');
      setForm((prev) => ({ ...prev, message: '' }));
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-wide uppercase text-red-500 mb-3">Support</p>
          <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">Contact Glossy Store</h1>
          <p className="text-gray-700 dark:text-gray-300 leading-7">
            Reach out for product inquiries, order-related concerns, payment clarification, and account assistance.
            Include your order ID where possible so we can resolve requests faster.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {supportChannels.map((channel) => (
            <div key={channel.title} className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-black dark:text-white mb-2">{channel.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{channel.detail}</p>
              <p className="text-xs font-medium text-red-500">{channel.time}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <form onSubmit={submit} className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold text-black dark:text-white">Send a Message</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              For urgent payment verification issues, include transaction reference, date, and amount in your message.
            </p>
            <input
              type="text"
              required={isGuest}
              minLength={2}
              maxLength={100}
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
            />
            <input
              type="email"
              required={isGuest}
              maxLength={120}
              placeholder="Your email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
            />
            <textarea
              required
              minLength={5}
              maxLength={5000}
              rows={7}
              placeholder="Tell us how we can help"
              value={form.message}
              onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {messageLength}/5000 characters
            </p>
            <button disabled={loading || !isFormValid} className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600 disabled:opacity-60">
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>

          <aside className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-3">Before You Submit</h3>
            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li>Use the same email linked to your account when following up on an order.</li>
              <li>Share clear details like product name, size/color variant, and order number.</li>
              <li>Avoid sending card PINs, CVV, or one-time passwords in messages.</li>
              <li>Support replies are sent during business days and may take longer on weekends.</li>
            </ul>
          </aside>
        </div>
      </section>
    </div>
  );
}
