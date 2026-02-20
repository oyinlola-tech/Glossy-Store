import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, Eye, Heart, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';
import { formatCurrency } from '../utils/currency';

const toPrice = (product: api.Product) =>
  Number(product.current_price ?? product.base_price ?? 0);

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

export function HomePage() {
  const [products, setProducts] = useState<api.Product[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<api.Product[]>([]);
  const [categories, setCategories] = useState<api.Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendingProducts, setTrendingProducts] = useState<api.Product[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [result, flashResult, categoryResult] = await Promise.all([
          api.getProducts({ limit: 12 }),
          api.getProducts({ flashSale: true, limit: 8 }),
          api.getCategories({ tree: true }),
        ]);
        setProducts(result.products || []);
        setFlashSaleProducts(
          (flashResult.products || [])
            .filter((product) => Number(product.current_price ?? product.base_price ?? 0) < Number(product.original_price || 0))
            .slice(0, 8)
        );
        setCategories(categoryResult.categories || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, []);

  useEffect(() => {
    if (!products.length) return;
    const refreshTrending = () => {
      const shuffled = [...products].sort(() => Math.random() - 0.5);
      setTrendingProducts(shuffled.slice(0, 3));
    };
    refreshTrending();
    const interval = window.setInterval(refreshTrending, 20000);
    return () => window.clearInterval(interval);
  }, [products]);

  const topProducts = useMemo(() => products.slice(0, 8), [products]);

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
          : toPrice(product);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <section className="bg-black dark:bg-gray-950 text-white py-20 mb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold">
                New Season,
                <br />
                New Style
              </h1>
              <Link to="/products" className="inline-flex items-center gap-2 text-lg font-semibold hover:underline">
                Shop Now
                <ArrowRight className="size-5" />
              </Link>
            </div>
            <div className="flex-1 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  const shuffled = [...products].sort(() => Math.random() - 0.5);
                  setTrendingProducts(shuffled.slice(0, 3));
                }}
                className="w-full max-w-md aspect-video rounded-lg border border-white/20 bg-white/5 p-4 text-left"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-white/60 mb-3">Trending Picks</p>
                <div className="grid grid-cols-3 gap-3">
                  {trendingProducts.map((product) => (
                    <div key={product.id} className="rounded bg-white/10 p-2">
                      <img
                        src={product.ProductImages?.[0]?.image_url || `https://source.unsplash.com/200x200/?fashion,${encodeURIComponent(product.name)}`}
                        alt={product.name}
                        className="h-24 w-full object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-white/50">Click to refresh picks</p>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-10 bg-red-500 rounded"></div>
              <h2 className="text-red-500 font-semibold">Categories</h2>
            </div>
            <h3 className="text-3xl font-bold text-black dark:text-white">Browse By Category</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
          {categories.slice(0, 9).map((category) => (
            <CategoryItem key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-10 bg-red-500 rounded"></div>
              <h2 className="text-red-500 font-semibold">Featured</h2>
            </div>
            <h3 className="text-3xl font-bold text-black dark:text-white">Flash Sales</h3>
          </div>
          <Link to="/products" className="text-sm text-black dark:text-white hover:underline">View All</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {flashSaleProducts.map((product) => (
            <FeaturedImageCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-10 bg-red-500 rounded"></div>
              <h2 className="text-red-500 font-semibold">Store</h2>
            </div>
            <h3 className="text-3xl font-bold text-black dark:text-white">Explore Products</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={addProductToCart} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product, onAddToCart }: { product: api.Product; onAddToCart: (product: api.Product) => void }) {
  const price = toPrice(product);
  const original = Number(product.original_price || 0);
  const sticker = discountSticker(product);
  const image = product.ProductImages?.[0]?.image_url || `https://source.unsplash.com/400x400/?product,${encodeURIComponent(product.name)}`;
  const rating = Math.round(Number(product.average_rating || 0));

  return (
    <div className="group relative">
      <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded overflow-hidden mb-4 relative">
        {sticker ? (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            {sticker}
          </span>
        ) : null}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <button className="bg-white dark:bg-gray-700 rounded-full p-2 hover:bg-red-500 hover:text-white transition-colors">
            <Heart className="size-4" />
          </button>
          <Link to={api.getProductPath(product)} className="bg-white dark:bg-gray-700 rounded-full p-2 hover:bg-red-500 hover:text-white transition-colors">
            <Eye className="size-4" />
          </Link>
        </div>
        <Link to={api.getProductPath(product)} className="block w-full h-full">
          <img src={image} alt={product.name} className="w-full h-full object-cover" />
        </Link>
        <button onClick={() => onAddToCart(product)} className="absolute bottom-0 left-0 right-0 bg-black dark:bg-gray-900 text-white py-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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

function FeaturedImageCard({ product }: { product: api.Product }) {
  const image = product.ProductImages?.[0]?.image_url || `https://source.unsplash.com/400x400/?product,${encodeURIComponent(product.name)}`;
  const currentPrice = Number(product.current_price ?? product.base_price ?? 0);
  const originalPrice = Number(product.original_price || 0);
  const sticker = discountSticker(product);

  return (
    <Link to={api.getProductPath(product)} className="group block">
      <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded overflow-hidden relative mb-3">
        {sticker ? (
          <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded">
            {sticker}
          </span>
        ) : null}
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <h4 className="font-semibold text-black dark:text-white mb-1 truncate group-hover:text-red-500">{product.name}</h4>
      {originalPrice > currentPrice ? (
        <div className="flex flex-col">
          <span className="text-sm text-gray-500 line-through">{formatCurrency(originalPrice)}</span>
          <span className="text-red-500 font-semibold">{formatCurrency(currentPrice)}</span>
        </div>
      ) : null}
    </Link>
  );
}

function CategoryItem({ category }: { category: api.Category }) {
  const [open, setOpen] = useState(false);
  const hasChildren = Boolean(category.subcategories?.length);
  return (
    <div className="border-2 border-gray-200 dark:border-gray-700 rounded">
      <div className="flex items-center justify-between p-4">
        <Link
          to={`/products?category=${category.id}`}
          className="text-sm font-semibold text-black dark:text-white hover:text-red-500"
        >
          {category.name}
        </Link>
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="text-xs text-red-500 hover:underline"
          >
            {open ? 'Hide' : 'Show'} subcategories
          </button>
        ) : null}
      </div>
      {open && hasChildren ? (
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 pb-3">
          <div className="pt-3 flex flex-wrap gap-2">
            {category.subcategories?.map((sub) => (
              <Link
                key={sub.id}
                to={`/products?category=${sub.id}`}
                className="text-xs px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-red-500 hover:text-red-500"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
