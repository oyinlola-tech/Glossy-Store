import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import * as api from '../../services/api';
import { formatCurrency } from '../../utils/currency';

const EVENT_OPTIONS = [
  'SuccessfulDispute',
  'CreatedDispute',
  'ReminderDispute',
  'SuccessfulInvoice',
  'CreatedInvoice',
  'FailedInvoice',
  'UpdatedPaymentRequest',
  'PendingPaymentRequest',
  'SuccessfulRefund',
  'FailedRefund',
  'PendingRefund',
  'ProcessedRefund',
  'TransactionSuccessful',
  'charge.successful',
  'charge.failed',
  'transaction.success',
  'refund.processed',
];

export function AdminPaymentsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getPaymentEvents(filter || undefined);
      setEvents(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load payment events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [filter]);

  const shown = useMemo(() => events.slice(0, 200), [events]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">Payment Events</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Live Squad event logs and receipts.</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
        >
          <option value="">All events</option>
          {EVENT_OPTIONS.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-gray-500 dark:text-gray-400">Loading payment events...</div>
      ) : shown.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400">No events yet.</div>
      ) : (
        <div className="space-y-3">
          {shown.map((event) => (
            <div key={event.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-black dark:text-white">{event.event}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{event.reference || 'No reference'}</p>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {event.amount ? formatCurrency(Number(event.amount)) : '—'} {event.currency || ''}
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {event.status || 'unknown'}
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {event.customer_email || 'No customer email'} · {event.occurred_at ? new Date(event.occurred_at).toLocaleString() : '—'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
