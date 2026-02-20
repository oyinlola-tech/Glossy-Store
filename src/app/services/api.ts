const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api';
const STORAGE_KEY = 'user';
const REQUEST_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 15000);

type ApiRequestOptions = RequestInit & {
  requireAuth?: boolean;
};

type ApiErrorPayload = {
  error?: string;
  message?: string;
  requestId?: string;
};

const safeParse = <T>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const safeStorageGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const getStoredToken = (): string | null => {
  const session = safeParse<{ token?: string }>(safeStorageGetItem(STORAGE_KEY));
  return session?.token || null;
};

const getDefaultHeaders = (requireAuth: boolean, includeJsonContentType: boolean): HeadersInit => {
  const token = getStoredToken();
  const headers: HeadersInit = {};
  if (includeJsonContentType) {
    headers['Content-Type'] = 'application/json';
  }
  if (requireAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const dispatchUnauthorized = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth:unauthorized'));
  }
};

async function apiCall<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const { requireAuth = false, ...requestOptions } = options;
  const includeJsonContentType = !(requestOptions.body instanceof FormData);
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const method = (requestOptions.method || 'GET').toUpperCase();
  const shouldRetry = method === 'GET';
  const maxAttempts = shouldRetry ? 2 : 1;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, {
        ...requestOptions,
        credentials: 'same-origin',
        signal: controller.signal,
        headers: {
          ...getDefaultHeaders(requireAuth, includeJsonContentType),
          ...(requestOptions.headers || {}),
        },
      });

      const responseText = await response.text();
      const payload = (() => {
        if (!responseText) return {} as ApiErrorPayload;
        try {
          return JSON.parse(responseText) as ApiErrorPayload;
        } catch {
          return { message: responseText } as ApiErrorPayload;
        }
      })();

      if (!response.ok) {
        const message = payload.error || payload.message || `Request failed (${response.status})`;
        const formattedMessage = payload.requestId ? `${message} (ref: ${payload.requestId})` : message;
        if (response.status === 401 && requireAuth) {
          dispatchUnauthorized();
        }
        throw new Error(formattedMessage);
      }

      if (response.status === 204) {
        return undefined as T;
      }
      if (!responseText) {
        return undefined as T;
      }
      try {
        return JSON.parse(responseText) as T;
      } catch {
        return responseText as unknown as T;
      }
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        lastError = new Error('Request timed out. Please try again.');
      } else {
        lastError = error instanceof Error ? error : new Error('Network request failed');
      }
      if (attempt < maxAttempts) {
        await sleep(350);
        continue;
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError || new Error('Request failed');
}

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  is_super_admin?: boolean;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type LoginResponse = AuthResponse | { needOtp: true; message: string };

export type UserProfileResponse = {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  is_super_admin?: boolean;
};

export type UpdateUserProfileResponse = {
  message?: string;
  user: UserProfileResponse;
};

export type Product = {
  id: number;
  slug?: string;
  name: string;
  description?: string;
  base_price: number | string;
  stock?: number;
  current_price?: number;
  original_price?: number | null;
  has_discount?: boolean;
  discount_label?: string | null;
  average_rating?: number;
  FlashSales?: Array<{
    id: number;
    name?: string;
    start_time?: string;
    end_time?: string;
    FlashSaleProduct?: { discount_price?: number | string };
  }>;
  ProductImages?: Array<{ image_url: string }>;
  ProductVariants?: Array<{
    id: number;
    stock: number;
    price_adjustment?: number;
    ProductColor?: { name?: string; color_name?: string };
    ProductSize?: { size?: string };
  }>;
};

export const getProductPath = (product?: Pick<Product, 'id' | 'slug'> | null) => {
  if (!product) return '/products';
  return `/products/${encodeURIComponent(String(product.slug || product.id))}`;
};

export const getFlashSaleProductPath = (product?: Pick<Product, 'id' | 'slug'> | null) => {
  if (!product) return '/products';
  return `/flash-sales/${encodeURIComponent(String(product.slug || product.id))}`;
};

export type Category = {
  id: number;
  name: string;
  description?: string;
  parent_id?: number | null;
  subcategories?: Category[];
};

