import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const isValidEmail = /\S+@\S+\.\S+/.test(email.trim());
  const isFormValid = isValidEmail && password.trim().length >= 8;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error('Enter a valid email and password');
      return;
    }
    setLoading(true);
    
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const result = await login(normalizedEmail, password);
      if (result.needOtp) {
        toast.success(result.message || 'OTP sent to your email');
        navigate(`/otp?purpose=login&email=${encodeURIComponent(normalizedEmail)}`);
        return;
      }

      toast.success('Login successful');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f1eb] via-white to-[#f8efe6] dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex">
      <div
        className="hidden lg:block lg:w-1/2 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80')",
        }}
      >
        <div className="h-full w-full bg-black/55 flex items-center justify-center p-12">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-5 text-[#f4d992] font-bold tracking-[0.2em]">GLOSSY</div>
            <h2 className="text-3xl font-bold text-white">Welcome back</h2>
            <p className="mt-4 text-gray-200">Premium drops, curated for you.</p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8 rounded-2xl border border-[#eadfce] bg-white/95 dark:bg-gray-900/85 p-8 shadow-[0_24px_60px_rgba(31,36,48,0.15)]">
          <div>
            <h2 className="text-4xl font-bold text-black dark:text-white mb-2">Login to Glossy Store</h2>
            <p className="text-gray-600 dark:text-gray-300">Welcome back to your premium account.</p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  aria-label="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-0 py-3 border-b-2 border-[#d8cdbf] dark:border-gray-700 bg-transparent text-black dark:text-white placeholder-gray-400 focus:border-[#b42318] outline-none"
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  aria-label="Password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-0 py-3 border-b-2 border-[#d8cdbf] dark:border-gray-700 bg-transparent text-black dark:text-white placeholder-gray-400 focus:border-[#b42318] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link to="/forgot-password" className="text-sm text-[#b42318] hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full bg-[#b42318] text-white py-3 rounded hover:bg-[#8f1b12] transition-colors disabled:opacity-50 font-semibold"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>

            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-[#b42318] hover:underline font-semibold">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
