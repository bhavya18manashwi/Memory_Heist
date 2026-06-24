import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { handleClientFallback } from './apiFallback.ts';

// Global API Interceptor for seamless static deployments (e.g. Vercel, GitHub Pages)
const originalFetch = window.fetch;

try {
  Object.defineProperty(window, 'fetch', {
    value: async function (input: RequestInfo | URL, init?: RequestInit) {
      const url = typeof input === 'string' ? input : (input instanceof URL ? input.href : (input as Request).url);
      
      if (url.startsWith('/api/') || url.includes('/api/')) {
        try {
          const response = await originalFetch(input, init);
          const contentType = response.headers.get('content-type');
          
          // If server returned valid JSON, use it!
          if (response.ok && contentType && contentType.includes('application/json')) {
            return response;
          }
          
          // If we got a Vercel/Static 404 HTML, or other non-JSON response, activate client fallback
          if (!response.ok || (contentType && contentType.includes('text/html'))) {
            return await handleClientFallback(url, init);
          }
          return response;
        } catch (err) {
          // Network error or offline
          return await handleClientFallback(url, init);
        }
      }
      return originalFetch(input, init);
    },
    writable: true,
    configurable: true
  });
} catch (e) {
  // Safe fallback if defineProperty is also restricted
  console.warn('Global fetch redirection fallback standby:', e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

