// Base API client for MediAI Backend
const API_BASE = '/api';

class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const res = await fetch(url, config);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.error?.message || data?.message || `Request failed (${res.status})`;
    const code = data?.error?.code || 'UNKNOWN';
    throw new ApiError(message, res.status, code);
  }

  // Backend wraps successful responses in { success: true, data: ... }
  return data?.data !== undefined ? data.data : data;
}

export const api = {
  get: (endpoint, params) => {
    const searchParams = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`${endpoint}${searchParams}`);
  },
  post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

export { ApiError };
