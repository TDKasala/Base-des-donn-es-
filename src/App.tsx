/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Schools } from './pages/Schools';
import { AdminUsers } from './pages/AdminUsers';
import { Login } from './pages/Login';
import { PWAUpdatePrompt } from './components/PWAUpdatePrompt';

function ProtectedRoutes() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Route path="/" element={<Layout />}>
      <Route index element={<Dashboard />} />
      <Route path="schools" element={<Schools />} />
      <Route path="admin/users" element={<AdminUsers />} />
    </Route>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <PWAUpdatePrompt />
        <Routes>
          <Route path="/login" element={<AuthRedirect />} />
          <Route path="/*" element={<AppRoutes />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function AuthRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <Login />;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="schools" element={<Schools />} />
        <Route path="admin/users" element={<AdminUsers />} />
      </Route>
    </Routes>
  );
}
