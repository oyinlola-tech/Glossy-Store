import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as api from '../../services/api';

export function SuperAdminAdminsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const loadUsers = async () => {
    try {
      const data = await api.getAdminUsers();
      setUsers((Array.isArray(data) ? data : []).filter((item) => item.role === 'admin'));
    } catch (error: any) {
      toast.error(error.message || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createAdminUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      toast.success('Admin user created');
      setForm({ name: '', email: '', password: '' });
      await loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create admin');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-500 dark:text-gray-400">Loading admin users...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-black dark:text-white mb-6">Manage Admins</h1>
      <form onSubmit={create} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 grid md:grid-cols-4 gap-3 mb-6">
        <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required placeholder="Name" className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white" />
        <input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required type="email" placeholder="Email" className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white" />
        <input value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} required type="password" minLength={8} placeholder="Password" className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white" />
        <button disabled={saving} className="bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600 disabled:opacity-60">{saving ? 'Creating...' : 'Create Admin'}</button>
      </form>
      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <p className="font-semibold text-black dark:text-white">{user.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
