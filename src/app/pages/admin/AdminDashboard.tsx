import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Package, Users, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import * as api from '../../services/api';

export function AdminDashboard() {
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
        pending_support_messages: 0,
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
        <h1 className="text-3xl font-bold text-black dark:text-white mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Open Support"
            value={summary?.pending_support_messages || 0}
            icon={<DollarSign className="size-8 text-green-500" />}
          />
          <StatCard
            title="Total Orders"
            value={summary?.orders || 0}
            icon={<ShoppingCart className="size-8 text-blue-500" />}
          />
          <StatCard
            title="Total Products"
            value={summary?.products || 0}
            icon={<Package className="size-8 text-purple-500" />}
          />
          <StatCard
            title="Total Users"
            value={summary?.users || 0}
            icon={<Users className="size-8 text-orange-500" />}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/admin/products"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <Package className="size-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">Manage Products</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Add, edit, or remove products</p>
          </Link>

          <Link
            to="/admin/orders"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <ShoppingCart className="size-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">Manage Orders</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">View and process orders</p>
          </Link>

          <Link
            to="/admin/users"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <Users className="size-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">Manage Users</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">View and manage users</p>
          </Link>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-black dark:text-white">Order ID</th>
                  <th className="text-left py-3 px-4 text-black dark:text-white">Customer</th>
                  <th className="text-left py-3 px-4 text-black dark:text-white">Amount</th>
                  <th className="text-left py-3 px-4 text-black dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 text-black dark:text-white">Date</th>
                </tr>
              </thead>
              <tbody>
                {summary?.recentOrders?.length > 0 ? (
                  summary.recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{order.id}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{order.customerName}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">${order.amount}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{order.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      No recent orders
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string; value: string | number; icon: React.ReactNode; trend?: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        {icon}
        {trend && (
          <div className="flex items-center gap-1 text-green-500 text-sm font-semibold">
            <TrendingUp className="size-4" />
            {trend}
          </div>
        )}
      </div>
      <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold text-black dark:text-white">{value}</p>
    </div>
  );
}
