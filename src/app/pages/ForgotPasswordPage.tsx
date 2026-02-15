import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import * as api from '../services/api';

export function ForgotPasswordPage() {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();
  const isValidEmail = /\S+@\S+\.\S+/.test(email.trim());
  const isOtpValid = /^\d{6}$/.test(otp.trim());
  const isStrongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword);

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail) {
      toast.error('Enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      await api.forgotPassword({ email: email.trim() });
      toast.success('If your account exists, an OTP was sent');
      setStep('reset');
    } catch (error: any) {
      toast.error(error.message || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail || !isOtpValid || !isStrongPassword) {
      toast.error('Enter a valid email, OTP, and strong password');
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword({ email: email.trim(), otp: otp.trim(), newPassword });
      toast.success('Password reset successful');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
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
            "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80')",
        }}
      >
        <div className="h-full w-full bg-black/55 flex items-center justify-center p-12">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-5 text-[#f4d992] font-bold tracking-[0.2em]">GLOSSY</div>
            <h2 className="text-3xl font-bold text-white">Secure recovery</h2>
            <p className="mt-4 text-gray-200">Reset access and get back to shopping.</p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white/95 dark:bg-gray-800 rounded-2xl border border-[#eadfce] shadow-[0_24px_60px_rgba(31,36,48,0.15)] p-6">
          <h1 className="text-2xl font-bold text-black dark:text-white mb-4">Reset Password</h1>
          {step === 'request' ? (
            <form onSubmit={requestOtp} className="space-y-4">
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full px-4 py-3 rounded border border-[#d8cdbf] dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white focus:border-[#b42318] outline-none"
              />
              <button disabled={loading || !isValidEmail} className="w-full bg-[#b42318] text-white py-3 rounded hover:bg-[#8f1b12] disabled:opacity-60">
                {loading ? 'Requesting...' : 'Request OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={resetPassword} className="space-y-4">
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full px-4 py-3 rounded border border-[#d8cdbf] dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white focus:border-[#b42318] outline-none"
              />
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="OTP"
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
                className="w-full px-4 py-3 rounded border border-[#d8cdbf] dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white focus:border-[#b42318] outline-none"
              />
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full px-4 py-3 rounded border border-[#d8cdbf] dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white focus:border-[#b42318] outline-none"
              />
              {newPassword.length > 0 && !isStrongPassword ? (
                <p className="text-xs text-[#b42318]">
                  Password must include uppercase, lowercase, and a number.
                </p>
              ) : null}
              <button disabled={loading || !isValidEmail || !isOtpValid || !isStrongPassword} className="w-full bg-[#b42318] text-white py-3 rounded hover:bg-[#8f1b12] disabled:opacity-60">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
          <div className="mt-4 text-sm">
            <Link to="/login" className="text-[#b42318] hover:underline">Back to login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
