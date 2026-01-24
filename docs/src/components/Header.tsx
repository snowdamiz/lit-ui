import { Link } from 'react-router'
import { MobileNav } from './MobileNav'

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-white border-b border-gray-200">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
        >
          lit-ui
        </Link>
        <MobileNav />
      </div>
    </header>
  )
}
