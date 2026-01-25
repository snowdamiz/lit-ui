import { useEffect, useState } from 'react'
import { getDocsUrl } from '../utils/config'

function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'border-b border-gray-200/80 bg-white/90 backdrop-blur-md shadow-[0_1px_3px_oklch(0_0_0/0.04)]'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="group flex items-center gap-2.5">
          <img
            src="/logo-icon.svg"
            alt="lit-ui logo"
            className="h-8 w-8 rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[-2deg]"
          />
          <span className="text-xl font-bold text-gray-900 transition-all duration-300 group-hover:tracking-wide">lit</span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          <a
            href="#features"
            className="group relative rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            Features
            <span className="absolute bottom-1.5 left-4 right-4 h-px bg-gray-900 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
          </a>
          <a
            href="#code"
            className="group relative rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            Code
            <span className="absolute bottom-1.5 left-4 right-4 h-px bg-gray-900 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
          </a>
          <a
            href="#components"
            className="group relative rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            Components
            <span className="absolute bottom-1.5 left-4 right-4 h-px bg-gray-900 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
          </a>
          <a
            href="https://github.com/snowdamiz/lit-ui"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
              />
            </svg>
            GitHub
            <span className="absolute bottom-1.5 left-4 right-4 h-px bg-gray-900 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
          </a>
        </div>

        <a
          href={getDocsUrl()}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-gray-800 btn-shadow focus-ring"
        >
          Get Started
        </a>
      </nav>
    </header>
  )
}

export default Header
