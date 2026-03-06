import { useState, useEffect } from 'react'
import seedArticles from '../data/articles.json'

const STORAGE_KEY = 'absar_articles'

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeDate(customDate) {
  if (customDate && customDate.trim()) return customDate.trim()
  return new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

function saveToStorage(articles) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles))
  } catch { /* ignore */ }
}

// ─── hook ─────────────────────────────────────────────────────────────────────

export function useArticles() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading]   = useState(true)

  // ── load on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = loadFromStorage()
    setArticles(stored ?? seedArticles)
    setLoading(false)
  }, [])

  // ── persist whenever articles change ─────────────────────────────────────
  useEffect(() => {
    if (!loading) saveToStorage(articles)
  }, [articles, loading])

  // ── add ───────────────────────────────────────────────────────────────────
  function addArticle(article) {
    const row = {
      id      : Date.now().toString(),
      category: article.category || '',
      title   : article.title    || '',
      date    : makeDate(article.customDate),
      excerpt : article.excerpt  || null,
      body    : article.body     || null,
      author  : article.author   || null,
      url     : article.url      || null,
    }
    setArticles(prev => [row, ...prev])
    return { error: null }
  }

  // ── delete ────────────────────────────────────────────────────────────────
  function deleteArticle(id) {
    setArticles(prev => prev.filter(a => a.id !== id))
    return { error: null }
  }

  // ── reset to seed ─────────────────────────────────────────────────────────
  function resetToSeed() {
    setArticles(seedArticles)
    saveToStorage(seedArticles)
    return { error: null }
  }

  return { articles, loading, addArticle, deleteArticle, resetToSeed }
}
