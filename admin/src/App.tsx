import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import { PageLoader } from './components/LoadingSpinner';

// Lazy load pages for code splitting
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const ArticlesPage = React.lazy(() => import('./pages/ArticlesPage'));
const UsersPage = React.lazy(() => import('./pages/UsersPage'));
const SourcesPage = React.lazy(() => import('./pages/SourcesPage'));
const CategoriesPage = React.lazy(() => import('./pages/CategoriesPage'));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage'));
const SystemPage = React.lazy(() => import('./pages/SystemPage'));

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

// Public route wrapper (redirects to dashboard if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <React.Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/articles"
              element={
                <ProtectedRoute>
                  <ArticlesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sources"
              element={
                <ProtectedRoute>
                  <SourcesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <CategoriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system"
              element={
                <ProtectedRoute>
                  <SystemPage />
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </ToastProvider>
    </ErrorBoundary>
  );
}
