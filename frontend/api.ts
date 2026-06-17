const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('ora_token');
}

function authHeaders(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...((options.headers as Record<string, string>) || {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  register: (name: string, email: string, password: string) =>
    request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<any>('/auth/me'),

  // Research
  startResearch: (query: string) =>
    request<{ session_id: string; status: string }>('/research/start', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  getStatus: (sessionId: string) =>
    request<any>(`/research/status/${sessionId}`),

  getReport: (sessionId: string) =>
    request<any>(`/research/report/${sessionId}`),

  getPdfUrl: (sessionId: string) => `${BASE}/research/report/${sessionId}/pdf`,

  // History
  getHistory: (search = '', limit = 20, offset = 0) =>
    request<any>(`/history/?search=${encodeURIComponent(search)}&limit=${limit}&offset=${offset}`),

  deleteSession: (sessionId: string) =>
    request<any>(`/history/${sessionId}`, { method: 'DELETE' }),
};

export { getToken };
