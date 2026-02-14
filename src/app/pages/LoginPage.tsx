import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, verifyLoginOTP } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await login(email.trim(), password);
      if (result.needOtp) {
        setShowOTP(true);
        toast.success(result.message || 'OTP sent to your email');
      } else {
        toast.success('Login successful');
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await verifyLoginOTP(email, otp);
      toast.success('Login successful');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-black dark:text-white mb-2">
            {showOTP ? 'Verify OTP' : 'Login to Glossy Store'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {showOTP ? 'Enter the OTP sent to your email' : 'Enter your details below'}
          </p>
        </div>

        {!showOTP ? (
          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-0 py-3 border-b-2 border-gray-300 dark:border-gray-700 bg-transparent text-black dark:text-white placeholder-gray-400 focus:border-red-500 outline-none"
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-0 py-3 border-b-2 border-gray-300 dark:border-gray-700 bg-transparent text-black dark:text-white placeholder-gray-400 focus:border-red-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link to="/forgot-password" className="text-sm text-red-500 hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 text-white py-3 rounded hover:bg-red-600 transition-colors disabled:opacity-50 font-semibold"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>

            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-red-500 hover:underline font-semibold">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="mt-8 space-y-6">
            <div>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                inputMode="numeric"
                maxLength={6}
                className="w-full px-0 py-3 border-b-2 border-gray-300 dark:border-gray-700 bg-transparent text-black dark:text-white placeholder-gray-400 focus:border-red-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 text-white py-3 rounded hover:bg-red-600 transition-colors disabled:opacity-50 font-semibold"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => setShowOTP(false)}
              className="w-full text-gray-600 dark:text-gray-400 hover:underline"
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
