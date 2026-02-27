// src/api/multipart-upload.ts

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

/* ===========================
   INITIATE MULTIPART UPLOAD
=========================== */
export async function initiateMultipartUpload(data: {
  file_name: string;
  file_size: number;
  mimeType: string;
  order_id: string;
  patient_id: string;
}) {
  const res = await fetch(`${API_BASE}/orders/initiate-multipart-upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Failed to initiate upload");
  }

  return json.data;
}

/* ===========================
   UPLOAD PARTS TO S3
=========================== */
export async function uploadPartsToS3({
  file,
  presignedUrls,
  onProgress,
}: {
  file: File;
  presignedUrls: { partNumber: number; url: string }[];
  onProgress?: (percent: number) => void;
}) {
  const chunkSize = 5 * 1024 * 1024; // 5MB
  const parts: { ETag: string; PartNumber: number }[] = [];

  for (let i = 0; i < presignedUrls.length; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const blob = file.slice(start, end);

    const response = await fetch(presignedUrls[i].url, {
      method: "PUT",
      body: blob,
    });

    if (!response.ok) {
      throw new Error("Failed uploading part " + (i + 1));
    }

    const ETag = response.headers.get("ETag");
    if (!ETag) {
      throw new Error("Missing ETag from S3");
    }

    parts.push({
      ETag: ETag.replace(/"/g, ""),
      PartNumber: presignedUrls[i].partNumber,
    });

    if (onProgress) {
      const percent = Math.round(((i + 1) / presignedUrls.length) * 100);
      onProgress(percent);
    }
  }

  return parts;
}

/* ===========================
   COMPLETE MULTIPART
=========================== */
export async function completeMultipartUpload(data: {
  uploadId: string;
  key: string;
  patient_id: string;
  file_type: string;
  parts: { ETag: string; PartNumber: number }[];
}) {
  const res = await fetch(`${API_BASE}/orders/complete-multipart-upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Failed to complete upload");
  }

  return json.data; // { message, key, imageRecordId }
}

/* ===========================
   GET PRESIGNED VIEW URL
=========================== */
export async function getPresignedViewUrl(key: string) {
  const res = await fetch(
    `${API_BASE}/orders/view-file?key=${encodeURIComponent(key)}`,
  );

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Failed to get view URL");
  }

  return json.data.url; //  return only the URL string
}
