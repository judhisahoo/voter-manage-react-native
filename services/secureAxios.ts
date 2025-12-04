import * as Crypto from 'expo-crypto';
import { router } from 'expo-router';
import { Platform } from 'react-native';
import { getStorageItem, removeStorageItem } from '../utils/storage';

// Helper for Token Management
const TOKEN_KEY = 'access_token';
const USER_KEY = 'user';

export const getToken = async () => await getStorageItem(TOKEN_KEY);
export const clearAuth = async () => {
  await removeStorageItem(TOKEN_KEY);
  await removeStorageItem(USER_KEY);
};

interface RequestConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

class SecureApiClient {
  private baseURL: string;
  private timeout: number;
  private maxRetries: number = 3;

  constructor(
    baseURL: string = process.env.EXPO_PUBLIC_API_URL || '',
    timeout: number = 30000
  ) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async getSecurityHeaders(
    headers: Record<string, string> = {}
  ): Promise<Record<string, string>> {
    const token = await getToken();
    
    // Generate UUID safely on both Web and Native
    let uuid = '';
    if (Platform.OS === 'web') {
        uuid = crypto.randomUUID();
    } else {
        uuid = Crypto.randomUUID();
    }

    return {
      'Content-Type': 'application/json',
      'X-Request-ID': uuid,
      'X-Request-Time': new Date().toISOString(),
      'X-API-Version': '1',
      'X-Client-Platform': Platform.OS === 'web' ? 'web' : 'mobile',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestConfig = {},
    retryCount: number = 0
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const startTime = Date.now();

    const headers = await this.getSecurityHeaders(options.headers);

    const config: RequestInit = {
      method: options.method || 'GET',
      headers: headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;

      if (__DEV__) {
        console.log(`✅ ${options.method || 'GET'} ${endpoint} - ${response.status} (${duration}ms)`);
      }

      // Handle 401 - Unauthorized
      if (response.status === 401) {
        await clearAuth();
        router.replace('/(auth)/login'); 
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        if (response.status >= 500 && retryCount < this.maxRetries) {
          console.warn(`Retrying request (${retryCount + 1}/${this.maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return this.request<T>(endpoint, options, retryCount + 1);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error: any) {
      console.error('❌ API Error:', {
        url: endpoint,
        error: error.message,
      });
      throw error;
    }
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    console.log('endpoint ::',endpoint);
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  async post<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, headers });
  }

  async put<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, headers });
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }

  async patch<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body, headers });
  }
}

export const apiClient = new SecureApiClient();