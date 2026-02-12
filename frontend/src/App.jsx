import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { I18nProvider } from './contexts/I18nContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import SuperAdmin from './pages/SuperAdmin';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import SelfCheckin from './pages/SelfCheckin';
import AttendanceDashboard from './pages/AttendanceDashboard';
import UsersManager from './pages/UsersManager';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/dashboard/superadmin" 
          element={
            <ProtectedRoute allowedRoles={['SuperAdmin']}>
              <SuperAdmin />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard/admin" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/attendance" 
          element={
            <ProtectedRoute allowedRoles={['Admin','SuperAdmin']}>
              <AttendanceDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/users" 
          element={
            <ProtectedRoute allowedRoles={['Admin','SuperAdmin']}>
              <UsersManager />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard/user" 
          element={
            <ProtectedRoute allowedRoles={['User']}>
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/checkin" 
          element={
            <ProtectedRoute allowedRoles={['User']}>
              <SelfCheckin />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              {user?.role === 'SuperAdmin' && <Navigate to="/dashboard/superadmin" />}
              {user?.role === 'Admin' && <Navigate to="/dashboard/admin" />}
              {user?.role === 'User' && <Navigate to="/dashboard/user" />}
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <I18nProvider>
        <Router>
          <AppRoutes />
        </Router>
      </I18nProvider>
    </AuthProvider>
  );
}

export default App;
