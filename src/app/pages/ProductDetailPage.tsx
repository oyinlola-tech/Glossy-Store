import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';
import { formatCurrency } from '../utils/currency';

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

export function ProductDetailPage() {
  const { slugOrId } = useParams();
  const [product, setProduct] = useState<api.Product | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [showAllComments, setShowAllComments] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const load = async () => {
      if (!slugOrId) return;
      try {
        const data = await api.getProduct(slugOrId);
        setProduct(data);
        const canonicalPath = api.getProductPath(data);
        if (canonicalPath && canonicalPath !== location.pathname) {
          navigate(canonicalPath, { replace: true });
          return;
        }
        const firstAvailable = data.ProductVariants?.find((variant) => Number(variant.stock) > 0);
        setSelectedVariantId(firstAvailable?.id || data.ProductVariants?.[0]?.id || null);
        const seedVariant = firstAvailable || data.ProductVariants?.[0];
        const seedColor = seedVariant?.ProductColor?.name || seedVariant?.ProductColor?.color_name || null;
        const seedSize = seedVariant?.ProductSize?.size || null;
        setSelectedColor(seedColor);
        setSelectedSize(seedSize);
        setSelectedImageIndex(0);
      } catch (error: any) {
        toast.error(error.message || 'Unable to load product');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [location.pathname, navigate, slugOrId]);

  const colorOptions = useMemo(() => {
    const entries = product?.ProductVariants || [];
    const set = new Set<string>();
    entries.forEach((variant) => {
      const name = variant.ProductColor?.name || variant.ProductColor?.color_name;
      if (name) set.add(name);
    });
    return Array.from(set);
  }, [product]);

  const sizeOptions = useMemo(() => {
    const entries = product?.ProductVariants || [];
    const set = new Set<string>();
    entries.forEach((variant) => {
      const size = variant.ProductSize?.size;
      if (size) set.add(size);
    });
    return Array.from(set);
  }, [product]);

  const selectedVariant = useMemo(
    () => product?.ProductVariants?.find((variant) => variant.id === selectedVariantId),
    [product, selectedVariantId]
  );

  useEffect(() => {
    if (!product?.ProductVariants?.length) return;
    if (!selectedColor && !selectedSize) return;
    const matching = product.ProductVariants.find((variant) => {
      const colorName = variant.ProductColor?.name || variant.ProductColor?.color_name || null;
      const sizeName = variant.ProductSize?.size || null;
      const colorOk = selectedColor ? colorName === selectedColor : true;
      const sizeOk = selectedSize ? sizeName === selectedSize : true;
      return colorOk && sizeOk;
    });
    if (matching && matching.id !== selectedVariantId) {
      setSelectedVariantId(matching.id);
    }
  }, [product, selectedColor, selectedSize, selectedVariantId]);

  const currentPrice = Number(product?.current_price ?? product?.base_price ?? 0);
  const originalPrice = Number(product?.original_price || 0);
  const productImages = product?.ProductImages || [];
  const fallbackImage = `https://source.unsplash.com/600x600/?product,${encodeURIComponent(product?.name || 'item')}`;
  const image = productImages[selectedImageIndex]?.image_url || productImages[0]?.image_url || fallbackImage;

  const addToCart = async () => {
    const hasProductStock = Number((product as any)?.stock || 0) > 0;
    if (!selectedVariantId && !hasProductStock) {
      toast.error('No purchasable variant available');
      return;
    }
    try {
      if (!user) {
        const unitPrice = selectedVariant
          ? Number(product?.base_price ?? 0) + Number(selectedVariant.price_adjustment || 0)
          : Number(product?.current_price ?? product?.base_price ?? 0);
        const color = selectedVariant?.ProductColor?.name || selectedVariant?.ProductColor?.color_name;
        const size = selectedVariant?.ProductSize?.size;
        const variantLabel = [color, size].filter(Boolean).join(' / ');
        addToLocalCart({
          id: selectedVariant?.id || product!.id,
          productName: product?.name || 'Product',
          unitPrice,
          quantity,
          image: product?.ProductImages?.[0]?.image_url || null,
          variantLabel,
          note: note.trim() || null,
        });
        toast.success('Added to cart');
        setNote('');
        return;
      }

      await api.addToCart(
        selectedVariantId
          ? { productVariantId: selectedVariantId, quantity, note: note.trim() || null }
          : { productId: product.id, quantity, note: note.trim() || null }
      );
      toast.success('Added to cart');
      setNote('');
      window.dispatchEvent(new Event('cart:updated'));
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  const submitReview = async () => {
    if (!slugOrId) return;
    if (!user) {
      toast.error('Please login to post a review');
      navigate('/login');
      return;
    }
    try {
      await api.rateProduct(slugOrId, rating);
      if (comment.trim()) {
        await api.commentProduct(slugOrId, comment.trim());
      }
      toast.success('Review submitted');
      setComment('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    }
  };

  const recentComments = useMemo(() => {
    const comments = Array.isArray((product as any)?.Comments) ? (product as any).Comments : [];
    const sorted = [...comments].sort((a, b) => {
      const aTime = new Date(a.created_at || a.createdAt || 0).getTime();
      const bTime = new Date(b.created_at || b.createdAt || 0).getTime();
      return bTime - aTime;
    });
    return showAllComments ? sorted : sorted.slice(0, 5);
  }, [product, showAllComments]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">Product not found</p>
          <Link to="/products" className="text-red-500 hover:underline">Back to products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#f7f2e8] via-white to-[#efe7d8] dark:from-[#171412] dark:via-[#1c1917] dark:to-[#141210] rounded-2xl p-3 shadow-[0_30px_80px_rgba(15,12,8,0.18)]">
              <div className="relative h-[420px] overflow-hidden rounded-xl border border-[#e3d7c5] dark:border-[#3b332c] bg-white/70 dark:bg-black/40">
                <div className="absolute inset-0 border border-[#bfa06a]/30 pointer-events-none" />
                <img src={image} alt={product.name} className="w-full h-full object-cover" />
              </div>
            </div>
            {productImages.length > 1 ? (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {productImages.map((photo, index) => (
                  <button
                    key={`${photo.image_url}-${index}`}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-20 w-20 shrink-0 rounded-xl border ${
                      selectedImageIndex === index
                        ? 'border-[#bfa06a] shadow-[0_10px_25px_rgba(191,160,106,0.35)]'
                        : 'border-[#e4d9c7] dark:border-[#2c2622]'
                    } bg-white/80 dark:bg-black/30`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <div className="absolute inset-0 rounded-xl ring-1 ring-[#bfa06a]/20 pointer-events-none" />
                    <img
                      src={photo.image_url || fallbackImage}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full rounded-xl object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white mb-4">{product.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{product.description || 'No product description yet.'}</p>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-red-500">{formatCurrency(currentPrice)}</span>
              {originalPrice > currentPrice ? <span className="text-gray-500 line-through">{formatCurrency(originalPrice)}</span> : null}
            </div>

            {colorOptions.length ? (
              <div className="mb-4">
                <p className="text-sm font-semibold text-black dark:text-white mb-2">Colors</p>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-2 rounded border text-sm ${
                        selectedColor === color
                          ? 'bg-red-500 border-red-500 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-black dark:text-white'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {sizeOptions.length ? (
              <div className="mb-6">
                <p className="text-sm font-semibold text-black dark:text-white mb-2">Sizes</p>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-2 rounded border text-sm ${
                        selectedSize === size
                          ? 'bg-red-500 border-red-500 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-black dark:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex items-center gap-3 mb-4">
              <input
                type="number"
                min={1}
                max={Math.max(1, Number(selectedVariant?.stock || 1))}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                className="w-24 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white"
              />
              <button onClick={addToCart} className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600">
                Add To Cart
              </button>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="Special message (optional)"
              className="w-full mb-6 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white"
            />

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-black dark:text-white mb-3">Leave a review</h2>
              <div className="flex items-center gap-2 mb-3">
                <label className="text-sm text-gray-600 dark:text-gray-400">Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
                >
                  {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Comment (optional)"
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
              />
              <button onClick={submitReview} className="mt-3 bg-black dark:bg-gray-900 text-white px-4 py-2 rounded hover:opacity-90">
                Submit Review
              </button>
            </div>

            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-black dark:text-white">Recent Comments</h2>
                {Array.isArray((product as any)?.Comments) && (product as any).Comments.length > 5 ? (
                  <button
                    type="button"
                    onClick={() => setShowAllComments((prev) => !prev)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    {showAllComments ? 'View less' : 'View more'}
                  </button>
                ) : null}
              </div>
              {recentComments.length ? (
                <div className="space-y-3">
                  {recentComments.map((entry: any) => (
                    <div key={entry.id} className="border-b border-gray-100 dark:border-gray-700 pb-3">
                      <p className="text-sm font-semibold text-black dark:text-white">
                        {entry?.User?.name || 'User'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{entry?.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
