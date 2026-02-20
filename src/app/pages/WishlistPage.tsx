import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import * as api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getUserWishlist();
        setItems(Array.isArray(data) ? data : []);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const removeItem = async (productId: number) => {
    try {
      await api.removeFromWishlist(productId);
      setItems((prev) => prev.filter((entry) => entry.product_id !== productId));
      toast.success('Removed from wishlist');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove');
    }
  };

  const addToCart = async (product: any) => {
    const variant = product?.Product?.ProductVariants?.find((entry: any) => Number(entry.stock) > 0);
    if (!variant) {
      toast.error('No purchasable variant for this product');
      return;
    }
    try {
      if (user) {
        await api.addToCart({ productVariantId: variant.id, quantity: 1 });
        toast.success('Added to cart');
        navigate('/cart');
        return;
      }

      const raw = localStorage.getItem('cart');
      const parsed = raw ? (JSON.parse(raw) as { items?: any[] }) : { items: [] };
      const items = Array.isArray(parsed.items) ? parsed.items : [];
      const existing = items.find((item) => Number(item.id) === Number(variant.id));
      if (existing) {
        existing.quantity = Number(existing.quantity || 1) + 1;
      } else {
        const unitPrice = Number(product?.Product?.base_price ?? 0) + Number(variant.price_adjustment || 0);
        const color = variant?.ProductColor?.name || variant?.ProductColor?.color_name;
        const size = variant?.ProductSize?.size;
        const variantLabel = [color, size].filter(Boolean).join(' / ');
        items.push({
          id: variant.id,
          productName: product?.Product?.name || 'Product',
          unitPrice,
          quantity: 1,
          image: product?.Product?.ProductImages?.[0]?.image_url || null,
          variantLabel,
          note: null,
        });
      }
      localStorage.setItem('cart', JSON.stringify({ items }));
      toast.success('Added to cart');
      navigate('/cart');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-black dark:text-white mb-6">My Wishlist</h1>
      {!items.length ? (
        <p className="text-gray-600 dark:text-gray-400">No items yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((entry) => {
            const product = entry.Product;
            const image = product?.ProductImages?.[0]?.image_url || `https://source.unsplash.com/400x400/?product,${encodeURIComponent(product?.name || 'item')}`;
            return (
              <div key={entry.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                <img src={image} alt={product?.name} className="w-full h-52 object-cover rounded-lg mb-3" />
                <Link to={`/products/${product?.id}`} className="font-semibold text-black dark:text-white hover:text-red-500">
                  {product?.name}
                </Link>
                <div className="mt-4 flex items-center gap-2">
                  <button onClick={() => addToCart(entry)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                    Add To Cart
                  </button>
                  <button onClick={() => removeItem(product.id)} className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-black dark:text-white">
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
