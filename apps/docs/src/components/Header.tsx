import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Search } from 'lucide-react'
import { MobileNav } from './MobileNav'
import { ThemeToggle } from './ThemeToggle'
import { CommandPalette } from './CommandPalette'

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)

export function Header() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 h-16 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80 shadow-[0_1px_3px_oklch(0_0_0/0.04)]'
          : 'bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800'
      }`}
    >
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        <Link
          to="/"
          className="group flex items-center gap-2.5 focus-ring rounded-lg"
        >
          <img
            src="/logo-icon.svg"
            alt="lit-ui logo"
            className="h-8 w-8 rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[-2deg]"
          />
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100 transition-all duration-300 group-hover:tracking-wide">lit</span>
          <span className="text-sm font-medium text-gray-400 dark:text-gray-500 tracking-wide">/ DOCS</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 cursor-pointer focus-ring"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search...</span>
            <kbd className="ml-auto rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-xs font-mono">
              {isMac ? 'Cmd K' : 'Ctrl K'}
            </kbd>
          </button>
          <a
            href="https://github.com/snowdamiz/lit-ui"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 focus-ring"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
              />
            </svg>
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
    </header>
  )
}
