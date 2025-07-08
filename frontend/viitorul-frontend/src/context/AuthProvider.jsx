import React, { useState, useEffect } from 'react';
import AuthContext from './AuthContext';
import { BASE_URL } from '../utils/constants';

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // user: { email, role, method }
    const [loading, setLoading] = useState(true);
    const checkAuth = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/auth/status`, {
                credentials: 'include',
            });

            const data = await res.json();

            if (data.authenticated) {
                setUser({
                    email: data.email,
                    role: data.role,
                    method: data.method,
                });
                console.log("Autentificat prin:", data.method);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false)
        }
    };
    
    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, setUser, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};



export default AuthProvider;
