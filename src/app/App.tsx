import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { router } from './routes';
import { SupportChatWidget } from './components/SupportChatWidget';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <SupportChatWidget />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </ThemeProvider>
  );
}
