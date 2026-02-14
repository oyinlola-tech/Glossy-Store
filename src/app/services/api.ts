const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api';
const STORAGE_KEY = 'user';

type ApiRequestOptions = RequestInit & {
  requireAuth?: boolean;
};

type ApiErrorPayload = {
  error?: string;
  message?: string;
};

const safeParse = <T>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const getStoredToken = (): string | null => {
  const session = safeParse<{ token?: string }>(localStorage.getItem(STORAGE_KEY));
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

async function apiCall<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const { requireAuth = false, ...requestOptions } = options;
  const includeJsonContentType = !(requestOptions.body instanceof FormData);
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...requestOptions,
    headers: {
      ...getDefaultHeaders(requireAuth, includeJsonContentType),
      ...(requestOptions.headers || {}),
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({} as ApiErrorPayload));
    const message = payload.error || payload.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
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

export type Product = {
  id: number;
  name: string;
  description?: string;
  base_price: number | string;
  current_price?: number;
  original_price?: number | null;
  average_rating?: number;
  ProductImages?: Array<{ image_url: string }>;
  ProductVariants?: Array<{
    id: number;
    stock: number;
    price_adjustment?: number;
    ProductColor?: { name?: string };
    ProductSize?: { size?: string };
  }>;
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
};

export type CartView = {
  id?: number;
  items: CartItemView[];
  subtotal: number;
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
    const color = variant?.ProductColor?.name;
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
    };
  });
  return {
    id: raw?.id,
    items,
    subtotal: items.reduce((sum, item) => sum + item.subtotal, 0),
  };
};

// Health
export const getHealth = () => apiCall('/health');
export const getInfo = () => apiCall('/info');

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
export const getUserProfile = () => apiCall('/user/profile', { requireAuth: true });
export const updateUserProfile = (data: { name?: string }) =>
  apiCall('/user/profile', {
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

export const getProduct = (id: number | string) => apiCall<Product>(`/products/${id}`);
export const rateProduct = (id: number | string, rating: number, review?: string) =>
  apiCall(`/products/${id}/rate`, {
    method: 'POST',
    requireAuth: true,
    body: JSON.stringify({ rating, review }),
  });
export const commentProduct = (id: number | string, comment: string) =>
  apiCall(`/products/${id}/comment`, {
    method: 'POST',
    requireAuth: true,
    body: JSON.stringify({ comment }),
  });

// Cart
export const getCart = () => apiCall('/cart', { requireAuth: true });
export const addToCart = (data: { productVariantId: number; quantity: number }) =>
  apiCall('/cart', {
    method: 'POST',
    requireAuth: true,
    body: JSON.stringify(data),
  });
export const updateCartItem = (itemId: number | string, quantity: number) =>
  apiCall(`/cart/${itemId}`, {
    method: 'PUT',
    requireAuth: true,
    body: JSON.stringify({ quantity }),
  });
export const deleteCartItem = (itemId: number | string) =>
  apiCall(`/cart/${itemId}`, {
    method: 'DELETE',
    requireAuth: true,
  });

// Orders
export const checkout = (data: { shippingAddress: string; couponCode?: string }) =>
  apiCall('/orders/checkout', {
    method: 'POST',
    requireAuth: true,
    body: JSON.stringify(data),
  });

export const getOrders = () => apiCall('/orders', { requireAuth: true });
export const getOrder = (id: number | string) => apiCall(`/orders/${id}`, { requireAuth: true });
export const getOrderStatus = (id: number | string) => apiCall(`/orders/${id}/status`, { requireAuth: true });
export const cancelOrder = (id: number | string) =>
  apiCall(`/orders/${id}/cancel`, {
    method: 'PATCH',
    requireAuth: true,
  });

// Coupons
export const validateCoupon = (code: string, cartTotal: number) =>
  apiCall('/coupons/validate', {
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
export const getAdminProducts = () => apiCall('/admin/products', { requireAuth: true });
export const getAdminProduct = (id: number | string) => apiCall(`/admin/products/${id}`, { requireAuth: true });
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
export const getAdminUsers = () => apiCall('/admin/users', { requireAuth: true });
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
export const getSupportConversations = () => apiCall('/support/conversations', { requireAuth: true });
export const createSupportConversation = (data: { subject?: string; message?: string }) =>
  apiCall('/support/conversations', {
    method: 'POST',
    requireAuth: true,
    body: JSON.stringify(data),
  });
export const getSupportUnreadCount = () => apiCall('/support/unread-count', { requireAuth: true });
export const getSupportMessages = (id: number | string) =>
  apiCall(`/support/conversations/${id}/messages`, { requireAuth: true });
export const sendSupportMessage = (id: number | string, message: string) =>
  apiCall(`/support/conversations/${id}/messages`, {
    method: 'POST',
    requireAuth: true,
    body: JSON.stringify({ message }),
  });
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
