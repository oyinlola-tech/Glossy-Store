import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Eye, Heart, Star } from 'lucide-react';
import { toast } from 'sonner';
import * as api from '../services/api';
import { formatCurrency } from '../utils/currency';
import { useAuth } from '../contexts/AuthContext';

type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'name_asc';

const priceOf = (product: api.Product) => Number(product.current_price ?? product.base_price ?? 0);

const discountSticker = (product: api.Product) => {
  if (product.discount_label && String(product.discount_label).trim()) {
    return String(product.discount_label).trim();
  }
  const current = Number(product.current_price ?? product.base_price ?? 0);
  const original = Number(product.original_price || 0);
  if (!original || current <= 0 || current >= original) return null;
  const percent = Math.round(((original - current) / original) * 100);
  return percent > 0 ? `-${percent}%` : null;
};

const addToLocalCart = (payload: {
  id: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  image?: string | null;
  variantLabel?: string;
  note?: string | null;
}) => {
  const raw = localStorage.getItem('cart');
  const parsed = raw ? (JSON.parse(raw) as { items?: any[] }) : { items: [] };
  const items = Array.isArray(parsed.items) ? parsed.items : [];
  const existing = items.find((item) => Number(item.id) === Number(payload.id));
  if (existing) {
    existing.quantity = Number(existing.quantity || 1) + payload.quantity;
    if (payload.note) existing.note = payload.note;
  } else {
    items.push({ ...payload });
  }
  localStorage.setItem('cart', JSON.stringify({ items }));
  window.dispatchEvent(new Event('cart:updated'));
};

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<api.Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [categories, setCategories] = useState<api.Category[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    void loadProducts();
  }, [searchParams]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.getCategories({ tree: true });
        setCategories(response.categories || []);
      } catch {
        setCategories([]);
      }
    };
    void loadCategories();
  }, []);

  const categoryOptions = useMemo(() => (
    categories.flatMap((category) => {
      if (Array.isArray(category.subcategories) && category.subcategories.length > 0) {
        return category.subcategories.map((sub) => ({
          id: sub.id,
          label: `${category.name} / ${sub.name}`,
        }));
      }
      return [{ id: category.id, label: category.name }];
    })
  ), [categories]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const page = Number(searchParams.get('page') || 1);
      const minPriceParam = searchParams.get('minPrice');
      const maxPriceParam = searchParams.get('maxPrice');
      const ratingParam = searchParams.get('rating');
      const response = await api.getProducts({
        page,
        limit: 12,
        category: searchParams.get('category') || undefined,
        minPrice: minPriceParam ? Number(minPriceParam) : undefined,
        maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
        rating: ratingParam ? Number(ratingParam) : undefined,
      });
      setProducts(response.products || []);
      setCurrentPage(response.page || 1);
      setTotalPages(response.pages || 1);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const search = (searchParams.get('search') || '').toLowerCase().trim();
    const source = search
      ? products.filter((product) => product.name.toLowerCase().includes(search))
      : products;

    const sorted = [...source];
    if (sortBy === 'price_asc') sorted.sort((a, b) => priceOf(a) - priceOf(b));
    if (sortBy === 'price_desc') sorted.sort((a, b) => priceOf(b) - priceOf(a));
    if (sortBy === 'name_asc') sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [products, searchParams, sortBy]);

  const handlePageChange = (page: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(page));
    setSearchParams(next);
  };

  const handleCategoryChange = (categoryId: string) => {
    const next = new URLSearchParams(searchParams);
    if (categoryId) next.set('category', categoryId);
    else next.delete('category');
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleFilterParamChange = (key: 'minPrice' | 'maxPrice' | 'rating', value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const clearFilters = () => {
    const next = new URLSearchParams(searchParams);
    ['category', 'minPrice', 'maxPrice', 'rating', 'page'].forEach((key) => next.delete(key));
    setSearchParams(next);
  };

  const addProductToCart = async (product: api.Product) => {
    const variant = product.ProductVariants?.find((entry) => Number(entry.stock) > 0);
    const hasProductStock = Number((product as any).stock || 0) > 0;
    if (!variant && !hasProductStock) {
      toast.error('This product is currently out of stock');
      return;
    }
    try {
      if (!user) {
        const unitPrice = variant
          ? Number(product.base_price ?? 0) + Number(variant.price_adjustment || 0)
          : priceOf(product);
        const color = variant?.ProductColor?.name || variant?.ProductColor?.color_name;
        const size = variant?.ProductSize?.size;
        const variantLabel = [color, size].filter(Boolean).join(' / ');
        addToLocalCart({
          id: variant?.id || product.id,
          productName: product.name,
          unitPrice,
          quantity: 1,
          image: product.ProductImages?.[0]?.image_url || null,
          variantLabel,
          note: null,
        });
        toast.success('Added to cart');
        return;
      }

      await api.addToCart(
        variant
          ? { productVariantId: variant.id, quantity: 1 }
          : { productId: product.id, quantity: 1 }
      );
      toast.success('Added to cart');
      window.dispatchEvent(new Event('cart:updated'));
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  const addProductToWishlist = async (productId: number) => {
    if (!user) {
      toast.error('Please login to use wishlist');
      navigate('/login');
      return;
    }
    try {
      await api.addToWishlist(productId);
      toast.success('Added to wishlist');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to wishlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            {searchParams.get('search') ? `Search: "${searchParams.get('search')}"` : 'All Products'}
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 w-full md:w-auto">
            <select
              value={searchParams.get('category') || ''}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-black dark:text-white"
            >
              <option value="">All Categories</option>
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>{category.label}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-black dark:text-white"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A-Z</option>
            </select>
            <input
              type="number"
              min={0}
              value={searchParams.get('minPrice') || ''}
              onChange={(e) => handleFilterParamChange('minPrice', e.target.value)}
              placeholder="Min price"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-black dark:text-white"
            />
            <input
              type="number"
              min={0}
              value={searchParams.get('maxPrice') || ''}
              onChange={(e) => handleFilterParamChange('maxPrice', e.target.value)}
              placeholder="Max price"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-black dark:text-white"
            />
            <select
              value={searchParams.get('rating') || ''}
              onChange={(e) => handleFilterParamChange('rating', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-black dark:text-white"
            >
              <option value="">All ratings</option>
              <option value="4">4★ and up</option>
              <option value="3">3★ and up</option>
              <option value="2">2★ and up</option>
              <option value="1">1★ and up</option>
            </select>
            <button
              type="button"
              onClick={clearFilters}
              className="w-full px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 lg:col-span-5"
            >
              Clear filters
            </button>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => addProductToCart(product)}
                  onAddToWishlist={() => addProductToWishlist(product.id)}
                />
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="flex items-center justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded ${
                      page === currentPage
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500 dark:text-gray-400">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({
  product,
  onAddToCart,
  onAddToWishlist,
}: {
  product: api.Product;
  onAddToCart: () => void;
  onAddToWishlist: () => void;
}) {
  const image = product.ProductImages?.[0]?.image_url || `https://source.unsplash.com/400x400/?product,${encodeURIComponent(product.name)}`;
  const price = priceOf(product);
  const original = Number(product.original_price || 0);
  const sticker = discountSticker(product);
  const rating = Math.round(Number(product.average_rating || 0));

  return (
    <div className="group relative">
      <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded overflow-hidden mb-4 relative">
        {sticker ? (
          <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded">
            {sticker}
          </span>
        ) : null}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <button onClick={onAddToWishlist} className="bg-white dark:bg-gray-700 rounded-full p-2 hover:bg-red-500 hover:text-white transition-colors">
            <Heart className="size-4" />
          </button>
          <Link to={api.getProductPath(product)} className="bg-white dark:bg-gray-700 rounded-full p-2 hover:bg-red-500 hover:text-white transition-colors">
            <Eye className="size-4" />
          </Link>
        </div>
        <Link to={api.getProductPath(product)} className="block w-full h-full">
          <img src={image} alt={product.name} className="w-full h-full object-cover" />
        </Link>
        <button onClick={onAddToCart} className="absolute bottom-0 left-0 right-0 bg-black dark:bg-gray-900 text-white py-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          Add To Cart
        </button>
      </div>
      <Link to={api.getProductPath(product)}>
        <h4 className="font-semibold text-black dark:text-white mb-1 hover:text-red-500">{product.name}</h4>
      </Link>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-red-500 font-semibold">{formatCurrency(price)}</span>
        {original > price ? <span className="text-gray-500 line-through text-sm">{formatCurrency(original)}</span> : null}
      </div>
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`size-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
        ))}
      </div>
    </div>
  );
}
