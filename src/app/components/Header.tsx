import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Heart, LogOut, Menu, Search, ShoppingCart, User, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadCartCount = async () => {
      try {
        if (user) {
          const data = await api.getCart();
          const items = Array.isArray(data?.CartItems) ? data.CartItems : [];
          const total = items.reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0);
          if (isMounted) setCartCount(total);
          return;
        }

        const raw = localStorage.getItem('cart');
        const parsed = raw ? (JSON.parse(raw) as { items?: any[] }) : { items: [] };
        const items = Array.isArray(parsed.items) ? parsed.items : [];
        const total = items.reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0);
        if (isMounted) setCartCount(total);
      } catch {
        if (isMounted) setCartCount(0);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'cart') {
        void loadCartCount();
      }
    };

    const handleCartUpdate = () => {
      void loadCartCount();
    };

    const handleFocus = () => {
      void loadCartCount();
    };

    void loadCartCount();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('cart:updated', handleCartUpdate as EventListener);
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('cart:updated', handleCartUpdate as EventListener);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    navigate(`/products?search=${encodeURIComponent(query)}`);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="bg-black dark:bg-gray-950 text-white py-3">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm gap-2">
          <p className="truncate">
            {user
              ? 'Welcome back to Glossy Store'
              : 'New users get 10% off one product on their first order.'}
            {!user ? (
              <>
                {' '}
                <Link to="/register" className="font-semibold underline">Sign up</Link>
              </>
            ) : null}
          </p>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="text-2xl font-bold text-black dark:text-white tracking-wider">
            Glossy Store
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-base hover:underline text-black dark:text-white">Home</Link>
            <Link to="/products" className="text-base hover:underline text-black dark:text-white">Shop</Link>
            <Link to="/contact" className="text-base hover:underline text-black dark:text-white">Contact</Link>
            <Link to="/about" className="text-base hover:underline text-black dark:text-white">About</Link>
          </nav>

          <div className="flex items-center gap-3">
            <button
              className="md:hidden inline-flex items-center justify-center size-9 rounded bg-gray-100 dark:bg-gray-800"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="size-5 text-black dark:text-white" /> : <Menu className="size-5 text-black dark:text-white" />}
            </button>

            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-100 dark:bg-gray-800 rounded px-4 py-2 pr-10 text-sm text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 w-64"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Search className="size-4 text-black dark:text-white" />
                </button>
              </div>
            </form>

            <Link to="/wishlist" className="relative hover:opacity-70">
              <Heart className="size-6 text-black dark:text-white" />
            </Link>
            <Link to="/cart" className="relative hover:opacity-70">
              <ShoppingCart className="size-6 text-black dark:text-white" />
              {cartCount > 0 ? (
                <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              ) : null}
            </Link>

            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu((prev) => !prev)}
                  className="flex items-center justify-center size-8 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600"
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>
                {showUserMenu ? (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-semibold text-black dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      <p className="text-xs text-red-500 font-semibold mt-1 capitalize">{user.role}</p>
                    </div>
                    <Link
                      to={user.role === 'user' ? '/account' : `/${user.role}/dashboard`}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="size-4" />
                      <span className="text-sm">My Account</span>
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <ShoppingCart className="size-4" />
                      <span className="text-sm">My Orders</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 w-full"
                    >
                      <LogOut className="size-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link to="/login" className="flex items-center justify-center size-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">
                <User className="size-5 text-black dark:text-white" />
              </Link>
            )}
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="md:hidden mt-4 border-t border-gray-200 dark:border-gray-800 pt-4 space-y-3">
            <nav className="flex flex-col gap-2">
              <Link onClick={() => setMobileMenuOpen(false)} to="/" className="text-black dark:text-white">Home</Link>
              <Link onClick={() => setMobileMenuOpen(false)} to="/products" className="text-black dark:text-white">Shop</Link>
              <Link onClick={() => setMobileMenuOpen(false)} to="/contact" className="text-black dark:text-white">Contact</Link>
              <Link onClick={() => setMobileMenuOpen(false)} to="/about" className="text-black dark:text-white">About</Link>
            </nav>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-gray-800 rounded px-4 py-2 pr-10 text-sm text-black dark:text-white"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Search className="size-4 text-black dark:text-white" />
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </div>
    </header>
  );
}
