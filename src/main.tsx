import '@fontsource-variable/fredoka'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import './index.css'
import { startUpdates } from './pwa/updates'

if (import.meta.env.PROD) startUpdates()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
