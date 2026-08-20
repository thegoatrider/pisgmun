import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';

// Pages (to be implemented)
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Committees } from './pages/Committees';
import { CommitteeDetail } from './pages/CommitteeDetail';
import { Rules } from './pages/Rules';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Success } from './pages/Success';

// Dashboards (to be implemented)
import { DelegateDashboard } from './pages/Dashboard/DelegateDashboard';
import { InChargeDashboard } from './pages/Dashboard/InChargeDashboard';
import { CoordinatorDashboard } from './pages/Dashboard/CoordinatorDashboard';
import { Spinner } from './components/UI/Spinner';

// Route Guard Component
interface GuardProps {
  children: React.ReactElement;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<GuardProps> = ({ children, allowedRoles }) => {
  const { role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', width: '100%', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-main)' }}>
        <div className="text-center">
          <Spinner size="lg" />
          <p style={{ marginTop: '1rem', fontWeight: 600, color: 'var(--color-primary)' }}>Authenticating Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !role) {
    return <Navigate to="/login" replace />;
  }

  // Coordinator bypasses all guards, otherwise check if role is allowed
  if (role !== 'coordinator' && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Layout Wrapper to conditionally render Navbar and Footer
const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 70px - 340px)' }}>{children}</main>
      <Footer />
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes inside standard layout wrapper */}
          <Route path="/" element={<LayoutWrapper><Home /></LayoutWrapper>} />
          <Route path="/about" element={<LayoutWrapper><About /></LayoutWrapper>} />
          <Route path="/committees" element={<LayoutWrapper><Committees /></LayoutWrapper>} />
          <Route path="/committees/:id" element={<LayoutWrapper><CommitteeDetail /></LayoutWrapper>} />
          <Route path="/rules" element={<LayoutWrapper><Rules /></LayoutWrapper>} />
          <Route path="/contact" element={<LayoutWrapper><Contact /></LayoutWrapper>} />
          <Route path="/login" element={<LayoutWrapper><Login /></LayoutWrapper>} />
          <Route path="/register" element={<LayoutWrapper><Register /></LayoutWrapper>} />
          <Route path="/success" element={<LayoutWrapper><Success /></LayoutWrapper>} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard/delegate"
            element={
              <ProtectedRoute allowedRoles={['delegate']}>
                <LayoutWrapper>
                  <DelegateDashboard />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/in-charge"
            element={
              <ProtectedRoute allowedRoles={['in_charge']}>
                <LayoutWrapper>
                  <InChargeDashboard />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/coordinator"
            element={
              <ProtectedRoute allowedRoles={['coordinator']}>
                <LayoutWrapper>
                  <CoordinatorDashboard />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
