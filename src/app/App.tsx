import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { router } from './routes';
import { SupportChatWidget } from './components/SupportChatWidget';
import { AppErrorBoundary } from './components/AppErrorBoundary';

export default function App() {
  return (
    <AppErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
          <SupportChatWidget />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}
