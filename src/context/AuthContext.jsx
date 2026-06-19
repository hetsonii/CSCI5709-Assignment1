import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('tt_token')
    if (!token) {
      setLoading(false)
      return
    }
    authApi.me()
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem('tt_token'))
      .finally(() => setLoading(false))
  }, [])

  async function signup(name, email, password) {
    const data = await authApi.signup({ name, email, password })
    localStorage.setItem('tt_token', data.token)
    setUser(data.user)
    return data
  }

  async function login(email, password) {
    const data = await authApi.login({ email, password })
    localStorage.setItem('tt_token', data.token)
    setUser(data.user)
    return data
  }

  function logout() {
    localStorage.removeItem('tt_token')
    setUser(null)
  }

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