export type CartItemView = {
  id: number;
  quantity: number;
  productVariantId: number;
  productName: string;
  image: string | null;
  unitPrice: number;
  subtotal: number;
  variantLabel: string;
  note?: string | null;
};

export type CartView = {
  id?: number;
  items: CartItemView[];
  subtotal: number;
};

export type DiscountPreviewResponse = {
  welcome_discount_eligible: boolean;
  welcome_discount_amount: number;
  welcome_discount_message: string;
  applies_to: null | {
    product_variant_id: number;
    product_name: string;
    quantity_affected: number;
    discount_rate: number;
  };
};

export type CheckoutResponse = {
  order: any;
  payment: any;
  welcome_discount_applied: boolean;
  welcome_discount_amount: number;
  welcome_discount_message: string | null;
  welcome_discount_target: null | {
    product_variant_id: number;
    product_name: string;
    quantity_affected: number;
    discount_rate: number;
  };
};

export type SavedPaymentMethod = {
  id: number;
  provider: 'squad';
  type: 'card';
  brand?: string | null;
  last4?: string | null;
  exp_month?: number | null;
  exp_year?: number | null;
  is_default: boolean;
  is_active: boolean;
  created_at?: string;
};

export type CouponValidationResponse = {
  message?: string;
  coupon?: {
    code?: string;
    discountAmount?: number;
    [key: string]: unknown;
  };
};

export type FinanceSummary = {
  gross_sales: number;
  refund_total: number;
  net_revenue: number;
  orders: number;
  refunds: number;
  discounts: number;
  avg_order_value: number;
  start: string | null;
  end: string | null;
};

export type FinanceTrendPoint = {
  period: string;
  gross_sales: number;
  refund_total: number;
  net_revenue: number;
  orders: number;
};

export type FinanceTrendsResponse = {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start: string | null;
  end: string | null;
  trends: FinanceTrendPoint[];
};

export type FinanceTransaction = {
  id: number;
  order_number: string;
  total: number;
  discount: number;
  status: string;
  payment_status: string;
  created_at: string;
  refunded_at?: string | null;
  User?: { id: number; name: string; email: string };
};

export type FlashSaleProductLink = {
  flash_sale_id?: number;
  product_id: number;
  discount_price: number | string;
  Product?: Product;
};

export type FlashSale = {
  id: number;
  name: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  Products?: Array<Product & { FlashSaleProduct?: FlashSaleProductLink }>;
};

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const computeVariantPrice = (variant: any): number => {
  const base = toNumber(variant?.Product?.base_price);
  const adjustment = toNumber(variant?.price_adjustment);
  return base + adjustment;
};

export const mapCartResponse = (raw: any): CartView => {
  const cartItems = Array.isArray(raw?.CartItems) ? raw.CartItems : [];
  const items = cartItems.map((item: any) => {
    const variant = item?.ProductVariant;
    const product = variant?.Product;
    const price = computeVariantPrice(variant);
    const color = variant?.ProductColor?.name || variant?.ProductColor?.color_name;
    const size = variant?.ProductSize?.size;
    const variantLabel = [color, size].filter(Boolean).join(' / ');
    return {
      id: item.id,
      quantity: toNumber(item.quantity, 1),
      productVariantId: item.product_variant_id,
      productName: product?.name || 'Product',
      image: product?.ProductImages?.[0]?.image_url || null,
      unitPrice: price,
      subtotal: price * toNumber(item.quantity, 1),
      variantLabel,
      note: item.note ?? null,
    };
  });
  return {
    id: raw?.id,
    items,
    subtotal: items.reduce((sum: number, item: CartItemView) => sum + item.subtotal, 0),
  };
};

// Health
export const getHealth = () => apiCall('/health');
export const getInfo = () => apiCall('/info');
export const getCurrencyProfile = () => apiCall<{ base: string; currency: string; locale: string; rate: number }>('/currency/profile');

