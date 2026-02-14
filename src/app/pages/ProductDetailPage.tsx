import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';

export function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<api.Product | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const data = await api.getProduct(id);
        setProduct(data);
        const firstAvailable = data.ProductVariants?.find((variant) => Number(variant.stock) > 0);
        setSelectedVariantId(firstAvailable?.id || data.ProductVariants?.[0]?.id || null);
      } catch (error: any) {
        toast.error(error.message || 'Unable to load product');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const selectedVariant = useMemo(
    () => product?.ProductVariants?.find((variant) => variant.id === selectedVariantId),
    [product, selectedVariantId]
  );

  const currentPrice = Number(product?.current_price ?? product?.base_price ?? 0);
  const originalPrice = Number(product?.original_price || 0);
  const image = product?.ProductImages?.[0]?.image_url || `https://source.unsplash.com/600x600/?product,${encodeURIComponent(product?.name || 'item')}`;

  const addToCart = async () => {
    if (!user) {
      toast.error('Please login to add to cart');
      navigate('/login');
      return;
    }
    if (!selectedVariantId) {
      toast.error('No purchasable variant available');
      return;
    }
    try {
      await api.addToCart({ productVariantId: selectedVariantId, quantity });
      toast.success('Added to cart');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  const submitReview = async () => {
    if (!id) return;
    if (!user) {
      toast.error('Please login to post a review');
      navigate('/login');
      return;
    }
    try {
      await api.rateProduct(id, rating);
      if (comment.trim()) {
        await api.commentProduct(id, comment.trim());
      }
      toast.success('Review submitted');
      setComment('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    }
  };

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
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
            <img src={image} alt={product.name} className="w-full h-full object-cover min-h-[380px]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white mb-4">{product.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{product.description || 'No product description yet.'}</p>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-red-500">${currentPrice.toFixed(2)}</span>
              {originalPrice > currentPrice ? <span className="text-gray-500 line-through">${originalPrice.toFixed(2)}</span> : null}
            </div>

            {product.ProductVariants?.length ? (
              <div className="mb-6">
                <p className="text-sm font-semibold text-black dark:text-white mb-2">Variants</p>
                <div className="flex flex-wrap gap-2">
                  {product.ProductVariants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`px-3 py-2 rounded border text-sm ${
                        selectedVariantId === variant.id
                          ? 'bg-red-500 border-red-500 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-black dark:text-white'
                      }`}
                    >
                      {variant.ProductColor?.name || 'Color'} {variant.ProductSize?.size ? ` / ${variant.ProductSize.size}` : ''}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex items-center gap-3 mb-6">
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
          </div>
        </div>
      </div>
    </div>
  );
}
