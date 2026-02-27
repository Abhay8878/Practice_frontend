import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import AddProductForm from '../components/form/product/AddProductForm';
import { renderWithRouter, clearAllMocks } from './testUtils';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock TeethSelector to avoid Raphael issues
vi.mock('../components/form/product/TeethSelector.tsx', () => ({
  default: () => <div data-testid="teeth-selector">Teeth Selector Mock</div>
}));

// Mock ThreeDimensionalViewer
vi.mock('../../ThreeDimensionalViewer', () => ({
  default: () => <div data-testid="viewer-mock">Viewer Mock</div>
}));

// Mock the API calls directly since AddProductForm uses them
vi.mock('../api/orders.api', () => ({
  getProductLists: vi.fn(() => Promise.resolve([{ list_id: 1, list_name: 'Crown' }])),
  getProductTypes: vi.fn(() => Promise.resolve([{ product_id: 1, product_name: 'Porcelain' }])),
  createOrder: vi.fn(() => Promise.resolve({ order_id: 'new-order-123' })),
  getProductImage: vi.fn(() => Promise.resolve('mock-image')),
  updateOrder: vi.fn(),
}));

describe('Order Creation', () => {
  const mockOnSuccess = vi.fn();
  const patientId = 'patient-123';

  beforeEach(() => {
    clearAllMocks();
    mockOnSuccess.mockClear();
    mockNavigate.mockClear();

    // Fix localStorage
    window.localStorage.getItem = vi.fn((key) => {
      if (key === "isMasked") return "true";
      if (key === "tenantId") return "clinic-123";
      return null;
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders order form with all required fields', async () => {
    renderWithRouter(<AddProductForm patientId={patientId} onSuccess={mockOnSuccess} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Product List/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Product Type/i)).toBeInTheDocument();
    expect(screen.getByTestId("teeth-selector")).toBeInTheDocument();
  });

  it('validates required fields on submit', async () => {
    renderWithRouter(<AddProductForm patientId={patientId} onSuccess={mockOnSuccess} />);

    const submitButton = screen.getByRole('button', { name: /Create Order/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Multiple fields will show "Required", so we use getAllByText
      expect(screen.getAllByText(/Required/i).length).toBeGreaterThan(0);
    });
  });
});