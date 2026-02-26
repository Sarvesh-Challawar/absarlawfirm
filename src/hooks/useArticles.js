import { useState, useEffect } from 'react'
import seedArticles from '../data/articles.json'

const STORAGE_KEY = 'absar_articles'

export function useArticles() {
  const [articles, setArticles] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return JSON.parse(stored)
    } catch {
      // corrupted storage — fall back to seed
    }
    return seedArticles
  })

  // persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles))
  }, [articles])

  function addArticle(article) {
    const newArticle = {
      ...article,
      id: Date.now().toString(),
      date: article.customDate && article.customDate.trim()
        ? article.customDate.trim()
        : new Date().toLocaleDateString('en-IN', {
            month: 'long',
            year: 'numeric',
          }),
    }
    // don't persist the helper field
    delete newArticle.customDate
    setArticles(prev => [newArticle, ...prev])
  }

  function deleteArticle(id) {
    setArticles(prev => prev.filter(a => a.id !== id))
  }

  function resetToSeed() {
    setArticles(seedArticles)
    localStorage.removeItem(STORAGE_KEY)
  }

  return { articles, addArticle, deleteArticle, resetToSeed }
}
