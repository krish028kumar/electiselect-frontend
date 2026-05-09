import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('jwt_token');
  const location = useLocation();
  
  if (loading) {
    return null; // or a loader component
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // If user has a token but wrong role, send them to their respective dashboard
    if (user.role === 'SUPER_ADMIN') return <Navigate to="/super-admin" replace />;
    if (user.role === 'ISE_ADMIN') return <Navigate to="/open-elective/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
