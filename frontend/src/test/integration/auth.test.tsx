import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../utils';
import Login from '../../pages/auth/Login';
import Signup from '../../pages/auth/Signup';
import App from '../../App';

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Login Flow', () => {
    it('should successfully log in a user with valid credentials', async () => {
      const user = userEvent.setup();
      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(localStorage.getItem('access_token')).toBe('test-token');
      });
    });

    it('should show error message for invalid credentials', async () => {
      const user = userEvent.setup();
      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'wrong@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/login failed/i)).toBeInTheDocument();
      });
    });

    it('should validate required fields', async () => {
      const user = userEvent.setup();
      render(<Login />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
      });
    });
  });

  describe('Signup Flow', () => {
    it('should successfully sign up a new user', async () => {
      const user = userEvent.setup();
      render(<Signup />);

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      await user.type(firstNameInput, 'Test');
      await user.type(lastNameInput, 'User');
      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/account created successfully/i)).toBeInTheDocument();
      });
    });

    it('should validate password confirmation', async () => {
      const user = userEvent.setup();
      render(<Signup />);

      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'differentpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('should validate all required fields', async () => {
      const user = userEvent.setup();
      render(<Signup />);

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users to login', async () => {
      render(<App />, { initialEntries: ['/dashboard'] });

      await waitFor(() => {
        expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
      });
    });

    it('should allow authenticated users to access dashboard', async () => {
      localStorage.setItem('access_token', 'test-token');
      render(<App />, { initialEntries: ['/dashboard'] });

      await waitFor(() => {
        expect(screen.getByText(/dashboard test/i)).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Context', () => {
    it('should maintain authentication state across page refreshes', async () => {
      localStorage.setItem('access_token', 'test-token');
      render(<App />, { initialEntries: ['/dashboard'] });

      await waitFor(() => {
        expect(screen.getByText(/dashboard test/i)).toBeInTheDocument();
      });
    });

    it('should clear authentication state on logout', async () => {
      localStorage.setItem('access_token', 'test-token');
      const user = userEvent.setup();
      render(<App />, { initialEntries: ['/dashboard'] });

      await waitFor(() => {
        expect(screen.getByText(/dashboard test/i)).toBeInTheDocument();
      });

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      await user.click(logoutButton);

      await waitFor(() => {
        expect(localStorage.getItem('access_token')).toBeNull();
        expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
      });
    });
  });
});