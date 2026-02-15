import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { router } from './routes';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import * as api from './services/api';
import { setCurrencyProfile } from './utils/currency';

export default function App() {
  const [, setCurrencyVersion] = useState(0);

  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const profile = await api.getCurrencyProfile();
        setCurrencyProfile(profile);
        setCurrencyVersion((prev) => prev + 1);
      } catch {
        // Keep default NGN profile on failure.
      }
    };
    void loadCurrency();
  }, []);

  return (
    <AppErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}
