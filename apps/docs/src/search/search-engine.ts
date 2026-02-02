import type { SearchEntry } from './search-index'

export interface SearchResult {
  entry: SearchEntry
  score: number
  matchedHeading?: string
}

export function search(query: string, index: SearchEntry[]): SearchResult[] {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return []

  const terms = trimmed.split(/\s+/).filter(Boolean)
  const results: SearchResult[] = []

  for (const entry of index) {
    const titleLower = entry.title.toLowerCase()
    const keywordsLower = entry.keywords.toLowerCase()
    const headingsLower = entry.headings.map((h) => h.toLowerCase())

    let totalScore = 0
    let allTermsMatch = true
    let firstMatchedHeading: string | undefined

    for (const term of terms) {
      let termScore = 0
      let termMatched = false

      // Title exact match (highest)
      if (titleLower === term) {
        termScore = Math.max(termScore, 100)
        termMatched = true
      }

      // Title starts-with
      if (titleLower.startsWith(term)) {
        termScore = Math.max(termScore, 80)
        termMatched = true
      }

      // Title contains
      if (titleLower.includes(term)) {
        termScore = Math.max(termScore, 60)
        termMatched = true
      }

      // Heading contains
      for (let i = 0; i < headingsLower.length; i++) {
        if (headingsLower[i].includes(term)) {
          termScore = Math.max(termScore, 40)
          termMatched = true
          if (!firstMatchedHeading) {
            firstMatchedHeading = entry.headings[i]
          }
          break
        }
      }

      // Keywords contains
      if (keywordsLower.includes(term)) {
        termScore = Math.max(termScore, 20)
        termMatched = true
      }

      if (!termMatched) {
        allTermsMatch = false
        break
      }

      totalScore += termScore
    }

    if (allTermsMatch && totalScore > 0) {
      results.push({
        entry,
        score: totalScore,
        matchedHeading: firstMatchedHeading,
      })
    }
  }

  results.sort((a, b) => b.score - a.score)
  return results.slice(0, 20)
}
