const API_URL = import.meta.env.VITE_API_URL || '';

export async function api(path, options = {}) {
  const token = localStorage.getItem('mini-crm-token');
  const response = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  const payload = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload?.message || 'The request could not be completed.');
    error.status = response.status;
    throw error;
  }
  return payload;
}

export function sendJson(method, body) {
  return { method, body: JSON.stringify(body) };
}