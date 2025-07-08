// Centralized API service
import { API_CONFIG } from '@/constants/api';

export class ApiService {
  private baseUrl: string;
  private timeout: number;
  private refreshTokenCallback: (() => Promise<boolean>) | null = null;
  private signOutCallback: (() => Promise<void>) | null = null;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  setAuthCallbacks(
    refreshToken: () => Promise<boolean>,
    signOut: () => Promise<void>
  ): void {
    this.refreshTokenCallback = refreshToken;
    this.signOutCallback = signOut;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {},
    isRetry: boolean = false
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('access_token');
    
    console.log(`🚀 Making request to: ${url}`);
    
    // Check if this is a sign-out related endpoint to prevent recursive loops
    const isSignOutEndpoint = endpoint.includes('/auth/signout') || endpoint.includes('/auth/logout') || endpoint.includes('/logout');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...options,
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
        credentials: 'include',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      // Handle 401 Unauthorized responses
      // Don't attempt token refresh for sign-out endpoints or if already retrying
      if (response.status === 401 && !isRetry && !isSignOutEndpoint && this.refreshTokenCallback) {
        console.log('🔄 Token expired, attempting refresh...');
        
        try {
          const refreshSuccess = await this.refreshTokenCallback();
          
          if (refreshSuccess) {
            console.log('✅ Token refreshed successfully, retrying request...');
            // Retry the original request with the new token
            return this.makeRequest<T>(endpoint, options, true);
          } else {
            console.log('❌ Token refresh failed, signing out...');
            if (this.signOutCallback) {
              await this.signOutCallback();
            }
            throw new Error('Session expired. Please sign in again.');
          }
        } catch (refreshError) {
          console.error('❌ Token refresh error:', refreshError);
          if (this.signOutCallback) {
            await this.signOutCallback();
          }
          throw new Error('Session expired. Please sign in again.');
        }
      }
      
      // For sign-out endpoints, if we get a 401, just treat it as success
      // since the token is already invalid anyway
      if (response.status === 401 && isSignOutEndpoint) {
        console.log('🔓 Sign-out endpoint returned 401 - treating as success since token is already invalid');
        return {} as T;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const responseText = await response.text();
      return responseText ? JSON.parse(responseText) : {};
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - Backend may be down');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();