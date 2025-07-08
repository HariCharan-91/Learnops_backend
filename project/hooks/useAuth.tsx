'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/features/auth/services/auth.service';
import { StorageService, STORAGE_KEYS } from '@/utils/storage';
import { apiService } from '@/services/api.service';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    // Register auth callbacks with the API service
    apiService.setAuthCallbacks(refreshToken, signOut);
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Checking auth status...');
      
      const token = StorageService.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) {
        console.log('❌ No token found in localStorage');
        setUser(null);
        setIsLoading(false);
        return;
      }

      const data = await authService.getProfile();
      
      if (data.profile) {
        const userData = authService.transformUserData({
          id: data.profile.id,
          email: data.profile.email,
          user_metadata: { full_name: data.profile.full_name }
        });
        setUser(userData);
        console.log('✅ User authenticated:', userData);
      } else {
        setUser(null);
        StorageService.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        console.log('❌ No authenticated user');
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      setUser(null);
      StorageService.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('🔐 Signing in...');
      
      const data = await authService.signIn(email, password);

      if (data.session?.access_token) {
        StorageService.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.session.access_token);
        const userData = authService.transformUserData(data.user);
        setUser(userData);
        console.log('✅ Sign in successful:', userData);
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      console.error('❌ Sign in failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      console.log('🔐 Signing in with Google...');
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    } catch (error) {
      console.error('❌ Google sign in failed:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      console.log('📝 Signing up...');
      
      const data = await authService.signUp(email, password, name);

      if (data.session?.access_token) {
        StorageService.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.session.access_token);
        const userData = authService.transformUserData(data.user, name);
        setUser(userData);
        console.log('✅ Sign up successful:', userData);
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      console.error('❌ Sign up failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      console.log('🚪 Signing out...');
      
      await authService.signOut();
      StorageService.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      setUser(null);
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Sign out failed:', error);
      StorageService.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      console.log('🔄 Refreshing token...');
      
      const data = await authService.refreshToken();

      if (data.session?.access_token) {
        StorageService.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.session.access_token);
        const userData = authService.transformUserData(data.user);
        setUser(userData);
        console.log('✅ Token refresh successful:', userData);
        return true;
      } else {
        StorageService.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        setUser(null);
        console.log('❌ Token refresh failed - no token');
        return false;
      }
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      StorageService.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      setUser(null);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}