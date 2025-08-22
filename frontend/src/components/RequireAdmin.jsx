// src/components/RequireAdmin.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

export default function RequireAdmin({ children }) {
  const { user, loading } = useContext(AuthContext);

  // a) încă se încarcă informația de user -> arată un mic skeleton
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // b) nu e logat -> redirect home
  if (!user) return <Navigate to="/" replace />;

  // c) e logat dar nu e admin -> redirect home
  const isAdmin =
    user.isAdmin === true ||
    user.role === 'ADMIN' ||
    user.role === 'ROLE_ADMIN' ||
    (Array.isArray(user.roles) && user.roles.includes('ADMIN')) ||
    (Array.isArray(user.authorities) &&
      user.authorities.some(a => a === 'ADMIN' || a?.authority === 'ROLE_ADMIN'));

  if (!isAdmin) return <Navigate to="/" replace />;

  // d) e admin -> afișează conținutul protejat
  return children;
}