// Auth
export const register = (data: { name: string; email: string; password: string; referralCode?: string }) =>
  apiCall<{ message: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const verifyOTP = (data: { email: string; otp: string; purpose: 'registration' | 'login' | 'forgot_password' | 'delete_account' }) =>
  apiCall<{ message: string }>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const resendOTP = (data: { email: string; purpose: 'registration' | 'login' | 'forgot_password' }) =>
  apiCall<{ message: string }>('/auth/resend-otp', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const login = (data: { email: string; password: string }) =>
  apiCall<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const verifyLoginOTP = (data: { email: string; otp: string }) =>
  apiCall<AuthResponse>('/auth/verify-login-otp', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const forgotPassword = (data: { email: string }) =>
  apiCall<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const resetPassword = (data: { email: string; otp: string; newPassword: string }) =>
  apiCall<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const changePassword = (data: { currentPassword: string; newPassword: string }) =>
  apiCall<{ message: string }>('/auth/change-password', {
    method: 'POST',
    requireAuth: true,
    body: JSON.stringify(data),
  });

export const requestDeleteAccount = () =>
  apiCall<{ message: string }>('/auth/request-delete-account', {
    method: 'POST',
    requireAuth: true,
  });

export const confirmDeleteAccount = (data: { otp: string }) =>
  apiCall<{ message: string }>('/auth/confirm-delete-account', {
    method: 'POST',
    requireAuth: true,
    body: JSON.stringify(data),
  });

// Users
export const getUserProfile = () => apiCall<UserProfileResponse>('/user/profile', { requireAuth: true });
export const updateUserProfile = (data: { name?: string }) =>
  apiCall<UpdateUserProfileResponse>('/user/profile', {
    method: 'PUT',
    requireAuth: true,
    body: JSON.stringify(data),
  });
export const getUserWishlist = () => apiCall('/user/wishlist', { requireAuth: true });
export const addToWishlist = (productId: number | string) =>
  apiCall(`/user/wishlist/${productId}`, {
    method: 'POST',
    requireAuth: true,
  });
export const removeFromWishlist = (productId: number | string) =>
  apiCall(`/user/wishlist/${productId}`, {
    method: 'DELETE',
    requireAuth: true,
  });
export const getUserReferral = () => apiCall('/user/referral', { requireAuth: true });
export const getPaymentMethods = () =>
  apiCall<{ paymentMethods: SavedPaymentMethod[] }>('/user/payment-methods', { requireAuth: true });
export const setDefaultPaymentMethod = (id: number | string) =>
  apiCall<{ message: string; paymentMethod: SavedPaymentMethod }>(`/user/payment-methods/${id}/default`, {
    method: 'PATCH',
    requireAuth: true,
  });
export const deletePaymentMethod = (id: number | string) =>
  apiCall<{ message: string }>(`/user/payment-methods/${id}`, {
    method: 'DELETE',
    requireAuth: true,
  });

// Products
export const getProducts = (params?: {
  page?: number;
  limit?: number;
  category?: string | number;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  flashSale?: boolean;
  newArrivals?: boolean;
}) => {
  const search = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        search.set(key, String(value));
      }
    });
  }
  return apiCall<{ total: number; page: number; pages: number; products: Product[] }>(
    `/products${search.toString() ? `?${search.toString()}` : ''}`
  );
};

export const getProduct = (idOrSlug: number | string, options?: { flashSale?: boolean }) => {
  const search = new URLSearchParams();
  if (options?.flashSale) search.set('flashSale', 'true');
  return apiCall<Product>(`/products/${encodeURIComponent(String(idOrSlug))}${search.toString() ? `?${search.toString()}` : ''}`);
};
export const getCategories = (params?: { tree?: boolean }) => {
  const search = new URLSearchParams();
  if (typeof params?.tree === 'boolean') search.set('tree', String(params.tree));
  return apiCall<{ categories: Category[] }>(`/categories${search.toString() ? `?${search.toString()}` : ''}`);
};
export const rateProduct = (idOrSlug: number | string, rating: number, review?: string) =>
  apiCall(`/products/${encodeURIComponent(String(idOrSlug))}/rate`, {
    method: 'POST',
    requireAuth: true,
    body: JSON.stringify({ rating, review }),
  });
