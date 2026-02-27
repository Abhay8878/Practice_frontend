import { vi } from 'vitest';
import { mockApiResponses } from '../src/test/testUtils.js';

// Mock axios instance
const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

// Mock responses for all your APIs
mockAxios.get.mockImplementation((url) => {
  if (url.includes('/users')) {
    return Promise.resolve({ data: { data: [mockApiResponses.staff] } });
  }
  if (url.includes('/patients')) {
    return Promise.resolve({ data: { data: [mockApiResponses.patient] } });
  }
  if (url.includes('/orders/patient')) {
    return Promise.resolve({ data: [mockApiResponses.order] });
  }
  if (url.includes('/orders/')) {
    return Promise.resolve({ data: { data: mockApiResponses.order } });
  }
  return Promise.resolve({ data: { data: [] } });
});

mockAxios.post.mockImplementation((url, payload) => {
  if (url === '/orders') {
    // FormData handling
    return Promise.resolve({ 
      data: { data: { ...mockApiResponses.order, id: 'new-order-1' } } 
    });
  }
  if (url === '/users') {
    return Promise.resolve({ data: { data: { ...mockApiResponses.staff, id: 'new-staff-1' } } });
  }
  if (url === '/patients') {
    return Promise.resolve({ data: { data: { ...mockApiResponses.patient, id: 'new-patient-1' } } });
  }
  return Promise.resolve({ data: { data: {} } });
});

export default mockAxios;
