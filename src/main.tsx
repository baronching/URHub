import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Handle and suppress benign Vite HMR WebSocket connection closed warnings in sandboxed/iframe environments
if (typeof window !== 'undefined') {
  const isWs = (str: string) => {
    const s = str.toLowerCase();
    return s.includes('websocket') || s.includes('failed to connect') || s.includes('[vite]');
  };

  const origConsoleError = console.error;
  console.error = (...args: any[]) => {
    const msg = args.map((a) => (a?.message ? a.message : String(a))).join(' ');
    if (isWs(msg)) return;
    origConsoleError(...args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    const errorMsg = event.reason?.message || event.reason?.toString?.() || '';
    if (typeof errorMsg === 'string' && isWs(errorMsg)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const errorMsg = event.message || event.error?.message || '';
    if (typeof errorMsg === 'string' && isWs(errorMsg)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