export const commentProduct = (idOrSlug: number | string, comment: string) =>
  apiCall(`/products/${encodeURIComponent(String(idOrSlug))}/comment`, {
    method: 'POST',
    requireAuth: true,
    body: JSON.stringify({ comment }),
  });

// Cart
export const getCart = () => apiCall('/cart', { requireAuth: true });
export const addToCart = (data: { productVariantId?: number; productId?: number; quantity: number; note?: string | null }) =>
  apiCall('/cart', {
    method: 'POST',
    requireAuth: true,
    body: JSON.stringify(data),
  });
export const updateCartItem = (itemId: number | string, quantity: number, note?: string | null) =>
  apiCall(`/cart/${itemId}`, {
    method: 'PUT',
    requireAuth: true,
    body: JSON.stringify(note ? { quantity, note } : { quantity }),
  });
export const deleteCartItem = (itemId: number | string) =>
  apiCall(`/cart/${itemId}`, {
    method: 'DELETE',
    requireAuth: true,
  });

// Orders
export const checkout = (data: { shippingAddress: string; couponCode?: string; currency?: 'NGN' | 'USD'; paymentMethodId?: number }) =>
  apiCall<CheckoutResponse>('/orders/checkout', {
    method: 'POST',
    requireAuth: true,
    body: JSON.stringify(data),
  });

export const verifyPaystackPayment = (reference: string) =>
  apiCall<{ status: string; reference: string; data?: any }>(`/payments/verify/${encodeURIComponent(reference)}`);
export const verifyPayment = verifyPaystackPayment;

export const getCheckoutDiscountPreview = () =>
  apiCall<DiscountPreviewResponse>('/orders/discount-preview', {
    requireAuth: true,
  });

export const getOrders = () => apiCall('/orders', { requireAuth: true });
export const getOrder = (id: number | string) => apiCall(`/orders/${id}`, { requireAuth: true });
export const getOrderStatus = (id: number | string) => apiCall(`/orders/${id}/status`, { requireAuth: true });
export const cancelOrder = (id: number | string) =>
  apiCall(`/orders/${id}/cancel`, {
    method: 'PATCH',
    requireAuth: true,
  });
export const requestOrderChargeback = (id: number | string, reason?: string) =>
  apiCall<{ message: string; order: any }>(`/orders/${id}/chargeback`, {
    method: 'POST',
    requireAuth: true,
    body: JSON.stringify(reason ? { reason } : {}),
  });

// Coupons
export const validateCoupon = (code: string, cartTotal: number) =>
  apiCall<CouponValidationResponse>('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, cartTotal }),
  });

// Contact
export const submitContact = (data: { name?: string; email?: string; message: string }) =>
  apiCall('/contact', {
    method: 'POST',
    requireAuth: Boolean(getStoredToken()),
    body: JSON.stringify(data),
  });

// Admin
export const getAdminDashboardSummary = () => apiCall('/admin/dashboard/summary', { requireAuth: true });
export const createAdminUser = (data: { name: string; email: string; password: string }) =>
  apiCall('/admin/admin-users', {
    method: 'POST',
    requireAuth: true,
    body: JSON.stringify(data),
  });
export const deleteAdminUser = (id: number | string) =>
  apiCall<{ message: string }>(`/admin/admin-users/${id}`, {
    method: 'DELETE',
    requireAuth: true,
  });
export const getAdminProducts = () => apiCall('/admin/products', { requireAuth: true });
export const getAdminProduct = (id: number | string) => apiCall(`/admin/products/${id}`, { requireAuth: true });
export const getFlashSales = () => apiCall<FlashSale[]>('/admin/flash-sales', { requireAuth: true });
export const createFlashSale = (data: {
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  products?: Array<{ product_id: number; discount_price: number }>;
}) =>
  apiCall<FlashSale>('/admin/flash-sales', {
    method: 'POST',
    requireAuth: true,
    body: JSON.stringify(data),
  });
export const updateFlashSale = (
  id: number | string,
  data: Partial<{
    name: string;
    description: string;
    start_time: string;
    end_time: string;
    products: Array<{ product_id: number; discount_price: number }>;
  }>
) =>
  apiCall<FlashSale>(`/admin/flash-sales/${id}`, {
    method: 'PUT',
    requireAuth: true,
    body: JSON.stringify(data),
  });
