import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Shield, Users, Settings, Database, Activity } from 'lucide-react';
import * as api from '../../services/api';

export function SuperAdminDashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const data = await api.getAdminDashboardSummary();
      setSummary(data);
    } catch (error) {
      console.error('Error loading dashboard summary:', error);
      setSummary({
        orders: 0,
        products: 0,
        users: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="size-10 text-red-500" />
          <h1 className="text-3xl font-bold text-black dark:text-white">SuperAdmin Dashboard</h1>
        </div>

        {/* System Health */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 mb-1">System Status</p>
              <h2 className="text-3xl font-bold">All Systems Operational</h2>
            </div>
            <Activity className="size-16 opacity-50" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <Users className="size-8 text-blue-500 mb-4" />
            <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Users</h3>
            <p className="text-3xl font-bold text-black dark:text-white">{summary?.users || 0}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <Shield className="size-8 text-purple-500 mb-4" />
            <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-1">Support Queue</h3>
            <p className="text-3xl font-bold text-black dark:text-white">{summary?.pending_support_messages || 0}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <Database className="size-8 text-green-500 mb-4" />
            <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Products</h3>
            <p className="text-3xl font-bold text-black dark:text-white">{summary?.products || 0}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <Activity className="size-8 text-orange-500 mb-4" />
            <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Orders</h3>
            <p className="text-3xl font-bold text-black dark:text-white">{summary?.orders || 0}</p>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/superadmin/admins"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <Shield className="size-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">Manage Admins</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Create and manage admin users</p>
          </Link>

          <Link
            to="/superadmin/users"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <Users className="size-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">All Users</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">View all system users</p>
          </Link>

          <Link
            to="/superadmin/settings"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <Settings className="size-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">System Settings</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Configure system settings</p>
          </Link>

          <Link
            to="/superadmin/finance"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <Activity className="size-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">Financial Reports</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Sales, refunds, and growth trends</p>
          </Link>

          <Link
            to="/admin/products"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <Database className="size-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">Products</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Manage all products</p>
          </Link>

          <Link
            to="/admin/categories"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <Database className="size-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">Categories</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Create categories and subcategories</p>
          </Link>

          <Link
            to="/admin/orders"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <Activity className="size-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">Orders</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">View all orders</p>
          </Link>

          <Link
            to="/admin/payments"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <Activity className="size-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">Transactions</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Payment events and receipts</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
