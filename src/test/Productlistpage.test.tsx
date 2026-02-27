import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { act } from "react";
import AddProductForm from "../components/form/product/AddProductForm.tsx";
import OrderDetailsDialog from "../components/form/product/ProductDetails.tsx";
import { renderWithRouter } from "./testUtils";

// Mock API calls
vi.mock("../api/orders.api", () => ({
  createOrder: vi.fn(),
  getProductLists: vi.fn(() => Promise.resolve([{ list_id: 1, list_name: "Crowns" }])),
  getProductTypes: vi.fn(() => Promise.resolve([{ product_id: 1, product_name: "Porcelain" }])),
  getProductImage: vi.fn(() => Promise.resolve("mock-image")),
  updateOrder: vi.fn(),
}));

// Mock ThreeDimensionalViewer
vi.mock("../../ThreeDimensionalViewer", () => ({
  default: () => <div data-testid="viewer-mock">Viewer Mock</div>
}));

// Mock TeethSelector
vi.mock("../components/form/product/TeethSelector.tsx", () => ({
  default: () => (
    <div data-testid="teeth-selector">Teeth Selector Mock</div>
  ),
}));

// Mock useNavigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe("AddProductForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Fix localStorage for MaskingProvider
    window.localStorage.getItem = vi.fn((key) => {
      if (key === "isMasked") return "true";
      if (key === "tenantId") return "clinic-123";
      return null;
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders form with all fields", async () => {
    await act(async () => {
      renderWithRouter(<AddProductForm patientId="patient-123" onSuccess={() => { }} />);
    });

    expect(screen.getByRole("button", { name: /create order/i })).toBeInTheDocument();
  });
});

describe("OrderDetailsDialog", () => {
  const mockOrder = {
    order_id: "ORD-123",
    product_list: "Crowns",
    product_type: "Porcelain",
    shade: "A1",
    tooth_numbers: ["1", "2", "3"],
    priority: "HIGH",
    status: "PENDING",
    order_date: "2026-02-02T10:00:00Z",
    image: "mock-image-data",
    patient_id: "patient-123",
  };

  const mockOnClose = vi.fn();

  it("renders order details correctly", async () => {
    await act(async () => {
      renderWithRouter(<OrderDetailsDialog order={mockOrder as any} onClose={mockOnClose} />);
    });

    expect(screen.getByText("Order Details")).toBeInTheDocument();
  });
});