export const deleteFlashSale = (id: number | string) =>
  apiCall<{ message: string }>(`/admin/flash-sales/${id}`, {
    method: 'DELETE',
    requireAuth: true,
  });
export const createProduct = (data: FormData) =>
  apiCall('/admin/products', {
    method: 'POST',
    requireAuth: true,
    headers: { Authorization: `Bearer ${getStoredToken() || ''}` },
    body: data,
  });
export const updateProduct = (id: number | string, data: FormData | Record<string, unknown>) =>
  apiCall(`/admin/products/${id}`, {
    method: 'PUT',
    requireAuth: true,
    ...(data instanceof FormData
      ? { headers: { Authorization: `Bearer ${getStoredToken() || ''}` }, body: data }
      : { body: JSON.stringify(data) }),
  });
export const deleteProduct = (id: number | string) =>
  apiCall(`/admin/products/${id}`, {
    method: 'DELETE',
    requireAuth: true,
  });
export const getAdminOrders = () => apiCall('/admin/orders', { requireAuth: true });
export const updateOrderStatus = (id: number | string, status: string, status_note?: string) =>
  apiCall(`/admin/orders/${id}/status`, {
    method: 'PATCH',
    requireAuth: true,
    body: JSON.stringify({ status, status_note }),
  });
export const resolveOrderDispute = (id: number | string, decision: 'approve_chargeback' | 'reject_chargeback', note?: string) =>
  apiCall(`/admin/orders/${id}/dispute`, {
    method: 'PATCH',
    requireAuth: true,
    body: JSON.stringify({ decision, note }),
  });
export const getAdminUsers = () => apiCall('/admin/users', { requireAuth: true });
export const getPaymentEvents = (event?: string) =>
  apiCall(`/admin/payments/events${event ? `?event=${encodeURIComponent(event)}` : ''}`, { requireAuth: true });
export const getFinanceSummary = (params?: { start?: string; end?: string }) => {
  const search = new URLSearchParams();
  if (params?.start) search.set('start', params.start);
  if (params?.end) search.set('end', params.end);
  return apiCall<FinanceSummary>(`/admin/finance/summary${search.toString() ? `?${search.toString()}` : ''}`, { requireAuth: true });
};
export const getFinanceTrends = (params?: { period?: 'daily' | 'weekly' | 'monthly' | 'yearly'; start?: string; end?: string }) => {
  const search = new URLSearchParams();
  if (params?.period) search.set('period', params.period);
  if (params?.start) search.set('start', params.start);
  if (params?.end) search.set('end', params.end);
  return apiCall<FinanceTrendsResponse>(`/admin/finance/trends${search.toString() ? `?${search.toString()}` : ''}`, { requireAuth: true });
};
export const getFinanceTransactions = (params?: { type?: 'all' | 'sales' | 'refunds'; start?: string; end?: string; limit?: number; offset?: number }) => {
  const search = new URLSearchParams();
  if (params?.type) search.set('type', params.type);
  if (params?.start) search.set('start', params.start);
  if (params?.end) search.set('end', params.end);
  if (params?.limit) search.set('limit', String(params.limit));
  if (params?.offset) search.set('offset', String(params.offset));
  return apiCall<{ total: number; limit: number; offset: number; transactions: FinanceTransaction[] }>(
    `/admin/finance/transactions${search.toString() ? `?${search.toString()}` : ''}`,
    { requireAuth: true }
  );
};
export const createCategory = (data: { name: string; description?: string; parent_id?: number }) =>
  apiCall('/admin/categories', {
    method: 'POST',
    requireAuth: true,
    body: JSON.stringify(data),
  });
export const updateCategory = (id: number | string, data: { name?: string; description?: string; parent_id?: number | null }) =>
  apiCall(`/admin/categories/${id}`, {
    method: 'PUT',
    requireAuth: true,
    body: JSON.stringify(data),
  });
export const deleteCategory = (id: number | string) =>
  apiCall(`/admin/categories/${id}`, {
    method: 'DELETE',
    requireAuth: true,
  });
