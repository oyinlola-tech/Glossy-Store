
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles/index.css';

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

window.addEventListener('error', (event) => {
  console.error('Unhandled runtime error:', event.error || event.message);
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element was not found');
}

createRoot(rootElement).render(<App />);
  
