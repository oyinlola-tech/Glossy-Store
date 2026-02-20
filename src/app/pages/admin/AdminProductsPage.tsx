import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import * as api from '../../services/api';
import { formatCurrency } from '../../utils/currency';

const toDiscountPercent = (currentPrice: string, originalPrice: string) => {
  const current = Number(currentPrice);
  const original = Number(originalPrice);
  if (!Number.isFinite(current) || !Number.isFinite(original) || original <= 0 || current <= 0 || current >= original) {
    return null;
  }
  const percent = Math.round(((original - current) / original) * 100);
  return percent > 0 ? percent : null;
};

const colorNameToHex = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  const toChannel = (shift: number) => {
    const value = (hash >> shift) & 0xff;
    return value.toString(16).padStart(2, '0');
  };
  return `#${toChannel(16)}${toChannel(8)}${toChannel(0)}`;
};

export function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<api.Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [stock, setStock] = useState('');
  const [hasMultipleOptions, setHasMultipleOptions] = useState(false);
  const [colorInput, setColorInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');
  const [colorNames, setColorNames] = useState<string[]>([]);
  const [sizeNames, setSizeNames] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editBasePrice, setEditBasePrice] = useState('');
  const [editCompareAtPrice, setEditCompareAtPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editHasMultipleOptions, setEditHasMultipleOptions] = useState(false);
  const [editColorInput, setEditColorInput] = useState('');
  const [editSizeInput, setEditSizeInput] = useState('');
  const [editColorNames, setEditColorNames] = useState<string[]>([]);
  const [editSizeNames, setEditSizeNames] = useState<string[]>([]);
  const [editImages, setEditImages] = useState<File[]>([]);

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

  const createDiscountPercent = useMemo(
    () => toDiscountPercent(basePrice, compareAtPrice),
    [basePrice, compareAtPrice]
  );

  const editDiscountPercent = useMemo(
    () => toDiscountPercent(editBasePrice, editCompareAtPrice),
    [editBasePrice, editCompareAtPrice]
  );

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId || !basePrice) {
      toast.error('Name, category, and base price are required');
      return;
    }
    if (compareAtPrice !== '') {
      const parsedCompareAt = Number(compareAtPrice);
      if (!Number.isFinite(parsedCompareAt) || parsedCompareAt <= Number(basePrice)) {
        toast.error('Original price must be greater than discounted/base price');
        return;
      }
    }
    setSaving(true);
    try {
      const formData = new FormData();
      const colors = colorNames.map((name) => ({
        color_name: name,
        color_code: colorNameToHex(name),
      }));
      const sizes = sizeNames;
      if (hasMultipleOptions) {
        if (!colors.length && !sizes.length) {
          toast.error('Add at least one color or one size, or disable multiple options.');
          setSaving(false);
          return;
        }
      }

      formData.append('name', name.trim());
      formData.append('category_id', categoryId);
      if (description.trim()) formData.append('description', description.trim());
      formData.append('base_price', String(Number(basePrice)));
      if (compareAtPrice !== '') formData.append('compare_at_price', String(Number(compareAtPrice)));
      if (createDiscountPercent) formData.append('discount_label', `-${createDiscountPercent}%`);
      if (stock) formData.append('stock', String(Number(stock)));
      if (hasMultipleOptions && colors.length) formData.append('colors', JSON.stringify(colors));
      if (hasMultipleOptions && sizes.length) formData.append('sizes', JSON.stringify(sizes));
      images.forEach((file) => formData.append('images', file));

      const created = await api.createProduct(formData);
      setProducts((prev) => [created, ...prev]);
      setName('');
      setDescription('');
      setCategoryId('');
      setBasePrice('');
      setCompareAtPrice('');
      setStock('');
      setHasMultipleOptions(false);
      setColorInput('');
      setSizeInput('');
      setColorNames([]);
      setSizeNames([]);
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

  const openEditModal = async (product: any) => {
    setEditingProduct(product);
    setEditLoading(true);
    try {
      const details = await api.getAdminProduct(product.id);
      const colors = (details as any)?.ProductColors || (details as any)?.ProductColor || [];
      const sizes = (details as any)?.ProductSizes || (details as any)?.ProductSize || [];
      const colorNamesLocal = colors.map((color: any) => String(color?.color_name || '').trim()).filter(Boolean);
      const sizeNamesLocal = sizes.map((size: any) => String(size?.size || '').trim()).filter(Boolean);
      setEditName(details?.name || '');
      setEditDescription(details?.description || '');
      setEditCategoryId(String(details?.category_id || ''));
      setEditBasePrice(String(Number(details?.base_price || 0)));
      setEditCompareAtPrice(
        details?.compare_at_price !== null && details?.compare_at_price !== undefined
          ? String(Number(details.compare_at_price))
          : ''
      );
      setEditStock(String(Number(details?.stock || 0)));
      setEditHasMultipleOptions(colorNamesLocal.length > 0 || sizeNamesLocal.length > 0);
      setEditColorNames(colorNamesLocal);
      setEditSizeNames(sizeNamesLocal);
      setEditImages([]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load product details');
    } finally {
      setEditLoading(false);
    }
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setEditName('');
    setEditDescription('');
    setEditCategoryId('');
    setEditBasePrice('');
    setEditCompareAtPrice('');
    setEditStock('');
    setEditHasMultipleOptions(false);
    setEditColorInput('');
    setEditSizeInput('');
    setEditColorNames([]);
    setEditSizeNames([]);
    setEditImages([]);
  };

  const updateProductDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editName.trim() || !editCategoryId || !editBasePrice) {
      toast.error('Name, category, and base price are required');
      return;
    }

    const parsedStock = Number(editStock);
    if (editStock !== '' && (!Number.isInteger(parsedStock) || parsedStock < 0)) {
      toast.error('Stock must be a whole number greater than or equal to 0');
      return;
    }
    if (editCompareAtPrice !== '') {
      const parsedCompareAt = Number(editCompareAtPrice);
      if (!Number.isFinite(parsedCompareAt) || parsedCompareAt <= Number(editBasePrice)) {
        toast.error('Original price must be greater than discounted/base price');
        return;
      }
    }

    setEditSaving(true);
    try {
      const useMultipart = editImages.length > 0;
      const colors = editHasMultipleOptions
        ? editColorNames.map((name) => ({ color_name: name, color_code: colorNameToHex(name) }))
        : [];
      const sizes = editHasMultipleOptions ? editSizeNames : [];
      if (editHasMultipleOptions && !colors.length && !sizes.length) {
        toast.error('Add at least one color or one size, or disable multiple options.');
        setEditSaving(false);
        return;
      }

      const payloadBase = {
        name: editName.trim(),
        category_id: Number(editCategoryId),
        base_price: Number(editBasePrice),
        description: editDescription.trim(),
        stock: editStock !== '' ? parsedStock : 0,
        compare_at_price: editCompareAtPrice !== '' ? Number(editCompareAtPrice) : null,
        discount_label: editDiscountPercent ? `-${editDiscountPercent}%` : null,
        colors: editHasMultipleOptions ? colors : [],
        sizes: editHasMultipleOptions ? sizes : [],
        variants: editHasMultipleOptions ? undefined : [],
      };

      let updated: any;
      if (useMultipart) {
        const formData = new FormData();
        formData.append('name', String(payloadBase.name));
        formData.append('category_id', String(payloadBase.category_id));
        formData.append('base_price', String(payloadBase.base_price));
        formData.append('description', String(payloadBase.description));
        formData.append('stock', String(payloadBase.stock));
        if (payloadBase.compare_at_price !== null) {
          formData.append('compare_at_price', String(payloadBase.compare_at_price));
        }
        if (payloadBase.discount_label) {
          formData.append('discount_label', String(payloadBase.discount_label));
        }
        if (payloadBase.colors) formData.append('colors', JSON.stringify(payloadBase.colors));
        if (payloadBase.sizes) formData.append('sizes', JSON.stringify(payloadBase.sizes));
        if (payloadBase.variants) formData.append('variants', JSON.stringify(payloadBase.variants));
        editImages.forEach((file) => formData.append('images', file));
        updated = await api.updateProduct(editingProduct.id, formData);
      } else {
        updated = await api.updateProduct(editingProduct.id, payloadBase);
      }

      setProducts((prev) => prev.map((item) => (item.id === editingProduct.id ? { ...item, ...updated } : item)));
      toast.success('Product updated');
      closeEditModal();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update product');
    } finally {
      setEditSaving(false);
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
            value={compareAtPrice}
            onChange={(e) => setCompareAtPrice(e.target.value)}
            inputMode="decimal"
            placeholder="Original price before discount (optional)"
            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            To show a discount, set base price as discounted price and original price here.
          </p>
          {createDiscountPercent ? (
            <p className="text-xs font-semibold text-red-600 dark:text-red-400">Calculated discount: -{createDiscountPercent}%</p>
          ) : null}
          <input
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            inputMode="numeric"
            placeholder="Stock (optional)"
            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
          />
          <div className="rounded border border-gray-300 dark:border-gray-600 p-3">
            <button
              type="button"
              onClick={() => setHasMultipleOptions((prev) => !prev)}
              className={`w-full px-3 py-2 rounded text-sm font-medium ${
                hasMultipleOptions
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {hasMultipleOptions ? 'Has multiple colors/sizes: Yes' : 'Has multiple colors/sizes: No'}
            </button>
            {hasMultipleOptions ? (
              <div className="mt-3 space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Colors (optional)</label>
                  <div className="flex gap-2">
                    <input
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      placeholder="Add color name (e.g. Red)"
                      className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = colorInput.trim();
                        if (!next) return;
                        if (!colorNames.includes(next)) setColorNames((prev) => [...prev, next]);
                        setColorInput('');
                      }}
                      className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colorNames.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setColorNames((prev) => prev.filter((item) => item !== name))}
                        className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-xs text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Sizes (optional)</label>
                  <div className="flex gap-2">
                    <input
                      value={sizeInput}
                      onChange={(e) => setSizeInput(e.target.value)}
                      placeholder="Add size (e.g. M)"
                      className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = sizeInput.trim();
                        if (!next) return;
                        if (!sizeNames.includes(next)) setSizeNames((prev) => [...prev, next]);
                        setSizeInput('');
                      }}
                      className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizeNames.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setSizeNames((prev) => prev.filter((item) => item !== name))}
                        className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-xs text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <label
            htmlFor="create-product-images"
            className="w-full cursor-pointer rounded-lg border-2 border-dashed border-red-300 dark:border-red-700 bg-red-50/60 dark:bg-red-950/30 px-3 py-4 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-100/70 dark:hover:bg-red-900/40 transition-colors text-center block"
          >
            {images.length ? `${images.length} image(s) selected` : 'Choose product images'}
          </label>
          <input
            id="create-product-images"
            type="file"
            multiple
            onChange={(e) => setImages(Array.from(e.target.files || []))}
            className="sr-only"
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Inventory: {Number(product.stock || 0)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openEditModal(product)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit
              </button>
              <button onClick={() => remove(product.id)} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingProduct ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 md:p-6">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Edit Product</h2>
            {editLoading ? (
              <div className="text-gray-500 dark:text-gray-400">Loading product details...</div>
            ) : (
              <form onSubmit={updateProductDetails} className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  placeholder="Product name"
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
                />
                <select
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
                >
                  <option value="">Select subcategory</option>
                  {categoryOptions.map((category) => (
                    <option key={category.id} value={category.id}>{category.label}</option>
                  ))}
                </select>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Product description (optional)"
                  className="w-full min-h-[110px] px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
                />
              </div>
              <div className="space-y-3">
                <input
                  value={editBasePrice}
                  onChange={(e) => setEditBasePrice(e.target.value)}
                  required
                  inputMode="decimal"
                  placeholder="Base price (NGN)"
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
                />
                <input
                  value={editCompareAtPrice}
                  onChange={(e) => setEditCompareAtPrice(e.target.value)}
                  inputMode="decimal"
                  placeholder="Original price before discount (optional)"
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
                />
                {editDiscountPercent ? (
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">Calculated discount: -{editDiscountPercent}%</p>
                ) : null}
                <input
                  value={editStock}
                  onChange={(e) => setEditStock(e.target.value)}
                  inputMode="numeric"
                  placeholder="Stock"
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
                />
                <div className="rounded border border-gray-300 dark:border-gray-600 p-3">
                  <button
                    type="button"
                    onClick={() => setEditHasMultipleOptions((prev) => !prev)}
                    className={`w-full px-3 py-2 rounded text-sm font-medium ${
                      editHasMultipleOptions
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {editHasMultipleOptions ? 'Has multiple colors/sizes: Yes' : 'Has multiple colors/sizes: No'}
                  </button>
                  {editHasMultipleOptions ? (
                    <div className="mt-3 space-y-3">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Colors (optional)</label>
                        <div className="flex gap-2">
                          <input
                            value={editColorInput}
                            onChange={(e) => setEditColorInput(e.target.value)}
                            placeholder="Add color name (e.g. Red)"
                            className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = editColorInput.trim();
                              if (!next) return;
                              if (!editColorNames.includes(next)) setEditColorNames((prev) => [...prev, next]);
                              setEditColorInput('');
                            }}
                            className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {editColorNames.map((name) => (
                            <button
                              key={name}
                              type="button"
                              onClick={() => setEditColorNames((prev) => prev.filter((item) => item !== name))}
                              className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-xs text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Sizes (optional)</label>
                        <div className="flex gap-2">
                          <input
                            value={editSizeInput}
                            onChange={(e) => setEditSizeInput(e.target.value)}
                            placeholder="Add size (e.g. M)"
                            className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = editSizeInput.trim();
                              if (!next) return;
                              if (!editSizeNames.includes(next)) setEditSizeNames((prev) => [...prev, next]);
                              setEditSizeInput('');
                            }}
                            className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {editSizeNames.map((name) => (
                            <button
                              key={name}
                              type="button"
                              onClick={() => setEditSizeNames((prev) => prev.filter((item) => item !== name))}
                              className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-xs text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
                <label
                  htmlFor="edit-product-images"
                  className="w-full cursor-pointer rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-700 bg-blue-50/60 dark:bg-blue-950/30 px-3 py-4 text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100/70 dark:hover:bg-blue-900/40 transition-colors text-center block"
                >
                  {editImages.length ? `${editImages.length} image(s) selected` : 'Choose new images'}
                </label>
                <input
                  id="edit-product-images"
                  type="file"
                  multiple
                  onChange={(e) => setEditImages(Array.from(e.target.files || []))}
                  className="sr-only"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Uploading new images will replace existing product images.
                </p>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSaving}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
                  >
                    {editSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
