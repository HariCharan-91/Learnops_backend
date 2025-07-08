// Authentication service
import { apiService } from '@/services/api.service';
import { API_ENDPOINTS } from '@/constants/api';
import { User } from '@/types';

export interface AuthResponse {
  user: any;
  session: {
    access_token: string;
  };
}

export class AuthService {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    return apiService.post<AuthResponse>(API_ENDPOINTS.AUTH.SIGNIN, {
      email,
      password,
    });
  }

  async signUp(email: string, password: string, name: string): Promise<AuthResponse> {
    return apiService.post<AuthResponse>(API_ENDPOINTS.AUTH.SIGNUP, {
      email,
      password,
      name,
    });
  }

  async signOut(): Promise<void> {
    return apiService.post<void>(API_ENDPOINTS.AUTH.SIGNOUT);
  }

  async refreshToken(): Promise<AuthResponse> {
    return apiService.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH);
  }

  async getProfile(): Promise<{ profile: any }> {
    return apiService.get<{ profile: any }>(API_ENDPOINTS.PROFILE);
  }

  transformUserData(userData: any, name?: string): User {
    return {
      id: userData.id,
      name: userData.user_metadata?.full_name || name || userData.email,
      email: userData.email,
      avatar: userData.user_metadata?.avatar_url,
    };
  }
}

export const authService = new AuthService();