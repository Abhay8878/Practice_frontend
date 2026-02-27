import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { PatientDetails } from "../components/form/patient/PatientDetails";
import { format } from "date-fns";
import { renderWithRouter } from "./testUtils";

// Mock date-fns to control formatted output
vi.mock("date-fns", () => ({
  format: vi.fn()
}));

const mockPatientWithAddress = {
  id: "1",
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  contact: "1234567890",
  gender: "Male",
  dob: new Date("1990-01-01"),
  address: {
    street: "123 Main St",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    zipCode: "411001"
  }
};

const mockPatientWithoutAddress = {
  id: "2",
  firstName: "Jane",
  lastName: "Smith",
  email: "jane@example.com",
  contact: "0987654321",
  gender: "Female",
  dob: null
};

const mockPatientWithAddressesArray = {
  id: "3",
  firstName: "Bob",
  lastName: "Wilson",
  email: "bob@example.com",
  contact: "1122334455",
  gender: "Male",
  dob: new Date("1985-05-15"),
  addresses: [{
    street: "456 Oak Ave",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    zipCode: "400001"
  }]
};

describe("PatientDetails Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(format).mockImplementation((date) => {
      if (!date) return "-";
      return "01-01-1990"; // Matches component's format pattern MM-dd-yyyy loosely for testing
    });
  });

  it("renders personal information section with all fields", () => {
    renderWithRouter(<PatientDetails patient={mockPatientWithAddress} />);

    expect(screen.getByText("Personal Information")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    // Masked email will be john**********m
    expect(screen.getByText(/john/i)).toBeInTheDocument();
    // Masked phone will be 123******0
    expect(screen.getByText(/123/i)).toBeInTheDocument();
    expect(screen.getByText("Male")).toBeInTheDocument();
    expect(screen.getByText("01-01-1990")).toBeInTheDocument();
  });

  it("renders address section when patient has address object", () => {
    renderWithRouter(<PatientDetails patient={mockPatientWithAddress} />);

    expect(screen.getByText("Address Details")).toBeInTheDocument();
    expect(screen.getByText("123 Main St")).toBeInTheDocument();
    expect(screen.getByText("Pune")).toBeInTheDocument();
    expect(screen.getByText("Maharashtra")).toBeInTheDocument();
    expect(screen.getByText("India")).toBeInTheDocument();
    expect(screen.getByText("411001")).toBeInTheDocument();
  });

  it("renders address section when patient has addresses array", () => {
    renderWithRouter(<PatientDetails patient={mockPatientWithAddressesArray} />);

    expect(screen.getByText("Address Details")).toBeInTheDocument();
    expect(screen.getByText("456 Oak Ave")).toBeInTheDocument();
    expect(screen.getByText("Mumbai")).toBeInTheDocument();
    expect(screen.getByText("400001")).toBeInTheDocument();
  });

  it("hides address section when no address or addresses array", () => {
    renderWithRouter(<PatientDetails patient={mockPatientWithoutAddress} />);

    expect(screen.queryByText("Address Details")).not.toBeInTheDocument();
  });

  it("shows dash for missing DOB", () => {
    renderWithRouter(<PatientDetails patient={mockPatientWithoutAddress} />);
    expect(screen.getByText("-")).toBeInTheDocument(); // DOB
  });

  it("shows dash for missing values", () => {
    const patientWithEmptyValues = {
      id: "4",
      firstName: "Test",
      lastName: "",
      email: "",
      contact: "",
      gender: "",
      dob: null
    };

    renderWithRouter(<PatientDetails patient={patientWithEmptyValues} />);

    // We expect dashes for missing values. lastName is part of Full Name, so it will be "Test "
    expect(screen.getAllByText("-")).toHaveLength(4); // contact, gender, dob, countryCode (default in address logic)
  });
});
