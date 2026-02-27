import api from "./axios";

/* ---------- Types: Image 3D Metadata ---------- */
export type Image3DMetadata = {
  s3_key: string;
  s3_bucket: string;
  file_name: string;
  file_size: number;
  content_type: string;
  order_id: string;
  patient_id: string;
  uploaded_at: string;
};

/* ---------- Types (match backend response) ---------- */
export type Order = {
  order_id: string;
  patient_id: string;
  product_list: string;
  shade: string;
  tooth_numbers: string;
  priority: string;
  status: string;
  order_date: string;
  product_type: string;
  image: string;
  expected_delivery?: string;
  design_notes?: string;
  image_3d?: Image3DMetadata[] | null;
  image_3d_urls?: string[] | null;
  image_repository_ids?: string[] | null;
  comment?: string[] | null;
};

/* ---------- Types (Create Order Payload) ---------- */
export type CreateOrderPayload = {
  patient_id: string;
  product_list: string;
  shade: string;
  tooth_numbers: number[];
  priority: string; // backend enum
  order_date: string; // ISO string
  expected_delivery: string; // ISO string
  design_notes?: string;
};

/* ---------- APIs ---------- */

// Fetch orders for a particular patient
export async function getOrdersByPatientId(patientId: string, page?: number, limit?: number) {
  const params = new URLSearchParams();
  if (page) params.set("page", page.toString());
  if (limit) params.set("limit", limit.toString());

  const response = await api.get(`/orders/patient/${patientId}?${params.toString()}`);
  return response.data;
}

// Fetch single order (for details)
export async function getOrderById(orderId: string) {
  const response = await api.get(`/orders/${orderId}`);
  return response.data.data;
}

// ✅ ADD PRODUCT (CREATE ORDER)
export async function createOrder(payload: FormData) {
  const response = await api.post("/orders", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
}

// ✅ UPDATE PRODUCT (UPDATE ORDER)
export async function updateOrder(orderId: string, payload: FormData) {
  const response = await api.patch(`/orders/${orderId}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
}

// ✅ GET PRODUCT LISTS
export async function getProductLists() {
  const response = await api.get("/orders/product-list");
  return response.data.data;
}

// ✅ GET PRODUCT TYPES BY LIST NAME
export async function getProductTypes(listName: string) {
  const response = await api.get("/orders/product-type", {
    params: { listName },
  });
  return response.data.data;
}

// ✅ GET PRODUCT IMAGE
export async function getProductImage(listName: string, typeName: string) {
  const response = await api.get("/orders/product-image", {
    params: { listName, typeName },
  });
  return response.data.data; // returns base64 string or null
}

// ✅ GET TRACKING DETAILS
export async function getTracking(orderId: string) {
  const response = await api.get("/tracking", {
    params: { order_id: orderId },
  });
  return response.data;
}

// ✅ UPDATE IMAGE STATUS
export async function updateImageStatus(id: string, status: string) {
  const response = await api.patch(`/orders/image/${id}/status`, { status });
  return response.data;
}
