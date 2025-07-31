import { APIResponse, PaginatedResponse, FilterOptions } from '../types';

// Force recompilation - 2025-01-30

export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
}

export interface RequestOptions extends RequestInit {
  timeout?: number;
  params?: Record<string, any>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any,
    public errorType?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.timeout = config.timeout || 30000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.defaultHeaders,
    };
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    // Always build relative path for proxy to intercept
    let relativePath = `${this.baseUrl}${endpoint}`;

    // Ensure it starts with / for relative URL
    if (!relativePath.startsWith('/')) {
      relativePath = `/${relativePath}`;
    }

    console.log(`🔗 Building relative URL: ${relativePath}`);

    // Add query parameters if present
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
      relativePath = `${relativePath}?${searchParams.toString()}`;
    }

    console.log(`✅ Final relative URL for proxy: ${relativePath}`);
    return relativePath;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, timeout = this.timeout, ...fetchOptions } = options;
    
    const url = this.buildUrl(endpoint, params);
    const headers = {
      ...this.defaultHeaders,
      ...fetchOptions.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check response status first, then read body
      let data: any;
      const contentType = response.headers.get('content-type');

      try {
        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }
      } catch (parseError) {
        // If we can't parse the response, create a generic error
        if (!response.ok) {
          throw new ApiError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status
          );
        }
        throw new ApiError('Failed to parse response', response.status);
      }

      if (!response.ok) {
        throw new ApiError(
          data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          data,
          data?.errorType
        );
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout', 408);
        }
        throw new ApiError(error.message, 0);
      }
      
      throw new ApiError('Unknown error occurred', 0);
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Utility methods
  setDefaultHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  removeDefaultHeader(key: string): void {
    delete this.defaultHeaders[key];
  }

  setAuthToken(token: string): void {
    this.setDefaultHeader('Authorization', `Bearer ${token}`);
  }

  clearAuth(): void {
    this.removeDefaultHeader('Authorization');
  }
}

// Create default API client instance
const getApiBaseUrl = (): string => {
  // Сначала провер��ем переменную окружения
  if (import.meta.env.VITE_API_BASE_URL) {
    console.log('Using VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Если в браузере
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;

    // Локальная разработка - всегда используем localhost:3000
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const apiUrl = 'http://localhost:3000/api';
      console.log('Using localhost API:', apiUrl);
      return apiUrl;
    }

    // Облачная среда - используем относительный путь через прокси
    const cloudApiUrl = '/api';
    console.log('Using cloud API URL (relative):', cloudApiUrl);
    return cloudApiUrl;
  }

  // Fallback
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

console.log('=== API Configuration ===');
console.log('API Base URL:', API_BASE_URL);
console.log('API Base URL type:', typeof API_BASE_URL);
console.log('API Base URL length:', API_BASE_URL.length);
console.log('Environment:', import.meta.env.MODE);
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('Window location:', typeof window !== 'undefined' ? window.location.href : 'N/A');
console.log('Window origin:', typeof window !== 'undefined' ? window.location.origin : 'N/A');
console.log('========================');

export const apiClient = new ApiClient({
  baseUrl: API_BASE_URL,
  timeout: 30000,
});

// Helper functions for common API patterns
export const createPaginatedRequest = (
  page: number = 1,
  limit: number = 20,
  filters?: FilterOptions
) => {
  return {
    page,
    limit,
    ...filters,
  };
};

export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export default apiClient;
