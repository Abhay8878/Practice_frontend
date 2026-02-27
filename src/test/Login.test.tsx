import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { renderWithRouter, mockFetch, mockApiResponses, clearAllMocks } from './testUtils';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Component', () => {
  beforeEach(() => {
    clearAllMocks();
    mockNavigate.mockClear();
  });

  it('renders login form correctly', () => {
    renderWithRouter(<Login />);
    expect(screen.getByText('Doctor Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('allows user to type in email and password fields', () => {
    renderWithRouter(<Login />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('successfully logs in a Practice user', async () => {
    mockFetch(mockApiResponses.loginSuccess);

    renderWithRouter(<Login />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'practice@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'mock-token-123');
      expect(localStorage.setItem).toHaveBeenCalledWith('userId', 'user-123');
      expect(localStorage.setItem).toHaveBeenCalledWith('practitionerType', 'Practice');
      expect(localStorage.setItem).toHaveBeenCalledWith('tenantId', 'tenant-123');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('successfully logs in a Team Member user', async () => {
    mockFetch({
      ...mockApiResponses.loginSuccess,
      data: {
        ...mockApiResponses.loginSuccess.data,
        practitionerType: 'Team Member',
      },
    });

    renderWithRouter(<Login />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'team@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error for invalid credentials', async () => {
    mockFetch({ message: 'Invalid credentials' }, 401, false);

    renderWithRouter(<Login />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('shows error for non-Practice/Team Member users', async () => {
    mockFetch({
      ...mockApiResponses.loginSuccess,
      data: {
        ...mockApiResponses.loginSuccess.data,
        practitionerType: 'Patient',
      },
    });

    renderWithRouter(<Login />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'patient@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/Access denied/i)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('switches to forgot password mode', () => {
    renderWithRouter(<Login />);

    const forgotPasswordButton = screen.getByText(/Forgot Password/i);
    fireEvent.click(forgotPasswordButton);

    expect(screen.getByRole('heading', { name: 'Forgot Password' })).toBeInTheDocument();
    expect(screen.getByText('Enter your email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Reset/i })).toBeInTheDocument();
  });

  it('sends forgot password request', async () => {
    mockFetch({ success: true, data: { token: 'reset-token-123' } });

    renderWithRouter(<Login />);

    fireEvent.click(screen.getByText(/Forgot Password/i));

    const emailInput = screen.getByPlaceholderText('Email');
    const sendResetButton = screen.getByRole('button', { name: /Send Reset/i });

    fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
    fireEvent.click(sendResetButton);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Reset Password' })
      ).toBeInTheDocument();
    });
  });

  it('validates password match in reset mode', async () => {
    mockFetch({ success: true, data: { token: 'reset-token-123' } });

    renderWithRouter(<Login />);

    fireEvent.click(screen.getByText(/Forgot Password/i));

    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Reset/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Reset Password' })).toBeInTheDocument();
    });

    const passwordInput = screen.getByPlaceholderText('New Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm New Password');

    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('successfully resets password', async () => {
    mockFetch({ success: true, data: { token: 'reset-token-123' } });

    renderWithRouter(<Login />);

    fireEvent.click(screen.getByText(/Forgot Password/i));

    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Reset/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Reset Password' })).toBeInTheDocument();
    });

    mockFetch({ success: true, message: "Password reset successful" });

    const passwordInput = screen.getByPlaceholderText('New Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm New Password');
    const resetButton = screen.getByRole('button', { name: /Reset Password/i });

    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText(/Password reset successful/i)).toBeInTheDocument();
      expect(screen.getByText('Doctor Login')).toBeInTheDocument();
    });
  });

  it('returns to login from forgot password mode', () => {
    renderWithRouter(<Login />);

    fireEvent.click(screen.getByText(/Forgot Password/i));
    expect(screen.getByRole('heading', { name: 'Forgot Password' })).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Back to login/i));
    expect(screen.getByText('Doctor Login')).toBeInTheDocument();
  });
});
