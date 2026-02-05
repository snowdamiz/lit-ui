import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Header } from '../components/Header'
import { Sidebar } from '../components/Sidebar'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

export function DocsLayout() {
  return (
    <div className="min-h-screen bg-background relative">
      <ScrollToTop />
      <div className="pointer-events-none absolute inset-0 grid-pattern" />
      <div className="pointer-events-none absolute inset-0 hero-gradient opacity-50" />
      <div className="relative">
        {/* Fixed header */}
        <Header />

        <div className="pt-16 flex">
          {/* Desktop sidebar - hidden on mobile, fixed position */}
          <aside className="hidden md:block fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
            <Sidebar />
          </aside>

          {/* Main content - offset by sidebar on desktop */}
          <main className="flex-1 md:ml-64 min-h-[calc(100vh-4rem)]">
            <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
