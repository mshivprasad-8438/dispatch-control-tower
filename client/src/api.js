const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
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
