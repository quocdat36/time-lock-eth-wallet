// client/src/index.js
import { Buffer } from 'buffer'; // Polyfill cho Buffer
window.Buffer = Buffer;

import process from 'process';   // Polyfill cho process
window.process = process;

import React from 'react';
import { createRoot } from 'react-dom/client'; // API mới của React 18
import App from './App';
import './index.css';
// import registerServiceWorker from './serviceWorker'; // Vẫn comment out khi debug

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Fatal: Root element with ID 'root' was not found in the HTML.");
}

// registerServiceWorker();