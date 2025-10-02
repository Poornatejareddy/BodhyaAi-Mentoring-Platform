import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a loading spinner or message while checking auth status
    return <div>Loading...</div>;
  }

  // If user is not logged in, redirect to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If roles are specified and the user's role is not included, redirect
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // You can redirect to an "Unauthorized" page or back to a safe route
    return <Navigate to="/unauthorized" replace />;
  }
  
  // If everything is okay, render the nested routes
  return <Outlet />;
}

export default ProtectedRoute;