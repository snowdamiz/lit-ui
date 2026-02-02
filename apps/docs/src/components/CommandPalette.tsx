import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router'
import * as Dialog from '@radix-ui/react-dialog'
import { Search } from 'lucide-react'
import { searchIndex } from '../search/search-index'
import { search, type SearchResult } from '../search/search-engine'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const navigate = useNavigate()
  const listRef = useRef<HTMLDivElement>(null)
  const activeItemRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => search(query, searchIndex), [query])

  // Group results by section
  const grouped = useMemo(() => {
    const groups: { section: string; items: SearchResult[] }[] = []
    for (const result of results) {
      const existing = groups.find((g) => g.section === result.entry.section)
      if (existing) {
        existing.items.push(result)
      } else {
        groups.push({ section: result.entry.section, items: [result] })
      }
    }
    return groups
  }, [results])

  // Flat list of results for index tracking
  const flatResults = useMemo(() => results, [results])

  // Reset on close
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setQuery('')
        setActiveIndex(0)
      }
      onOpenChange(nextOpen)
    },
    [onOpenChange],
  )

  // Scroll active item into view
  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0)
  }, [results])

  const handleSelect = useCallback(
    (href: string) => {
      navigate(href)
      handleOpenChange(false)
    },
    [navigate, handleOpenChange],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (flatResults.length === 0) return

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault()
          setActiveIndex((prev) => (prev + 1) % flatResults.length)
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          setActiveIndex((prev) => (prev - 1 + flatResults.length) % flatResults.length)
          break
        }
        case 'Enter': {
          e.preventDefault()
          const selected = flatResults[activeIndex]
          if (selected) {
            handleSelect(selected.entry.href)
          }
          break
        }
      }
    },
    [flatResults, activeIndex, handleSelect],
  )

  // Track which flat index we're rendering
  let flatIndex = -1

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          className="fixed top-[20%] left-1/2 z-50 w-full max-w-lg -translate-x-1/2 rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          onKeyDown={handleKeyDown}
        >
          <Dialog.Title className="sr-only">Search documentation</Dialog.Title>
          <Dialog.Description className="sr-only">
            Type to search across all documentation pages
          </Dialog.Description>

          {/* Search Input */}
          <div className="flex items-center border-b border-gray-200 px-4 dark:border-gray-800">
            <Search className="h-4 w-4 shrink-0 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documentation..."
              className="w-full bg-transparent py-3 pl-3 pr-4 text-base text-gray-900 placeholder-gray-400 outline-none dark:text-gray-100"
              autoFocus
            />
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-80 overflow-y-auto overscroll-contain p-1">
            {query && flatResults.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                No results found
              </div>
            )}

            {!query && (
              <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                Start typing to search...
              </div>
            )}

            {grouped.map((group) => (
              <div key={group.section}>
                <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {group.section}
                </div>
                {group.items.map((result) => {
                  flatIndex++
                  const isActive = flatIndex === activeIndex
                  const currentIndex = flatIndex
                  return (
                    <div
                      key={result.entry.href}
                      ref={isActive ? activeItemRef : undefined}
                      role="option"
                      aria-selected={isActive}
                      className={`mx-1 cursor-pointer rounded-lg px-3 py-2 ${
                        isActive
                          ? 'bg-gray-100 dark:bg-gray-800'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                      onClick={() => handleSelect(result.entry.href)}
                      onMouseEnter={() => setActiveIndex(currentIndex)}
                    >
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {result.entry.title}
                      </div>
                      {result.matchedHeading && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {result.matchedHeading}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 border-t border-gray-200 px-4 py-2 text-xs text-gray-400 dark:border-gray-800 dark:text-gray-500">
            <span>
              <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] dark:bg-gray-800">
                &uarr;&darr;
              </kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] dark:bg-gray-800">
                Enter
              </kbd>{' '}
              Open
            </span>
            <span>
              <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] dark:bg-gray-800">
                Esc
              </kbd>{' '}
              Close
            </span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
