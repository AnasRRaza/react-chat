import { useNavigate } from 'react-router-dom'
import AuthForm from '../components/AuthForm'
import { useAuth } from '../context/useAuth'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  async function handleRegister(email, password) {
    await register(email, password)
    navigate('/', { replace: true })
  }

  return (
    <AuthForm
      title="Create account"
      submitLabel="Sign up"
      isRegister
      onSubmit={handleRegister}
      footer={{ text: 'Already have an account?', to: '/login', link: 'Log in' }}
    />
  )
}
