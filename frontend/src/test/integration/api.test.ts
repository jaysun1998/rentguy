import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiService, ApiError } from '../../services/api';
import { server } from '../setup';
import { http, HttpResponse } from 'msw';

describe('API Service Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Authentication API', () => {
    it('should successfully login with valid credentials', async () => {
      const result = await apiService.login('test@example.com', 'password123');
      
      expect(result).toEqual({
        access_token: 'test-token',
        token_type: 'bearer',
        id: 'test-user-id',
        email: 'test@example.com'
      });
      expect(localStorage.getItem('access_token')).toBe('test-token');
    });

    it('should throw ApiError for invalid credentials', async () => {
      server.use(
        http.post('/api/auth/login/access-token', () => {
          return HttpResponse.json({ detail: 'Invalid credentials' }, { status: 401 });
        })
      );

      await expect(
        apiService.login('wrong@example.com', 'wrongpassword')
      ).rejects.toThrow(ApiError);
    });

    it('should successfully signup new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        company: 'Test Company',
        country: 'Test Country'
      };

      const result = await apiService.signup(userData);
      
      expect(result).toEqual({
        id: 'new-user-id',
        email: 'newuser@example.com',
        first_name: 'Test',
        last_name: 'User'
      });
    });

    it('should handle signup validation errors', async () => {
      server.use(
        http.post('/api/auth/signup', () => {
          return HttpResponse.json({ detail: 'Email already exists' }, { status: 400 });
        })
      );

      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      await expect(apiService.signup(userData)).rejects.toThrow(ApiError);
    });

    it('should get current user with valid token', async () => {
      apiService.setToken('test-token');
      
      const result = await apiService.getCurrentUser();
      
      expect(result).toEqual({
        id: 'test-user-id',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        is_active: true,
        is_superuser: false
      });
    });

    it('should return null for invalid token', async () => {
      server.use(
        http.get('/api/auth/me', () => {
          return HttpResponse.json({ detail: 'Not authenticated' }, { status: 401 });
        })
      );

      apiService.setToken('invalid-token');
      const result = await apiService.getCurrentUser();
      
      expect(result).toBeNull();
    });
  });

  describe('Properties API', () => {
    beforeEach(() => {
      apiService.setToken('test-token');
    });

    it('should fetch properties successfully', async () => {
      const result = await apiService.getProperties();
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: '1',
        name: 'Test Property 1',
        address1: '123 Test St',
        city: 'Test City',
        country: 'Test Country',
        units: 10,
        vacancyRate: 5,
        defaultVatRate: 20
      });
    });

    it('should handle properties API errors', async () => {
      server.use(
        http.get('/api/properties', () => {
          return HttpResponse.json({ detail: 'Server error' }, { status: 500 });
        })
      );

      await expect(apiService.getProperties()).rejects.toThrow(ApiError);
    });

    it('should create property successfully', async () => {
      server.use(
        http.post('/api/properties', () => {
          return HttpResponse.json({
            data: {
              id: '3',
              name: 'New Property',
              address1: '789 New St',
              city: 'New City',
              country: 'New Country'
            }
          }, { status: 201 });
        })
      );

      const propertyData = {
        name: 'New Property',
        address1: '789 New St',
        city: 'New City',
        country: 'New Country'
      } as any;

      const result = await apiService.createProperty(propertyData);
      
      expect(result?.name).toBe('New Property');
    });
  });

  describe('Units API', () => {
    beforeEach(() => {
      apiService.setToken('test-token');
    });

    it('should fetch units successfully', async () => {
      const result = await apiService.getUnits();
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: '1',
        name: 'Unit 1A',
        property_id: '1',
        rent_amount: 1200,
        status: 'occupied'
      });
    });

    it('should create unit successfully', async () => {
      server.use(
        http.post('/api/units', () => {
          return HttpResponse.json({
            unit: {
              id: '3',
              name: 'Unit 3C',
              property_id: '1',
              rent_amount: 1100,
              status: 'vacant'
            }
          }, { status: 201 });
        })
      );

      const unitData = {
        name: 'Unit 3C',
        property_id: '1',
        rent_amount: 1100,
        status: 'vacant'
      };

      const result = await apiService.createUnit(unitData);
      
      expect(result.name).toBe('Unit 3C');
    });

    it('should update unit successfully', async () => {
      server.use(
        http.put('/api/units/1', () => {
          return HttpResponse.json({
            unit: {
              id: '1',
              name: 'Updated Unit 1A',
              property_id: '1',
              rent_amount: 1300,
              status: 'occupied'
            }
          });
        })
      );

      const updateData = {
        name: 'Updated Unit 1A',
        rent_amount: 1300
      };

      const result = await apiService.updateUnit('1', updateData);
      
      expect(result.name).toBe('Updated Unit 1A');
      expect(result.rent_amount).toBe(1300);
    });

    it('should delete unit successfully', async () => {
      server.use(
        http.delete('/api/units/1', () => {
          return HttpResponse.json(null, { status: 204 });
        })
      );

      await expect(apiService.deleteUnit('1')).resolves.toBeUndefined();
    });
  });

  describe('Tenants API', () => {
    beforeEach(() => {
      apiService.setToken('test-token');
    });

    it('should fetch tenants successfully', async () => {
      const result = await apiService.getTenants();
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890'
      });
    });

    it('should create tenant successfully', async () => {
      server.use(
        http.post('/api/tenants', () => {
          return HttpResponse.json({
            tenant: {
              id: '3',
              first_name: 'New',
              last_name: 'Tenant',
              email: 'new.tenant@example.com',
              phone: '+1234567892'
            }
          }, { status: 201 });
        })
      );

      const tenantData = {
        first_name: 'New',
        last_name: 'Tenant',
        email: 'new.tenant@example.com',
        phone: '+1234567892'
      };

      const result = await apiService.createTenant(tenantData);
      
      expect(result.first_name).toBe('New');
      expect(result.last_name).toBe('Tenant');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      server.use(
        http.get('/api/properties', () => {
          return HttpResponse.error();
        })
      );

      apiService.setToken('test-token');
      
      await expect(apiService.getProperties()).rejects.toThrow(ApiError);
    });

    it('should handle malformed JSON responses', async () => {
      server.use(
        http.get('/api/properties', () => {
          return HttpResponse.text('Invalid JSON');
        })
      );

      apiService.setToken('test-token');
      
      await expect(apiService.getProperties()).rejects.toThrow(ApiError);
    });

    it('should handle 401 unauthorized errors', async () => {
      server.use(
        http.get('/api/properties', () => {
          return HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 });
        })
      );

      apiService.setToken('invalid-token');
      
      await expect(apiService.getProperties()).rejects.toThrow(ApiError);
    });
  });

  describe('Token Management', () => {
    it('should set and get token correctly', () => {
      const token = 'test-token-123';
      apiService.setToken(token);
      
      expect(localStorage.getItem('access_token')).toBe(token);
    });

    it('should remove token correctly', () => {
      apiService.setToken('test-token');
      expect(localStorage.getItem('access_token')).toBe('test-token');
      
      apiService.removeToken();
      expect(localStorage.getItem('access_token')).toBeNull();
    });

    it('should include token in API requests', async () => {
      let requestHeaders: any = {};
      
      server.use(
        http.get('/api/properties', ({ request }) => {
          requestHeaders = Object.fromEntries(request.headers.entries());
          return HttpResponse.json({ properties: [] });
        })
      );

      apiService.setToken('test-token');
      await apiService.getProperties();
      
      expect(requestHeaders.authorization).toBe('Bearer test-token');
    });
  });
});