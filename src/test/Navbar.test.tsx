import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../pages/Navbar';
import { renderWithRouter, clearAllMocks } from './testUtils';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Navbar Component', () => {
  beforeEach(() => {
    clearAllMocks();
    mockNavigate.mockClear();
  });

  it('renders navbar with title', () => {
    renderWithRouter(<Navbar />);

    expect(screen.getByText('AOA Doctor')).toBeInTheDocument();
  });

  it('renders user icon button', () => {
    renderWithRouter(<Navbar />);
    const userButton = screen.getAllByRole('button')[2];
    expect(userButton).toBeInTheDocument();
  });

  it('opens dropdown when user icon is clicked', () => {
    renderWithRouter(<Navbar />);
    const userButton = screen.getAllByRole('button')[2];
    fireEvent.click(userButton);
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('closes dropdown when user icon is clicked again', async () => {
    renderWithRouter(<Navbar />);
    const userButton = screen.getAllByRole('button')[2];

    // Open dropdown
    fireEvent.click(userButton);
    expect(screen.getByText('Logout')).toBeInTheDocument();

    // Close dropdown
    fireEvent.click(userButton);

    await waitFor(() => {
      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });
  });

  it('logs out user and navigates to login', () => {
    renderWithRouter(<Navbar />);

    // Open dropdown
    const userButton = screen.getAllByRole('button')[2];
    fireEvent.click(userButton);

    // Click logout
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('closes dropdown when clicking outside', async () => {
    renderWithRouter(
      <div>
        <Navbar />
        <div data-testid="outside-element">Outside</div>
      </div>
    );

    // Open dropdown
    const userButton = screen.getAllByRole('button')[2];
    fireEvent.click(userButton);
    expect(screen.getByText('Logout')).toBeInTheDocument();

    // Click outside
    const outsideElement = screen.getByTestId('outside-element');
    fireEvent.mouseDown(outsideElement);

    await waitFor(() => {
      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });
  });

  it('displays logout button with icon', () => {
    renderWithRouter(<Navbar />);

    const userButton = screen.getAllByRole('button')[2];
    fireEvent.click(userButton);

    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeInTheDocument();

    // Check for logout icon (FiLogOut)
    const logoutIcon = logoutButton.querySelector('svg');
    expect(logoutIcon).toBeInTheDocument();
  });
});