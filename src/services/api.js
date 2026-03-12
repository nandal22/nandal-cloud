const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function getToken() {
  return localStorage.getItem('nc_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

// ── Auth ────────────────────────────────────────────────────────────
export const auth = {
  register: (email, password, name) =>
    request('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),

  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  me: () => request('/api/auth/me'),
}

// ── Upload (two-step, direct-to-Supabase) ───────────────────────────
export const upload = {
  sign: (filename, folderId, size, mimeType) =>
    request('/api/upload/sign', {
      method: 'POST',
      body: JSON.stringify({ filename, folderId, size, mimeType }),
    }),

  complete: (fileId) =>
    request('/api/upload/complete', {
      method: 'POST',
      body: JSON.stringify({ fileId }),
    }),
}

// ── Download ────────────────────────────────────────────────────────
export const download = {
  getUrl: (fileId) => request(`/api/download/${fileId}`),
}

// ── Files ───────────────────────────────────────────────────────────
export const files = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/api/files${q ? `?${q}` : ''}`)
  },
  delete: (fileId)          => request(`/api/files/${fileId}`, { method: 'DELETE' }),
  patch:  (fileId, updates) => request(`/api/files/${fileId}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  folders: {
    list:   ()                    => request('/api/files/folders'),
    create: (name, parentId, color) =>
      request('/api/files/folders', { method: 'POST', body: JSON.stringify({ name, parentId, color }) }),
    delete: (folderId) => request(`/api/files/folders/${folderId}`, { method: 'DELETE' }),
  },
}
