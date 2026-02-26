import { useEffect, useState } from 'react'
import { useArticles } from '../../hooks/useArticles'
import './KnowledgeCenter.css'

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
  const { articles, addArticle, deleteArticle, resetToSeed } = useArticles()

  // article reader modal
  const [selectedArticle, setSelectedArticle] = useState(null)

  // admin states — adminMode: null | 'add' | 'manage'
  const [adminMode, setAdminMode]             = useState(null)
  const [pwInput, setPwInput]                 = useState('')
  const [pwError, setPwError]                 = useState(false)
  const [authenticated, setAuthenticated]     = useState(false)
  const [form, setForm]                       = useState(EMPTY_FORM)
  const [formError, setFormError]             = useState('')
  const [successMsg, setSuccessMsg]           = useState('')
  const [confirmReset, setConfirmReset]       = useState(false)

  // scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // lock body scroll when any modal is open
  useEffect(() => {
    const isOpen = selectedArticle !== null || adminMode !== null
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [selectedArticle, adminMode])

  // close on Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') {
        setSelectedArticle(null)
        setAdminMode(null)
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

  function handleAddArticle(e) {
    e.preventDefault()
    if (!form.title.trim()) return setFormError('Title is required.')
    if (form.articleType === 'external') {
      if (!form.url.trim()) return setFormError('URL is required for external articles.')
      try { new URL(form.url.trim()) } catch { return setFormError('Please enter a valid URL (include https://).') }
    } else {
      if (!form.excerpt.trim()) return setFormError('Excerpt is required.')
      if (!form.body.trim())    return setFormError('Article body is required.')
    }
    addArticle(form)
    setForm(EMPTY_FORM)
    setSuccessMsg('Article published successfully.')
    setFormError('')
  }

  function handleDelete(id, title) {
    if (window.confirm(`Delete "${title}"?`)) deleteArticle(id)
  }

  function handleReset() {
    resetToSeed()
    setConfirmReset(false)
    setSuccessMsg('Articles reset to default.')
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

        {/* admin trigger buttons */}
        <div className="knowledge__admin-bar">
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
            aria-label="Open panel to manage existing articles"
          >
            Manage Articles
          </button>
        </div>

        {/* article grid */}
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
      </div>

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
                <div className="knowledge__type-toggle">
                  <button
                    type="button"
                    className={`knowledge__type-btn${form.articleType === 'internal' ? ' knowledge__type-btn--active' : ''}`}
                    onClick={() => setForm(prev => ({ ...EMPTY_FORM, articleType: 'internal' }))}
                  >
                    Internal Article
                  </button>
                  <button
                    type="button"
                    className={`knowledge__type-btn${form.articleType === 'external' ? ' knowledge__type-btn--active' : ''}`}
                    onClick={() => setForm(prev => ({ ...EMPTY_FORM, articleType: 'external' }))}
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
                  Date
                  <input
                    type="text"
                    name="customDate"
                    className="knowledge__input"
                    value={form.customDate}
                    onChange={handleFormChange}
                    placeholder="e.g. February 2026 (leave blank for today)"
                  />
                </label>

                {form.articleType === 'external' ? (
                  /* external-only field */
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
                ) : (
                  /* internal-only fields */
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

                <button type="submit" className="knowledge__submit-btn">
                  Publish Article
                </button>
              </form>

            ) : (
              /* ── manage articles ── */
              <div className="knowledge__manage">
                <p className="knowledge__manage-count">{articles.length} article{articles.length !== 1 ? 's' : ''} published</p>
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
                        onClick={() => handleDelete(a.id, a.title)}
                        aria-label={`Delete article: ${a.title}`}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>

                {successMsg && (
                  <p className="knowledge__form-success" role="status">{successMsg}</p>
                )}

                {/* reset to seed */}
                <div className="knowledge__reset-bar">
                  {!confirmReset ? (
                    <button
                      className="knowledge__reset-btn"
                      onClick={() => setConfirmReset(true)}
                    >
                      Reset to default articles
                    </button>
                  ) : (
                    <div className="knowledge__reset-confirm">
                      <span>This will delete all custom articles. Are you sure?</span>
                      <button
                        className="knowledge__reset-btn--confirm"
                        onClick={handleReset}
                      >
                        Yes, reset
                      </button>
                      <button
                        className="knowledge__reset-btn--cancel"
                        onClick={() => setConfirmReset(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default KnowledgeCenter
