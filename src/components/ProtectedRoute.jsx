import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Renders child routes when the user is logged in.
 * AuthContext returns null while loading (the /me check),
 * so by the time ProtectedRoute renders, loading is always false.
 */
export default function ProtectedRoute() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}