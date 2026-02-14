import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const isValidEmail = /\S+@\S+\.\S+/.test(email.trim());
  const isStrongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  const isFormValid = name.trim().length >= 2 && isValidEmail && isStrongPassword;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error('Enter a valid name, email, and strong password');
      return;
    }
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      await register(name.trim(), normalizedEmail, password);
      toast.success('OTP sent to your email');
      navigate(`/otp?purpose=registration&email=${encodeURIComponent(normalizedEmail)}`);
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f1eb] via-white to-[#f8efe6] dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex">
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-[#1f2430] via-[#5a140e] to-[#b42318]">
        <div className="h-full flex items-center justify-center p-12">
          <div className="text-center">
            <div className="text-5xl mb-5 text-[#d4af37] font-bold tracking-[0.2em]">GLOSSY</div>
            <h2 className="text-3xl font-bold text-white">Welcome to Glossy Store</h2>
            <p className="mt-4 text-gray-200">Elegant commerce with secure identity verification.</p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8 rounded-2xl border border-[#eadfce] bg-white/95 dark:bg-gray-900/85 p-8 shadow-[0_24px_60px_rgba(31,36,48,0.15)]">
          <div>
            <h2 className="text-4xl font-bold text-black dark:text-white mb-2">Create an account</h2>
            <p className="text-gray-600 dark:text-gray-300">Join the premium shopping experience.</p>
          </div>

          <form onSubmit={handleRegister} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  aria-label="Full name"
                  autoComplete="name"
                  minLength={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  className="w-full px-0 py-3 border-b-2 border-[#d8cdbf] dark:border-gray-700 bg-transparent text-black dark:text-white placeholder-gray-400 focus:border-[#b42318] outline-none"
                />
              </div>
              <div>
                <input
                  type="email"
                  required
                  aria-label="Email address"
                  autoComplete="email"
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
                  aria-label="Password"
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-0 py-3 border-b-2 border-[#d8cdbf] dark:border-gray-700 bg-transparent text-black dark:text-white placeholder-gray-400 focus:border-[#b42318] outline-none"
                />
              </div>
            </div>

            {password.length > 0 && !isStrongPassword ? (
              <p className="text-xs text-[#b42318]">
                Password must be at least 8 characters with uppercase, lowercase, and a number.
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full bg-[#b42318] text-white py-3 rounded hover:bg-[#8f1b12] transition-colors disabled:opacity-50 font-semibold"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-[#b42318] hover:underline font-semibold">
                  Log In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
