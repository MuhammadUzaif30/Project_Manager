import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrganizationsPage from './pages/OrganizationsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import OrganizationDetailPage from './pages/OrganizationDetailPage';
import IssueDetailPage from './pages/IssueDetailPage';
import { SocketProvider } from './context/SocketContext';
import DashboardPage from './pages/DashboardPage';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route
          path="/organization"
          element={
            <ProtectedRoute>
              <OrganizationsPage />
            </ProtectedRoute>
          }
      />

      <Route
          path="/organizations/:orgId/projects/:projectId/issues/:issueId"
          element={
            <ProtectedRoute>
              <IssueDetailPage />
            </ProtectedRoute>
          }
        />

      <Route
          path="/organizations/:orgId"
          element={
            <ProtectedRoute>
              <OrganizationDetailPage />
            </ProtectedRoute>
          }
      />
      
      <Route
          path="/organizations/:orgId/projects/:projectId/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

      <Route
        path="/organizations/:orgId/projects/:projectId"
        element={
          <ProtectedRoute>
            <ProjectDetailPage />
          </ProtectedRoute>
  }

      />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
export default App;