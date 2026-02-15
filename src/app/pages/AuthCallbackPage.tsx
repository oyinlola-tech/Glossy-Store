import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export function AuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { applyOAuth } = useAuth();

  useEffect(() => {
    const token = params.get('token');
    const id = params.get('id');
    const name = params.get('name');
    const email = params.get('email');
    const role = (params.get('role') || 'user') as 'user' | 'admin' | 'superadmin';
    const isSuper = params.get('is_super_admin') === 'true';

    if (!token || !id || !name || !email) {
      toast.error('Social login failed. Please try again.');
      navigate('/login', { replace: true });
      return;
    }

    applyOAuth({
      token,
      user: { id, name, email, role, is_super_admin: isSuper },
    });
    toast.success('Login successful');
    navigate('/', { replace: true });
  }, [applyOAuth, navigate, params]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="text-gray-600 dark:text-gray-300">Completing sign-in...</div>
    </div>
  );
}
