import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount: hit /me — if the cookie is still valid the server returns
  // the user, otherwise it 401s and we stay logged out.
  // No localStorage, no token juggling.
  useEffect(() => {
    authApi.me()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))      // 401 = not logged in, that's fine
      .finally(() => setLoading(false))
  }, [])

  async function signup(name, email, password) {
    const data = await authApi.signup({ name, email, password })
    // Server sets the httpOnly cookie; we just store the user object in state
    setUser(data.user)
    return data
  }

  async function login(email, password) {
    const data = await authApi.login({ email, password })
    setUser(data.user)
    return data
  }

  async function logout() {
    try {
      await authApi.logout()   // tells server to clear the cookie
    } catch {
      // ignore network errors on logout
    }
    setUser(null)
  }

  // Show nothing until we know whether the user is logged in.
  // Prevents ProtectedRoute from flashing the login page on refresh.
  if (loading) return null

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}