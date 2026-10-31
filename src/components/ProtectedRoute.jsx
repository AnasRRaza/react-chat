import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

// Wraps routes that need a logged-in user.
export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    // Remember where they were going so login can send them back.
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}
