import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { useSocket } from '../context/useSocket'

const MAX_MESSAGES = 200
const MAX_LENGTH = 500 // matches the server's limit

const STATUS_LABEL = {
  connected: 'Connected',
  connecting: 'Connecting…',
  disconnected: 'Disconnected',
}

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export default function ChatPage() {
  const { user, logout } = useAuth()
  const { socket, status } = useSocket()
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const listRef = useRef(null)
  const stickToBottom = useRef(true)

  useEffect(() => {
    if (!socket) return
    const onMessage = (msg) => setMessages((prev) => [...prev, msg].slice(-MAX_MESSAGES))
    socket.on('chat:message', onMessage)
    return () => socket.off('chat:message', onMessage)
  }, [socket])

  // Follow new messages, unless the user scrolled up to read older ones.
  useEffect(() => {
    const el = listRef.current
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight
  }, [messages])

  function handleScroll() {
    const el = listRef.current
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }

  async function handleSend(e) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || !socket || status !== 'connected' || sending) return

    setError('')
    setSending(true)
    stickToBottom.current = true
    try {
      const res = await socket.timeout(5000).emitWithAck('chat:message', { text })
      if (res.ok) setDraft('')
      else setError(res.error)
    } catch {
      setError('Message not delivered. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="chat">
      <header className="chat-header">
        <div>
          <h1>Chat</h1>
          <span className="muted">{user.email}</span>
        </div>
        <div className="chat-actions">
          <span className={`status status-${status}`} role="status">
            {STATUS_LABEL[status]}
          </span>
          <button type="button" className="secondary" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <ul className="messages" ref={listRef} onScroll={handleScroll} aria-live="polite">
        {messages.length === 0 && <li className="empty">No messages yet. Say hello!</li>}
        {messages.map((msg) => {
          const mine = msg.user.id === user.id
          return (
            <li key={msg.id} className={mine ? 'message mine' : 'message'}>
              <div className="meta">
                {mine ? 'You' : msg.user.email} · {formatTime(msg.createdAt)}
              </div>
              <div className="bubble">{msg.text}</div>
            </li>
          )
        })}
      </ul>

      <form className="composer" onSubmit={handleSend}>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="composer-row">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={status === 'connected' ? 'Type a message' : 'Waiting for connection…'}
            maxLength={MAX_LENGTH}
            disabled={status !== 'connected'}
            autoFocus
            aria-label="Message"
          />
          <button type="submit" disabled={status !== 'connected' || sending || !draft.trim()}>
            Send
          </button>
        </div>
      </form>
    </main>
  )
}
