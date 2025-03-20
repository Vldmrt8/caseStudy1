import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const auth = useContext(AuthContext);

  if (!auth || !auth.user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(auth.user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;
