import { msalInstance, msalReady, graphScopes, loginRequest } from './msalConfig'
import { supabase } from './supabase'

const FOLDER     = import.meta.env.VITE_ONEDRIVE_FOLDER || 'lawfirmarticles'
const GRAPH      = 'https://graph.microsoft.com/v1.0'
const CHUNK_SIZE = 4 * 1024 * 1024   // 4 MB — Graph API chunk limit

// ── auth ──────────────────────────────────────────────────────────────────────

/**
 * Returns a valid Graph access token using silent acquisition only.
 * The user must already be signed in (preAuth completed a redirect flow).
 */
async function getToken() {
  await msalReady

  const accounts = msalInstance.getAllAccounts()
  if (!accounts.length) throw new Error('Not signed in to Microsoft.')

  try {
    const result = await msalInstance.acquireTokenSilent({
      scopes : graphScopes,
      account: accounts[0],
    })
    return result.accessToken
  } catch {
    // Silent refresh failed — redirect to re-authenticate
    sessionStorage.setItem('msal_return_path', '/knowledge-center')
    await msalInstance.acquireTokenRedirect({ scopes: graphScopes, account: accounts[0] })
    throw new Error('Redirecting for re-authentication')
  }
}

/**
 * Pre-authenticate the user with Microsoft via redirect flow.
 *
 * If the user is already signed in (token cached), acquires silently and
 * returns true — the caller can proceed immediately.
 *
 * If sign-in is required, saves adminMode + password-ok flags to
 * sessionStorage and redirects to Microsoft login. The page will navigate
 * away; on return, main.jsx calls handleRedirectPromise() and restores the
 * hash route so KnowledgeCenter can auto-open the admin panel.
 *
 * @param {string} adminMode  'upload' | 'manage'
 * @returns {Promise<boolean>} true if already authenticated, never resolves if redirecting
 */
export async function preAuth(adminMode) {
  await msalReady

  const accounts = msalInstance.getAllAccounts()
  if (accounts.length) {
    try {
      await msalInstance.acquireTokenSilent({ scopes: graphScopes, account: accounts[0] })
      return true  // already authenticated, caller can proceed
    } catch {
      // token expired — fall through to redirect
    }
  }

  // Persist intent so KnowledgeCenter can restore state after redirect
  sessionStorage.setItem('msal_admin_intent', adminMode)
  sessionStorage.setItem('msal_pw_ok', 'true')
  sessionStorage.setItem('msal_return_path', '/knowledge-center')
  await msalInstance.loginRedirect(loginRequest)
  // execution stops here — browser navigates to Microsoft login
}

// ── helpers ───────────────────────────────────────────────────────────────────

async function ensureFolder(token) {
  const check = await fetch(
    `${GRAPH}/me/drive/root:/${FOLDER}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (check.ok) return

  // Folder doesn't exist — create it
  const create = await fetch(`${GRAPH}/me/drive/root/children`, {
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

  // 409 Conflict = folder already exists (race condition) — safe to ignore
  if (!create.ok && create.status !== 409) {
    const detail = await create.text().catch(() => '')
    throw new Error(`Failed to create OneDrive folder (${create.status})${detail ? ': ' + detail : ''}`)
  }
}

// In-memory cache: itemId → share webUrl
const shareLinkCache = new Map()

async function getOrCreateShareLink(token, itemId) {
  if (shareLinkCache.has(itemId)) return shareLinkCache.get(itemId)

  // View link — anonymous, opens in browser; SharePoint blocks iframe embedding
  const res = await fetch(`${GRAPH}/me/drive/items/${itemId}/createLink`, {
    method : 'POST',
    headers: {
      Authorization : `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type: 'view', scope: 'anonymous' }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(
      `Could not create share link (${res.status}). ` +
      `Ensure SharePoint sharing is set to "Anyone" in the admin centre. ` +
      `Details: ${detail}`
    )
  }

  const url = (await res.json()).link.webUrl
  shareLinkCache.set(itemId, url)
  return url
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
 * Uses a simple PUT for files ≤ 4 MB and a resumable upload session for
 * larger files (the Graph API /content PUT endpoint rejects files > 4 MB).
 * Returns the uploaded item object.
 */
export async function uploadPDF(file) {
  const token = await getToken()
  await ensureFolder(token)

  const encodedName = encodeURIComponent(file.name)
  let item

  if (file.size <= CHUNK_SIZE) {
    // ── simple upload for files ≤ 4 MB ─────────────────────────────────────
    const res = await fetch(
      `${GRAPH}/me/drive/root:/${FOLDER}/${encodedName}:/content`,
      {
        method : 'PUT',
        headers: {
          Authorization : `Bearer ${token}`,
          'Content-Type': 'application/pdf',
        },
        body: file,
      }
    )

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new Error(`Upload failed (${res.status})${detail ? ': ' + detail : ''}`)
    }
    item = await res.json()

  } else {
    // ── resumable upload session for files > 4 MB ───────────────────────────
    const sessionRes = await fetch(
      `${GRAPH}/me/drive/root:/${FOLDER}/${encodedName}:/createUploadSession`,
      {
        method : 'POST',
        headers: {
          Authorization : `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item: {
            '@microsoft.graph.conflictBehavior': 'replace',
            name: file.name,
          },
        }),
      }
    )

    if (!sessionRes.ok) {
      const detail = await sessionRes.text().catch(() => '')
      throw new Error(`Failed to create upload session (${sessionRes.status})${detail ? ': ' + detail : ''}`)
    }

    const { uploadUrl } = await sessionRes.json()
    const fileSize = file.size
    let start = 0

    while (start < fileSize) {
      const end   = Math.min(start + CHUNK_SIZE, fileSize)
      const chunk = file.slice(start, end)

      const chunkRes = await fetch(uploadUrl, {
        method : 'PUT',
        headers: {
          'Content-Range' : `bytes ${start}-${end - 1}/${fileSize}`,
          'Content-Length': String(end - start),
        },
        body: chunk,
      })

      if (chunkRes.status === 200 || chunkRes.status === 201) {
        // Final chunk — Graph returns the completed item
        item = await chunkRes.json()
      } else if (chunkRes.status === 202) {
        // Intermediate chunk accepted, continue
      } else {
        const detail = await chunkRes.text().catch(() => '')
        throw new Error(`Upload failed at byte ${start} (${chunkRes.status})${detail ? ': ' + detail : ''}`)
      }

      start = end
    }
  }

  // Create anonymous share link — throws if SharePoint sharing is not set to "Anyone"
  const shareUrl = await getOrCreateShareLink(token, item.id)

  if (supabase) {
    const { error: sbError } = await supabase.from('kc_documents').upsert({
      onedrive_id: item.id,
      name       : item.name,
      size       : item.size ?? null,
      share_url  : shareUrl,
    }, { onConflict: 'onedrive_id' })
    if (sbError) console.warn('[Supabase] Failed to save document metadata:', sbError.message)
  }

  return item
}

/**
 * Delete a file from the OneDrive folder and remove its Supabase record.
 */
export async function deletePDF(itemId) {
  const token = await getToken()

  const res = await fetch(`${GRAPH}/me/drive/items/${itemId}`, {
    method : 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok && res.status !== 204) throw new Error('Delete failed')
  shareLinkCache.delete(itemId)

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
 * Reads from the Supabase `kc_documents` table which is populated
 * whenever an admin uploads a file. No Microsoft authentication required.
 *
 * Returns: [{ id, name, size, viewUrl }]
 */
export async function listPDFsPublic() {
  if (!supabase) {
    console.warn('[Supabase] Not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
    return []
  }

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
