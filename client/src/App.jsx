import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { ToastProvider } from './utils/Toast';
import { FeatureProvider } from './features/FeatureProvider';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <FeatureProvider>
          <AppRoutes />
        </FeatureProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
