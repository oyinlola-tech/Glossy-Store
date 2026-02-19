import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import * as api from '../../services/api';
import { formatCurrency } from '../../utils/currency';

export function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<api.Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [stock, setStock] = useState('');
  const [images, setImages] = useState<File[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [data, categoryData] = await Promise.all([
          api.getAdminProducts(),
          api.getCategories({ tree: false }),
        ]);
        setProducts(Array.isArray(data) ? data : []);
        setCategories(categoryData.categories || []);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const categoryOptions = useMemo(() => {
    const byId = new Map<number, api.Category>();
    categories.forEach((category) => {
      byId.set(category.id, category);
    });
    return categories
      .filter((category) => Boolean(category.parent_id))
      .map((category) => {
        const parent = category.parent_id ? byId.get(category.parent_id) : undefined;
        const label = parent ? `${parent.name} / ${category.name}` : category.name;
        return { id: category.id, label };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [categories]);

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId || !basePrice) {
      toast.error('Name, category, and base price are required');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('category_id', categoryId);
      if (description.trim()) formData.append('description', description.trim());
      formData.append('base_price', String(Number(basePrice)));
      if (stock) formData.append('stock', String(Number(stock)));
      images.forEach((file) => formData.append('images', file));

      const created = await api.createProduct(formData);
      setProducts((prev) => [created, ...prev]);
      setName('');
      setDescription('');
      setCategoryId('');
      setBasePrice('');
      setStock('');
      setImages([]);
      toast.success('Product created');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((item) => item.id !== id));
      toast.success('Product deleted');
    } catch (error: any) {
      toast.error(error.message || 'Delete failed');
    }
  };

  if (loading) return <div className="p-8 text-gray-500 dark:text-gray-400">Loading products...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-black dark:text-white mb-4">Admin Products</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Create products, upload images, and manage listings.</p>

      <form onSubmit={createProduct} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 grid md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Product name"
            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
          >
            <option value="">Select subcategory</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>{category.label}</option>
            ))}
          </select>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Product description (optional)"
            className="w-full min-h-[100px] px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
          />
        </div>
        <div className="space-y-3">
          <input
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            required
            inputMode="decimal"
            placeholder="Base price (NGN)"
            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
          />
          <input
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            inputMode="numeric"
            placeholder="Stock (optional)"
            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
          />
          <input
            type="file"
            multiple
            onChange={(e) => setImages(Array.from(e.target.files || []))}
            className="w-full text-sm text-gray-600 dark:text-gray-300"
          />
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Create Product'}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {products.map((product) => (
          <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow flex items-center justify-between">
            <div>
              <Link to={`/products/${product.id}`} className="font-semibold text-black dark:text-white hover:text-red-500">
                {product.name}
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(Number(product.base_price || 0))}</p>
            </div>
            <button onClick={() => remove(product.id)} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
