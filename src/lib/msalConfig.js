import { PublicClientApplication } from '@azure/msal-browser'

// Build redirect URI from origin + BASE_URL, always with a trailing slash
const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/')
const redirectUri = window.location.origin + base

const msalConfig = {
  auth: {
    clientId  : import.meta.env.VITE_AZURE_CLIENT_ID,
    authority : `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
    redirectUri,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
}

export const msalInstance = new PublicClientApplication(msalConfig)

/**
 * Promise that resolves when msalInstance is fully initialized.
 * Awaited in main.jsx before the React app mounts so that by the time
 * any user clicks a button, initialize() is already done.
 * This prevents the popup blocker from firing because loginPopup()
 * can then be called with no awaits breaking the user-activation chain.
 */
export const msalReady = msalInstance.initialize()

/** Scopes needed to read/write OneDrive files */
export const graphScopes = ['Files.ReadWrite', 'User.Read']

/** Extra login request options — forces the account picker so a cached
 *  personal account doesn't shadow the business account. */
export const loginRequest = { scopes: graphScopes, prompt: 'select_account' }
