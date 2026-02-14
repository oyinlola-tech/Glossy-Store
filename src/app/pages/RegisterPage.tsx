import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, verifyOTP } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await register(name, email, password);
      setShowOTP(true);
      toast.success('OTP sent to your email');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await verifyOTP(email.trim(), otp);
      toast.success('Registration verified. Please log in.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex">
      {/* Side Image */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-blue-200 to-blue-100 dark:from-blue-900 dark:to-blue-800">
        <div className="h-full flex items-center justify-center p-12">
          <div className="text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome to Glossy Store</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Discover amazing products at great prices</p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-black dark:text-white mb-2">
              {showOTP ? 'Verify Your Email' : 'Create an account'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {showOTP ? 'Enter the OTP sent to your email' : 'Enter your details below'}
            </p>
          </div>

          {!showOTP ? (
            <form onSubmit={handleRegister} className="mt-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    className="w-full px-0 py-3 border-b-2 border-gray-300 dark:border-gray-700 bg-transparent text-black dark:text-white placeholder-gray-400 focus:border-red-500 outline-none"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email or Phone Number"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-500 text-white py-3 rounded hover:bg-red-600 transition-colors disabled:opacity-50 font-semibold"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link to="/login" className="text-red-500 hover:underline font-semibold">
                    Log In
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
                Back to Register
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
