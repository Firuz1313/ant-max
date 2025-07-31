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
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      console.log(`📡 Response: ${response.status} ${response.statusText}`);
      const contentType = response.headers.get('content-type');

      // Read response body only once
      let responseData: any;
      
      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      console.log(`📡 Response data:`, responseData);

      if (!response.ok) {
        const errorMessage = responseData?.error || responseData?.message || response.statusText;
        throw new ApiError(
          `HTTP ${response.status}: ${errorMessage}`,
          response.status,
          responseData
        );
      }

      return responseData;
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
}

// Create default API client instance
const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    console.log('🌐 Current location:', window.location.href);
    
    // В облачной среде fly.dev/builder.codes
    if (hostname.includes('builder.codes') || hostname.includes('fly.dev')) {
      // Сначала пробуем proxy
      const proxyUrl = '/api';
      console.log('🌩️ Cloud environment - trying proxy URL:', proxyUrl);
      return proxyUrl;
    }
    
    // Локальная разработка - прямое подключение к бэкенду
    if (hostname === 'localhost' && port === '8080') {
      const directUrl = 'http://localhost:3000/api';
      console.log('🏠 Local development - using direct connection:', directUrl);
      return directUrl;
    }
  }

  // Default fallback
  const defaultUrl = '/api';
  console.log('🔄 Using default API URL:', defaultUrl);
  return defaultUrl;
};

const API_BASE_URL = getApiBaseUrl();

console.log('=== API Configuration ===');
console.log('API Base URL:', API_BASE_URL);
console.log('========================');

export const apiClient = new ApiClient({
  baseUrl: API_BASE_URL,
  timeout: 30000,
});

export default apiClient;
