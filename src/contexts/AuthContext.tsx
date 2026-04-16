import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabase';

export interface AppUser {
  id: string;
  username: string;
  is_admin: boolean;
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  login: (username: string) => Promise<'ok' | 'not_found'>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = 'sc_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
    setLoading(false);
  }, []);

  const login = async (username: string): Promise<'ok' | 'not_found'> => {
    const { data, error } = await supabase
      .from('app_users')
      .select('id, username, is_admin')
      .eq('username', username.trim())
      .single();

    if (error || !data) return 'not_found';

    const appUser: AppUser = { id: data.id, username: data.username, is_admin: data.is_admin };
    setUser(appUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(appUser));
    return 'ok';
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
