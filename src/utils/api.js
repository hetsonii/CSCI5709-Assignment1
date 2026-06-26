/**
 * api.js — centralised fetch wrapper
 *
 * Auth is now handled via httpOnly cookies.
 * Every request sends credentials:include so the browser
 * automatically attaches the tt_token cookie.
 * No token is ever stored in JS / localStorage.
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',   // <── sends cookie on every request
  })

  let data
  try {
    data = await res.json()
  } catch {
    data = {}
  }

  if (!res.ok) {
    const err = new Error(data.message || 'Request failed.')
    err.status  = res.status
    err.errors  = data.errors || null
    throw err
  }

  return data
}

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login:  (body) => request('/auth/login',  { method: 'POST', body: JSON.stringify(body) }),
  logout: ()     => request('/auth/logout', { method: 'POST' }),
  me:     ()     => request('/auth/me'),
}

// ── Apartments ────────────────────────────────────────────────
export const apartmentsApi = {
  list: ()     => request('/apartments'),
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
  get:    ()     => request('/profile'),
  update: (body) => request('/profile', { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (body) => request('/profile', { method: 'DELETE', body: JSON.stringify(body) }),
}

// ── Upload ────────────────────────────────────────────────────
export const uploadApi = {
  upload: (file) => {
    const form = new FormData()
    form.append('file', file)
    // Do NOT set Content-Type — browser sets multipart boundary automatically
    return fetch(`${BASE}/upload`, {
      method:      'POST',
      credentials: 'include',   // <── cookie auth
      body:        form,
    }).then(async (res) => {
      const data = await res.json()
      if (!res.ok) {
        const err = new Error(data.message || 'Upload failed.')
        err.status = res.status
        throw err
      }
      return data   // { url }
    })
  },
}