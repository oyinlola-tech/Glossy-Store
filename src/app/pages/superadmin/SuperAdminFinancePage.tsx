import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import * as api from '../../services/api';
import { formatCurrency } from '../../utils/currency';

const RANGE_OPTIONS = [
  { label: 'Last 7 days', days: 7, period: 'daily' as const },
  { label: 'Last 30 days', days: 30, period: 'daily' as const },
  { label: 'Last 90 days', days: 90, period: 'weekly' as const },
  { label: 'Last 12 months', days: 365, period: 'monthly' as const },
];

const getRangeDates = (days: number) => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days + 1);
  return { start, end };
};

export function SuperAdminFinancePage() {
  const [summary, setSummary] = useState<api.FinanceSummary | null>(null);
  const [trends, setTrends] = useState<api.FinanceTrendPoint[]>([]);
  const [transactions, setTransactions] = useState<api.FinanceTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [rangeIndex, setRangeIndex] = useState(1);
  const [type, setType] = useState<'all' | 'sales' | 'refunds'>('all');

  const activeRange = RANGE_OPTIONS[rangeIndex] || RANGE_OPTIONS[1];

  const load = async () => {
    setLoading(true);
    try {
      const { start, end } = getRangeDates(activeRange.days);
      const startIso = start.toISOString();
      const endIso = end.toISOString();
      const [summaryData, trendsData, transactionsData] = await Promise.all([
        api.getFinanceSummary({ start: startIso, end: endIso }),
        api.getFinanceTrends({ period: activeRange.period, start: startIso, end: endIso }),
        api.getFinanceTransactions({ type, start: startIso, end: endIso, limit: 50, offset: 0 }),
      ]);
      setSummary(summaryData);
      setTrends(trendsData.trends || []);
      setTransactions(transactionsData.transactions || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load financial reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [rangeIndex, type]);

  const totals = useMemo(() => ({
    gross: summary?.gross_sales || 0,
    refunds: summary?.refund_total || 0,
    net: summary?.net_revenue || 0,
    orders: summary?.orders || 0,
    avg: summary?.avg_order_value || 0,
  }), [summary]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">Financial Reports</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Revenue, refunds, and growth trends.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={String(rangeIndex)}
              onChange={(e) => setRangeIndex(Number(e.target.value))}
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white text-sm"
            >
              {RANGE_OPTIONS.map((option, index) => (
                <option key={option.label} value={index}>{option.label}</option>
              ))}
            </select>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'all' | 'sales' | 'refunds')}
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white text-sm"
            >
              <option value="all">All transactions</option>
              <option value="sales">Sales</option>
              <option value="refunds">Refunds</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">Gross Sales</p>
            <p className="text-2xl font-bold text-black dark:text-white">{formatCurrency(totals.gross)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">Refunds</p>
            <p className="text-2xl font-bold text-black dark:text-white">{formatCurrency(totals.refunds)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">Net Revenue</p>
            <p className="text-2xl font-bold text-black dark:text-white">{formatCurrency(totals.net)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">Orders</p>
            <p className="text-2xl font-bold text-black dark:text-white">{totals.orders}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Order</p>
            <p className="text-2xl font-bold text-black dark:text-white">{formatCurrency(totals.avg)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-black dark:text-white mb-3">Net Revenue Trend</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(Number(value))} />
                  <Area type="monotone" dataKey="net_revenue" stroke="#b42318" fill="#fbd4d1" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-black dark:text-white mb-3">Sales vs Refunds</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="gross_sales" fill="#16a34a" name="Sales" />
                  <Bar dataKey="refund_total" fill="#dc2626" name="Refunds" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-black dark:text-white">Transactions</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Showing latest 50 entries</p>
          </div>
          {transactions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No transactions found.</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 border border-gray-100 dark:border-gray-700 rounded-md px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-black dark:text-white">{item.order_number}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.User?.name || 'Customer'} · {item.User?.email || '—'}
                    </p>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {formatCurrency(Number(item.total || 0))}
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 capitalize">
                    {item.status}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {item.created_at ? new Date(item.created_at).toLocaleString() : '—'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
