import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { VerifyOtpPage } from './pages/auth/VerifyOtpPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardOverviewPage } from './pages/dashboard/DashboardOverviewPage';

import { WorkspacesPage } from './pages/workspace/WorkspacesPage';
import { CreateWorkspacePage } from './pages/workspace/CreateWorkspacePage';
import { WorkspaceDetailPage } from './pages/workspace/WorkspaceDetailPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" replace />} />
      <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPasswordPage /> : <Navigate to="/" replace />} />
      <Route path="/verify-otp" element={!isAuthenticated ? <VerifyOtpPage /> : <Navigate to="/" replace />} />
      <Route path="/verify-email" element={!isAuthenticated ? <VerifyEmailPage /> : <Navigate to="/" replace />} />
      <Route path="/reset-password" element={!isAuthenticated ? <ResetPasswordPage /> : <Navigate to="/" replace />} />
      
      {/* Protected Dashboard Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        } 
      >
        <Route index element={<DashboardOverviewPage />} />
        
        {/* Workspace Routes */}
        <Route path="workspaces" element={<WorkspacesPage />} />
        <Route path="workspaces/create" element={<CreateWorkspacePage />} />
        <Route path="workspaces/:id" element={<WorkspaceDetailPage />} />
      </Route>

      {/* Catch All */}
      <Route path="*" element={isAuthenticated ? <NotFoundPage /> : <Navigate to="/login" replace />} />
    </Routes>
  );
};

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: '!bg-white !text-slate-900 dark:!bg-slate-800 dark:!text-white dark:!border dark:!border-white/10'
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
