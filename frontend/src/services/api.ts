const API_BASE_URL = 'http://localhost:8001';

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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
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
    return this.request('/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request('/api/v1/auth/me');
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