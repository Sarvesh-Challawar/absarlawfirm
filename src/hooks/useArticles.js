import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import seedArticles from '../data/articles.json'

const TABLE = 'articles'

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeDate(customDate) {
  if (customDate && customDate.trim()) return customDate.trim()
  return new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

// ─── hook ─────────────────────────────────────────────────────────────────────

export function useArticles() {
  const [articles, setArticles]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [isSupabase, setIsSupabase] = useState(false)

  // ── fetch ────────────────────────────────────────────────────────────────
  const fetchArticles = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (!supabase) {
      // Credentials not configured yet — show seed data
      setArticles(seedArticles)
      setIsSupabase(false)
      setLoading(false)
      return
    }

    const { data, error: sbError } = await supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false })

    if (sbError) {
      console.error('[useArticles] Supabase fetch error:', sbError.message)
      setError(sbError.message)
      // Graceful fallback — page never breaks
      setArticles(seedArticles)
      setIsSupabase(false)
    } else {
      setArticles(data)
      setIsSupabase(true)
    }

    setLoading(false)
  }, [])

  useEffect(() => { fetchArticles() }, [fetchArticles])

  // ── add ──────────────────────────────────────────────────────────────────
  async function addArticle(article) {
    // Explicitly name every column — never rely on spread order matching the DB schema
    const row = {
      category : article.category  || '',
      title    : article.title     || '',
      date     : makeDate(article.customDate),
      excerpt  : article.excerpt   || null,
      body     : article.body      || null,
      author   : article.author    || null,
      url      : article.url       || null,
    }

    if (!supabase) {
      // offline / no credentials — prepend locally only
      setArticles(prev => [{ ...row, id: Date.now().toString() }, ...prev])
      return { error: null }
    }

    const { data, error: sbError } = await supabase
      .from(TABLE)
      .insert([row])
      .select()
      .single()

    if (sbError) {
      console.error('[useArticles] Supabase insert error:', sbError.message)
      return { error: sbError.message }
    }

    setArticles(prev => [data, ...prev])
    return { error: null }
  }

  // ── delete ───────────────────────────────────────────────────────────────
  async function deleteArticle(id) {
    if (!supabase) {
      setArticles(prev => prev.filter(a => a.id !== id))
      return { error: null }
    }

    const { error: sbError } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id)

    if (sbError) {
      console.error('[useArticles] Supabase delete error:', sbError.message)
      return { error: sbError.message }
    }

    setArticles(prev => prev.filter(a => a.id !== id))
    return { error: null }
  }

  // ── reset to seed ────────────────────────────────────────────────────────
  async function resetToSeed() {
    if (!supabase) {
      setArticles(seedArticles)
      return { error: null }
    }

    // Delete all rows then bulk-insert seed rows
    const { error: delError } = await supabase
      .from(TABLE)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (delError) return { error: delError.message }

    // Delete all rows then bulk-insert seed rows with explicit column mapping
    const seedRows = seedArticles.map(a => ({
      category : a.category || '',
      title    : a.title    || '',
      date     : a.date     || '',
      excerpt  : a.excerpt  || null,
      body     : a.body     || null,
      author   : a.author   || null,
      url      : a.url      || null,
    }))

    const { error: insError } = await supabase
      .from(TABLE)
      .insert(seedRows)

    if (insError) return { error: insError.message }

    await fetchArticles()
    return { error: null }
  }

  return { articles, loading, error, isSupabase, addArticle, deleteArticle, resetToSeed }
}
