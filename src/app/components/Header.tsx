import { Link, useNavigate } from 'react-router';
import { Search, Heart, ShoppingCart, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { useState, useEffect, useRef } from 'react';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      {/* Top Banner */}
      <div className="bg-black dark:bg-gray-950 text-white py-3">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <p>Summer Sale For All Swim Suits And Free Express Delivery - OFF 50%! <span className="font-semibold underline cursor-pointer">ShopNow</span></p>
          <div className="flex items-center gap-4">
            <select className="bg-transparent border-none text-white text-sm">
              <option>English</option>
            </select>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-black dark:text-white tracking-wider">
            Glossy Store
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-base hover:underline text-black dark:text-white">Home</Link>
            <Link to="/products" className="text-base hover:underline text-black dark:text-white">Shop</Link>
            <Link to="/contact" className="text-base hover:underline text-black dark:text-white">Contact</Link>
            <Link to="/about" className="text-base hover:underline text-black dark:text-white">About</Link>
          </nav>

          {/* Search and Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
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

            {/* Icons */}
            <Link to="/wishlist" className="relative hover:opacity-70">
              <Heart className="size-6 text-black dark:text-white" />
            </Link>

            <Link to="/cart" className="relative hover:opacity-70">
              <ShoppingCart className="size-6 text-black dark:text-white" />
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center justify-center size-8 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600"
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>
                
                {showUserMenu && (
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
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center size-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                <User className="size-5 text-black dark:text-white" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}