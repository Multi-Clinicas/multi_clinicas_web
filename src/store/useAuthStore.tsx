"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// 1. Tipagens do Estado Global
export type UserRole = "SUPER_ADMIN" | "ADMIN" | "PATIENT" | "RECEPCIONISTA";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  activeTenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  setAuthData: (user: User, token: string, tenant?: Tenant) => void;
  clearAuthData: () => void;
  updateActiveTenant: (tenant: Tenant) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Chave para persistência no localStorage
const STORAGE_KEY = "@multiclinicas:auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    activeTenant: null,
    isAuthenticated: false,
    isLoading: true, // Começa carregando até checarmos o localStorage
  });

  // Carregar dados persistidos no carregamento inicial
  useEffect(() => {
    const storedAuth = localStorage.getItem(STORAGE_KEY);
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        setState({
          user: parsed.user,
          token: parsed.token,
          activeTenant: parsed.activeTenant,
          isAuthenticated: !!parsed.token,
          isLoading: false,
        });
      } catch (e) {
        console.error("Erro ao fazer parse do localStorage", e);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Persistir dados no localStorage sempre que houver mudanças de auth (exceto reload)
  const setAuthData = (user: User, token: string, activeTenant?: Tenant) => {
    const newState = {
      user,
      token,
      activeTenant: activeTenant || null,
      isAuthenticated: true,
      isLoading: false,
    };

    setState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    // Sincroniza também a chave de token que o interceptor do Axios consome
    localStorage.setItem('@multiclinicas:token', token);
  };

  const clearAuthData = () => {
    setState({
      user: null,
      token: null,
      activeTenant: null,
      isAuthenticated: false,
      isLoading: false,
    });
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('@multiclinicas:token');
  };

  const updateActiveTenant = (activeTenant: Tenant) => {
    setState(prev => {
      const newState = { ...prev, activeTenant };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, setAuthData, clearAuthData, updateActiveTenant }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthStore() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthStore deve ser usado dentro de um AuthProvider");
  }
  return context;
}
