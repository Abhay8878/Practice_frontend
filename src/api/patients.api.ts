import api from "./axios";
import type { Patient, Address } from "../types/patientType";

// Type for API payload (dob is string in API, Date in frontend)
export type CreatePatientPayload = Omit<Patient, "id" | "dob" | "addresses"> & {
  dob: string | null;
  address: Address;
};

export async function createPatient(patient: CreatePatientPayload) {
  // 🔹 Include tenantId for tenant isolation
  const tenantId = localStorage.getItem("tenantId");
  const payload = { ...patient, tenantId };
  const response = await api.post("/patients", payload);
  return response.data.data;
}

export async function getPatients(page?: number, limit?: number) {
  // 🔹 Filter by tenantId for tenant isolation
  const tenantId = localStorage.getItem("tenantId");
  const params = new URLSearchParams();
  if (tenantId) {
    params.set("tenantId", tenantId);
  }
  if (page && limit) {
    params.set("page", page.toString());
    params.set("limit", limit.toString());
  }
  const response = await api.get(`/patients?${params.toString()}`);
  return response.data;
}

export async function getPatientById(id: string) {
  console.log("Fetching patient with ID:", id);
  const response = await api.get(`/patients/${id}`);
  return response.data.data;
}

export async function updatePatient(id: string, patient: Partial<Patient>) {
  const response = await api.patch(`/patients/${id}`, patient);
  return response.data.data;
}

export async function deletePatient(id: string) {
  const response = await api.delete(`/patients/${id}`);
  return response.data.data;
}
