const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
const ADMIN_RESET_KEY =
  import.meta.env.VITE_ADMIN_RESET_KEY || "local-admin-reset-key";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.message || "Request failed");
  }

  return body;
}

export function getOrders() {
  return request("/api/orders");
}

export function getVehicles() {
  return request("/api/vehicles");
}

export function savePlan(payload) {
  return request("/api/plans", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function resetData() {
  return request("/api/admin/reset-data", {
    method: "POST",
    headers: {
      "x-admin-reset-key": ADMIN_RESET_KEY,
    },
  });
}
