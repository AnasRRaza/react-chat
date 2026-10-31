const BASE_URL = '/api'
const STORAGE_KEY = 'auth'

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// --- session storage (token + user live together) ---

export function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? null
  } catch {
    return null
  }
}

export function saveSession(session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // storage unavailable (private mode etc.): the session just won't survive a reload
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

// --- 401 handling: AuthProvider registers a callback that logs the user out ---

let onUnauthorized = () => {}

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

// --- request helper ---

export async function request(path, { method = 'GET', body } = {}) {
  const token = loadSession()?.token

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Is the API running?')
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null)

  if (!res.ok) {
    // A 401 while we held a token means it expired or is invalid: drop the session.
    // (A 401 from /auth/login has no token attached, so it just shows "invalid credentials".)
    if (res.status === 401 && token) onUnauthorized()
    throw new ApiError(res.status, data?.error ?? `Request failed (${res.status})`)
  }

  return data
}
