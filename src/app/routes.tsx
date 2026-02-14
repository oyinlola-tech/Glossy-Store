import { createBrowserRouter, Navigate } from 'react-router';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { useAuth } from './contexts/AuthContext';
import { AccountPage } from './pages/AccountPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ContactPage } from './pages/ContactPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ProductsPage } from './pages/ProductsPage';
import { RegisterPage } from './pages/RegisterPage';
import { WishlistPage } from './pages/WishlistPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { SuperAdminDashboard } from './pages/superadmin/SuperAdminDashboard';

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
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

function AboutPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-4">About Glossy Store</h1>
        <p className="text-gray-700 dark:text-gray-300 max-w-3xl">
          Glossy Store is a modern ecommerce experience focused on quality products and reliable fulfillment.
          This frontend is now wired to the backend API for authentication, catalog browsing, cart, checkout, and account operations.
        </p>
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
        <a href="/" className="bg-red-500 text-white px-8 py-3 rounded hover:bg-red-600">
          Back to Home
        </a>
      </div>
    </MainLayout>
  );
}

export const router = createBrowserRouter([
  { path: '/', element: <MainLayout><HomePage /></MainLayout> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/products', element: <MainLayout><ProductsPage /></MainLayout> },
  { path: '/products/:id', element: <MainLayout><ProductDetailPage /></MainLayout> },
  { path: '/cart', element: <MainLayout><CartPage /></MainLayout> },
  {
    path: '/checkout',
    element: <ProtectedRoute><MainLayout><CheckoutPage /></MainLayout></ProtectedRoute>,
  },
  {
    path: '/wishlist',
    element: <ProtectedRoute><MainLayout><WishlistPage /></MainLayout></ProtectedRoute>,
  },
  {
    path: '/account',
    element: <ProtectedRoute><MainLayout><AccountPage /></MainLayout></ProtectedRoute>,
  },
  {
    path: '/orders',
    element: <ProtectedRoute><MainLayout><OrdersPage /></MainLayout></ProtectedRoute>,
  },
  { path: '/contact', element: <MainLayout><ContactPage /></MainLayout> },
  { path: '/about', element: <AboutPage /> },
  {
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
        <MainLayout><AdminDashboard /></MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/superadmin/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['superadmin']}>
        <MainLayout><SuperAdminDashboard /></MainLayout>
      </ProtectedRoute>
    ),
  },
  { path: '*', element: <NotFoundPage /> },
]);
