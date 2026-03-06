import { useEffect, useState, useCallback } from 'react'
import { listPDFsPublic, listPDFs, uploadPDF, deletePDF } from '../../lib/oneDrive'
import './KnowledgeCenter.css'

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const ADMIN_PASSWORD = 'absarlaw2026'

function KnowledgeCenter() {
  // ── public PDF listing ───────────────────────────────────────────────────
  const [pdfs, setPdfs]               = useState([])
  const [pdfsLoading, setPdfsLoading] = useState(true)
  const [pdfsError, setPdfsError]     = useState(null)
  const [viewerPdf, setViewerPdf]     = useState(null)   // { name, viewUrl }

  // ── admin modal ──────────────────────────────────────────────────────────
  const [adminMode, setAdminMode]         = useState(null)   // null | 'upload' | 'manage'
  const [pwInput, setPwInput]             = useState('')
  const [pwError, setPwError]             = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  // ── upload state ─────────────────────────────────────────────────────────
  const [pdfUploading, setPdfUploading]   = useState(false)
  const [uploadError, setUploadError]     = useState(null)
  const [uploadSuccess, setUploadSuccess] = useState('')

  // ── manage state ─────────────────────────────────────────────────────────
  const [managePdfs, setManagePdfs]                   = useState([])
  const [managePdfsLoading, setManagePdfsLoading]     = useState(false)
  const [managePdfsError, setManagePdfsError]         = useState(null)
  const [deleteSuccess, setDeleteSuccess]             = useState('')

  // ── fetch public PDFs on mount ───────────────────────────────────────────
  const fetchPublicPDFs = useCallback(async () => {
    setPdfsLoading(true)
    setPdfsError(null)
    try {
      const files = await listPDFsPublic()
      setPdfs(files)
    } catch (e) {
      setPdfsError(e.message || 'Failed to load documents. Please try again.')
    } finally {
      setPdfsLoading(false)
    }
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    fetchPublicPDFs()
  }, [fetchPublicPDFs])

  // lock body scroll when any modal / viewer is open
  useEffect(() => {
    document.body.style.overflow = (adminMode !== null || viewerPdf !== null) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [adminMode, viewerPdf])

  // close on Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') {
        setAdminMode(null)
        setViewerPdf(null)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // ── admin helpers ─────────────────────────────────────────────────────────
  function handleAdminOpen(mode) {
    setAdminMode(mode)
    setPwInput('')
    setPwError(false)
    setAuthenticated(false)
    setUploadError(null)
    setUploadSuccess('')
    setDeleteSuccess('')
    setManagePdfs([])
    setManagePdfsError(null)
  }

  function handleAdminClose() {
    setAdminMode(null)
    setAuthenticated(false)
    setPwInput('')
    // Refresh the public listing in case files changed
    fetchPublicPDFs()
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    if (pwInput === ADMIN_PASSWORD) {
      setAuthenticated(true)
      setPwError(false)
      if (adminMode === 'manage') fetchManagePDFs()
    } else {
      setPwError(true)
    }
  }

  // ── upload ────────────────────────────────────────────────────────────────
  async function handleUploadPDF(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only PDF files can be uploaded.')
      e.target.value = ''
      return
    }
    setPdfUploading(true)
    setUploadError(null)
    setUploadSuccess('')
    try {
      await uploadPDF(file)
      setUploadSuccess(`"${file.name}" uploaded successfully.`)
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Please try again.')
    } finally {
      setPdfUploading(false)
      e.target.value = ''
    }
  }

  // ── manage: fetch with auth ────────────────────────────────────────────────
  const fetchManagePDFs = useCallback(async () => {
    setManagePdfsLoading(true)
    setManagePdfsError(null)
    try {
      const files = await listPDFs()
      setManagePdfs(files)
    } catch (e) {
      setManagePdfsError(e.message || 'Failed to load documents.')
    } finally {
      setManagePdfsLoading(false)
    }
  }, [])

  async function handleDeletePdf(id, name) {
    if (!window.confirm(`Delete "${name}"?`)) return
    try {
      await deletePDF(id)
      setManagePdfs(prev => prev.filter(p => p.id !== id))
      setDeleteSuccess(`"${name}" deleted.`)
    } catch (err) {
      alert(`Failed to delete: ${err.message}`)
    }
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <section id="knowledge-center" className="knowledge section">
      <div className="container">

        <p className="knowledge__eyebrow">Insights &amp; Publications</p>
        <h2 className="section-title">Knowledge Center</h2>
        <p className="section-subtitle">
          Access our curated library of legal publications, advisories and research notes
          across practice areas — helping clients stay informed and ahead of regulatory change.
        </p>

        {/* ── admin action bar ── */}
        <div className="knowledge__admin-bar">
          <button
            className="knowledge__admin-btn"
            onClick={() => handleAdminOpen('upload')}
            aria-label="Upload a PDF document"
          >
            ↑ Upload
          </button>
          <button
            className="knowledge__admin-btn knowledge__admin-btn--secondary"
            onClick={() => handleAdminOpen('manage')}
            aria-label="Manage uploaded documents"
          >
            ⚙ Manage
          </button>
        </div>

        {/* ── public PDF grid ── */}
        {pdfsLoading && (
          <p className="knowledge__loading" aria-live="polite">Loading documents…</p>
        )}

        {!pdfsLoading && pdfsError && (
          <div className="knowledge__error" role="alert">
            {pdfsError}
            {' '}
            <button className="knowledge__retry-btn" onClick={fetchPublicPDFs}>Retry</button>
          </div>
        )}

        {!pdfsLoading && !pdfsError && pdfs.length === 0 && (
          <p className="knowledge__docs-empty">No documents available yet.</p>
        )}

        {!pdfsLoading && !pdfsError && pdfs.length > 0 && (
          <div className="knowledge__pdf-grid">
            {pdfs.map(pdf => (
              <button
                key={pdf.id || pdf.name}
                className="knowledge__pdf-card"
                onClick={() => setViewerPdf({ name: pdf.name, viewUrl: pdf.viewUrl })}
                aria-label={`Open ${pdf.name}`}
              >
                <span className="knowledge__pdf-icon" aria-hidden="true">📄</span>
                <span className="knowledge__pdf-name">
                  {pdf.name.replace(/\.pdf$/i, '')}
                </span>
                {pdf.size && (
                  <span className="knowledge__pdf-size">{formatBytes(pdf.size)}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════ PDF VIEWER OVERLAY ══════════════ */}
      {viewerPdf && (
        <div
          className="knowledge__pdf-viewer-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`Viewing: ${viewerPdf.name}`}
        >
          <div className="knowledge__pdf-viewer-bar">
            <span className="knowledge__pdf-viewer-title">{viewerPdf.name}</span>
            <a
              className="knowledge__pdf-open-link"
              href={viewerPdf.viewUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              ↗ Open in new tab
            </a>
            <button
              className="knowledge__pdf-viewer-close"
              onClick={() => setViewerPdf(null)}
              aria-label="Close PDF viewer"
            >
              ✕
            </button>
          </div>
          <iframe
            className="knowledge__pdf-iframe"
            src={viewerPdf.viewUrl}
            title={viewerPdf.name}
            allowFullScreen
          />
        </div>
      )}

      {/* ══════════════ ADMIN MODAL ══════════════ */}
      {adminMode !== null && (
        <div
          className="knowledge__overlay"
          role="dialog"
          aria-modal="true"
          aria-label={adminMode === 'upload' ? 'Upload document' : 'Manage documents'}
          onClick={handleAdminClose}
        >
          <div
            className="knowledge__admin-panel"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="knowledge__modal-close"
              onClick={handleAdminClose}
              aria-label="Close admin panel"
            >
              ✕
            </button>

            <h2 className="knowledge__admin-title">
              {adminMode === 'upload' ? 'Upload Document' : 'Manage Documents'}
            </h2>

            {/* ── password gate ── */}
            {!authenticated ? (
              <form className="knowledge__pw-form" onSubmit={handlePasswordSubmit}>
                <p className="knowledge__pw-label">Enter admin password to continue</p>
                <input
                  type="password"
                  className={`knowledge__input${pwError ? ' knowledge__input--error' : ''}`}
                  value={pwInput}
                  onChange={e => { setPwInput(e.target.value); setPwError(false) }}
                  placeholder="Password"
                  autoFocus
                  aria-label="Admin password"
                />
                {pwError && (
                  <p className="knowledge__form-error" role="alert">Incorrect password.</p>
                )}
                <button type="submit" className="knowledge__submit-btn">
                  Continue
                </button>
              </form>

            ) : adminMode === 'upload' ? (

              /* ══════════════ UPLOAD PANEL ══════════════ */
              <div className="knowledge__upload-panel">
                <p className="knowledge__upload-hint">
                  Select a PDF file to upload to the OneDrive document library.
                  It will appear in the Knowledge Center immediately after upload.
                </p>

                <label className={`knowledge__upload-label${pdfUploading ? ' knowledge__upload-label--disabled' : ''}`}>
                  {pdfUploading ? '⏳ Uploading…' : '↑ Choose PDF to Upload'}
                  <input
                    type="file"
                    accept=".pdf"
                    className="knowledge__upload-input"
                    onChange={handleUploadPDF}
                    disabled={pdfUploading}
                  />
                </label>

                {uploadError && (
                  <p className="knowledge__form-error" role="alert">{uploadError}</p>
                )}
                {uploadSuccess && (
                  <p className="knowledge__form-success" role="status">{uploadSuccess}</p>
                )}
              </div>

            ) : (

              /* ══════════════ MANAGE PANEL ══════════════ */
              <div className="knowledge__manage">

                {deleteSuccess && (
                  <p className="knowledge__form-success" role="status">{deleteSuccess}</p>
                )}

                {managePdfsLoading && (
                  <p className="knowledge__loading">Loading documents…</p>
                )}

                {!managePdfsLoading && managePdfsError && (
                  <div className="knowledge__error" role="alert">
                    {managePdfsError}
                    {' '}
                    <button className="knowledge__retry-btn" onClick={fetchManagePDFs}>Retry</button>
                  </div>
                )}

                {!managePdfsLoading && !managePdfsError && (
                  <>
                    <p className="knowledge__manage-count">
                      {managePdfs.length} document{managePdfs.length !== 1 ? 's' : ''} on OneDrive
                    </p>
                    <ul className="knowledge__manage-list">
                      {managePdfs.length === 0 && (
                        <li className="knowledge__manage-empty">No documents uploaded yet.</li>
                      )}
                      {managePdfs.map(pdf => (
                        <li key={pdf.id} className="knowledge__manage-item">
                          <div className="knowledge__manage-info">
                            <span className="knowledge__manage-category">PDF</span>
                            <span className="knowledge__manage-title">{pdf.name}</span>
                            {pdf.size && (
                              <span className="knowledge__manage-date">{formatBytes(pdf.size)}</span>
                            )}
                          </div>
                          <button
                            className="knowledge__delete-btn"
                            onClick={() => handleDeletePdf(pdf.id, pdf.name)}
                            aria-label={`Delete ${pdf.name}`}
                          >
                            Delete
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default KnowledgeCenter
