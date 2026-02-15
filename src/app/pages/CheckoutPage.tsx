import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import * as api from '../services/api';
import { formatCurrency } from '../utils/currency';

type CheckoutState = { couponCode?: string };
type CheckoutLocationState = CheckoutState | null;

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = ((location.state as CheckoutLocationState) || {}) as CheckoutState;
  const [loading, setLoading] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentCurrency, setPaymentCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [savedMethods, setSavedMethods] = useState<api.SavedPaymentMethod[]>([]);
  const [selectedSavedMethodId, setSelectedSavedMethodId] = useState<number | null>(null);
  const [cart, setCart] = useState<api.CartView>({ items: [], subtotal: 0 });
  const [discountPreview, setDiscountPreview] = useState<api.DiscountPreviewResponse | null>(null);
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
        const [cartRaw, profile, preview, methods] = await Promise.all([
          api.getCart(),
          api.getUserProfile(),
          api.getCheckoutDiscountPreview(),
          api.getPaymentMethods().catch(() => ({ paymentMethods: [] as api.SavedPaymentMethod[] })),
        ]);
        const mapped = api.mapCartResponse(cartRaw);
        setCart(mapped);
        setDiscountPreview(preview);
        setSavedMethods(Array.isArray(methods.paymentMethods) ? methods.paymentMethods : []);
        const defaultMethod = Array.isArray(methods.paymentMethods)
          ? methods.paymentMethods.find((method) => method.is_default)
          : null;
        if (defaultMethod) {
          setSelectedSavedMethodId(defaultMethod.id);
        }
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
  const welcomeDiscount = useMemo(() => {
    if (!discountPreview?.welcome_discount_eligible) return 0;
    if (state.couponCode) return 0;
    return Number(discountPreview.welcome_discount_amount || 0);
  }, [discountPreview, state.couponCode]);
  const total = useMemo(() => Math.max(0, cart.subtotal + shipping - welcomeDiscount), [cart.subtotal, shipping, welcomeDiscount]);

  const submitOrder = async () => {
    if (!cart.items.length) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    setLoading(true);
    try {
      if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
        throw new Error('Enter a valid email address');
      }
      const shippingAddress = [
        `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        formData.address.trim(),
        `${formData.city.trim()} ${formData.postalCode.trim()}`.trim(),
        formData.phone.trim(),
        formData.email.trim(),
      ]
        .filter(Boolean)
        .join(', ');
      if (shippingAddress.length < 10) {
        throw new Error('Shipping details are incomplete');
      }

      const checkoutResponse = await api.checkout({
        shippingAddress,
        couponCode: state.couponCode,
        currency: paymentCurrency,
        paymentMethodId: selectedSavedMethodId || undefined,
      });

      if (checkoutResponse.welcome_discount_applied) {
        toast.success(checkoutResponse.welcome_discount_message || '10% first-order discount applied');
      }
      const authorizationUrl = checkoutResponse?.payment?.data?.authorization_url;
      if (authorizationUrl) {
        window.location.href = authorizationUrl;
        return;
      }
      toast.success(`Order placed successfully (${paymentCurrency})`);
      navigate('/orders');
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentOpen(true);
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
              {discountPreview?.welcome_discount_eligible && !state.couponCode ? (
                <div className="mb-4 rounded-md border border-green-500/40 bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-800 dark:text-green-200">
                  <p className="font-semibold">10% first-order discount applied</p>
                  <p>
                    Applies to one unit of{' '}
                    <span className="font-semibold">
                      {discountPreview.applies_to?.product_name || 'a product'}
                    </span>.
                  </p>
                </div>
              ) : null}
              <div className="space-y-3 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{item.productName} x {item.quantity}</span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="text-black dark:text-white">{formatCurrency(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                  <span className="text-black dark:text-white">{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
                </div>
                {welcomeDiscount > 0 ? (
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Welcome discount:</span>
                    <span className="text-green-600 dark:text-green-300">-{formatCurrency(welcomeDiscount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between py-2">
                  <span className="text-black dark:text-white font-semibold">Total:</span>
                  <span className="text-black dark:text-white font-semibold">{formatCurrency(total)}</span>
                </div>
              </div>
              <button onClick={handleSubmit} disabled={loading} className="w-full bg-red-500 text-white py-3 rounded hover:bg-red-600 disabled:opacity-50 font-semibold">
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {paymentOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
            <h2 className="text-xl font-bold text-black dark:text-white">Pay with Squad</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Choose your payment currency</p>
              </div>
              <button onClick={() => setPaymentOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="space-y-3 mb-6">
              {savedMethods.length ? (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                  <p className="text-sm font-semibold text-black dark:text-white mb-2">Saved cards</p>
                  <label className="flex items-center justify-between px-2 py-2 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Use new card</span>
                    <input
                      type="radio"
                      name="saved-method"
                      checked={selectedSavedMethodId === null}
                      onChange={() => setSelectedSavedMethodId(null)}
                    />
                  </label>
                  {savedMethods.map((method) => (
                    <label
                      key={method.id}
                      className="flex items-center justify-between px-2 py-2 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div>
                        <p className="text-sm text-black dark:text-white">
                          {(method.brand || 'CARD').toUpperCase()} ****{method.last4 || '****'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Exp {String(method.exp_month || '--').padStart(2, '0')}/{method.exp_year || '----'}
                          {method.is_default ? ' • Default' : ''}
                        </p>
                      </div>
                      <input
                        type="radio"
                        name="saved-method"
                        checked={selectedSavedMethodId === method.id}
                        onChange={() => setSelectedSavedMethodId(method.id)}
                      />
                    </label>
                  ))}
                </div>
              ) : null}
              <label className="flex items-center justify-between border rounded-lg px-4 py-3 cursor-pointer">
                <div>
                  <p className="font-semibold text-black dark:text-white">Pay in NGN</p>
                  <p className="text-xs text-gray-500">Recommended for local cards</p>
                </div>
                <input
                  type="radio"
                  name="currency"
                  value="NGN"
                  checked={paymentCurrency === 'NGN'}
                  onChange={() => setPaymentCurrency('NGN')}
                />
              </label>
              <label className="flex items-center justify-between border rounded-lg px-4 py-3 cursor-pointer">
                <div>
                  <p className="font-semibold text-black dark:text-white">Pay in USD</p>
                  <p className="text-xs text-gray-500">For international cards</p>
                </div>
                <input
                  type="radio"
                  name="currency"
                  value="USD"
                  checked={paymentCurrency === 'USD'}
                  onChange={() => setPaymentCurrency('USD')}
                />
              </label>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setPaymentOpen(false);
                await submitOrder();
              }}
              className="w-full bg-red-500 text-white py-3 rounded hover:bg-red-600 disabled:opacity-50 font-semibold"
            >
              {loading ? 'Processing...' : 'Continue to Squad'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
