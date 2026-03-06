import { useEffect, useState, useCallback } from 'react'
import { useArticles } from '../../hooks/useArticles'
import { listPDFs, uploadPDF, getShareLink, deletePDF } from '../../lib/oneDrive'
import './KnowledgeCenter.css'

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const ADMIN_PASSWORD = 'absarlaw2026'

const CATEGORIES = [
  'Corporate Law',
  'Intellectual Property',
  'Employment Law',
  'Real Estate',
  'Technology & TMT',
  'Banking & Finance',
  'Litigation & Arbitration',
  'Tax Law',
  'General',
]

const EMPTY_FORM = {
  articleType: 'internal',  // 'internal' | 'external'
  category: CATEGORIES[0],
  title: '',
  customDate: '',
  url: '',
  excerpt: '',
  body: '',
  author: '',
}

function KnowledgeCenter() {
  const { articles, loading, error, isSupabase, addArticle, deleteArticle, resetToSeed } = useArticles()

  // ── tab state ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('articles')   // 'articles' | 'documents'

  // ── article reader modal ─────────────────────────────────────────────────
  const [selectedArticle, setSelectedArticle] = useState(null)

  // ── OneDrive / PDF state ─────────────────────────────────────────────────
  const [pdfs, setPdfs]               = useState([])
  const [pdfsLoading, setPdfsLoading] = useState(false)
  const [pdfsError, setPdfsError]     = useState(null)
  const [pdfUploading, setPdfUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [viewerPdf, setViewerPdf]     = useState(null)   // { name, shareUrl }
  const [openingPdfId, setOpeningPdfId] = useState(null)

  // ── admin states ─────────────────────────────────────────────────────────
  const [adminMode, setAdminMode]         = useState(null)  // null | 'add' | 'manage'
  const [pwInput, setPwInput]             = useState('')
  const [pwError, setPwError]             = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [form, setForm]                   = useState(EMPTY_FORM)
  const [formError, setFormError]         = useState('')
  const [successMsg, setSuccessMsg]       = useState('')
  const [confirmReset, setConfirmReset]   = useState(false)
  const [submitting, setSubmitting]       = useState(false)
  const [manageTab, setManageTab]         = useState('articles')  // 'articles' | 'pdfs'

  // ── fetch PDFs ────────────────────────────────────────────────────────────
  const fetchPDFs = useCallback(async () => {
    setPdfsLoading(true)
    setPdfsError(null)
    try {
      const files = await listPDFs()
      setPdfs(files)
    } catch (e) {
      setPdfsError(e.message || 'Failed to load documents. Please try again.')
    } finally {
      setPdfsLoading(false)
    }
  }, [])

  // scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // load PDFs when documents tab is first opened
  useEffect(() => {
    if (activeTab === 'documents' && pdfs.length === 0 && !pdfsLoading && !pdfsError) {
      fetchPDFs()
    }
  }, [activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  // lock body scroll when any modal is open
  useEffect(() => {
    const isOpen = selectedArticle !== null || adminMode !== null || viewerPdf !== null
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [selectedArticle, adminMode, viewerPdf])

  // close on Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') {
        setSelectedArticle(null)
        setAdminMode(null)
        setViewerPdf(null)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // ── admin handlers ────────────────────────────────────────
  function handleAdminOpen(mode) {
    setAdminMode(mode)
    setPwInput('')
    setPwError(false)
    setAuthenticated(false)
    setForm(EMPTY_FORM)
    setFormError('')
    setSuccessMsg('')
    setConfirmReset(false)
    setManageTab('articles')
    setUploadError(null)
  }

  function handleAdminClose() {
    setAdminMode(null)
    setAuthenticated(false)
    setPwInput('')
    setConfirmReset(false)
  }

  function handlePasswordSubmit(e) {
    e.preventDefault()
    if (pwInput === ADMIN_PASSWORD) {
      setAuthenticated(true)
      setPwError(false)
    } else {
      setPwError(true)
    }
  }

  function handleFormChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setFormError('')
    setSuccessMsg('')
  }

  async function handleAddArticle(e) {
    e.preventDefault()
    if (!form.title.trim()) return setFormError('Title is required.')
    if (form.articleType === 'external') {
      if (!form.url.trim()) return setFormError('URL is required for external articles.')
      try { new URL(form.url.trim()) } catch { return setFormError('Please enter a valid URL (include https://).') }
    } else {
      if (!form.excerpt.trim()) return setFormError('Excerpt is required.')
      if (!form.body.trim())    return setFormError('Article body is required.')
    }
    setSubmitting(true)
    const { error: addError } = await addArticle(form)
    setSubmitting(false)
    if (addError) return setFormError(`Failed to publish: ${addError}`)
    setForm(EMPTY_FORM)
    setSuccessMsg('Article published successfully.')
    setFormError('')
  }

  async function handleDeleteArticle(id, title) {
    if (!window.confirm(`Delete "${title}"?`)) return
    const { error: delError } = await deleteArticle(id)
    if (delError) alert(`Failed to delete: ${delError}`)
  }

  async function handleReset() {
    const { error: resetError } = await resetToSeed()
    setConfirmReset(false)
    if (resetError) return setSuccessMsg(`Reset failed: ${resetError}`)
    setSuccessMsg('Articles reset to default.')
  }

  // ── OneDrive handlers ─────────────────────────────────────────────────────
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
    try {
      const uploaded = await uploadPDF(file)
      setPdfs(prev => [...prev, uploaded])
      setSuccessMsg(`"${file.name}" uploaded successfully.`)
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Please try again.')
    } finally {
      setPdfUploading(false)
      e.target.value = ''
    }
  }

  async function handleViewPdf(pdf) {
    setOpeningPdfId(pdf.id)
    try {
      const shareUrl = await getShareLink(pdf.id)
      setViewerPdf({ name: pdf.name, shareUrl })
    } catch {
      alert('Could not open document. Please try again.')
    } finally {
      setOpeningPdfId(null)
    }
  }

  async function handleDeletePdf(id, name) {
    if (!window.confirm(`Delete "${name}"?`)) return
    try {
      await deletePDF(id)
      setPdfs(prev => prev.filter(p => p.id !== id))
      setSuccessMsg(`"${name}" deleted.`)
    } catch (err) {
      alert(`Failed to delete: ${err.message}`)
    }
  }

  return (
    <section id="knowledge-center" className="knowledge section">
      <div className="container">

        <p className="knowledge__eyebrow">Insights &amp; Publications</p>
        <h2 className="section-title">Knowledge Center</h2>
        <p className="section-subtitle">
          Our attorneys regularly publish analysis on evolving legal developments across
          practice areas — helping clients stay informed and ahead of regulatory change.
        </p>

        {/* ── tab switcher ── */}
        <div className="knowledge__tabs">
          <button
            className={`knowledge__tab${activeTab === 'articles' ? ' knowledge__tab--active' : ''}`}
            onClick={() => setActiveTab('articles')}
          >
            Articles
          </button>
          <button
            className={`knowledge__tab${activeTab === 'documents' ? ' knowledge__tab--active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            Documents
          </button>
        </div>

        {/* ── admin bar ── */}
        <div className="knowledge__admin-bar">
          <span
            className={`knowledge__status-badge${isSupabase ? ' knowledge__status-badge--live' : ''}`}
            title={isSupabase ? 'Articles stored in Supabase' : 'Supabase not configured — showing seed articles'}
          >
            {isSupabase ? '● Live (Supabase)' : '○ Local'}
          </span>
          <button
            className="knowledge__admin-btn"
            onClick={() => handleAdminOpen('add')}
            aria-label="Open panel to add a new article"
          >
            + Add Article
          </button>
          <button
            className="knowledge__admin-btn knowledge__admin-btn--secondary"
            onClick={() => handleAdminOpen('manage')}
            aria-label="Open panel to manage content"
          >
            Manage
          </button>
        </div>

        {/* ══════════════ ARTICLES TAB ══════════════ */}
        {activeTab === 'articles' && (
          <>
            {loading && (
              <p className="knowledge__loading" aria-live="polite">Loading articles…</p>
            )}
            {!loading && error && (
              <p className="knowledge__error" role="alert">
                Could not load articles from Supabase — showing default content.
              </p>
            )}
            {!loading && (
              <div className="knowledge__grid">
                {articles.map(article => (
                  <article key={article.id} className="knowledge__card">
                    <div className="knowledge__card-header">
                      <span className="knowledge__category">{article.category}</span>
                      <span className="knowledge__date">{article.date}</span>
                    </div>
                    <h3 className="knowledge__title">{article.title}</h3>
                    <p className="knowledge__excerpt">{article.excerpt}</p>
                    {article.url ? (
                      <a
                        className="knowledge__read-more"
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Read external article: ${article.title}`}
                      >
                        Read article ↗
                      </a>
                    ) : (
                      <button
                        className="knowledge__read-more"
                        onClick={() => setSelectedArticle(article)}
                        aria-label={`Read full article: ${article.title}`}
                      >
                        Read article →
                      </button>
                    )}
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══════════════ DOCUMENTS TAB ══════════════ */}
        {activeTab === 'documents' && (
          <div className="knowledge__docs-section">
            {pdfsLoading && (
              <p className="knowledge__loading">Loading documents…</p>
            )}
            {!pdfsLoading && pdfsError && (
              <div className="knowledge__error">
                {pdfsError}
                {' '}<button className="knowledge__retry-btn" onClick={fetchPDFs}>Retry</button>
              </div>
            )}
            {!pdfsLoading && !pdfsError && pdfs.length === 0 && (
              <p className="knowledge__docs-empty">No documents available yet.</p>
            )}
            {!pdfsLoading && !pdfsError && pdfs.length > 0 && (
              <div className="knowledge__pdf-grid">
                {pdfs.map(pdf => (
                  <button
                    key={pdf.id}
                    className="knowledge__pdf-card"
                    onClick={() => handleViewPdf(pdf)}
                    disabled={openingPdfId === pdf.id}
                    aria-label={`Open ${pdf.name}`}
                  >
                    <span className="knowledge__pdf-icon" aria-hidden="true">
                      {openingPdfId === pdf.id ? '⏳' : '📄'}
                    </span>
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
              href={viewerPdf.shareUrl}
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
            src={viewerPdf.shareUrl}
            title={viewerPdf.name}
            allowFullScreen
          />
        </div>
      )}

      {/* ── article reader modal ────────────────────────────── */}
      {selectedArticle && (
        <div
          className="knowledge__overlay"
          role="dialog"
          aria-modal="true"
          aria-label={selectedArticle.title}
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="knowledge__reader"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="knowledge__modal-close"
              onClick={() => setSelectedArticle(null)}
              aria-label="Close article"
            >
              ✕
            </button>
            <div className="knowledge__reader-header">
              <span className="knowledge__category">{selectedArticle.category}</span>
              <span className="knowledge__date">{selectedArticle.date}</span>
            </div>
            <h2 className="knowledge__reader-title">{selectedArticle.title}</h2>
            {selectedArticle.author && (
              <p className="knowledge__reader-author">By {selectedArticle.author}</p>
            )}
            <div className="knowledge__reader-body">
              {selectedArticle.body.split('\n').map((para, i) =>
                para.trim() ? <p key={i}>{para}</p> : null
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── admin modal ─────────────────────────────────────── */}
      {adminMode !== null && (
        <div
          className="knowledge__overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Admin panel"
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
              {adminMode === 'add' ? 'Publish New Article' : 'Manage Articles'}
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

            ) : adminMode === 'add' ? (
              /* ── add article form ── */
              <form className="knowledge__article-form" onSubmit={handleAddArticle}>

                {/* article type toggle */}
                <div className="knowledge__type-toggle" role="group" aria-label="Article type">
                  <button
                    type="button"
                    className={`knowledge__type-btn${form.articleType === 'internal' ? ' knowledge__type-btn--active' : ''}`}
                    onClick={() => setForm(prev => ({ ...prev, articleType: 'internal', url: '' }))}
                  >
                    Internal Article
                  </button>
                  <button
                    type="button"
                    className={`knowledge__type-btn${form.articleType === 'external' ? ' knowledge__type-btn--active' : ''}`}
                    onClick={() => setForm(prev => ({ ...prev, articleType: 'external', excerpt: '', body: '' }))}
                  >
                    External Link
                  </button>
                </div>

                <label className="knowledge__label">
                  Category
                  <select
                    name="category"
                    className="knowledge__input"
                    value={form.category}
                    onChange={handleFormChange}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>

                <label className="knowledge__label">
                  Title <span className="knowledge__required">*</span>
                  <input
                    type="text"
                    name="title"
                    className="knowledge__input"
                    value={form.title}
                    onChange={handleFormChange}
                    placeholder="Article title"
                  />
                </label>

                <label className="knowledge__label">
                  Date <span className="knowledge__hint">(optional — leave blank for today)</span>
                  <input
                    type="text"
                    name="customDate"
                    className="knowledge__input"
                    value={form.customDate}
                    onChange={handleFormChange}
                    placeholder="e.g. 15 January 2025"
                  />
                </label>

                {form.articleType === 'external' ? (
                  <>
                    <label className="knowledge__label">
                      External URL <span className="knowledge__required">*</span>
                      <input
                        type="url"
                        name="url"
                        className="knowledge__input"
                        value={form.url}
                        onChange={handleFormChange}
                        placeholder="https://example.com/article"
                      />
                    </label>
                    <label className="knowledge__label">
                      Excerpt / Summary <span className="knowledge__hint">(shown on card)</span>
                      <textarea
                        name="excerpt"
                        className="knowledge__input knowledge__textarea"
                        value={form.excerpt}
                        onChange={handleFormChange}
                        placeholder="Short description of the linked article"
                        rows={3}
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <label className="knowledge__label">
                      Author
                      <input
                        type="text"
                        name="author"
                        className="knowledge__input"
                        value={form.author}
                        onChange={handleFormChange}
                        placeholder="e.g. Absar Law Editorial Team"
                      />
                    </label>
                    <label className="knowledge__label">
                      Excerpt <span className="knowledge__required">*</span>
                      <textarea
                        name="excerpt"
                        className="knowledge__input knowledge__textarea"
                        value={form.excerpt}
                        onChange={handleFormChange}
                        placeholder="Short summary shown on the card (2–3 sentences)"
                        rows={3}
                      />
                    </label>
                    <label className="knowledge__label">
                      Full Article Body <span className="knowledge__required">*</span>
                      <textarea
                        name="body"
                        className="knowledge__input knowledge__textarea"
                        value={form.body}
                        onChange={handleFormChange}
                        placeholder="Full article content. Use blank lines to separate paragraphs."
                        rows={8}
                      />
                    </label>
                  </>
                )}

                {formError && (
                  <p className="knowledge__form-error" role="alert">{formError}</p>
                )}
                {successMsg && (
                  <p className="knowledge__form-success" role="status">{successMsg}</p>
                )}

                <button type="submit" className="knowledge__submit-btn" disabled={submitting}>
                  {submitting ? 'Publishing…' : 'Publish Article'}
                </button>
              </form>

            ) : (
              /* ══════════════ MANAGE PANEL ══════════════ */
              <div className="knowledge__manage">

                {/* manage sub-tabs */}
                <div className="knowledge__type-toggle" role="group" aria-label="Manage section">
                  <button
                    type="button"
                    className={`knowledge__type-btn${manageTab === 'articles' ? ' knowledge__type-btn--active' : ''}`}
                    onClick={() => setManageTab('articles')}
                  >
                    Articles ({articles.length})
                  </button>
                  <button
                    type="button"
                    className={`knowledge__type-btn${manageTab === 'pdfs' ? ' knowledge__type-btn--active' : ''}`}
                    onClick={() => { setManageTab('pdfs'); if (pdfs.length === 0) fetchPDFs() }}
                  >
                    Documents ({pdfs.length})
                  </button>
                </div>

                {successMsg && <p className="knowledge__form-success" role="status">{successMsg}</p>}
                {uploadError && <p className="knowledge__form-error"  role="alert">{uploadError}</p>}

                {/* ── articles list ── */}
                {manageTab === 'articles' && (
                  <>
                    <p className="knowledge__manage-count">{articles.length} article{articles.length !== 1 ? 's' : ''}</p>
                    <ul className="knowledge__manage-list">
                      {articles.map(a => (
                        <li key={a.id} className="knowledge__manage-item">
                          <div className="knowledge__manage-info">
                            <span className="knowledge__manage-category">{a.category}</span>
                            <span className="knowledge__manage-title">{a.title}</span>
                            <span className="knowledge__manage-date">{a.date}</span>
                          </div>
                          <button
                            className="knowledge__delete-btn"
                            onClick={() => handleDeleteArticle(a.id, a.title)}
                            aria-label={`Delete article: ${a.title}`}
                          >
                            Delete
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="knowledge__reset-bar">
                      {!confirmReset ? (
                        <button className="knowledge__reset-btn" onClick={() => setConfirmReset(true)}>
                          Reset to default articles
                        </button>
                      ) : (
                        <div className="knowledge__reset-confirm">
                          <span>This will delete all custom articles. Are you sure?</span>
                          <button className="knowledge__reset-btn--confirm" onClick={handleReset}>Yes, reset</button>
                          <button className="knowledge__reset-btn--cancel"  onClick={() => setConfirmReset(false)}>Cancel</button>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* ── PDFs list ── */}
                {manageTab === 'pdfs' && (
                  <>
                    <div className="knowledge__pdf-manage-header">
                      <p className="knowledge__manage-count">{pdfs.length} document{pdfs.length !== 1 ? 's' : ''} on OneDrive</p>
                      <label className={`knowledge__upload-label${pdfUploading ? ' knowledge__upload-label--disabled' : ''}`}>
                        {pdfUploading ? '⏳ Uploading…' : '↑ Upload PDF'}
                        <input
                          type="file"
                          accept=".pdf"
                          className="knowledge__upload-input"
                          onChange={handleUploadPDF}
                          disabled={pdfUploading}
                        />
                      </label>
                    </div>
                    {pdfsLoading ? (
                      <p className="knowledge__loading">Loading documents…</p>
                    ) : (
                      <ul className="knowledge__manage-list">
                        {pdfs.length === 0 && (
                          <li className="knowledge__manage-empty">No documents uploaded yet.</li>
                        )}
                        {pdfs.map(pdf => (
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
                    )}
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
