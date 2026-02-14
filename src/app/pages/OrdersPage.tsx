import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as api from '../services/api';

export function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const cancelOrder = async (orderId: number) => {
    try {
      await api.cancelOrder(orderId);
      setOrders((prev) => prev.map((order) => (
        order.id === orderId ? { ...order, status: 'cancelled' } : order
      )));
      toast.success('Order cancelled');
    } catch (error: any) {
      toast.error(error.message || 'Unable to cancel order');
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
      <h1 className="text-3xl font-bold text-black dark:text-white mb-6">My Orders</h1>
      {!orders.length ? (
        <p className="text-gray-600 dark:text-gray-400">You have no orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-black dark:text-white">#{order.order_number}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs bg-gray-200 dark:bg-gray-700 text-black dark:text-white capitalize">
                  {order.status}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                <p>Total: ${Number(order.total || 0).toFixed(2)}</p>
                <p>Payment: {order.payment_status}</p>
              </div>
              {['pending', 'paid', 'processing'].includes(order.status) ? (
                <button onClick={() => cancelOrder(order.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                  Cancel Order
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
