import { createBrowserRouter, Navigate, Link, Outlet } from 'react-router';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { SupportChatWidget } from './components/SupportChatWidget';
import { useAuth } from './contexts/AuthContext';
import { AccountPage } from './pages/AccountPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ContactPage } from './pages/ContactPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { FaqPage } from './pages/FaqPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { OrdersPage } from './pages/OrdersPage';
import { OtpVerificationPage } from './pages/OtpVerificationPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { PaymentVerifyPage } from './pages/PaymentVerifyPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ProductsPage } from './pages/ProductsPage';
import { RegisterPage } from './pages/RegisterPage';
import { TermsPage } from './pages/TermsPage';
import { WishlistPage } from './pages/WishlistPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { FlashSalesPage } from './pages/admin/FlashSalesPage';
import { SuperAdminAdminsPage } from './pages/superadmin/SuperAdminAdminsPage';
import { SuperAdminDashboard } from './pages/superadmin/SuperAdminDashboard';
import { SuperAdminFinancePage } from './pages/superadmin/SuperAdminFinancePage';
import { SuperAdminSettingsPage } from './pages/superadmin/SuperAdminSettingsPage';
import { SuperAdminUsersPage } from './pages/superadmin/SuperAdminUsersPage';

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function RootLayout() {
  return (
    <>
      <Outlet />
      <SupportChatWidget />
    </>
  );
}

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: Array<'user' | 'admin' | 'superadmin'> }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function GuestOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (user) {
    const redirectPath = user.role === 'superadmin'
      ? '/superadmin/dashboard'
      : user.role === 'admin'
        ? '/admin/dashboard'
        : '/account';
    return <Navigate to={redirectPath} replace />;
  }
  return <>{children}</>;
}

