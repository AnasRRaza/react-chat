import { useLocation, useNavigate } from 'react-router-dom'
import AuthForm from '../components/AuthForm'
import { useAuth } from '../context/useAuth'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from?.pathname ?? '/'

  async function handleLogin(email, password) {
    await login(email, password)
    navigate(redirectTo, { replace: true })
  }

  return (
    <AuthForm
      title="Log in"
      submitLabel="Log in"
      onSubmit={handleLogin}
      footer={{ text: "Don't have an account?", to: '/register', link: 'Sign up' }}
    />
  )
}
