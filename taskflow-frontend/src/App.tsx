import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Loader2 } from 'lucide-react';

const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const VerifyOtpPage = lazy(() => import('./pages/auth/VerifyOtpPage').then(m => ({ default: m.VerifyOtpPage })));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout').then(m => ({ default: m.DashboardLayout })));
const DashboardOverviewPage = lazy(() => import('./pages/dashboard/DashboardOverviewPage').then(m => ({ default: m.DashboardOverviewPage })));
const WorkspacesPage = lazy(() => import('./pages/workspace/WorkspacesPage').then(m => ({ default: m.WorkspacesPage })));
const CreateWorkspacePage = lazy(() => import('./pages/workspace/CreateWorkspacePage').then(m => ({ default: m.CreateWorkspacePage })));
const WorkspaceDetailPage = lazy(() => import('./pages/workspace/WorkspaceDetailPage').then(m => ({ default: m.WorkspaceDetailPage })));
const ProjectTasksPage = lazy(() => import('./pages/project/ProjectTasksPage').then(m => ({ default: m.ProjectTasksPage })));
const GlobalTasksPage = lazy(() => import('./pages/tasks/GlobalTasksPage').then(m => ({ default: m.GlobalTasksPage })));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));

// Loading Fallback Component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1120]">
    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Suspense fallback={<PageLoader />}>
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
          
          {/* Project Routes */}
          <Route path="projects/:id" element={<ProjectTasksPage />} />

          {/* Global Tasks */}
          <Route path="tasks" element={<GlobalTasksPage />} />
          
          {/* Settings */}
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Catch All */}
        <Route path="*" element={isAuthenticated ? <NotFoundPage /> : <Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};

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
