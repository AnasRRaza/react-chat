import { useCallback, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/auth'
import { clearSession, loadSession, saveSession, setUnauthorizedHandler } from '../api/client'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  // Restore the session synchronously so a reload doesn't flash the login page.
  const [session, setSession] = useState(loadSession)

  const startSession = useCallback(({ user, token }) => {
    const next = { user, token }
    saveSession(next)
    setSession(next)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const login = useCallback(
    async (email, password) => startSession(await authApi.login(email, password)),
    [startSession],
  )

  const register = useCallback(
    async (email, password) => startSession(await authApi.register(email, password)),
    [startSession],
  )

  // If any API call comes back 401 with a token, the token is dead: log out.
  useEffect(() => {
    setUnauthorizedHandler(logout)
    return () => setUnauthorizedHandler(() => {})
  }, [logout])

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session?.token),
      login,
      register,
      logout,
    }),
    [session, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
