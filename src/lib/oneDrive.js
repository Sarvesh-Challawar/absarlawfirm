import { msalInstance, graphScopes } from './msalConfig'

const FOLDER = import.meta.env.VITE_ONEDRIVE_FOLDER || 'lawfirmarticles'
const GRAPH   = 'https://graph.microsoft.com/v1.0'

// In-memory cache: itemId → anonymous share webUrl
const shareLinkCache = new Map()

// ── auth ──────────────────────────────────────────────────────────────────────

let _initialized = false

async function getToken() {
  if (!_initialized) {
    await msalInstance.initialize()
    _initialized = true
  }

  const accounts = msalInstance.getAllAccounts()

  if (!accounts.length) {
    // First time — show login popup
    const result = await msalInstance.loginPopup({ scopes: graphScopes })
    return result.accessToken
  }

  try {
    const result = await msalInstance.acquireTokenSilent({
      scopes : graphScopes,
      account: accounts[0],
    })
    return result.accessToken
  } catch {
    // Silent refresh failed — show popup
    const result = await msalInstance.acquireTokenPopup({
      scopes : graphScopes,
      account: accounts[0],
    })
    return result.accessToken
  }
}

// ── helpers ───────────────────────────────────────────────────────────────────

async function ensureFolder(token) {
  const check = await fetch(
    `${GRAPH}/me/drive/root:/${FOLDER}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (check.ok) return

  // Folder doesn't exist — create it
  await fetch(`${GRAPH}/me/drive/root/children`, {
    method : 'POST',
    headers: {
      Authorization : `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name   : FOLDER,
      folder : {},
      '@microsoft.graph.conflictBehavior': 'fail',
    }),
  })
}

async function getOrCreateShareLink(token, itemId) {
  if (shareLinkCache.has(itemId)) return shareLinkCache.get(itemId)

  const res = await fetch(`${GRAPH}/me/drive/items/${itemId}/createLink`, {
    method : 'POST',
    headers: {
      Authorization : `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type: 'view', scope: 'anonymous' }),
  })

  if (!res.ok) throw new Error('Could not create share link')

  const data   = await res.json()
  const webUrl = data.link.webUrl
  shareLinkCache.set(itemId, webUrl)
  return webUrl
}

// ── public API ────────────────────────────────────────────────────────────────

/**
 * List all PDFs in the OneDrive folder.
 * Returns: [{ id, name, webUrl, size }]
 */
export async function listPDFs() {
  const token = await getToken()

  const res = await fetch(
    `${GRAPH}/me/drive/root:/${FOLDER}:/children?$select=id,name,webUrl,size,file`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (!res.ok) {
    if (res.status === 404) return []   // folder not yet created
    throw new Error('Failed to list files from OneDrive')
  }

  const data = await res.json()
  return (data.value || []).filter(f =>
    f.file && f.name.toLowerCase().endsWith('.pdf')
  )
}

/**
 * Upload a PDF file to the OneDrive folder.
 * Returns the uploaded item object.
 */
export async function uploadPDF(file) {
  const token = await getToken()
  await ensureFolder(token)

  const res = await fetch(
    `${GRAPH}/me/drive/root:/${FOLDER}/${encodeURIComponent(file.name)}:/content`,
    {
      method : 'PUT',
      headers: {
        Authorization : `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
      },
      body: file,
    }
  )

  if (!res.ok) throw new Error('Upload failed')
  return res.json()
}

/**
 * Get the anonymous share link (embed-safe) for a file.
 * Cached per session so we don't create duplicate links.
 */
export async function getShareLink(itemId) {
  const token = await getToken()
  return getOrCreateShareLink(token, itemId)
}

/**
 * Delete a file from the OneDrive folder.
 */
export async function deletePDF(itemId) {
  const token = await getToken()

  const res = await fetch(`${GRAPH}/me/drive/items/${itemId}`, {
    method : 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok && res.status !== 204) throw new Error('Delete failed')
  shareLinkCache.delete(itemId)
}
