// Determine the base URL based on the environment
const getApiBaseUrl = () => {
  // 1. Check for environment variable first (highest priority)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 2. Check for web container environments (like StackBlitz, CodeSandbox, etc.)
  const isWebContainer = window.location.hostname.includes('webcontainer.io') || 
                       window.location.hostname.includes('stackblitz.io') ||
                       window.location.hostname.includes('codesandbox.io');
  
  if (isWebContainer) {
    // For web containers, we need to use the full URL to the backend
    // This should be set in the environment variables of your web container
    return 'https://your-deployed-backend-url.com/api/v1';
  }
  
  // 3. For local development with Vite proxy
  if (import.meta.env.DEV) {
    // Use relative URL which will be proxied by Vite
    return '/api';
  }
  
  // 4. Default production URL (should be overridden by VITE_API_URL in production)
  return '/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export class ApiError extends Error {
  status?: number;
  details?: any;
  
  constructor(message: string, status?: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    
    // Set the prototype explicitly for TypeScript
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('access_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log(`[API] Making request to: ${url}`, { 
      ...options,
      headers: {
        ...Object.fromEntries(new Headers(options.headers).entries()),
        ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {})
      },
      // Don't log the full request body as it might contain sensitive data
      body: options.body ? '[REDACTED]' : undefined,
    });
    
    // Create headers
    const headers = new Headers(options.headers);
    
    // Set default headers if not already set
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }
    
    // Add auth token if available
    if (this.token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const responseClone = response.clone(); // Clone the response for error handling
      
      console.log(`[API] Response status: ${response.status} ${response.statusText}`, { 
        url,
        headers: Object.fromEntries(response.headers.entries())
      });

      try {
        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          const data = await response.json();
          
          if (!response.ok) {
            console.error('[API] Error response data:', data);
            throw new ApiError(
              data.detail || data.message || data.error || `Request failed with status ${response.status}`,
              response.status,
              data
            );
          }
          
          console.log('[API] Response data:', data);
          return data;
        } else {
          // Handle non-JSON responses
          const text = await responseClone.text();
          
          if (!response.ok) {
            console.error('[API] Non-JSON error response:', text);
            throw new ApiError(
              `Request failed with status ${response.status}: ${text}`,
              response.status,
              { raw: text }
            );
          }
          
          // If the response is OK but not JSON, return the text
          return text as unknown as T;
        }
      } catch (jsonError) {
        console.error('[API] JSON parsing error:', jsonError);
        const text = await responseClone.text();
        throw new ApiError(
          `Failed to parse server response: ${text}`,
          response.status,
          { raw: text, error: jsonError }
        );
        
        // Re-throw other errors
        console.error('[API] Error processing response:', jsonError);
        throw new ApiError('Failed to process server response');
      }
    } catch (error) {
      // Log additional debug information
      console.error('[API] Request failed:', {
        error,
        endpoint,
        baseUrl: this.baseUrl,
        fullUrl: `${this.baseUrl}${endpoint}`,
        isSecure: window.location.protocol === 'https:',
        isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
        environment: import.meta.env.MODE,
      });

      // Handle network errors
      if (error instanceof TypeError) {
        if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
          throw new ApiError(
            'Unable to connect to the server. Please check if the backend server is running and accessible.',
            0, // 0 status code indicates network error
            { 
              originalError: error.message,
              suggestion: this.baseUrl.startsWith('http://localhost') ? 
                'Make sure the backend server is running on localhost' :
                'If running in a web container, verify the backend URL is correctly configured in environment variables (VITE_API_URL)'
            }
          );
        }
      }
      
      // Handle connection refused errors
      if (error instanceof Error && 
          (error.message.includes('ECONNREFUSED') || 
           error.message.includes('Failed to fetch'))) {
        throw new ApiError(
          `Could not connect to the server at ${this.baseUrl}. Please make sure the backend server is running.`,
          0,
          {
            originalError: error.message,
            suggestion: 'If running locally, start the backend server with `uvicorn app.main:app --reload`'
          }
        );
      }
      
      // Re-throw ApiError instances as is
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Wrap other errors in ApiError
      throw new ApiError(
        error instanceof Error ? error.message : 'An unknown error occurred',
        undefined,
        error
      );
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    try {
      console.log('[API] Attempting login for:', email);
      
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      formData.append('grant_type', 'password');

      const response = await fetch(`${this.baseUrl}/auth/login/access-token`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const responseData = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        console.error('[API] Login failed:', {
          status: response.status,
          error: responseData,
        });
        
        throw new ApiError(
          responseData.detail || 
          responseData.message || 
          'Login failed. Please check your credentials and try again.',
          response.status
        );
      }

      if (!responseData.access_token) {
        console.error('[API] No access token in response:', responseData);
        throw new ApiError('Invalid server response: no access token received');
      }

      console.log('[API] Login successful, setting token');
      this.setToken(responseData.access_token);
      return responseData;
      
    } catch (error) {
      console.error('[API] Login error:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'An unknown error occurred during login'
      );
    }
  }

  async signup(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    company?: string;
    country?: string;
  }) {
    try {
      console.log('[API] Starting signup process for:', userData.email);
      
      // Convert camelCase to snake_case for backend compatibility
      const requestData = {
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
        ...(userData.country && { country: userData.country }),
        ...(userData.company && { company: userData.company }), // Optional field
      };
      
      // Log the request without sensitive data
      console.log('[API] Sending signup request with data:', {
        ...requestData,
        password: '[REDACTED]'
      });
      
      try {
        const response = await fetch(`${this.baseUrl}/auth/register`, {
          method: 'POST',
          body: JSON.stringify(requestData),
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        const responseData = await response.json().catch(() => ({}));
        
        if (!response.ok) {
          console.error('[API] Signup failed:', {
            status: response.status,
            error: responseData,
          });
          
          throw new ApiError(
            responseData.detail || 
            responseData.message || 
            `Signup failed. Please check your input and try again. Status: ${response.status}`,
            response.status,
            responseData
          );
        }

        if (!responseData.id) {
          console.error('[API] Invalid signup response:', responseData);
          throw new ApiError('Invalid server response: no user ID received');
        }

        console.log('[API] Signup successful');
        return responseData;
      } catch (error) {
        console.error('[API] Signup request failed:', error);
        throw new ApiError(
          error instanceof Error ? error.message : 'An unknown error occurred during signup'
        );
      }
      
    } catch (error: unknown) {
      console.error('[API] Signup failed:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Error'
      });
      
      // Handle specific error cases
      if (error instanceof Error) {
        // Network errors
        if (error.message.includes('Failed to fetch')) {
          throw new ApiError(
            'Unable to connect to the server. Please check your internet connection and try again.'
          );
        }
        
        // Handle validation errors from the server
        if (error.message.includes('already exists') || error.message.includes('already registered')) {
          throw new ApiError('This email is already registered. Please use a different email or log in.');
        }
        
        // Re-throw ApiError as is
        if (error instanceof ApiError) {
          throw error;
        }
        
        // For other errors, wrap them in ApiError
        throw new ApiError(
          error.message || 'An unexpected error occurred during signup'
        );
      }
      
      // For non-Error objects
      throw new ApiError('An unknown error occurred during signup');
    }
  }

  async getCurrentUser() {
    const response = await this.request<{
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      company?: string;
      country: string;
    }>('/api/v1/auth/me');

    // Convert snake_case to camelCase for frontend
    return {
      id: response.id,
      email: response.email,
      firstName: response.first_name,
      lastName: response.last_name,
      company: response.company,
      country: response.country
    };
  }

  // Properties endpoints
  async getProperties() {
    return this.request('/api/v1/properties/');
  }

  async getProperty(id: string) {
    return this.request(`/api/v1/properties/${id}`);
  }

  async createProperty(propertyData: any) {
    return this.request('/api/v1/properties/', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  }

  async updateProperty(id: string, propertyData: any) {
    return this.request(`/api/v1/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(propertyData),
    });
  }

  async deleteProperty(id: string) {
    return this.request(`/api/v1/properties/${id}`, {
      method: 'DELETE',
    });
  }

  // Units endpoints
  async getUnits() {
    return this.request('/api/v1/units/');
  }

  async getUnit(id: string) {
    return this.request(`/api/v1/units/${id}`);
  }

  async createUnit(unitData: any) {
    return this.request('/api/v1/units/', {
      method: 'POST',
      body: JSON.stringify(unitData),
    });
  }

  async updateUnit(id: string, unitData: any) {
    return this.request(`/api/v1/units/${id}`, {
      method: 'PUT',
      body: JSON.stringify(unitData),
    });
  }

  async deleteUnit(id: string) {
    return this.request(`/api/v1/units/${id}`, {
      method: 'DELETE',
    });
  }

  // Tenants endpoints
  async getTenants() {
    return this.request('/api/v1/tenants/');
  }

  async getTenant(id: string) {
    return this.request(`/api/v1/tenants/${id}`);
  }

  async createTenant(tenantData: any) {
    return this.request('/api/v1/tenants/', {
      method: 'POST',
      body: JSON.stringify(tenantData),
    });
  }

  async updateTenant(id: string, tenantData: any) {
    return this.request(`/api/v1/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tenantData),
    });
  }

  async deleteTenant(id: string) {
    return this.request(`/api/v1/tenants/${id}`, {
      method: 'DELETE',
    });
  }

  // Leases endpoints
  async getLeases() {
    return this.request('/api/v1/leases/');
  }

  async getLease(id: string) {
    return this.request(`/api/v1/leases/${id}`);
  }

  async createLease(leaseData: any) {
    return this.request('/api/v1/leases/', {
      method: 'POST',
      body: JSON.stringify(leaseData),
    });
  }

  async updateLease(id: string, leaseData: any) {
    return this.request(`/api/v1/leases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(leaseData),
    });
  }

  async deleteLease(id: string) {
    return this.request(`/api/v1/leases/${id}`, {
      method: 'DELETE',
    });
  }

  // Invoices endpoints
  async getInvoices() {
    return this.request('/api/v1/invoices/');
  }

  async getInvoice(id: string) {
    return this.request(`/api/v1/invoices/${id}`);
  }

  async createInvoice(invoiceData: any) {
    return this.request('/api/v1/invoices/', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  }

  async updateInvoice(id: string, invoiceData: any) {
    return this.request(`/api/v1/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoiceData),
    });
  }

  async deleteInvoice(id: string) {
    return this.request(`/api/v1/invoices/${id}`, {
      method: 'DELETE',
    });
  }

  // Maintenance endpoints
  async getMaintenanceRequests() {
    return this.request('/api/v1/maintenance/');
  }

  async getMaintenanceRequest(id: string) {
    return this.request(`/api/v1/maintenance/${id}`);
  }

  async createMaintenanceRequest(maintenanceData: any) {
    return this.request('/api/v1/maintenance/', {
      method: 'POST',
      body: JSON.stringify(maintenanceData),
    });
  }

  async updateMaintenanceRequest(id: string, maintenanceData: any) {
    return this.request(`/api/v1/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(maintenanceData),
    });
  }

  async deleteMaintenanceRequest(id: string) {
    return this.request(`/api/v1/maintenance/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();