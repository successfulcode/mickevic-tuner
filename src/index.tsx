import { render } from 'solid-js/web'
import App from './App'

const root = document.getElementById('root')
render(() => <App />, root!)

// Register service worker in production only
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch((err) => console.warn('SW registration failed:', err))
  })
}
