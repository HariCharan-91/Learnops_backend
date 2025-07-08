// Storage utilities
export class StorageService {
  static setItem(key: string, value: any): void {
    try {
      // If the value is already a string (like a JWT token), store it directly
      // Otherwise, JSON stringify it
      const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, valueToStore);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  static getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      // Try to parse as JSON first
      try {
        return JSON.parse(item);
      } catch (parseError) {
        // If JSON parsing fails, return the raw string
        // This handles cases like JWT tokens that are stored as plain strings
        return item as unknown as T;
      }
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return null;
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }

  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
}

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  CURRENT_SESSION: 'current_session',
  TEST_TOKEN: 'test_token',
} as const;