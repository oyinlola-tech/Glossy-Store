import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';

type OtpPurpose = 'registration' | 'login';

const PURPOSE_LABEL: Record<OtpPurpose, string> = {
  registration: 'Complete Registration',
  login: 'Complete Login',
};

export function OtpVerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyLoginOTP } = useAuth();

  const email = useMemo(() => searchParams.get('email')?.trim().toLowerCase() || '', [searchParams]);
  const rawPurpose = (searchParams.get('purpose') || '').trim().toLowerCase();
  const purpose: OtpPurpose | null = rawPurpose === 'registration' || rawPurpose === 'login' ? rawPurpose : null;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const isOtpValid = /^\d{6}$/.test(otp.trim());

  if (!email || !purpose) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f7f1eb] via-white to-[#f8efe6] dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex">
        <div
          className="hidden lg:block lg:w-1/2 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1400&q=80')",
          }}
        >
          <div className="h-full w-full bg-black/55 flex items-center justify-center p-12">
            <div className="text-center max-w-md">
              <div className="text-5xl mb-5 text-[#f4d992] font-bold tracking-[0.2em]">GLOSSY</div>
              <h2 className="text-3xl font-bold text-white">Secure checkout access</h2>
              <p className="mt-4 text-gray-200">Verify to continue your shopping journey.</p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md bg-white/95 dark:bg-gray-800 rounded-2xl border border-[#eadfce] shadow-[0_24px_60px_rgba(31,36,48,0.15)] p-6">
            <h1 className="text-2xl font-bold text-black dark:text-white mb-3">OTP Verification</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              This OTP link is incomplete. Please restart login or registration.
            </p>
            <div className="flex gap-3">
              <Link to="/login" className="text-[#b42318] hover:underline">Go to Login</Link>
              <Link to="/register" className="text-[#b42318] hover:underline">Go to Register</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedOtp = otp.trim();
    if (!/^\d{6}$/.test(normalizedOtp)) {
      toast.error('OTP must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      if (purpose === 'login') {
        await verifyLoginOTP(email, normalizedOtp);
        toast.success('Login successful');
        navigate('/');
        return;
      }

      await api.verifyOTP({ email, otp: normalizedOtp, purpose: 'registration' });
      toast.success('Registration verified. Please log in.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.resendOTP({ email, purpose });
      toast.success('A new OTP has been sent');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f1eb] via-white to-[#f8efe6] dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex">
      <div
        className="hidden lg:block lg:w-1/2 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=1400&q=80')",
        }}
      >
        <div className="h-full w-full bg-black/55 flex items-center justify-center p-12">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-5 text-[#f4d992] font-bold tracking-[0.2em]">GLOSSY</div>
            <h2 className="text-3xl font-bold text-white">Verify to continue</h2>
            <p className="mt-4 text-gray-200">Access your cart and order updates.</p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white/95 dark:bg-gray-800 rounded-2xl border border-[#eadfce] shadow-[0_24px_60px_rgba(31,36,48,0.15)] p-6">
          <h1 className="text-2xl font-bold text-black dark:text-white mb-1">{PURPOSE_LABEL[purpose]}</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Enter the 6-digit OTP sent to <span className="font-medium">{email}</span>.
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="text"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-label="One time password"
              maxLength={6}
              className="w-full px-4 py-3 rounded border border-[#d8cdbf] dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white focus:border-[#b42318] outline-none"
            />

            <button
              type="submit"
              disabled={loading || !isOtpValid}
              className="w-full bg-[#b42318] text-white py-3 rounded hover:bg-[#8f1b12] transition-colors disabled:opacity-60"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          <button
            type="button"
            disabled={resending || loading}
            onClick={handleResend}
            className="w-full mt-3 text-[#b42318] hover:underline disabled:opacity-60"
          >
            {resending ? 'Resending...' : 'Resend OTP'}
          </button>

          <div className="mt-4 text-sm">
            <Link to={purpose === 'login' ? '/login' : '/register'} className="text-gray-600 dark:text-gray-300 hover:underline">
              Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
