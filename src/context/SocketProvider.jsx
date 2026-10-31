import { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import { SocketContext } from './socket-context'
import { useAuth } from './useAuth'

const CONNECTING = { socket: null, status: 'connecting' }
const LOGGED_OUT = { socket: null, status: 'disconnected' }

// Opens one authenticated socket while logged in; closes it on logout.
// status: 'connecting' | 'connected' | 'disconnected'
// State is only set from socket event callbacks, and "connecting" is the default
// until the first event arrives, so the effect body never calls setState directly.
export function SocketProvider({ children }) {
  const { token, logout } = useAuth()
  const [conn, setConn] = useState(CONNECTING)

  useEffect(() => {
    if (!token) return

    // Same origin as the page: the Vite proxy forwards /socket.io to the API.
    const socket = io({ auth: { token }, transports: ['websocket'] })

    socket.on('connect', () => setConn({ socket, status: 'connected' }))
    socket.on('disconnect', () => setConn({ socket, status: 'disconnected' }))
    socket.on('connect_error', (err) => {
      // The server refused our token (expired, invalid, or the user is gone).
      if (err.message === 'Unauthorized') logout()
      else setConn({ socket, status: 'connecting' }) // network trouble: socket.io keeps retrying
    })

    // Also runs between StrictMode's double mount in dev: closes the first socket.
    return () => {
      socket.disconnect()
      setConn(CONNECTING)
    }
  }, [token, logout])

  const value = useMemo(() => (token ? conn : LOGGED_OUT), [token, conn])

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
