import { useEffect, useState, useRef, useCallback } from 'react'
import { getDocsUrl } from '../utils/config'

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#code', label: 'Code' },
  { href: '#components', label: 'Components' },
]

function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)

  // Scroll detection + active section tracking
  useEffect(() => {
    const sectionIds = ['features', 'code', 'cli-demo-section', 'components', 'get-started']

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)

      // Find the active section based on scroll position
      const scrollY = window.scrollY + 120
      let current = ''

      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= scrollY) {
          current = id
        }
      }

      // Map cli-demo-section to no nav highlight (it's between code and components)
      if (current === 'cli-demo-section') current = 'code'
      if (current === 'get-started') current = 'components'

      setActiveSection(current ? `#${current}` : '')
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileMenuOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mobileMenuOpen])

  // Focus trap within mobile menu
  const handleMenuKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!mobileMenuOpen) return

      if (e.key === 'Escape') {
        setMobileMenuOpen(false)
        buttonRef.current?.focus()
        return
      }

      if (e.key === 'Tab') {
        const focusableEls = menuRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])'
        )
        if (!focusableEls || focusableEls.length === 0) return

        const first = focusableEls[0]
        const last = focusableEls[focusableEls.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    },
    [mobileMenuOpen]
  )

  // Focus first link when menu opens
  useEffect(() => {
    if (mobileMenuOpen) {
      // Small delay to allow animation to start
      requestAnimationFrame(() => {
        firstLinkRef.current?.focus()
      })
    }
  }, [mobileMenuOpen])

  // Close mobile menu on resize above md breakpoint
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = () => {
      if (mq.matches) setMobileMenuOpen(false)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const closeMobileMenu = () => setMobileMenuOpen(false)

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

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={activeSection === link.href ? 'true' : undefined}
              className={`group relative rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-ring ${
                activeSection === link.href
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {link.label}
              <span
                className={`absolute bottom-1.5 left-4 right-4 h-px bg-gray-900 origin-left transition-transform duration-300 ${
                  activeSection === link.href
                    ? 'scale-x-100'
                    : 'scale-x-0 group-hover:scale-x-100'
                }`}
              />
            </a>
          ))}
          <a
            href="https://github.com/snowdamiz/lit-ui"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 focus-ring"
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

        <div className="flex items-center gap-3">
          {/* Hamburger button (mobile only) */}
          <button
            ref={buttonRef}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-ring md:hidden"
          >
            <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
            <svg
              className={`h-5 w-5 transition-transform duration-300 ${mobileMenuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
              className={`absolute h-5 w-5 transition-transform duration-300 ${mobileMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <a
            href={getDocsUrl()}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-gray-800 btn-shadow focus-ring"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          ref={menuRef}
          role="navigation"
          aria-label="Mobile navigation"
          onKeyDown={handleMenuKeyDown}
          className="border-t border-gray-200/80 bg-white/95 backdrop-blur-md md:hidden mobile-menu-enter"
        >
          <div className="mx-auto max-w-6xl space-y-1 px-6 py-4">
            {navLinks.map((link, i) => (
              <a
                key={link.href}
                ref={i === 0 ? firstLinkRef : undefined}
                href={link.href}
                onClick={closeMobileMenu}
                aria-current={activeSection === link.href ? 'true' : undefined}
                className={`block rounded-lg px-4 py-3 text-base font-medium transition-colors focus-ring ${
                  activeSection === link.href
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://github.com/snowdamiz/lit-ui"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobileMenu}
              className="flex items-center gap-2 rounded-lg px-4 py-3 text-base font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 focus-ring"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
