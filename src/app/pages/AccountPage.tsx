import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as api from '../services/api';

export function AccountPage() {
  const [profile, setProfile] = useState<api.UserProfileResponse | null>(null);
  const [name, setName] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<api.SavedPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingMethodId, setSavingMethodId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [data, methods] = await Promise.all([
          api.getUserProfile(),
          api.getPaymentMethods().catch(() => ({ paymentMethods: [] as api.SavedPaymentMethod[] })),
        ]);
        setProfile(data);
        setName(data?.name || '');
        setPaymentMethods(Array.isArray(methods.paymentMethods) ? methods.paymentMethods : []);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const save = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (name.trim().length < 2 || name.trim().length > 100) {
      toast.error('Name must be between 2 and 100 characters');
      return;
    }
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

  const makeDefault = async (id: number) => {
    try {
      setSavingMethodId(id);
      const result = await api.setDefaultPaymentMethod(id);
      const method = result?.paymentMethod;
      setPaymentMethods((prev) => prev.map((item) => ({
        ...item,
        is_default: method ? item.id === method.id : item.id === id,
      })));
      toast.success('Default card updated');
    } catch (error: any) {
      toast.error(error.message || 'Unable to update default card');
    } finally {
      setSavingMethodId(null);
    }
  };

  const removeMethod = async (id: number) => {
    if (!window.confirm('Remove this saved card?')) return;
    try {
      setSavingMethodId(id);
      await api.deletePaymentMethod(id);
      const refreshed = await api.getPaymentMethods().catch(() => ({ paymentMethods: [] as api.SavedPaymentMethod[] }));
      setPaymentMethods(Array.isArray(refreshed.paymentMethods) ? refreshed.paymentMethods : []);
      toast.success('Card removed');
    } catch (error: any) {
      toast.error(error.message || 'Unable to remove card');
    } finally {
      setSavingMethodId(null);
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
            aria-label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
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
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Saved Cards</p>
          {!paymentMethods.length ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No saved cards yet. Your card is saved after a successful card payment.</p>
          ) : (
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <div key={method.id} className="rounded border border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-black dark:text-white text-sm font-medium">
                      {(method.brand || 'CARD').toUpperCase()} ****{method.last4 || '****'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Exp {String(method.exp_month || '--').padStart(2, '0')}/{method.exp_year || '----'}
                      {method.is_default ? ' • Default' : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!method.is_default ? (
                      <button
                        onClick={() => makeDefault(method.id)}
                        disabled={savingMethodId === method.id}
                        className="px-3 py-1.5 rounded bg-gray-900 text-white text-xs disabled:opacity-60"
                      >
                        {savingMethodId === method.id ? 'Please wait...' : 'Set Default'}
                      </button>
                    ) : null}
                    <button
                      onClick={() => removeMethod(method.id)}
                      disabled={savingMethodId === method.id}
                      className="px-3 py-1.5 rounded bg-red-500 text-white text-xs disabled:opacity-60"
                    >
                      {savingMethodId === method.id ? 'Please wait...' : 'Remove'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
