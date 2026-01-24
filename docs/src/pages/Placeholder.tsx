import { useLocation } from 'react-router'

export function Placeholder() {
  const location = useLocation()

  // Convert path to title: /components/button -> "Components / Button"
  const pathParts = location.pathname
    .split('/')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '))

  const title = pathParts.length > 0 ? pathParts.join(' / ') : 'Introduction'

  return (
    <div className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-600 text-lg">
        This page is coming soon. Content will be added in later phases.
      </p>
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500 font-mono">
          Route: {location.pathname}
        </p>
      </div>
    </div>
  )
}
