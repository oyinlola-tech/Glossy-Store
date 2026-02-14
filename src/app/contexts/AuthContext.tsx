import React, { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../services/api';

export type UserRole = 'user' | 'admin' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ needOtp: boolean; message?: string }>;
  verifyLoginOTP: (email: string, otp: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const toUserRole = (role: 'user' | 'admin', isSuperAdmin?: boolean): UserRole => {
  if (role === 'admin' && isSuperAdmin) return 'superadmin';
  return role;
};

const normalizeStoredUser = (input: unknown): User | null => {
  if (!input || typeof input !== 'object') return null;
  const raw = input as Record<string, unknown>;
  if (!raw.token || !raw.email || !raw.name || !raw.id) return null;
  const rawRole = raw.role === 'superadmin' ? 'superadmin' : raw.role === 'admin' ? 'admin' : 'user';
  return {
    id: String(raw.id),
    name: String(raw.name),
    email: String(raw.email),
    role: rawRole,
    token: String(raw.token),
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const normalized = normalizeStoredUser(parsed);
        if (normalized) setUser(normalized);
        else localStorage.removeItem('user');
      } catch {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const register = async (name: string, email: string, password: string) => {
    await api.register({ name, email, password });
  };

  const verifyOTP = async (email: string, otp: string) => {
    await api.verifyOTP({ email, otp, purpose: 'registration' });
  };

  const login = async (email: string, password: string) => {
    const response = await api.login({ email, password });
    if ('needOtp' in response && response.needOtp) {
      return { needOtp: true, message: response.message };
    }

    const userData: User = {
      id: String(response.user.id),
      name: response.user.name,
      email: response.user.email,
      role: toUserRole(response.user.role, response.user.is_super_admin),
      token: response.token,
    };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return { needOtp: false };
  };

  const verifyLoginOTP = async (email: string, otp: string) => {
    const response = await api.verifyLoginOTP({ email, otp });
    const userData: User = {
      id: String(response.user.id),
      name: response.user.name,
      email: response.user.email,
      role: toUserRole(response.user.role, response.user.is_super_admin),
      token: response.token,
    };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
  };

  return (
    <AuthContext.Provider value={{ user, login, verifyLoginOTP, register, verifyOTP, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
