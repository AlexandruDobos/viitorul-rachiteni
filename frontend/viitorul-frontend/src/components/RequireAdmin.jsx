import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const RequireAdmin = ({ children }) => {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  if (user === null) {
    // încă nu a fost determinat user-ul (sau nu e autentificat deloc)
    return <div>Loading...</div>; // sau un spinner
  }

  if (!user.role || user.role !== 'ADMIN') {
    console.log("User invalid sau fără rol admin:", user);
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAdmin;
