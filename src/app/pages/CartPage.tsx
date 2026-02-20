import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';
import { formatCurrency } from '../utils/currency';

type LocalCartItem = {
  id: string | number;
  productName: string;
  unitPrice: number;
  quantity: number;
  image?: string | null;
  variantLabel?: string;
  note?: string | null;
};

export function CartPage() {
  const [cart, setCart] = useState<api.CartView>({ items: [], subtotal: 0 });
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    void loadCart();
  }, [user]);

  const loadCart = async () => {
    try {
      if (user) {
        const data = await api.getCart();
        setCart(api.mapCartResponse(data));
        return;
      }

      const localCart = localStorage.getItem('cart');
      if (!localCart) {
        setCart({ items: [], subtotal: 0 });
        return;
      }

      const parsed = JSON.parse(localCart) as { items?: LocalCartItem[] };
      const items = (parsed.items || []).map((item) => ({
        id: Number(item.id),
        quantity: Number(item.quantity || 1),
        productVariantId: Number(item.id),
        productName: item.productName,
        image: item.image || null,
        unitPrice: Number(item.unitPrice || 0),
        subtotal: Number(item.unitPrice || 0) * Number(item.quantity || 1),
        variantLabel: item.variantLabel || '',
        note: item.note || null,
      }));
      setCart({ items, subtotal: items.reduce((sum, item) => sum + item.subtotal, 0) });
    } catch (error) {
      console.error('Error loading cart:', error);
      setCart({ items: [], subtotal: 0 });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    if (!user) {
      toast.error('Login is required to edit server cart');
      navigate('/login');
      return;
    }

    try {
      await api.updateCartItem(itemId, newQuantity);
      await loadCart();
      toast.success('Cart updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update cart');
    }
  };

  const removeItem = async (itemId: number) => {
    if (!user) {
      toast.error('Login is required to edit server cart');
      navigate('/login');
      return;
    }

    try {
      await api.deleteCartItem(itemId);
      await loadCart();
      toast.success('Item removed from cart');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove item');
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Enter a coupon code');
      return;
    }
    try {
      const result = await api.validateCoupon(couponCode.trim(), cart.subtotal);
      const discount = Number(result?.coupon?.discountAmount || 0);
      setCouponDiscount(discount);
      toast.success('Coupon applied successfully');
    } catch (error: any) {
      setCouponDiscount(0);
      toast.error(error.message || 'Invalid coupon code');
    }
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout', {
      state: {
        couponCode: couponCode.trim() || undefined,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const shipping = cart.subtotal > 0 ? (cart.subtotal > 100 ? 0 : 10) : 0;
  const total = Math.max(0, cart.subtotal + shipping - couponDiscount);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white">Home</Link>
          <span className="text-gray-500 dark:text-gray-400">/</span>
          <span className="text-black dark:text-white">Cart</span>
        </div>

        {cart.items.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-4">Your cart is empty</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Add products to continue</p>
            <Link to="/products" className="inline-block bg-red-500 text-white px-8 py-3 rounded hover:bg-red-600">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="grid grid-cols-5 gap-4 p-4 border-b border-gray-200 dark:border-gray-700 font-semibold text-black dark:text-white">
                  <div className="col-span-2">Product</div>
                  <div>Price</div>
                  <div>Quantity</div>
                  <div>Subtotal</div>
                </div>

                {cart.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-5 gap-4 p-4 border-b border-gray-100 dark:border-gray-700 items-center">
                    <div className="col-span-2 flex items-center gap-4">
                      <img
                        src={item.image || `https://source.unsplash.com/100x100/?product,${encodeURIComponent(item.productName)}`}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-semibold text-black dark:text-white">{item.productName}</h3>
                        {item.variantLabel ? <p className="text-sm text-gray-500 dark:text-gray-400">{item.variantLabel}</p> : null}
                        {item.note ? <p className="text-xs text-gray-500 dark:text-gray-400">Message: {item.note}</p> : null}
                      </div>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">{formatCurrency(item.unitPrice)}</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Minus className="size-4 text-black dark:text-white" />
                      </button>
                      <span className="w-12 text-center text-black dark:text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Plus className="size-4 text-black dark:text-white" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-black dark:text-white font-semibold">{formatCurrency(item.subtotal)}</span>
                      <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-600">
                        <Trash2 className="size-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white"
                  />
                  <button onClick={applyCoupon} className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                    Apply
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-black dark:text-white mb-4">Cart Total</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-black dark:text-white">Subtotal:</span>
                    <span className="text-black dark:text-white">{formatCurrency(cart.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-black dark:text-white">Shipping:</span>
                    <span className="text-black dark:text-white">{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-black dark:text-white">Discount:</span>
                    <span className="text-black dark:text-white">-{formatCurrency(couponDiscount)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-black dark:text-white font-semibold">Total:</span>
                    <span className="text-black dark:text-white font-semibold">{formatCurrency(total)}</span>
                  </div>
                </div>
                <button onClick={handleCheckout} disabled={!cart.items.length} className="w-full mt-6 bg-red-500 text-white py-3 rounded hover:bg-red-600 font-semibold disabled:opacity-50">
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
