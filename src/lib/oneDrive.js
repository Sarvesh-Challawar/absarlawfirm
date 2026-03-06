import { msalInstance, graphScopes } from './msalConfig'
import { supabase } from './supabase'

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

/**
 * Pre-authenticate the user with OneDrive.
 * Call this directly from a button-click handler so the browser allows the
 * MSAL login popup (file-input onChange is not a trusted user gesture).
 */
export async function preAuth() {
  await getToken()
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
 * Also creates an anonymous share link and saves metadata to Supabase
 * so public users can list documents without signing in.
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
  const item = await res.json()

  // Create a per-file anonymous view link so we can store it for public access
  let shareUrl = null
  try {
    shareUrl = await getOrCreateShareLink(token, item.id)
  } catch {
    // Non-fatal: link creation failed, skip Supabase save
  }

  // Persist metadata to Supabase for unauthenticated public listing
  if (supabase && shareUrl) {
    const { error: sbError } = await supabase.from('kc_documents').insert({
      onedrive_id : item.id,
      name        : item.name,
      size        : item.size ?? null,
      share_url   : shareUrl,
    })
    if (sbError) console.warn('[Supabase] Failed to save document metadata:', sbError.message)
  }

  return item
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
 * Also removes the corresponding record from Supabase.
 */
export async function deletePDF(itemId) {
  const token = await getToken()

  const res = await fetch(`${GRAPH}/me/drive/items/${itemId}`, {
    method : 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok && res.status !== 204) throw new Error('Delete failed')
  shareLinkCache.delete(itemId)

  // Remove from Supabase so the public listing stays in sync
  if (supabase) {
    const { error: sbError } = await supabase
      .from('kc_documents')
      .delete()
      .eq('onedrive_id', itemId)
    if (sbError) console.warn('[Supabase] Failed to remove document metadata:', sbError.message)
  }
}

/**
 * List all PDFs for public (unauthenticated) users.
 *
 * Reads from the `kc_documents` Supabase table which is populated
 * whenever an admin uploads a file. The Microsoft Graph shares API
 * requires authentication even for "Anyone with the link" folder shares,
 * so Supabase acts as the public metadata store.
 *
 * Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.
 * See SUPABASE_SETUP.md for table creation SQL.
 *
 * Returns: [{ id, name, size, viewUrl }]
 */
export async function listPDFsPublic() {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('kc_documents')
    .select('onedrive_id, name, size, share_url')
    .order('uploaded_at', { ascending: false })

  if (error) throw new Error(error.message || 'Failed to load documents')

  return (data || []).map(doc => ({
    id     : doc.onedrive_id,
    name   : doc.name,
    size   : doc.size,
    viewUrl: doc.share_url,
  }))
}