export const getAdminCoupons = () => apiCall('/admin/coupons', { requireAuth: true });
export const createCoupon = (data: Record<string, unknown>) =>
  apiCall('/admin/coupons', {
    method: 'POST',
    requireAuth: true,
    body: JSON.stringify(data),
  });
export const updateCoupon = (id: number | string, data: Record<string, unknown>) =>
  apiCall(`/admin/coupons/${id}`, {
    method: 'PUT',
    requireAuth: true,
    body: JSON.stringify(data),
  });
export const deleteCoupon = (id: number | string) =>
  apiCall(`/admin/coupons/${id}`, {
    method: 'DELETE',
    requireAuth: true,
  });
export const getAdminContactMessages = () => apiCall('/admin/contact-messages', { requireAuth: true });
export const replyContactMessage = (id: number | string, reply: string) =>
  apiCall(`/admin/contact-messages/${id}/reply`, {
    method: 'POST',
    requireAuth: true,
    body: JSON.stringify({ reply }),
  });

// Support
const buildSupportFormData = (data: Record<string, unknown>, attachments?: File[]) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, String(value));
  });
  (attachments || []).forEach((file) => {
    formData.append('attachments', file);
  });
  return formData;
};

export const getSupportConversations = () => apiCall('/support/conversations', { requireAuth: true });
export const createSupportConversation = (data: { subject?: string; message?: string; attachments?: File[] }) => {
  if (data.attachments && data.attachments.length) {
    return apiCall('/support/conversations', {
      method: 'POST',
      requireAuth: true,
      body: buildSupportFormData({ subject: data.subject, message: data.message }, data.attachments),
    });
  }
  return apiCall('/support/conversations', {
    method: 'POST',
    requireAuth: true,
    body: JSON.stringify({ subject: data.subject, message: data.message }),
  });
};
export const getSupportUnreadCount = () => apiCall('/support/unread-count', { requireAuth: true });
export const getSupportMessages = (id: number | string) =>
  apiCall(`/support/conversations/${id}/messages`, { requireAuth: true });
export const sendSupportMessage = (id: number | string, message: string, attachments?: File[]) => {
  if (attachments && attachments.length) {
    return apiCall(`/support/conversations/${id}/messages`, {
      method: 'POST',
      requireAuth: true,
      body: buildSupportFormData({ message }, attachments),
    });
  }
  return apiCall(`/support/conversations/${id}/messages`, {
    method: 'POST',
    requireAuth: true,
    body: JSON.stringify({ message }),
  });
};
export const markSupportConversationRead = (id: number | string) =>
  apiCall(`/support/conversations/${id}/read`, {
    method: 'PATCH',
    requireAuth: true,
  });
export const updateSupportConversationStatus = (id: number | string, status: 'open' | 'resolved' | 'closed') =>
  apiCall(`/support/conversations/${id}/status`, {
    method: 'PATCH',
    requireAuth: true,
    body: JSON.stringify({ status }),
  });

export const clearSupportConversationMessages = (id: number | string) =>
  apiCall(`/support/conversations/${id}/messages`, {
    method: 'DELETE',
    requireAuth: true,
  });

export const deleteSupportConversation = (id: number | string) =>
  apiCall(`/support/conversations/${id}`, {
    method: 'DELETE',
    requireAuth: true,
  });

// Guest support
export const createGuestSupportConversation = (data: { name: string; email: string; subject?: string; message?: string; attachments?: File[] }) =>
  apiCall('/support/guest/conversations', {
    method: 'POST',
    body: buildSupportFormData({ name: data.name, email: data.email, subject: data.subject, message: data.message }, data.attachments),
  });

export const getGuestSupportMessages = (id: number | string, guestToken: string) =>
  apiCall(`/support/guest/conversations/${id}/messages`, {
    headers: { 'X-Guest-Token': guestToken },
  });

export const sendGuestSupportMessage = (id: number | string, guestToken: string, message: string, attachments?: File[]) =>
  apiCall(`/support/guest/conversations/${id}/messages`, {
    method: 'POST',
    headers: { 'X-Guest-Token': guestToken },
    body: buildSupportFormData({ message }, attachments),
  });
