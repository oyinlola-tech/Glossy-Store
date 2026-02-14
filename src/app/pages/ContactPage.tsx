import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';

export function ContactPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    message: '',
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-black dark:text-white mb-6">Contact Us</h1>
      <form onSubmit={submit} className="max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4">
        <input
          type="text"
          placeholder="Your name"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
        />
        <input
          type="email"
          placeholder="Your email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
        />
        <textarea
          required
          rows={6}
          placeholder="Message"
          value={form.message}
          onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
          className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
        />
        <button disabled={loading} className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600 disabled:opacity-60">
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
