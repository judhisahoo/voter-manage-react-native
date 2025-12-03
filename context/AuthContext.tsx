import { useRouter, useSegments } from 'expo-router';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';
import { getStorageItem, removeStorageItem, setStorageItem } from '../utils/storage';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'support';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'access_token';
const USER_KEY = 'user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const segments = useSegments();

  // 1. Initialize Auth State
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userData = await getStorageItem(USER_KEY);
        const token = await getStorageItem(TOKEN_KEY);

        if (userData && token) {
          setUser(JSON.parse(userData));
        }
      } catch (err) {
        console.error('Auth initialization failed:', err);
        await removeStorageItem(USER_KEY);
        await removeStorageItem(TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 2. Protect Routes (Redirect logic)
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (!user && !inAuthGroup) {
      // If not logged in and not in login screen, go to login
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // If logged in but in login screen, go to dashboard
      router.replace('/(drawer)/dashboard');
    }
  }, [user, loading, segments]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Using generic fetch to avoid circular dependency
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/login`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      console.log('login data ::',data);
      const { user: userData, access_token } = data;

      // Use safe storage utility
      await setStorageItem(USER_KEY, JSON.stringify(userData));
      await setStorageItem(TOKEN_KEY, access_token);

      setUser(userData);
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      console.error('Login error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await removeStorageItem(USER_KEY);
      await removeStorageItem(TOKEN_KEY);
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}