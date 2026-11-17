import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('staysync_token');
    const savedUser = localStorage.getItem('staysync_user');

    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed === 'object' && parsed.role) {
          setUser(parsed);
        } else {
          logout();
        }

        // Safety timeout: ensure loading state never hangs longer than 1.5s
        const safetyTimer = setTimeout(() => {
          if (isMounted) setLoading(false);
        }, 1500);

        // Validate and refresh profile from server
        api.getMe()
          .then(res => {
            if (!isMounted) return;
            if (res.data && res.data.user) {
              setUser(res.data.user);
              localStorage.setItem('staysync_user', JSON.stringify(res.data.user));
            } else {
              logout();
            }
          })
          .catch((err) => {
            if (!isMounted) return;
            console.warn('Session verification failed, logging out:', err.message);
            logout();
          })
          .finally(() => {
            clearTimeout(safetyTimer);
            if (isMounted) setLoading(false);
          });
      } catch (e) {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    const { user, token } = res.data;
    localStorage.setItem('staysync_token', token);
    localStorage.setItem('staysync_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    const { user, token } = res.data;
    localStorage.setItem('staysync_token', token);
    localStorage.setItem('staysync_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    try {
      localStorage.removeItem('staysync_token');
      localStorage.removeItem('staysync_user');
    } catch (e) {
      console.error('Error clearing localStorage on logout:', e);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
