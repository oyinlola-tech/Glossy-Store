import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as api from '../../services/api';
import { formatCurrency } from '../../utils/currency';

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'];

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingOrderId, setActingOrderId] = useState<number | null>(null);

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
      setActingOrderId(orderId);
      await api.updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((order) => order.id === orderId ? { ...order, status } : order));
      toast.success('Order status updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setActingOrderId(null);
    }
  };

  const resolveDispute = async (orderId: number, decision: 'approve_chargeback' | 'reject_chargeback') => {
    const note = window.prompt('Optional admin note')?.trim();
    try {
      setActingOrderId(orderId);
      const updated = await api.resolveOrderDispute(orderId, decision, note || undefined);
      setOrders((prev) => prev.map((order) => order.id === orderId ? updated : order));
      toast.success('Dispute resolved');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resolve dispute');
    } finally {
      setActingOrderId(null);
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
              <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(Number(order.total || 0))}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">Payment: {order.payment_status || 'pending'}</p>
              {order.dispute_status && order.dispute_status !== 'none' ? (
                <p className="text-xs text-amber-600 dark:text-amber-400 capitalize">Dispute: {String(order.dispute_status).replace(/_/g, ' ')}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <select
                value={order.status}
                onChange={(e) => changeStatus(order.id, e.target.value)}
                disabled={actingOrderId === order.id}
                className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white disabled:opacity-60"
              >
                {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              {order.dispute_status === 'pending' ? (
                <>
                  <button
                    onClick={() => resolveDispute(order.id, 'approve_chargeback')}
                    disabled={actingOrderId === order.id}
                    className="px-3 py-2 rounded bg-green-600 text-white disabled:opacity-60"
                  >
                    Approve Chargeback
                  </button>
                  <button
                    onClick={() => resolveDispute(order.id, 'reject_chargeback')}
                    disabled={actingOrderId === order.id}
                    className="px-3 py-2 rounded bg-gray-900 text-white disabled:opacity-60"
                  >
                    Reject Dispute
                  </button>
                </>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
