import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Mock data
const mockPatients = [
  { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' }
];

const mockStaff = [
  { id: '1', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' }
];

const mockOrders = [
  { order_id: '1', patient_id: '1', product_list: 'Crown', status: 'pending' }
];

// Create MSW server
export const server = setupServer(
  // Patient APIs
  rest.get('/api/patients', (req, res, ctx) => {
    const tenantId = req.url.searchParams.get('tenantId');
    return res(ctx.json({ data: mockPatients }));
  }),

  rest.post('/api/patients', async (req, res, ctx) => {
    const newPatient = await req.json();
    const patient = { id: '2', ...newPatient };
    mockPatients.push(patient);
    return res(ctx.json({ data: patient }));
  }),

  rest.get('/api/patients/:id', (req, res, ctx) => {
    return res(ctx.json({ data: mockPatients[0] }));
  }),

  // Staff APIs (mapped to /users)
  rest.get('/api/users', (req, res, ctx) => {
    const tenantId = req.url.searchParams.get('tenantId');
    return res(ctx.json({ data: mockStaff }));
  }),

  rest.post('/api/users', async (req, res, ctx) => {
    const newStaff = await req.json();
    const staff = { id: '2', ...newStaff };
    mockStaff.push(staff);
    return res(ctx.json({ data: staff }));
  }),

  rest.get('/api/users/:id', (req, res, ctx) => {
    return res(ctx.json({ data: mockStaff[0] }));
  }),

  // Order APIs
  rest.get('/api/orders/patient/:patientId', (req, res, ctx) => {
    return res(ctx.json(mockOrders));
  }),

  rest.get('/api/orders/:orderId', (req, res, ctx) => {
    return res(ctx.json({ data: mockOrders[0] }));
  }),

  rest.post('/api/orders', async (req, res, ctx) => {
    const formData = await req.formData();
    const order = {
      order_id: 'new-order-1',
      patient_id: formData.get('patient_id'),
      ...Object.fromEntries(formData)
    };
    mockOrders.push(order);
    return res(ctx.json({ data: order }));
  })
);

// Auto-start server for tests
beforeAll(() => server.listen({
  onUnhandledRequest: 'error',
}));

afterEach(() => server.resetHandlers());
afterAll(() => server.close());