function AboutPage() {
  return (
    <MainLayout>
      <div className="bg-gray-50 dark:bg-gray-900">
        <section className="container mx-auto px-4 py-14">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold tracking-wide uppercase text-red-500 mb-3">About Us</p>
            <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-5">Built For Confident Shopping</h1>
            <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-7">
              Glossy Store is an online shopping platform focused on quality products, clear pricing, and reliable order handling.
              We built this store to keep the buying process simple: discover products fast, choose the right options, pay securely,
              and track your order without confusion.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
              <h2 className="text-xl font-semibold text-black dark:text-white mb-2">Our Mission</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-6">
                Make online shopping practical and trustworthy with transparent product information, real support, and dependable fulfillment.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
              <h2 className="text-xl font-semibold text-black dark:text-white mb-2">What We Value</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-6">
                Product quality, honest pricing, customer privacy, and responsive support when customers need help.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
              <h2 className="text-xl font-semibold text-black dark:text-white mb-2">How We Operate</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-6">
                We combine secure account management, smooth checkout, and operational dashboards to manage catalog, orders, and payments responsibly.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-14">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 md:p-8">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-4">What You Can Expect</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
              <div className="rounded border border-gray-200 dark:border-gray-700 p-4">
                <p className="font-semibold text-black dark:text-white mb-1">Product Clarity</p>
                <p>Detailed product pages with price visibility, variant selection, and current availability.</p>
              </div>
              <div className="rounded border border-gray-200 dark:border-gray-700 p-4">
                <p className="font-semibold text-black dark:text-white mb-1">Secure Checkout</p>
                <p>A secure checkout flow with clear totals, discount handling, and payment verification support.</p>
              </div>
              <div className="rounded border border-gray-200 dark:border-gray-700 p-4">
                <p className="font-semibold text-black dark:text-white mb-1">Order Confidence</p>
                <p>Order status visibility and clear communication from order confirmation to fulfillment updates.</p>
              </div>
              <div className="rounded border border-gray-200 dark:border-gray-700 p-4">
                <p className="font-semibold text-black dark:text-white mb-1">Helpful Support</p>
                <p>Contact and support channels for product questions, account issues, and after-purchase concerns.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16">
          <div className="bg-black dark:bg-gray-950 rounded-lg p-7 md:p-10 text-white">
            <h2 className="text-2xl font-bold mb-3">Shop With Confidence</h2>
            <p className="text-sm md:text-base text-white/80 max-w-2xl mb-6">
              Explore products, save favorites, and check out with a flow designed for real customers and real operations.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="px-5 py-2.5 rounded bg-red-500 hover:bg-red-600 text-white font-semibold">
                Browse Products
              </Link>
              <Link to="/contact" className="px-5 py-2.5 rounded border border-white/30 hover:bg-white/10 text-white font-semibold">
                Contact Support
              </Link>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

function NotFoundPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-6xl font-bold text-black dark:text-white mb-4">404</h1>
        <p className="text-2xl text-gray-600 dark:text-gray-400 mb-8">Page Not Found</p>
        <Link to="/" className="bg-red-500 text-white px-8 py-3 rounded hover:bg-red-600">
          Back to Home
        </Link>
      </div>
    </MainLayout>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <MainLayout><HomePage /></MainLayout> },
      { path: 'login', element: <GuestOnlyRoute><LoginPage /></GuestOnlyRoute> },
      { path: 'auth/callback', element: <AuthCallbackPage /> },
      { path: 'register', element: <GuestOnlyRoute><RegisterPage /></GuestOnlyRoute> },
      { path: 'otp', element: <OtpVerificationPage /> },
      { path: 'payment/verify', element: <PaymentVerifyPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'products', element: <MainLayout><ProductsPage /></MainLayout> },
      { path: 'products/:slugOrId', element: <MainLayout><ProductDetailPage /></MainLayout> },
      { path: 'flash-sales/:slugOrId', element: <MainLayout><ProductDetailPage /></MainLayout> },
      { path: 'cart', element: <MainLayout><CartPage /></MainLayout> },
      {
        path: 'checkout',
        element: <ProtectedRoute><MainLayout><CheckoutPage /></MainLayout></ProtectedRoute>,
      },
      {
        path: 'wishlist',
        element: <ProtectedRoute><MainLayout><WishlistPage /></MainLayout></ProtectedRoute>,
      },
      {
        path: 'account',
        element: <ProtectedRoute><MainLayout><AccountPage /></MainLayout></ProtectedRoute>,
      },
      {
        path: 'orders',
        element: <ProtectedRoute><MainLayout><OrdersPage /></MainLayout></ProtectedRoute>,
      },
      { path: 'contact', element: <MainLayout><ContactPage /></MainLayout> },
      { path: 'about', element: <AboutPage /> },
      { path: 'privacy', element: <MainLayout><PrivacyPage /></MainLayout> },
      { path: 'terms', element: <MainLayout><TermsPage /></MainLayout> },
      { path: 'faq', element: <MainLayout><FaqPage /></MainLayout> },
      {
        path: 'admin/dashboard',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <MainLayout><AdminDashboard /></MainLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/products',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <MainLayout><AdminProductsPage /></MainLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/categories',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <MainLayout><AdminCategoriesPage /></MainLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/orders',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <MainLayout><AdminOrdersPage /></MainLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <MainLayout><AdminUsersPage /></MainLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/payments',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <MainLayout><AdminPaymentsPage /></MainLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/flash-sales',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <MainLayout><FlashSalesPage /></MainLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'superadmin/dashboard',
        element: (
          <ProtectedRoute allowedRoles={['superadmin']}>
            <MainLayout><SuperAdminDashboard /></MainLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'superadmin/admins',
        element: (
          <ProtectedRoute allowedRoles={['superadmin']}>
            <MainLayout><SuperAdminAdminsPage /></MainLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'superadmin/finance',
        element: (
          <ProtectedRoute allowedRoles={['superadmin']}>
            <MainLayout><SuperAdminFinancePage /></MainLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'superadmin/users',
        element: (
          <ProtectedRoute allowedRoles={['superadmin']}>
            <MainLayout><SuperAdminUsersPage /></MainLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'superadmin/settings',
        element: (
          <ProtectedRoute allowedRoles={['superadmin']}>
            <MainLayout><SuperAdminSettingsPage /></MainLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'superadmin/flash-sales',
        element: (
          <ProtectedRoute allowedRoles={['superadmin']}>
            <MainLayout><FlashSalesPage /></MainLayout>
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
