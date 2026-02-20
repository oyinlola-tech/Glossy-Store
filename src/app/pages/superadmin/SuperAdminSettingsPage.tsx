import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import * as api from '../../services/api';
import { formatCurrency } from '../../utils/currency';

type HealthInfo = { status?: string; service?: string };
type ServiceInfo = { name?: string; version?: string; environment?: string; owner?: string | null; portfolio?: string | null; docs_url?: string };
type FlashSaleFormItem = { rowId: number; product_id: string; discount_price: string };

const toLocalInput = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const formatDateTime = (value?: string) => {
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed.toLocaleString() : 'N/A';
};

const formatDuration = (ms: number) => {
  if (ms <= 0) return '00:00:00';
  const total = Math.floor(ms / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (d > 0) return `${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const getSaleTiming = (sale: api.FlashSale, nowMs: number) => {
  const start = new Date(sale.start_time).getTime();
  const end = new Date(sale.end_time).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return { status: 'invalid' as const, label: 'Invalid', remainingMs: 0 };
  if (nowMs < start) return { status: 'upcoming' as const, label: 'Starts in', remainingMs: start - nowMs };
  if (nowMs <= end) return { status: 'live' as const, label: 'Ends in', remainingMs: end - nowMs };
  return { status: 'ended' as const, label: 'Ended', remainingMs: 0 };
};

export function SuperAdminSettingsPage() {
  const [health, setHealth] = useState<HealthInfo | null>(null);
  const [info, setInfo] = useState<ServiceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [salesLoading, setSalesLoading] = useState(true);
  const [salesSaving, setSalesSaving] = useState(false);
  const [actionSaleId, setActionSaleId] = useState<number | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [sales, setSales] = useState<api.FlashSale[]>([]);
  const [nowMs, setNowMs] = useState(Date.now());
  const [saleName, setSaleName] = useState('Flash Sale');
  const [saleDescription, setSaleDescription] = useState('');
  const [saleStart, setSaleStart] = useState(() => toLocalInput(new Date(Date.now() + 15 * 60 * 1000)));
  const [saleEnd, setSaleEnd] = useState(() => toLocalInput(new Date(Date.now() + 24 * 60 * 60 * 1000)));
  const [items, setItems] = useState<FlashSaleFormItem[]>([{ rowId: 1, product_id: '', discount_price: '' }]);

  const productById = useMemo(() => {
    const map = new Map<number, any>();
    products.forEach((p) => map.set(Number(p.id), p));
    return map;
  }, [products]);

  const saleStats = useMemo(() => {
    return sales.reduce((acc, sale) => {
      const t = getSaleTiming(sale, nowMs);
      if (t.status === 'live') acc.live += 1;
      if (t.status === 'upcoming') acc.upcoming += 1;
      if (t.status === 'ended') acc.ended += 1;
      return acc;
    }, { live: 0, upcoming: 0, ended: 0 });
  }, [sales, nowMs]);

  const loadSystem = async () => {
    setLoading(true);
    try {
      const [h, i] = await Promise.all([api.getHealth(), api.getInfo()]);
      setHealth(h || {});
      setInfo(i || {});
    } catch (error: any) {
      toast.error(error.message || 'Failed to load system info');
    } finally {
      setLoading(false);
    }
  };

  const loadSales = async () => {
    setSalesLoading(true);
    try {
      const [list, productList] = await Promise.all([api.getFlashSales(), api.getAdminProducts()]);
      setSales(Array.isArray(list) ? list : []);
      setProducts(Array.isArray(productList) ? productList : []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load flash sales');
    } finally {
      setSalesLoading(false);
    }
  };

  useEffect(() => { void Promise.all([loadSystem(), loadSales()]); }, []);
  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
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
      flash_sales: { total: sales.length, ...saleStats },
      configuration: { owner: info?.owner || null, portfolio: info?.portfolio || null, docs_url: info?.docs_url || '/api/docs' },
      raw: { health, info },
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
      toast.success('System report copied');
    } catch {
      toast.error('Unable to copy report');
    }
  };

  const setDurationHours = (hours: number) => {
    const start = new Date(saleStart);
    if (Number.isNaN(start.getTime())) return;
    setSaleEnd(toLocalInput(new Date(start.getTime() + hours * 60 * 60 * 1000)));
  };

  const updateItem = (rowId: number, patch: Partial<FlashSaleFormItem>) => setItems((prev) => prev.map((i) => (i.rowId === rowId ? { ...i, ...patch } : i)));

  const createSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date(saleStart);
    const end = new Date(saleEnd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return toast.error('Set a valid start and end time');
    const payloadProducts = items.map((i) => ({ product_id: Number(i.product_id), discount_price: Number(i.discount_price) }))
      .filter((i) => i.product_id > 0 && i.discount_price > 0);
    if (!payloadProducts.length) return toast.error('Add at least one product');
    const seen = new Set<number>();
    for (const row of payloadProducts) {
      if (seen.has(row.product_id)) return toast.error('Duplicate product in sale list');
      seen.add(row.product_id);
      const p = productById.get(row.product_id);
      if (!p || Number(row.discount_price) >= Number(p.base_price)) return toast.error(`${p?.name || row.product_id}: flash price must be below base price`);
    }
    setSalesSaving(true);
    try {
      await api.createFlashSale({ name: saleName.trim() || 'Flash Sale', description: saleDescription.trim(), start_time: start.toISOString(), end_time: end.toISOString(), products: payloadProducts });
      toast.success('Flash sale created');
      await loadSales();
      setItems([{ rowId: Date.now(), product_id: '', discount_price: '' }]);
      setSaleDescription('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create flash sale');
    } finally {
      setSalesSaving(false);
    }
  };

  const runAction = async (sale: api.FlashSale, action: 'start' | 'extend' | 'end' | 'delete') => {
    setActionSaleId(Number(sale.id));
    try {
      if (action === 'delete') await api.deleteFlashSale(sale.id);
      if (action === 'start') await api.updateFlashSale(sale.id, { start_time: new Date().toISOString() });
      if (action === 'end') await api.updateFlashSale(sale.id, { end_time: new Date().toISOString() });
      if (action === 'extend') await api.updateFlashSale(sale.id, { end_time: new Date(new Date(sale.end_time).getTime() + 24 * 60 * 60 * 1000).toISOString() });
      toast.success('Flash sale updated');
      await loadSales();
    } catch (error: any) {
      toast.error(error.message || 'Flash sale action failed');
    } finally {
      setActionSaleId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">System Control Center</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">Platform status, admin shortcuts, and flash sale controls.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => void Promise.all([loadSystem(), loadSales()])} className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600">{loading || salesLoading ? 'Refreshing...' : 'Refresh'}</button>
            <button type="button" onClick={() => void copySystemReport()} className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-black dark:text-white">Copy Report</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow"><p className="text-xs text-gray-500 dark:text-gray-400">System Health</p><p className="text-xl font-bold text-black dark:text-white">{String(health?.status || '').toLowerCase() === 'ok' ? 'Running Normally' : 'Needs Attention'}</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow"><p className="text-xs text-gray-500 dark:text-gray-400">Environment</p><p className="text-xl font-bold text-black dark:text-white capitalize">{info?.environment || 'unknown'}</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow"><p className="text-xs text-gray-500 dark:text-gray-400">Flash Sales Live</p><p className="text-xl font-bold text-black dark:text-white">{saleStats.live}</p></div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow"><p className="text-xs text-gray-500 dark:text-gray-400">Quick Links</p><div className="text-sm"><Link to="/admin/products" className="text-red-600">Products</Link> • <Link to="/admin/orders" className="text-red-600">Orders</Link></div></div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-black dark:text-white">Flash Sales Manager</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">Add products to a flash sale, set the duration, and track countdowns on each product row.</p>
          </div>

          <form onSubmit={createSale} className="space-y-3 border border-gray-200 dark:border-gray-700 rounded p-4">
            <div className="grid md:grid-cols-2 gap-3">
              <input value={saleName} onChange={(e) => setSaleName(e.target.value)} required className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white" placeholder="Sale name" />
              <input value={saleDescription} onChange={(e) => setSaleDescription(e.target.value)} className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white" placeholder="Description (optional)" />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <input type="datetime-local" value={saleStart} onChange={(e) => setSaleStart(e.target.value)} required className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white" />
              <input type="datetime-local" value={saleEnd} onChange={(e) => setSaleEnd(e.target.value)} required className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button type="button" onClick={() => setDurationHours(2)} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs">2h</button>
              <button type="button" onClick={() => setDurationHours(6)} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs">6h</button>
              <button type="button" onClick={() => setDurationHours(24)} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs">24h</button>
              <button type="button" onClick={() => setDurationHours(72)} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs">3d</button>
            </div>
            {items.map((item) => (
              <div key={item.rowId} className="grid md:grid-cols-[1fr_180px_auto] gap-2">
                <select value={item.product_id} onChange={(e) => updateItem(item.rowId, { product_id: e.target.value })} className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white">
                  <option value="">Select product</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({formatCurrency(Number(p.base_price || 0))})</option>)}
                </select>
                <input value={item.discount_price} onChange={(e) => updateItem(item.rowId, { discount_price: e.target.value })} inputMode="decimal" placeholder="Flash price" className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white" />
                <button type="button" onClick={() => setItems((prev) => prev.filter((x) => x.rowId !== item.rowId))} className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700">Remove</button>
              </div>
            ))}
            <div className="flex gap-2">
              <button type="button" onClick={() => setItems((prev) => [...prev, { rowId: Date.now(), product_id: '', discount_price: '' }])} className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700">Add Product</button>
              <button type="submit" disabled={salesSaving} className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-60">{salesSaving ? 'Creating...' : 'Create Flash Sale'}</button>
            </div>
          </form>

          <div className="space-y-3">
            {salesLoading ? <p className="text-sm text-gray-500 dark:text-gray-400">Loading flash sales...</p> : null}
            {!salesLoading && sales.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400">No flash sales yet.</p> : null}
            {sales.map((sale) => {
              const timing = getSaleTiming(sale, nowMs);
              const busy = actionSaleId === Number(sale.id);
              const saleProducts = Array.isArray(sale.Products) ? sale.Products : [];
              return (
                <div key={sale.id} className="border border-gray-200 dark:border-gray-700 rounded p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-black dark:text-white">{sale.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(sale.start_time)} → {formatDateTime(sale.end_time)}</p>
                    </div>
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400">{timing.status === 'ended' ? 'Sale ended' : `${timing.label}: ${formatDuration(timing.remainingMs)}`}</p>
                  </div>
                  <div className="mt-2 space-y-2">
                    {saleProducts.map((product) => {
                      const flashPrice = Number(product?.FlashSaleProduct?.discount_price || 0);
                      const base = Number(product?.base_price || 0);
                      return (
                        <div key={product.id} className="rounded bg-gray-50 dark:bg-gray-700/40 px-3 py-2 flex items-center justify-between">
                          <span className="text-sm text-black dark:text-white">{product.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(base)} → {formatCurrency(flashPrice)}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex gap-2 flex-wrap">
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
