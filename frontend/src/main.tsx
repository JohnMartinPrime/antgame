import React from 'react';
import ReactDOM from 'react-dom/client';
// Side-effect import: PostHog initializes here, before the first React render,
// so session tracking starts as early as possible.
import './analytics/posthog';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
