import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import * as api from '../services/api';

type CheckoutState = { couponCode?: string };

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as CheckoutState;
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<api.CartView>({ items: [], subtotal: 0 });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [cartRaw, profile] = await Promise.all([api.getCart(), api.getUserProfile()]);
        const mapped = api.mapCartResponse(cartRaw);
        setCart(mapped);
        setFormData((prev) => ({
          ...prev,
          firstName: String(profile?.name || '').split(' ')[0] || '',
          lastName: String(profile?.name || '').split(' ').slice(1).join(' '),
          email: profile?.email || '',
        }));
      } catch (error: any) {
        toast.error(error.message || 'Unable to load checkout details');
        navigate('/cart');
      }
    };
    void load();
  }, [navigate]);

  const shipping = useMemo(() => (cart.subtotal > 100 ? 0 : 10), [cart.subtotal]);
  const total = useMemo(() => cart.subtotal + shipping, [cart.subtotal, shipping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart.items.length) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    setLoading(true);
    try {
      const shippingAddress = [
        `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        formData.address.trim(),
        `${formData.city.trim()} ${formData.postalCode.trim()}`.trim(),
        formData.phone.trim(),
        formData.email.trim(),
      ]
        .filter(Boolean)
        .join(', ');

      await api.checkout({
        shippingAddress,
        couponCode: state.couponCode,
      });

      toast.success('Order placed successfully');
      navigate('/orders');
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">First Name*</label>
                  <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded text-black dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Last Name*</label>
                  <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded text-black dark:text-white" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Street Address*</label>
                <input type="text" name="address" required value={formData.address} onChange={handleChange} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded text-black dark:text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Town/City*</label>
                <input type="text" name="city" required value={formData.city} onChange={handleChange} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded text-black dark:text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Postal Code*</label>
                <input type="text" name="postalCode" required value={formData.postalCode} onChange={handleChange} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded text-black dark:text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Phone Number*</label>
                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded text-black dark:text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Email Address*</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded text-black dark:text-white" />
              </div>
            </form>
          </div>

          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-4">
              <h3 className="text-xl font-bold text-black dark:text-white mb-4">Order Summary</h3>
              <div className="space-y-3 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{item.productName} x {item.quantity}</span>
                    <span>${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="text-black dark:text-white">${cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                  <span className="text-black dark:text-white">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-black dark:text-white font-semibold">Total:</span>
                  <span className="text-black dark:text-white font-semibold">${total.toFixed(2)}</span>
                </div>
              </div>
              <button onClick={handleSubmit} disabled={loading} className="w-full bg-red-500 text-white py-3 rounded hover:bg-red-600 disabled:opacity-50 font-semibold">
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
