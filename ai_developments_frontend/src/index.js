import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Routes from './Routes';

// Parse URL flags once at startup to set a global mock override.
// Supports ?mock=1 or ?mock=true and #mock
(function bootstrapMockFlag() {
  try {
    const searchParams = new URLSearchParams(window.location.search || '');
    const mockParam = searchParams.get('mock');
    const hasQueryMock = mockParam && ['1', 'true', 'on', 'yes'].includes(String(mockParam).toLowerCase());
    const hasHashMock = (window.location.hash || '').toLowerCase().includes('mock');
    if (hasQueryMock || hasHashMock) {
      // PUBLIC_INTERFACE
      window.__USE_MOCK = true; // Allows services to bypass env issues
    }
  } catch {
    // no-op
  }
})();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Routes />
  </React.StrictMode>
);
