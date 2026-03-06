import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { msalReady } from './lib/msalConfig.js'

// Initialize MSAL before mounting so that by the time a user clicks a button,
// initialize() is already resolved and loginPopup() fires with no awaits
// breaking the browser's user-activation chain (which causes popup_window_error).
msalReady.then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </StrictMode>,
  )
})
