import React from 'react';
import ReactDOM from 'react-dom/client';

import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import { initDB } from './utils/indexedDB'; 

const root = ReactDOM.createRoot(document.getElementById('root'));

(async () => {
  await initDB();

  root.render(
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
})();
