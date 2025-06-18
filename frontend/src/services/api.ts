import { User, Property, ApiResponse, Tenant, Lease } from '../types/index';

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

export class ApiError extends Error {
  status: number;
  details?: any;
  
  constructor(message: string, status: number = 500, details?: any) {
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



  // Auth endpoints
  async login(email: string, password: string): Promise<{ id: string; email: string }> {
    try {
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
        throw new ApiError(
          responseData.detail || 
          responseData.message || 
          'Login failed. Please check your credentials and try again.',
          response.status
        );
      }

      if (!responseData.access_token) {
        throw new ApiError(
          'Invalid server response: no access token received',
          500
        );
      }

      this.setToken(responseData.access_token);
      return responseData;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error instanceof Error ? error.message : 'An unknown error occurred during login', 500);
    }
  }

  async signup(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    company?: string;
    country?: string;
  }): Promise<{ id: string; email: string }> {
    try {
      // Convert camelCase to snake_case for backend compatibility
      const requestData = {
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
        ...(userData.country && { country: userData.country }),
        ...(userData.company && { company: userData.company }),
      };
      
      console.log('Sending signup request with data:', JSON.stringify(requestData, null, 2));
      const response = await fetch(`${this.baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage = data.message || data.detail || `Signup failed. Status: ${response.status}`;
        throw new ApiError(errorMessage, response.status, data);
      }
      if (!data.id || !data.email) {
        throw new ApiError('Invalid server response: missing required fields');
      }
      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error instanceof Error ? error.message : 'Network or server error during signup', 500);
    }
  }

  async forgotPassword(email: string) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(
          data.message || data.detail || `Password reset failed. Status: ${response.status}`,
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'An unknown error occurred during password reset',
        500
      );
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/me`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          return null;
        }
        throw new ApiError(
          data.message || data.detail || `Failed to get user. Status: ${response.status}`,
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'An unknown error occurred while fetching user data',
        500
      );
    }
  }

  async getProperties(): Promise<Property[]> {
    try {
      const response = await fetch(`${this.baseUrl}/properties`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(
          data.message || data.detail || `Failed to fetch properties. Status: ${response.status}`,
          response.status,
          data
        );
      }

      return data.properties;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Failed to fetch properties',
        500
      );
    }
  }

  async getProperty(id: string): Promise<Property | null> {
    try {
      const response = await fetch(`${this.baseUrl}/properties/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      });
      const data = await response.json().catch(() => ({ data: null })) as ApiResponse<Property>;

      if (!response.ok) {
        throw new ApiError(
          data.message || data.detail || `Failed to fetch property with id ${id}`,
          response.status,
          data
        );
      }

      return data.data || null;
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error.message || `Failed to fetch property with id ${id}`,
        500
      );
    }
  }

  async createProperty(propertyData: Property): Promise<Property | null> {
    try {
      const response = await fetch(`${this.baseUrl}/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(propertyData),
      });
      const data = await response.json().catch(() => ({ data: null })) as ApiResponse<Property>;

      if (!response.ok) {
        throw new ApiError(
          data.message || data.detail || `Failed to create property. Status: ${response.status}`,
          response.status,
          data
        );
      }

      return data.data || null;
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error.message || `Failed to create property`,
        500
      );
    }
  }

  async getUnits(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/units`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(
          data.message || data.detail || `Failed to fetch units. Status: ${response.status}`,
          response.status,
          data
        );
      }

      return data.units;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Failed to fetch units',
        500
      );
    }
  }

  async getUnit(id: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/units/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(
          data.message || data.detail || `Failed to fetch unit. Status: ${response.status}`,
          response.status,
          data
        );
      }

      return data.unit;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Failed to fetch unit',
        500
      );
    }
  }

  async createUnit(unitData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/units`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(unitData),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(
          data.message || data.detail || `Failed to create unit. Status: ${response.status}`,
          response.status,
          data
        );
      }

      return data.unit;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Failed to create unit',
        500
      );
    }
  }

  async updateUnit(id: string, unitData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/units/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(unitData),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(
          data.message || data.detail || `Failed to update unit. Status: ${response.status}`,
          response.status,
          data
        );
      }

      return data.unit;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Failed to update unit',
        500
      );
    }
  }

  async deleteUnit(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/units/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      });
      const data = await response.json().catch(() => ({ data: null })) as ApiResponse<void>;

      if (!response.ok) {
        throw new ApiError(
          data.message || data.detail || `Failed to delete unit. Status: ${response.status}`,
          response.status,
          data
        );
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Failed to delete unit',
        500
      );
    }
  }

  // Tenants endpoints
  async getTenants(): Promise<Tenant[]> {
    try {
      const response = await fetch(`${this.baseUrl}/tenants`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      });
      const data = await response.json().catch(() => ({ data: [] })) as ApiResponse<Tenant[]>;

      if (!response.ok) {
        throw new ApiError(
          data.message || data.detail || `Failed to fetch tenants. Status: ${response.status}`,
          response.status,
          data
        );
      }

      return data.data || [];
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Failed to fetch tenants',
        500
      );
    }
  }

  async getTenant(id: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/tenants/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(
          data.message || data.detail || `Failed to fetch tenant. Status: ${response.status}`,
          response.status,
          data
        );
      }

      return data.tenant;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Failed to fetch tenant',
        500
      );
    }
  }

  async createTenant(tenantData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/tenants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(tenantData),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(
          data.message || data.detail || `Failed to create tenant. Status: ${response.status}`,
          response.status,
          data
        );
      }

      return data.tenant;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Failed to create tenant',
        500
      );
    }
  }

  async updateTenant(id: string, tenantData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/tenants/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(tenantData),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(
          data.message || data.detail || `Failed to update tenant. Status: ${response.status}`,
          response.status,
          data
        );
      }

      return data.tenant;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Failed to update tenant',
        500
      );
    }
  }

  async deleteTenant(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/tenants/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      });
      const data = await response.json().catch(() => ({ data: null })) as ApiResponse<void>;

      if (!response.ok) {
        throw new ApiError(
          data.message || data.detail || `Failed to delete tenant. Status: ${response.status}`,
          response.status,
          data
        );
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Failed to delete tenant',
        500
      );
    }
  }

  // Leases endpoints
  async getLeases(): Promise<Lease[]> {
    try {
      const response = await fetch(`${this.baseUrl}/leases`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      });
      const data = await response.json().catch(() => ({ data: [] })) as ApiResponse<Lease[]>;

      if (!response.ok) {
        throw new ApiError(
          data.message || data.detail || `Failed to fetch leases. Status: ${response.status}`,
          response.status,
          data
        );
      }

      return data.data || [];
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Failed to fetch leases',
        500
      );
    }
  }

  async getLease(id: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/leases/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(
          data.message || data.detail || `Failed to fetch lease. Status: ${response.status}`,
          response.status,
          data
        );
      }

      return data.lease;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Failed to fetch lease',
        500
      );
    }
  }

  async createLease(leaseData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/leases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(leaseData),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(
          data.message || data.detail || `Failed to create lease. Status: ${response.status}`,
          response.status,
          data
        );
      }

      return data.lease;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Failed to create lease',
        500
      );
    }
  }

  async updateLease(id: string, leaseData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/leases/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(leaseData),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(
          data.message || data.detail || `Failed to update lease. Status: ${response.status}`,
          response.status,
          data
        );
      }

      return data.lease;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Failed to update lease',
        500
      );
    }
  }

  async deleteLease(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/leases/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        const responseData = await response.json().catch(() => ({}));
        throw new ApiError(
          responseData.message || responseData.detail || `Failed to delete lease. Status: ${response.status}`,
          response.status,
          responseData
        );
      }
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error.message || 'Failed to delete lease',
        500
      );
    }
  }

  // Invoices endpoints
  async getInvoices(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/invoices`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      });
      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(
          responseData.message || responseData.detail || `Failed to fetch invoices. Status: ${response.status}`,
          response.status,
          responseData
        );
      }

      return responseData.invoices || [];
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error.message || 'Failed to fetch invoices',
        500
      );
    }
  }

  async getInvoice(id: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/invoices/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      });
      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(
          responseData.message || responseData.detail || `Failed to fetch invoice. Status: ${response.status}`,
          response.status,
          responseData
        );
      }

      return responseData.invoice || null;
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error.message || 'Failed to fetch invoice',
        500
      );
    }
  }

  async createInvoice(invoiceData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(invoiceData),
      });
      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(
          responseData.message || responseData.detail || `Failed to create invoice. Status: ${response.status}`,
          response.status,
          responseData
        );
      }

      return responseData.invoice || null;
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error.message || 'Failed to create invoice',
        500
      );
    }
  }

  async updateInvoice(id: string, invoiceData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/invoices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(invoiceData),
      });
      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(
          responseData.message || responseData.detail || `Failed to update invoice. Status: ${response.status}`,
          response.status,
          responseData
        );
      }

      return responseData.invoice || null;
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error.message || 'Failed to update invoice',
        500
      );
    }
  }

  async deleteInvoice(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/invoices/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        const responseData = await response.json().catch(() => ({}));
        throw new ApiError(
          responseData.message || responseData.detail || `Failed to delete invoice. Status: ${response.status}`,
          response.status,
          responseData
        );
      }
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error.message || 'Failed to delete invoice',
        500
      );
    }
  }

  // Maintenance endpoints
  async getMaintenanceRequests(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/maintenance`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      });
      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(
          responseData.message || responseData.detail || `Failed to fetch maintenance requests. Status: ${response.status}`,
          response.status,
          responseData
        );
      }

      return responseData.requests || [];
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error.message || 'Failed to fetch maintenance requests',
        500
      );
    }
  }

  async getMaintenanceRequest(id: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/maintenance/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      });
      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(
          responseData.message || responseData.detail || `Failed to fetch maintenance request. Status: ${response.status}`,
          response.status,
          responseData
        );
      }

      return responseData.request || null;
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error.message || 'Failed to fetch maintenance request',
        500
      );
    }
  }

  async createMaintenanceRequest(maintenanceData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(maintenanceData),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(
          data.message || data.detail || `Failed to create maintenance request. Status: ${response.status}`,
          response.status,
          data
        );
      }

      return data.request;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Failed to create maintenance request',
        500
      );
    }
  }

  async updateMaintenanceRequest(id: string, maintenanceData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/maintenance/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(maintenanceData),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(
          data.message || data.detail || `Failed to update maintenance request. Status: ${response.status}`,
          response.status,
          data
        );
      }

      return data.request;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Failed to update maintenance request',
        500
      );
    }
  }

  async deleteMaintenanceRequest(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/maintenance/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        const responseData = await response.json().catch(() => ({}));
        throw new ApiError(
          responseData.message || responseData.detail || `Failed to delete maintenance request. Status: ${response.status}`,
          response.status,
          responseData
        );
      }
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error.message || 'Failed to delete maintenance request',
        500
      );
    }
  }
}

export const apiService = new ApiService();