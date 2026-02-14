import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as api from '../../services/api';

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'];

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getAdminOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const changeStatus = async (orderId: number, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((order) => order.id === orderId ? { ...order, status } : order));
      toast.success('Order status updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  if (loading) return <div className="p-8 text-gray-500 dark:text-gray-400">Loading orders...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-black dark:text-white mb-6">Admin Orders</h1>
      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-black dark:text-white">#{order.order_number}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">${Number(order.total || 0).toFixed(2)}</p>
            </div>
            <select
              value={order.status}
              onChange={(e) => changeStatus(order.id, e.target.value)}
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
            >
              {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
