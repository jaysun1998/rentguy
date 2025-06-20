import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/auth/login/access-token', async ({ request }) => {
    const formData = await request.formData();
    const username = formData.get('username');
    const password = formData.get('password');
    
    if (username === 'wrong@example.com' || password === 'wrongpassword') {
      return HttpResponse.json({ detail: 'Invalid credentials' }, { status: 401 });
    }
    
    return HttpResponse.json({
      access_token: 'test-token',
      token_type: 'bearer',
      id: 'test-user-id',
      email: 'test@example.com'
    });
  }),

  http.post('/api/auth/signup', () => {
    return HttpResponse.json({
      id: 'new-user-id',
      email: 'newuser@example.com',
      first_name: 'Test',
      last_name: 'User'
    }, { status: 201 });
  }),

  http.get('/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ detail: 'Not authenticated' }, { status: 401 });
    }
    
    return HttpResponse.json({
      id: 'test-user-id',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      is_active: true,
      is_superuser: false
    });
  }),

  http.get('/api/properties', () => {
    return HttpResponse.json({
      properties: [
        {
          id: '1',
          name: 'Test Property 1',
          address1: '123 Test St',
          city: 'Test City',
          country: 'Test Country',
          units: 10,
          vacancyRate: 5,
          defaultVatRate: 20
        },
        {
          id: '2',
          name: 'Test Property 2',
          address1: '456 Test Ave',
          city: 'Test Town',
          country: 'Test Country',
          units: 15,
          vacancyRate: 0,
          defaultVatRate: 20
        }
      ]
    });
  }),

  http.get('/api/units', () => {
    return HttpResponse.json({
      units: [
        {
          id: '1',
          name: 'Unit 1A',
          property_id: '1',
          rent_amount: 1200,
          status: 'occupied'
        },
        {
          id: '2',
          name: 'Unit 2B',
          property_id: '1',
          rent_amount: 1300,
          status: 'vacant'
        }
      ]
    });
  }),

  http.get('/api/tenants', () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890'
        },
        {
          id: '2',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@example.com',
          phone: '+1234567891'
        }
      ]
    });
  }),

  http.get('/api/leases', () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          tenant_id: '1',
          unit_id: '1',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          rent_amount: 1200,
          status: 'active'
        }
      ]
    });
  }),

  http.get('/api/invoices', () => {
    return HttpResponse.json({
      invoices: [
        {
          id: '1',
          tenant_id: '1',
          amount: 1200,
          due_date: '2024-01-31',
          status: 'paid'
        }
      ]
    });
  }),

  http.get('/api/maintenance', () => {
    return HttpResponse.json({
      requests: [
        {
          id: '1',
          unit_id: '1',
          title: 'Leaky faucet',
          description: 'Kitchen faucet is leaking',
          status: 'open',
          priority: 'medium'
        }
      ]
    });
  })
];

export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());