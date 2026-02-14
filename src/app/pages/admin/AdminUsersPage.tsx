import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as api from '../../services/api';

export function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getAdminUsers();
        setUsers(Array.isArray(data) ? data : []);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) return <div className="p-8 text-gray-500 dark:text-gray-400">Loading users...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-black dark:text-white mb-6">Admin Users</h1>
      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <p className="font-semibold text-black dark:text-white">{user.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            <p className="text-xs text-red-500 mt-1 capitalize">{user.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
