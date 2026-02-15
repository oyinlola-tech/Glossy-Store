import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as api from '../services/api';
import { formatCurrency } from '../utils/currency';

export function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingOrderId, setActingOrderId] = useState<number | null>(null);

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
    if (!window.confirm('Cancel this order?')) return;
    try {
      setActingOrderId(orderId);
      await api.cancelOrder(orderId);
      setOrders((prev) => prev.map((order) => (
        order.id === orderId ? { ...order, status: 'cancelled' } : order
      )));
      toast.success('Order cancelled');
    } catch (error: any) {
      toast.error(error.message || 'Unable to cancel order');
    } finally {
      setActingOrderId(null);
    }
  };

  const requestChargeback = async (orderId: number, status: string) => {
    const reason = window.prompt('Optional reason for chargeback/dispute:')?.trim();
    const requiresDispute = ['out_for_delivery', 'delivered'].includes(status);
    if (!window.confirm(requiresDispute ? 'Create a dispute for this order?' : 'Issue chargeback for this order?')) return;
    try {
      setActingOrderId(orderId);
      const result = await api.requestOrderChargeback(orderId, reason || undefined);
      setOrders((prev) => prev.map((order) => (
        order.id === orderId ? { ...order, ...result.order } : order
      )));
      toast.success(result.message || (requiresDispute ? 'Dispute created' : 'Chargeback issued'));
    } catch (error: any) {
      toast.error(error.message || 'Unable to process chargeback');
    } finally {
      setActingOrderId(null);
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
                <p>Total: {formatCurrency(Number(order.total || 0))}</p>
                <p>Payment: {order.payment_status}</p>
                {order.dispute_status && order.dispute_status !== 'none' ? (
                  <p className="capitalize">Dispute: {String(order.dispute_status).replace(/_/g, ' ')}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {['pending', 'paid', 'processing'].includes(order.status) ? (
                  <button
                    onClick={() => cancelOrder(order.id)}
                    disabled={actingOrderId === order.id}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-60"
                  >
                    {actingOrderId === order.id ? 'Please wait...' : 'Cancel Order'}
                  </button>
                ) : null}
                {order.payment_status === 'success' && order.status !== 'refunded' ? (
                  <button
                    onClick={() => requestChargeback(order.id, order.status)}
                    disabled={actingOrderId === order.id || order.dispute_status === 'pending'}
                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-60"
                  >
                    {order.dispute_status === 'pending'
                      ? 'Dispute Pending'
                      : ['out_for_delivery', 'delivered'].includes(order.status)
                        ? (actingOrderId === order.id ? 'Please wait...' : 'Open Dispute')
                        : (actingOrderId === order.id ? 'Please wait...' : 'Request Chargeback')}
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
