import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('currentUser');
  
  if (!user) {
    // Redirect to login if no user is found in localStorage
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
