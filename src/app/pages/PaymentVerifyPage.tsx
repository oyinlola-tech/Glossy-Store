import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import * as api from '../services/api';

export function PaymentVerifyPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const reference = searchParams.get('reference') || '';

  useEffect(() => {
    const verify = async () => {
      if (!reference) {
        setStatus('failed');
        return;
      }
      try {
        const result = await api.verifyPaystackPayment(reference);
        if (result.status === 'success') {
          setStatus('success');
          toast.success('Payment verified successfully');
        } else {
          setStatus('failed');
          toast.error('Payment verification failed');
        }
      } catch (error: any) {
        setStatus('failed');
        toast.error(error.message || 'Payment verification failed');
      }
    };
    void verify();
  }, [reference]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-center shadow">
        <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Payment Status</h1>
        {status === 'pending' ? (
          <p className="text-gray-600 dark:text-gray-300">Verifying your payment...</p>
        ) : status === 'success' ? (
          <p className="text-green-600 dark:text-green-300">Payment confirmed. Thank you!</p>
        ) : (
          <p className="text-red-500">Payment could not be verified.</p>
        )}
        <div className="mt-4">
          <Link to="/orders" className="text-[#b42318] hover:underline">Go to Orders</Link>
        </div>
      </div>
    </div>
  );
}
