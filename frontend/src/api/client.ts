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
    let fullUrl: string;

    // Check if baseUrl is absolute (starts with http)
    if (this.baseUrl.startsWith('http')) {
      // Direct connection to backend
      fullUrl = `${this.baseUrl}${endpoint}`;
      console.log(`🔗 Building direct URL: ${fullUrl}`);
    } else {
      // Relative URL for proxy
      fullUrl = `${this.baseUrl}${endpoint}`;
      if (!fullUrl.startsWith('/')) {
        fullUrl = `/${fullUrl}`;
      }
      console.log(`🔗 Building relative URL: ${fullUrl}`);
    }

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
      const separator = fullUrl.includes('?') ? '&' : '?';
      fullUrl = `${fullUrl}${separator}${searchParams.toString()}`;
    }

    console.log(`✅ Final API URL: ${fullUrl}`);
    return fullUrl;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, timeout = this.timeout, ...fetchOptions } = options;

    const url = this.buildUrl(endpoint, params);
    console.log(`🚀 Making ${fetchOptions.method || 'GET'} request to: ${url}`);
    const headers = {
      ...this.defaultHeaders,
      ...fetchOptions.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      console.log(`📡 Sending fetch request to: ${url}`);
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`📡 Response received: ${response.status} ${response.statusText}`);
      console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()));

      const contentType = response.headers.get('content-type');
      console.log(`📡 Content-Type: ${contentType}`);

      // Clone response to avoid body stream issues
      const responseClone = response.clone();

      // Check status first before reading body
      if (!response.ok) {
        console.error(`📡 HTTP Error ${response.status}`);

        // Try to read error details from response
        let errorData: any = {};
        try {
          if (contentType?.includes('application/json')) {
            errorData = await responseClone.json();
          } else {
            const textData = await responseClone.text();
            errorData = { message: textData };
          }
        } catch (parseError) {
          console.error(`📡 Error parse failed:`, parseError);
          errorData = { message: response.statusText };
        }

        const errorMessage = errorData?.error || errorData?.message || response.statusText || 'Unknown error';
        throw new ApiError(
          `HTTP ${response.status}: ${errorMessage}`,
          response.status,
          errorData,
          errorData?.errorType
        );
      }

      // Read successful response body
      let data: any;
      try {
        if (contentType?.includes('application/json')) {
          data = await response.json();
          console.log(`📡 Parsed JSON data:`, data);
        } else {
          data = await response.text();
          console.log(`📡 Response text:`, data.substring(0, 200));
        }
      } catch (parseError) {
        console.error(`📡 Parse error:`, parseError);
        throw new ApiError(
          `Failed to parse response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
          response.status
        );
      }

      console.log(`✅ API call successful:`, data);
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        console.error(`📡 API Error ${error.status}:`, error.message);
        throw error;
      }

      if (error instanceof Error) {
        console.error(`📡 Request Error:`, error.message);
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout', 408);
        }
        if (error.message.includes('Failed to fetch')) {
          throw new ApiError('Network error - could not connect to server', 0, error);
        }
        throw new ApiError(error.message, 0, error);
      }

      console.error(`📡 Unknown Error:`, error);
      throw new ApiError('Unknown error occurred', 0, error);
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
  // Проверяем переменную окружения
  if (import.meta.env.VITE_API_BASE_URL) {
    console.log('🔧 Using VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
    return import.meta.env.VITE_API_BASE_URL;
  }

  // В облачной среде пытаемся использовать относительный путь для прокси
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // Если это облачная среда, используем относительный путь
    if (hostname.includes('builder.codes') || hostname.includes('fly.dev')) {
      const apiUrl = '/api';
      console.log('🌩️ Cloud environment - using relative API URL for proxy:', apiUrl);
      return apiUrl;
    }
  }

  // Fallback
  const fallbackUrl = '/api';
  console.log('🔄 Using fallback API URL:', fallbackUrl);
  return fallbackUrl;
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
