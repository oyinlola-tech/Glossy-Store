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

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-black dark:text-white mb-4">Reset Password</h1>
        {step === 'request' ? (
          <form onSubmit={requestOtp} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
            />
            <button disabled={loading} className="w-full bg-red-500 text-white py-3 rounded hover:bg-red-600 disabled:opacity-60">
              {loading ? 'Requesting...' : 'Request OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
            />
            <input
              type="text"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="OTP"
              maxLength={6}
              inputMode="numeric"
              className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
            />
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
            />
            <button disabled={loading} className="w-full bg-red-500 text-white py-3 rounded hover:bg-red-600 disabled:opacity-60">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
        <div className="mt-4 text-sm">
          <Link to="/login" className="text-red-500 hover:underline">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
