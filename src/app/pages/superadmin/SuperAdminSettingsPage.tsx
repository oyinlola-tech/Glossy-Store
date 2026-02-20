import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import * as api from '../../services/api';

type HealthInfo = { status?: string; service?: string };
type ServiceInfo = {
  name?: string;
  version?: string;
  environment?: string;
  owner?: string | null;
  portfolio?: string | null;
  docs_url?: string;
};

export function SuperAdminSettingsPage() {
  const [health, setHealth] = useState<HealthInfo | null>(null);
  const [info, setInfo] = useState<ServiceInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [healthData, infoData] = await Promise.all([api.getHealth(), api.getInfo()]);
      setHealth(healthData || {});
      setInfo(infoData || {});
    } catch (error: any) {
      toast.error(error.message || 'Failed to load system info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const copySystemReport = async () => {
    const report = {
      title: 'Glossy Store - Super Admin System Report',
      generated_at: new Date().toISOString(),
      summary: {
        system_health: String(health?.status || '').toLowerCase() === 'ok' ? 'running_normally' : 'needs_attention',
        service: health?.service || info?.name || 'unknown',
        environment: info?.environment || 'unknown',
        version: info?.version || 'unknown',
      },
      configuration: {
        owner: info?.owner || null,
        portfolio: info?.portfolio || null,
        docs_url: info?.docs_url || '/api/docs',
      },
      raw: { health, info },
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
      toast.success('System report copied');
    } catch {
      toast.error('Unable to copy report');
    }
  };

  const systemHealthy = String(health?.status || '').toLowerCase() === 'ok';
  const environment = info?.environment || 'unknown';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">System Control Center</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">System status, diagnostics, and admin control links.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => void load()} disabled={loading} className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-60">
              {loading ? 'Refreshing...' : 'Refresh Status'}
            </button>
            <button type="button" onClick={() => void copySystemReport()} className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-black dark:text-white">
              Copy Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">System Health</p>
            <p className={`text-xl font-bold ${systemHealthy ? 'text-green-600' : 'text-amber-600'}`}>{systemHealthy ? 'Running Normally' : 'Needs Attention'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Service: {health?.service || info?.name || 'Unknown'}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Environment</p>
            <p className="text-xl font-bold text-black dark:text-white capitalize">{environment}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Version: {info?.version || 'Unknown'}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Platform Owner</p>
            <p className="text-xl font-bold text-black dark:text-white">{info?.owner || 'Not set'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Portfolio: {info?.portfolio || 'Not set'}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Support Hint</p>
            <p className="text-sm text-black dark:text-white">Copy report and share it with developer if issues appear.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <h2 className="text-xl font-semibold text-black dark:text-white mb-3">Common Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link to="/superadmin/flash-sales" className="rounded border border-gray-200 dark:border-gray-700 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-black dark:text-white">
              Manage Flash Sales
            </Link>
            <Link to="/superadmin/admins" className="rounded border border-gray-200 dark:border-gray-700 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-black dark:text-white">
              Manage Admin Accounts
            </Link>
            <Link to="/superadmin/users" className="rounded border border-gray-200 dark:border-gray-700 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-black dark:text-white">
              View All Customers
            </Link>
            <Link to="/superadmin/finance" className="rounded border border-gray-200 dark:border-gray-700 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-black dark:text-white">
              Check Revenue Reports
            </Link>
            <Link to="/admin/products" className="rounded border border-gray-200 dark:border-gray-700 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-black dark:text-white">
              Update Products
            </Link>
            <Link to="/admin/orders" className="rounded border border-gray-200 dark:border-gray-700 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-black dark:text-white">
              Review Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
