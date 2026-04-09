import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

function ensureSafeMatchMedia(): void {
  if (typeof window === 'undefined') return

  const fallback = (query: string): MediaQueryList => {
    const noop = () => {}
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: noop,
      removeListener: noop,
      addEventListener: noop,
      removeEventListener: noop,
      dispatchEvent: () => false,
    } as MediaQueryList
  }

  const nativeMatchMedia =
    typeof window.matchMedia === 'function' ? window.matchMedia.bind(window) : null

  window.matchMedia = ((query: string): MediaQueryList => {
    if (!nativeMatchMedia) return fallback(query)
    try {
      const result = nativeMatchMedia(query)
      return result ?? fallback(query)
    } catch {
      return fallback(query)
    }
  }) as typeof window.matchMedia
}

ensureSafeMatchMedia()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
