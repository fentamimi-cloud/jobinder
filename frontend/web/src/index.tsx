import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './i18n/config';
import AppEnhanced from './AppEnhanced';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <AppEnhanced />
  </React.StrictMode>
);
