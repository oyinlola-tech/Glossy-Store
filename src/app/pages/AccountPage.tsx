import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as api from '../services/api';

export function AccountPage() {
  const [profile, setProfile] = useState<api.UserProfileResponse | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getUserProfile();
        setProfile(data);
        setName(data?.name || '');
      } catch (error: any) {
        toast.error(error.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const response = await api.updateUserProfile({ name: name.trim() });
      setProfile(response?.user || profile);
      toast.success('Profile updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-black dark:text-white mb-6">My Account</h1>
      <div className="max-w-xl bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
          <p className="text-black dark:text-white">{profile?.email}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
          />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Role</p>
          <p className="text-black dark:text-white capitalize">{profile?.role}</p>
        </div>
        <button onClick={save} disabled={saving} className="bg-red-500 text-white px-5 py-2 rounded hover:bg-red-600 disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
