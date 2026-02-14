import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as api from '../../services/api';

export function SuperAdminSettingsPage() {
  const [health, setHealth] = useState<any>(null);
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [healthData, infoData] = await Promise.all([api.getHealth(), api.getInfo()]);
        setHealth(healthData);
        setInfo(infoData);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load system info');
      }
    };
    void load();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-black dark:text-white mb-6">System Settings</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow">
          <h2 className="text-xl font-semibold text-black dark:text-white mb-3">Health</h2>
          <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{JSON.stringify(health, null, 2)}</pre>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow">
          <h2 className="text-xl font-semibold text-black dark:text-white mb-3">Service Info</h2>
          <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{JSON.stringify(info, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
