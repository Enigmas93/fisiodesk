import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient()

// #region debug-point A:bootstrap-location
fetch('http://127.0.0.1:7777/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: 'root-auto-login', runId: 'pre-fix', hypothesisId: 'A', location: 'src/main.tsx:bootstrap', msg: '[DEBUG] main bootstrap', data: { href: window.location.href, pathname: window.location.pathname }, ts: Date.now() }) }).catch(() => {})
window.addEventListener('popstate', () => { fetch('http://127.0.0.1:7777/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: 'root-auto-login', runId: 'pre-fix', hypothesisId: 'A', location: 'src/main.tsx:popstate', msg: '[DEBUG] popstate navigation', data: { href: window.location.href, pathname: window.location.pathname }, ts: Date.now() }) }).catch(() => {}) })
const debugReplaceState = window.history.replaceState.bind(window.history)
window.history.replaceState = (...args) => { fetch('http://127.0.0.1:7777/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: 'root-auto-login', runId: 'pre-fix', hypothesisId: 'A', location: 'src/main.tsx:replaceState', msg: '[DEBUG] history.replaceState', data: { href: window.location.href, pathname: window.location.pathname, nextUrl: typeof args[2] === 'string' ? args[2] : null }, ts: Date.now() }) }).catch(() => {}); return debugReplaceState(...args) }
const debugPushState = window.history.pushState.bind(window.history)
window.history.pushState = (...args) => { fetch('http://127.0.0.1:7777/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: 'root-auto-login', runId: 'pre-fix', hypothesisId: 'A', location: 'src/main.tsx:pushState', msg: '[DEBUG] history.pushState', data: { href: window.location.href, pathname: window.location.pathname, nextUrl: typeof args[2] === 'string' ? args[2] : null }, ts: Date.now() }) }).catch(() => {}); return debugPushState(...args) }
// #endregion

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
