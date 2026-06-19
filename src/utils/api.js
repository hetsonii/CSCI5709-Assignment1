const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function getToken() {
  return localStorage.getItem('tt_token')
}

async function request(path, options = {}) {
  const token = getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  let data
  try {
    data = await res.json()
  } catch {
    data = {}
  }

  if (!res.ok) {
    const err = new Error(data.message || 'Request failed.')
    err.status = res.status
    err.errors = data.errors || null
    throw err
  }

  return data
}

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login:  (body) => request('/auth/login',  { method: 'POST', body: JSON.stringify(body) }),
  me:     ()     => request('/auth/me'),
}

// ── Apartments ────────────────────────────────────────────────
export const apartmentsApi = {
  list: () => request('/apartments'),
  get:  (slug) => request(`/apartments/${slug}`),

  addReview: (slug, body) =>
    request(`/apartments/${slug}/reviews`, { method: 'POST', body: JSON.stringify(body) }),

  updateReview: (slug, reviewId, body) =>
    request(`/apartments/${slug}/reviews/${reviewId}`, { method: 'PUT', body: JSON.stringify(body) }),

  deleteReview: (slug, reviewId) =>
    request(`/apartments/${slug}/reviews/${reviewId}`, { method: 'DELETE' }),

  addComment: (slug, reviewId, body) =>
    request(`/apartments/${slug}/reviews/${reviewId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    }),

  deleteComment: (slug, reviewId, commentId) =>
    request(`/apartments/${slug}/reviews/${reviewId}/comments/${commentId}`, { method: 'DELETE' }),
}

// ── Profile ───────────────────────────────────────────────────
export const profileApi = {
  get: () => request('/profile'),
}

// ── Upload ────────────────────────────────────────────────────
export const uploadApi = {
  upload: (file) => {
    const token = getToken()
    const form  = new FormData()
    form.append('file', file)
    return fetch(`${BASE}/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }).then(async (res) => {
      const data = await res.json()
      if (!res.ok) {
        const err = new Error(data.message || 'Upload failed.')
        err.status = res.status
        throw err
      }
      return data
    })
  },
}