import { useAuth } from '../context/useAuth'

// Placeholder: the chat UI will live here.
export default function HomePage() {
  const { user, logout } = useAuth()

  return (
    <main className="card">
      <h1>Hello, {user.email}</h1>
      <p>You are logged in. Chat is coming next.</p>
      <button type="button" onClick={logout}>Log out</button>
    </main>
  )
}
