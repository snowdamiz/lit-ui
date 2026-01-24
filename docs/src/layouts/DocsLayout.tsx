import { Outlet } from 'react-router'
import { Header } from '../components/Header'
import { Sidebar } from '../components/Sidebar'

export function DocsLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Fixed header */}
      <Header />

      <div className="pt-16 flex">
        {/* Desktop sidebar - hidden on mobile, fixed position */}
        <aside className="hidden md:block fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] overflow-y-auto border-r border-gray-200 bg-white">
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
  )
}
