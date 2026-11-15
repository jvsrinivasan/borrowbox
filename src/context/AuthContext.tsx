import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getCurrentUser, loginUser, logoutUser, registerUser } from '../store';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => User | null;
  register: (name: string, email: string, password: string, apartment: string, building: string) => User | null;
  logout: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getCurrentUser());

  const refresh = useCallback(() => {
    setUser(getCurrentUser());
  }, []);

  const login = useCallback((email: string, password: string) => {
    const u = loginUser(email, password);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(
    (name: string, email: string, password: string, apartment: string, building: string) => {
      const u = registerUser(name, email, password, apartment, building);
      setUser(u);
      return u;
    },
    []
  );

  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
  }, []);

  // keep state in sync if changed in another tab
  useEffect(() => {
    const handler = () => setUser(getCurrentUser());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
