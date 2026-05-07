import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { loading } = useAuth();
  const token = localStorage.getItem('jwt_token');
  const location = useLocation();
  
  if (loading) {
    return null; // or a loader component
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
