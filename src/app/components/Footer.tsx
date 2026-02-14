import { useState } from 'react';
import { Link } from 'react-router';
import { Facebook, Instagram, Linkedin, Send, Twitter } from 'lucide-react';
import { toast } from 'sonner';

export function Footer() {
  const [email, setEmail] = useState('');
  const socialBaseUrl = 'https://oyinlola.site';

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      toast.error('Enter a valid email address');
      return;
    }
    toast.success('Subscribed successfully');
    setEmail('');
  };

  return (
    <footer className="bg-black dark:bg-gray-950 text-white mt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Glossy Store</h3>
            <p className="text-xl">Subscribe</p>
            <p className="text-sm">Get 10% off your first order</p>
            <form onSubmit={subscribe} className="relative">
              <input
                type="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                aria-label="Newsletter email"
                className="w-full bg-transparent border border-white rounded px-4 py-2 pr-10 text-sm"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2" aria-label="Subscribe">
                <Send className="size-5" />
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Support</h3>
            <div className="space-y-2 text-sm">
              <p>111 Bijoy sarani, Dhaka,<br />DH 1515, Bangladesh.</p>
              <p>support@glossystore.com</p>
              <p>+88015-88888-9999</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Account</h3>
            <div className="space-y-2 text-sm">
              <Link to="/account" className="block hover:underline">My Account</Link>
              <Link to="/login" className="block hover:underline">Login / Register</Link>
              <Link to="/cart" className="block hover:underline">Cart</Link>
              <Link to="/wishlist" className="block hover:underline">Wishlist</Link>
              <Link to="/products" className="block hover:underline">Shop</Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Quick Link</h3>
            <div className="space-y-2 text-sm">
              <Link to="/privacy" className="block hover:underline">Privacy Policy</Link>
              <Link to="/terms" className="block hover:underline">Terms Of Use</Link>
              <Link to="/faq" className="block hover:underline">FAQ</Link>
              <Link to="/contact" className="block hover:underline">Contact</Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Follow Us</h3>
            <p className="text-xs opacity-70">Get updates on offers and releases</p>
            <div className="flex gap-4 items-center">
              <a href={socialBaseUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook className="size-6 cursor-pointer hover:opacity-70" /></a>
              <a href={socialBaseUrl} target="_blank" rel="noopener noreferrer" aria-label="Twitter"><Twitter className="size-6 cursor-pointer hover:opacity-70" /></a>
              <a href={socialBaseUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram className="size-6 cursor-pointer hover:opacity-70" /></a>
              <a href={socialBaseUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin className="size-6 cursor-pointer hover:opacity-70" /></a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 dark:border-gray-900 py-4">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm opacity-60">&copy; Copyright Glossy Store 2026. All rights reserved</p>
        </div>
      </div>
    </footer>
  );
}
