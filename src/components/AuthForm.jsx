import { useState } from 'react'
import { Link } from 'react-router-dom'

// Shared by the login and register pages.
export default function AuthForm({ title, submitLabel, onSubmit, isRegister = false, footer }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await onSubmit(email, password)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
    // On success the provider flips to authenticated and the route redirects, so no reset needed.
  }

  return (
    <main className="card">
      <h1>{title}</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            autoFocus
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            minLength={isRegister ? 8 : undefined}
            required
          />
          {isRegister && <small>At least 8 characters</small>}
        </label>

        {error && <p className="error" role="alert">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Please wait…' : submitLabel}
        </button>
      </form>
      <p className="footer">
        {footer.text} <Link to={footer.to}>{footer.link}</Link>
      </p>
    </main>
  )
}
