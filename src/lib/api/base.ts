import { ApiResponse, ServiceStatus } from './types';

export abstract class BaseApiClient {
  protected baseUrl: string;
  protected timeout: number;

  constructor(baseUrl: string, timeout = 30000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  protected async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return { success: false, error: 'Request timeout' };
        }
        return { success: false, error: error.message };
      }
      
      return { success: false, error: 'Unknown error occurred' };
    }
  }

  async checkHealth(): Promise<ServiceStatus> {
    const startTime = Date.now();
    
    try {
      const response = await this.healthCheck();
      const responseTime = Date.now() - startTime;
      
      return {
        name: this.constructor.name.replace('Client', ''),
        url: this.baseUrl,
        status: response.success ? 'online' : 'error',
        lastChecked: new Date(),
        responseTime,
      };
    } catch (error) {
      return {
        name: this.constructor.name.replace('Client', ''),
        url: this.baseUrl,
        status: 'offline',
        lastChecked: new Date(),
      };
    }
  }

  protected abstract healthCheck(): Promise<ApiResponse>;
}