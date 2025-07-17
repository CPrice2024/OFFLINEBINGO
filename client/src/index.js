import React from 'react';
import ReactDOM from 'react-dom/client';  // React 18 and above
// Global styles for the app
import { BrowserRouter } from 'react-router-dom';  // For routing
import { AuthProvider } from './context/AuthContext';  // Authentication Context
import AppRoutes from './routes/AppRoutes';  // Routes for different pages

// Creating the root element for React 18 and above
const root = ReactDOM.createRoot(document.getElementById('root'));

// Rendering the app wrapped with BrowserRouter and AuthProvider
root.render(
  <AuthProvider>  {/* Wrap the app with Auth context */}
    <BrowserRouter>  {/* BrowserRouter for routing */}
      <AppRoutes />  {/* Your routes */}
    </BrowserRouter>
  </AuthProvider>
);
