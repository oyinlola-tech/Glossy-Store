import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import * as api from '../../services/api';
import { formatCurrency } from '../../utils/currency';

type SaleItemForm = {
  rowId: number;
  query: string;
  product_id: string;
  discount_price: string;
};

const toLocalInput = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const formatDateTime = (value?: string) => {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleString();
};

const formatDuration = (ms: number) => {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const getSaleTiming = (sale: api.FlashSale, nowMs: number) => {
  const startMs = new Date(sale.start_time).getTime();
  const endMs = new Date(sale.end_time).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return { status: 'invalid' as const, label: 'Invalid date', remainingMs: 0 };
  if (nowMs < startMs) return { status: 'upcoming' as const, label: 'Starts in', remainingMs: startMs - nowMs };
  if (nowMs <= endMs) return { status: 'live' as const, label: 'Ends in', remainingMs: endMs - nowMs };
  return { status: 'ended' as const, label: 'Ended', remainingMs: 0 };
};

export function FlashSalesPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [sales, setSales] = useState<api.FlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionSaleId, setActionSaleId] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(Date.now());
  const [saleName, setSaleName] = useState('Flash Sale');
  const [saleDescription, setSaleDescription] = useState('');
  const [saleStart, setSaleStart] = useState(() => toLocalInput(new Date(Date.now() + 15 * 60 * 1000)));
  const [saleEnd, setSaleEnd] = useState(() => toLocalInput(new Date(Date.now() + 24 * 60 * 60 * 1000)));
  const [items, setItems] = useState<SaleItemForm[]>([{ rowId: 1, query: '', product_id: '', discount_price: '' }]);

  const productById = useMemo(() => {
    const map = new Map<number, any>();
    products.forEach((p) => map.set(Number(p.id), p));
    return map;
  }, [products]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productList, saleList] = await Promise.all([api.getAdminProducts(), api.getFlashSales()]);
      setProducts(Array.isArray(productList) ? productList : []);
      setSales(Array.isArray(saleList) ? saleList : []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load flash sales data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const setDurationHours = (hours: number) => {
    const start = new Date(saleStart);
    if (Number.isNaN(start.getTime())) return;
    setSaleEnd(toLocalInput(new Date(start.getTime() + hours * 60 * 60 * 1000)));
  };

  const updateItem = (rowId: number, patch: Partial<SaleItemForm>) => {
    setItems((prev) => prev.map((row) => (row.rowId === rowId ? { ...row, ...patch } : row)));
  };

  const addItem = () => {
    if (items.length >= 8) return toast.error('Maximum 8 products per flash sale');
    setItems((prev) => [...prev, { rowId: Date.now(), query: '', product_id: '', discount_price: '' }]);
  };

  const removeItem = (rowId: number) => {
    setItems((prev) => {
      const next = prev.filter((row) => row.rowId !== rowId);
      return next.length ? next : [{ rowId: Date.now(), query: '', product_id: '', discount_price: '' }];
    });
  };

  const createSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date(saleStart);
    const end = new Date(saleEnd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      return toast.error('End time must be after start time');
    }

    const rows = items
      .map((row) => ({ product_id: Number(row.product_id), discount_price: Number(row.discount_price) }))
      .filter((row) => row.product_id > 0 && row.discount_price > 0);

    if (!rows.length) return toast.error('Add at least one product with a flash price');

    const unique = new Set<number>();
    for (const row of rows) {
      if (unique.has(row.product_id)) return toast.error('Duplicate products are not allowed in one flash sale');
      unique.add(row.product_id);
      const product = productById.get(row.product_id);
      if (!product) return toast.error(`Product ${row.product_id} not found`);
      if (Number(row.discount_price) >= Number(product.base_price || 0)) {
        return toast.error(`${product.name}: flash price must be lower than base price`);
      }
    }

    setSaving(true);
    try {
      await api.createFlashSale({
        name: saleName.trim() || 'Flash Sale',
        description: saleDescription.trim(),
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        products: rows,
      });
      toast.success('Flash sale created');
      await loadData();
      setSaleDescription('');
      setItems([{ rowId: Date.now(), query: '', product_id: '', discount_price: '' }]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create flash sale');
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (sale: api.FlashSale, action: 'start' | 'extend' | 'end' | 'delete') => {
    setActionSaleId(Number(sale.id));
    try {
      if (action === 'delete') {
        await api.deleteFlashSale(sale.id);
      } else if (action === 'start') {
        await api.updateFlashSale(sale.id, { start_time: new Date().toISOString() });
      } else if (action === 'end') {
        await api.updateFlashSale(sale.id, { end_time: new Date().toISOString() });
      } else if (action === 'extend') {
        const nextEnd = new Date(new Date(sale.end_time).getTime() + 24 * 60 * 60 * 1000);
        await api.updateFlashSale(sale.id, { end_time: nextEnd.toISOString() });
      }
      toast.success('Flash sale updated');
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Flash sale action failed');
    } finally {
      setActionSaleId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 space-y-6 max-w-7xl">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">Flash Sales</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">Create timed flash deals, search products quickly, and track countdowns live.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(420px,520px)_minmax(0,1fr)] gap-6 items-start">
          <form onSubmit={createSale} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4 xl:sticky xl:top-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={saleName} onChange={(e) => setSaleName(e.target.value)} required placeholder="Sale name" className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white" />
              <input value={saleDescription} onChange={(e) => setSaleDescription(e.target.value)} placeholder="Description (optional)" className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="datetime-local" value={saleStart} onChange={(e) => setSaleStart(e.target.value)} required className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white" />
              <input type="datetime-local" value={saleEnd} onChange={(e) => setSaleEnd(e.target.value)} required className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white" />
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setDurationHours(2)} className="px-3 py-1.5 rounded bg-gray-100 dark:bg-gray-700 text-xs">2h</button>
              <button type="button" onClick={() => setDurationHours(6)} className="px-3 py-1.5 rounded bg-gray-100 dark:bg-gray-700 text-xs">6h</button>
              <button type="button" onClick={() => setDurationHours(12)} className="px-3 py-1.5 rounded bg-gray-100 dark:bg-gray-700 text-xs">12h</button>
              <button type="button" onClick={() => setDurationHours(24)} className="px-3 py-1.5 rounded bg-gray-100 dark:bg-gray-700 text-xs">24h</button>
              <button type="button" onClick={() => setDurationHours(72)} className="px-3 py-1.5 rounded bg-gray-100 dark:bg-gray-700 text-xs">3d</button>
            </div>

            <div className="space-y-3">
              {items.map((row) => {
                const filteredProducts = row.query.trim()
                  ? products.filter((product) => String(product.name || '').toLowerCase().includes(row.query.toLowerCase())).slice(0, 100)
                  : products.slice(0, 100);
                return (
                  <div key={row.rowId} className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)_160px_100px] gap-2 items-center">
                    <input
                      value={row.query}
                      onChange={(e) => updateItem(row.rowId, { query: e.target.value })}
                      placeholder="Search product"
                      className="w-full min-w-0 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
                    />
                    <select
                      value={row.product_id}
                      onChange={(e) => {
                        const productId = e.target.value;
                        const product = productById.get(Number(productId));
                        updateItem(row.rowId, {
                          product_id: productId,
                          query: product ? String(product.name) : row.query,
                          discount_price: product ? (Number(product.base_price) * 0.9).toFixed(2) : row.discount_price,
                        });
                      }}
                      className="w-full min-w-0 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
                    >
                      <option value="">Select product</option>
                      {filteredProducts.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({formatCurrency(Number(product.base_price || 0))})
                        </option>
                      ))}
                    </select>
                    <input
                      value={row.discount_price}
                      onChange={(e) => updateItem(row.rowId, { discount_price: e.target.value })}
                      placeholder="Flash price"
                      inputMode="decimal"
                      className="w-full min-w-0 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
                    />
                    <button type="button" onClick={() => removeItem(row.rowId)} className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-gray-700">
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={addItem} className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700">
                Add Product
              </button>
              <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-60">
                {saving ? 'Creating...' : 'Create Flash Sale'}
              </button>
            </div>
          </form>

          <div className="space-y-3 min-w-0">
            {loading ? <p className="text-gray-500 dark:text-gray-400">Loading flash sales...</p> : null}
            {!loading && sales.length === 0 ? <p className="text-gray-500 dark:text-gray-400">No flash sales found.</p> : null}
            {sales.map((sale) => {
              const timing = getSaleTiming(sale, nowMs);
              const saleProducts = Array.isArray(sale.Products) ? sale.Products : [];
              const busy = actionSaleId === Number(sale.id);
              return (
                <div key={sale.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-black dark:text-white truncate">{sale.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(sale.start_time)} {'->'} {formatDateTime(sale.end_time)}</p>
                    </div>
                    <p className={`text-xs font-semibold ${timing.status === 'live' ? 'text-red-600' : timing.status === 'upcoming' ? 'text-amber-600' : 'text-gray-500 dark:text-gray-400'}`}>
                      {timing.status === 'ended' ? 'Ended' : `${timing.label}: ${formatDuration(timing.remainingMs)}`}
                    </p>
                  </div>
                  <div className="space-y-2 mb-3">
                    {saleProducts.map((product) => {
                      const base = Number(product.base_price || 0);
                      const flash = Number(product?.FlashSaleProduct?.discount_price || 0);
                      return (
                        <div key={product.id} className="rounded bg-gray-50 dark:bg-gray-700/40 px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 min-w-0">
                          <Link to={api.getFlashSaleProductPath(product)} className="text-sm text-black dark:text-white hover:text-red-500 truncate">
                            {product.name}
                          </Link>
                          <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{formatCurrency(base)} {'->'} {formatCurrency(flash)}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {timing.status === 'upcoming' ? <button type="button" onClick={() => void runAction(sale, 'start')} disabled={busy} className="px-3 py-1 rounded bg-green-600 text-white text-xs">Start now</button> : null}
                    {timing.status !== 'ended' ? <button type="button" onClick={() => void runAction(sale, 'extend')} disabled={busy} className="px-3 py-1 rounded bg-blue-600 text-white text-xs">Extend 24h</button> : null}
                    {timing.status === 'live' ? <button type="button" onClick={() => void runAction(sale, 'end')} disabled={busy} className="px-3 py-1 rounded bg-amber-600 text-white text-xs">End now</button> : null}
                    <button type="button" onClick={() => void runAction(sale, 'delete')} disabled={busy} className="px-3 py-1 rounded bg-red-600 text-white text-xs">Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
