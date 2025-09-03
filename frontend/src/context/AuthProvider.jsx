import React, { useState, useEffect, useCallback, useRef } from 'react';
import AuthContext from './AuthContext';
import { BASE_URL } from '../utils/constants';

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const inFlight = useRef(false);

  const checkAuth = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const res = await fetch(`${BASE_URL}/auth/status`, { credentials: 'include' });
      if (!res.ok) throw new Error('status request failed');
      const data = await res.json();
      if (data?.authenticated) {
        setUser({ email: data.email, role: data.role, method: data.method });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
