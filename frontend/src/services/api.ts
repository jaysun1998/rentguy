// In development, the Vite proxy will handle the request to the backend
const API_BASE_URL = import.meta.env.DEV ? '/api' : 'http://localhost:8001';

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  detail: string;
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
    const headers: Record<string, string> = {};
    
    // Add Content-Type if not already set
    if (!options.headers || !('Content-Type' in (options.headers as Record<string, string>))) {
      headers['Content-Type'] = 'application/json';
    }

    // Add Authorization header if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers as Record<string, string> || {})
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.detail || 'API request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${this.baseUrl}/api/v1/auth/login/access-token`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    return response.json();
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
      // Convert camelCase to snake_case for backend compatibility
      const requestData = {
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
        ...(userData.country && { country: userData.country }),
        ...(userData.company && { company: userData.company }), // Optional field
      };
      
      const url = `${this.baseUrl}/api/v1/auth/signup`;
      console.log('Sending signup request to:', url);
      console.log('Request data:', requestData);
      
      let response;
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(requestData),
        });
      } catch (networkError) {
        console.error('Network error during signup:', networkError);
        throw new Error('Network error. Please check your connection and try again.');
      }

      console.log('Signup response status:', response.status);
      const responseText = await response.text();
      console.log('Raw response text:', responseText);
      
      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
        console.log('Parsed response data:', responseData);
      } catch (e) {
        console.error('Failed to parse JSON response. Response text:', responseText);
        throw new Error(`Invalid server response: ${response.status} ${response.statusText}`);
      }
      
      if (!response.ok) {
        const errorDetails = {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          responseText,
          parsedData: responseData
        };
        
        console.error('Signup error response:', errorDetails);
        
        // Try to extract a meaningful error message
        let errorMessage = 'Failed to create account';
        if (responseData.detail) {
          errorMessage = responseData.detail;
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.errors) {
          // Handle validation errors
          const errorMessages = Object.entries(responseData.errors)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          errorMessage = errorMessages || errorMessage;
        } else if (response.status === 500) {
          errorMessage = 'Internal server error. Please try again later.';
        }
        
        const error = new Error(errorMessage);
        // @ts-ignore - Adding additional properties to error object
        error.details = errorDetails;
        throw error;
      }

      console.log('Signup successful:', responseData);
      return responseData;
    } catch (error: unknown) {
      console.error('Signup error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Error',
        stack: error instanceof Error ? error.stack : undefined,
        details: error && typeof error === 'object' && 'details' in error 
          ? (error as any).details 
          : undefined
      });
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred during signup');
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