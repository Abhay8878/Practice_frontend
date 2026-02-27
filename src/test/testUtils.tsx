import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import React from 'react';
import { LanguageProvider } from '../language/LanguageContext';
import { MaskingProvider } from '../context/MaskingContext';
import { SidebarProvider } from '../components/ui/sidebar';

// Custom render function that includes all necessary providers
export function renderWithRouter(ui: React.ReactNode, { route = '/' } = {}) {
  window.history.pushState({}, 'Test page', route);
  return render(
    <LanguageProvider>
      <MaskingProvider>
        <SidebarProvider defaultOpen={false}>
          <BrowserRouter>
            {ui}
          </BrowserRouter>
        </SidebarProvider>
      </MaskingProvider>
    </LanguageProvider>
  );
}

// Mock API responses
export const mockApiResponses = {
  loginSuccess: {
    success: true,
    message: "Login successful",
    data: {
      accessToken: 'mock-token-123',
      userId: 'user-123',
      practitionerType: 'Practice',
      tenantId: 'tenant-123',
      addressId: 'address-123',
    }
  },

  patient: {
    id: 'patient-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    contact: '1234567890',
    gender: 'Male',
    dob: '1990-01-01',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'United States',
      zipCode: '10001',
    },
  },

  staff: {
    id: 'staff-123',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    contact: '0987654321',
    role: 'Nurse',
    address: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      country: 'United States',
      zipCode: '90001',
    },
  },

  order: {
    order_id: 'order-123',
    product_list: 'Crown',
    product_type: 'Porcelain',
    shade: 'A1',
    tooth_numbers: ['11', '12'],
    priority: 'MEDIUM',
    status: 'PENDING',
    order_date: '2024-01-01T00:00:00.000Z',
    expected_delivery: '2024-01-15T00:00:00.000Z',
  },
};

// API-specific mock helpers
export function mockStaffApi() {
  vi.mock('../src/api/staff.api', () => ({
    getStaff: vi.fn(() => Promise.resolve([mockApiResponses.staff])),
    createStaff: vi.fn(() => Promise.resolve({ ...mockApiResponses.staff, id: 'new-staff-1' })),
  }));
}

export function mockPatientApi() {
  vi.mock('../src/api/patient.api', () => ({
    getPatients: vi.fn(() => Promise.resolve([mockApiResponses.patient])),
    createPatient: vi.fn(() => Promise.resolve({ ...mockApiResponses.patient, id: 'new-patient-1' })),
  }));
}

export function mockOrderApi() {
  vi.mock('../src/api/order.api', () => ({
    getOrdersByPatientId: vi.fn(() => Promise.resolve([mockApiResponses.order])),
    createOrder: vi.fn(() => Promise.resolve({ ...mockApiResponses.order, order_id: 'new-order-1' })),
  }));
}

// Mock fetch helper (for fallback)
export function mockFetch(response: any, status = 200, ok = true) {
  globalThis.fetch = vi.fn(() =>
    Promise.resolve({
      ok,
      status,
      json: () => Promise.resolve(response),
    }) as any
  );
}

// Clear all mocks
export function clearAllMocks() {
  vi.clearAllMocks();
  localStorage.clear();
}
