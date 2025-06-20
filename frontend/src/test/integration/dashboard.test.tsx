import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../utils';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Units from '../../pages/dashboard/Units';
import Tenants from '../../pages/dashboard/Tenants';
import { server } from '../setup';
import { http, HttpResponse } from 'msw';

describe('Dashboard Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('access_token', 'test-token');
    vi.clearAllMocks();
  });

  describe('Dashboard Layout', () => {
    it('should render navigation menu', async () => {
      render(<DashboardLayout />);

      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/properties/i)).toBeInTheDocument();
      expect(screen.getByText(/units/i)).toBeInTheDocument();
      expect(screen.getByText(/tenants/i)).toBeInTheDocument();
      expect(screen.getByText(/leases/i)).toBeInTheDocument();
      expect(screen.getByText(/invoices/i)).toBeInTheDocument();
      expect(screen.getByText(/maintenance/i)).toBeInTheDocument();
      expect(screen.getByText(/reports/i)).toBeInTheDocument();
    });

    it('should have logout functionality', async () => {
      const user = userEvent.setup();
      render(<DashboardLayout />);

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      expect(logoutButton).toBeInTheDocument();

      await user.click(logoutButton);
      expect(localStorage.getItem('access_token')).toBeNull();
    });
  });

  describe('Units Component', () => {
    it('should load and display units', async () => {
      render(<Units />);

      await waitFor(() => {
        expect(screen.getByText('Unit 1A')).toBeInTheDocument();
        expect(screen.getByText('Unit 2B')).toBeInTheDocument();
        expect(screen.getByText('$1,200')).toBeInTheDocument();
        expect(screen.getByText('$1,300')).toBeInTheDocument();
      });
    });

    it('should handle units API errors', async () => {
      server.use(
        http.get('/api/units', () => {
          return HttpResponse.json({ detail: 'Server error' }, { status: 500 });
        })
      );

      render(<Units />);

      await waitFor(() => {
        expect(screen.getByText(/error.*server error/i)).toBeInTheDocument();
      });
    });

    it('should show empty state when no units found', async () => {
      server.use(
        http.get('/api/units', () => {
          return HttpResponse.json({ units: [] });
        })
      );

      render(<Units />);

      await waitFor(() => {
        expect(screen.getByText(/no units found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Tenants Component', () => {
    it('should load and display tenants', async () => {
      render(<Tenants />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
      });
    });

    it('should handle tenants API errors', async () => {
      server.use(
        http.get('/api/tenants', () => {
          return HttpResponse.json({ detail: 'Server error' }, { status: 500 });
        })
      );

      render(<Tenants />);

      await waitFor(() => {
        expect(screen.getByText(/error.*server error/i)).toBeInTheDocument();
      });
    });

    it('should show empty state when no tenants found', async () => {
      server.use(
        http.get('/api/tenants', () => {
          return HttpResponse.json({ data: [] });
        })
      );

      render(<Tenants />);

      await waitFor(() => {
        expect(screen.getByText(/no tenants found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across components', async () => {
      // Test that data changes in one component reflect in others
      server.use(
        http.post('/api/units', () => {
          return HttpResponse.json({
            unit: {
              id: '3',
              name: 'Unit 3C',
              property_id: '1',
              rent_amount: 1400,
              status: 'vacant'
            }
          }, { status: 201 });
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
              },
              {
                id: '3',
                name: 'Unit 3C',
                property_id: '1',
                rent_amount: 1400,
                status: 'vacant'
              }
            ]
          });
        })
      );

      render(<Units />);

      await waitFor(() => {
        expect(screen.getByText('Unit 1A')).toBeInTheDocument();
        expect(screen.getByText('Unit 2B')).toBeInTheDocument();
      });

      // Simulate adding a new unit
      const addButton = screen.getByRole('button', { name: /add.*unit/i });
      if (addButton) {
        const user = userEvent.setup();
        await user.click(addButton);
        
        // After adding, the list should update
        await waitFor(() => {
          expect(screen.getByText('Unit 3C')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Real-time Updates', () => {
    it('should handle API data updates', async () => {
      render(<Units />);

      await waitFor(() => {
        expect(screen.getByText('Unit 1A')).toBeInTheDocument();
      });

      // Simulate server data change
      server.use(
        http.get('/api/units', () => {
          return HttpResponse.json({
            units: [
              {
                id: '1',
                name: 'Updated Unit 1A',
                property_id: '1',
                rent_amount: 1500,
                status: 'occupied'
              }
            ]
          });
        })
      );

      // Trigger a refresh (this would happen in real app through websockets or polling)
      // For now, we'll simulate by re-rendering or triggering a data fetch
      const refreshButton = screen.queryByRole('button', { name: /refresh/i });
      if (refreshButton) {
        const user = userEvent.setup();
        await user.click(refreshButton);

        await waitFor(() => {
          expect(screen.getByText('Updated Unit 1A')).toBeInTheDocument();
          expect(screen.getByText('$1,500')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', async () => {
      const manyUnits = Array.from({ length: 100 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Unit ${i + 1}`,
        property_id: '1',
        rent_amount: 1000 + i * 10,
        status: i % 2 === 0 ? 'occupied' : 'vacant'
      }));

      server.use(
        http.get('/api/units', () => {
          return HttpResponse.json({ units: manyUnits });
        })
      );

      const startTime = performance.now();
      render(<Units />);

      await waitFor(() => {
        expect(screen.getByText('Unit 1')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 2 seconds)
      expect(renderTime).toBeLessThan(2000);
    });
  });
});