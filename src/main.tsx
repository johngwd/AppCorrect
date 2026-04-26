import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

/** Monte l'application React et enregistre le service worker pour l'usage PWA. */
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // L'application reste utilisable si le navigateur refuse le mode hors ligne.
      });
    });
  }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

registerServiceWorker();
