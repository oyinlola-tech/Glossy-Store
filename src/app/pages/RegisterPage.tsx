import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { buildApiUrl } from '../services/api';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const isValidEmail = /\S+@\S+\.\S+/.test(email.trim());
  const isStrongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  const isFormValid = name.trim().length >= 2 && isValidEmail && isStrongPassword && password === confirmPassword && acceptedTerms;
  const startGoogleAuth = () => {
    window.location.href = buildApiUrl('/auth/google');
  };
  const startAppleAuth = () => {
    window.location.href = buildApiUrl('/auth/apple');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error('Complete all fields, use a strong password, and accept terms to continue');
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
      <div
        className="hidden lg:block lg:w-1/2 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1400&q=80')",
        }}
      >
        <div className="h-full w-full bg-black/55 flex items-center justify-center p-12">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-5 text-[#f4d992] font-bold tracking-[0.2em]">GLOSSY</div>
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  aria-label="Password"
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pr-10 px-0 py-3 border-b-2 border-[#d8cdbf] dark:border-gray-700 bg-transparent text-black dark:text-white placeholder-gray-400 focus:border-[#b42318] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-0 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  aria-label="Confirm password"
                  autoComplete="new-password"
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full pr-10 px-0 py-3 border-b-2 border-[#d8cdbf] dark:border-gray-700 bg-transparent text-black dark:text-white placeholder-gray-400 focus:border-[#b42318] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute right-0 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            {password.length > 0 && !isStrongPassword ? (
              <p className="text-xs text-[#b42318]">
                Password must be at least 8 characters with uppercase, lowercase, and a number.
              </p>
            ) : null}
            {confirmPassword && password !== confirmPassword ? (
              <p className="text-xs text-[#b42318]">Passwords do not match.</p>
            ) : null}
            <label className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#b42318] focus:ring-[#b42318]"
                aria-label="Accept terms and conditions"
              />
              <span>
                I agree to the{' '}
                <Link to="/terms" className="text-[#b42318] hover:underline font-semibold">
                  Terms of Use
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-[#b42318] hover:underline font-semibold">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full bg-[#b42318] text-white py-3 rounded hover:bg-[#8f1b12] transition-colors disabled:opacity-50 font-semibold"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="space-y-3">
              <button
                type="button"
                onClick={startGoogleAuth}
                className="w-full border border-gray-200 dark:border-gray-700 text-black dark:text-white py-3 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <svg className="size-5" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#FFC107" d="M43.6 20.3H42V20H24v8h11.3C33.8 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.7z"/>
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.6 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6 29.4 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z"/>
                  <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.4 35.1 26.8 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                  <path fill="#1976D2" d="M43.6 20.3H42V20H24v8h11.3c-1.2 3.2-3.7 5.8-7 7.3l6.3 5.3C37.1 38.3 44 33 44 24c0-1.3-.1-2.4-.4-3.7z"/>
                </svg>
                Continue with Google
              </button>
              <button
                type="button"
                onClick={startAppleAuth}
                className="w-full border border-gray-200 dark:border-gray-700 text-black dark:text-white py-3 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M16.7 1.9c-1 .1-2.2.7-2.9 1.6-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.5.7-.8 1.1-1.9 1-3.1zM20.2 9.2c-1.3-1.6-3.1-1.8-3.8-1.8-1.6 0-3.1 1-3.9 1s-2.1-1-3.4-1c-1.8 0-3.5 1-4.4 2.5-1.9 3-0.5 7.5 1.3 10 0.9 1.2 2 2.6 3.4 2.5 1.4-.1 1.9-.9 3.6-.9s2.1.9 3.5.9c1.5 0 2.4-1.2 3.3-2.4 1-1.4 1.4-2.7 1.4-2.8-.1 0-2.7-1-2.7-4 0-2.5 2.1-3.7 2.2-3.8-.1-.1-1-1.4-2.5-2.2z"
                  />
                </svg>
                Continue with Apple
              </button>
            </div>

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
