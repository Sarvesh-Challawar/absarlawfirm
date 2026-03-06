import { PublicClientApplication } from '@azure/msal-browser'

const msalConfig = {
  auth: {
    clientId  : import.meta.env.VITE_AZURE_CLIENT_ID,
    authority : `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
    redirectUri: window.location.origin + (import.meta.env.BASE_URL || '/'),
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
}

export const msalInstance = new PublicClientApplication(msalConfig)

/** Scopes needed to read/write OneDrive files */
export const graphScopes = ['Files.ReadWrite', 'User.Read']
