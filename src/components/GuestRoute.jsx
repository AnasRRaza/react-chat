import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

// Wraps login/register: a logged-in user has no reason to see them.
export default function GuestRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />
}
