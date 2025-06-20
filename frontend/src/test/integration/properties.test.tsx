import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../utils';
import Properties from '../../pages/dashboard/Properties';
import { server } from '../setup';
import { http, HttpResponse } from 'msw';

describe('Properties Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('access_token', 'test-token');
    vi.clearAllMocks();
  });

  describe('Properties List', () => {
    it('should load and display properties', async () => {
      render(<Properties />);

      // Check for loading skeleton by looking for animate-pulse elements
      const loadingElements = document.querySelectorAll('.animate-pulse');
      expect(loadingElements).toHaveLength(4);

      await waitFor(() => {
        expect(screen.getByText('Test Property 1')).toBeInTheDocument();
        expect(screen.getByText('Test Property 2')).toBeInTheDocument();
        expect(screen.getByText('123 Test St')).toBeInTheDocument();
        expect(screen.getByText('456 Test Ave')).toBeInTheDocument();
      });
    });

    it('should display property details correctly', async () => {
      render(<Properties />);

      await waitFor(() => {
        expect(screen.getByText('Test Property 1')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument(); // units
        expect(screen.getByText('5%')).toBeInTheDocument(); // vacancy rate
        expect(screen.getByText('20%')).toBeInTheDocument(); // VAT rate
      });
    });

    it('should show fully occupied badge for 0% vacancy', async () => {
      render(<Properties />);

      await waitFor(() => {
        expect(screen.getByText('Fully Occupied')).toBeInTheDocument();
      });
    });

    it('should handle API errors gracefully', async () => {
      server.use(
        http.get('/api/properties', () => {
          return HttpResponse.json({ detail: 'Server error' }, { status: 500 });
        })
      );

      render(<Properties />);

      await waitFor(() => {
        expect(screen.getByText(/error: server error/i)).toBeInTheDocument();
      });
    });

    it('should show empty state when no properties found', async () => {
      server.use(
        http.get('/api/properties', () => {
          return HttpResponse.json({ properties: [] });
        })
      );

      render(<Properties />);

      await waitFor(() => {
        expect(screen.getByText(/no properties found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Properties Search and Filter', () => {
    it('should filter properties by search term', async () => {
      const user = userEvent.setup();
      render(<Properties />);

      await waitFor(() => {
        expect(screen.getByText('Test Property 1')).toBeInTheDocument();
        expect(screen.getByText('Test Property 2')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'Property 1');

      await waitFor(() => {
        expect(screen.getByText('Test Property 1')).toBeInTheDocument();
        expect(screen.queryByText('Test Property 2')).not.toBeInTheDocument();
      });
    });

    it('should filter by address', async () => {
      const user = userEvent.setup();
      render(<Properties />);

      await waitFor(() => {
        expect(screen.getByText('Test Property 1')).toBeInTheDocument();
        expect(screen.getByText('Test Property 2')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, '123 Test St');

      await waitFor(() => {
        expect(screen.getByText('Test Property 1')).toBeInTheDocument();
        expect(screen.queryByText('Test Property 2')).not.toBeInTheDocument();
      });
    });

    it('should filter by vacancy status', async () => {
      const user = userEvent.setup();
      render(<Properties />);

      await waitFor(() => {
        expect(screen.getByText('Test Property 1')).toBeInTheDocument();
        expect(screen.getByText('Test Property 2')).toBeInTheDocument();
      });

      const filterSelect = screen.getByRole('combobox');
      await user.selectOptions(filterSelect, 'fully_occupied');

      await waitFor(() => {
        expect(screen.queryByText('Test Property 1')).not.toBeInTheDocument();
        expect(screen.getByText('Test Property 2')).toBeInTheDocument();
      });
    });

    it('should filter by has vacancies', async () => {
      const user = userEvent.setup();
      render(<Properties />);

      await waitFor(() => {
        expect(screen.getByText('Test Property 1')).toBeInTheDocument();
        expect(screen.getByText('Test Property 2')).toBeInTheDocument();
      });

      const filterSelect = screen.getByRole('combobox');
      await user.selectOptions(filterSelect, 'has_vacancies');

      await waitFor(() => {
        expect(screen.getByText('Test Property 1')).toBeInTheDocument();
        expect(screen.queryByText('Test Property 2')).not.toBeInTheDocument();
      });
    });

    it('should combine search and filter', async () => {
      const user = userEvent.setup();
      render(<Properties />);

      await waitFor(() => {
        expect(screen.getByText('Test Property 1')).toBeInTheDocument();
        expect(screen.getByText('Test Property 2')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search/i);
      const filterSelect = screen.getByRole('combobox');

      await user.type(searchInput, 'Test');
      await user.selectOptions(filterSelect, 'fully_occupied');

      await waitFor(() => {
        expect(screen.queryByText('Test Property 1')).not.toBeInTheDocument();
        expect(screen.getByText('Test Property 2')).toBeInTheDocument();
      });
    });
  });

  describe('Properties Actions', () => {
    it('should have view and edit buttons for each property', async () => {
      render(<Properties />);

      await waitFor(() => {
        const viewButtons = screen.getAllByText(/view/i);
        const editButtons = screen.getAllByText(/edit/i);
        
        expect(viewButtons).toHaveLength(2);
        expect(editButtons).toHaveLength(2);
      });
    });

    it('should have add new property button', async () => {
      render(<Properties />);

      const addButton = screen.getByRole('button', { name: /new property/i });
      expect(addButton).toBeInTheDocument();
    });
  });

  describe('Properties Loading States', () => {
    it('should show loading skeleton while fetching', async () => {
      render(<Properties />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      const loadingElements = document.querySelectorAll('.animate-pulse');
      expect(loadingElements).toHaveLength(4);
    });

    it('should hide loading state after data loads', async () => {
      render(<Properties />);

      await waitFor(() => {
        const loadingElements = document.querySelectorAll('.animate-pulse');
        expect(loadingElements).toHaveLength(0);
        expect(screen.getByText('Test Property 1')).toBeInTheDocument();
      });
    });
  });
});