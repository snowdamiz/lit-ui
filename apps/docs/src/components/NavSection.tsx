import { NavLink } from 'react-router'
import type { NavItem } from '../nav'

interface NavSectionProps {
  title: string
  items: NavItem[]
}

// Icon components for each nav item type
function BookIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  )
}

function ButtonIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="8" rx="2" />
      <path d="M9 12h6" />
    </svg>
  )
}

function DialogIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <rect x="7" y="7" width="10" height="10" rx="1" />
    </svg>
  )
}

function ServerIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="6" rx="1" />
      <rect x="2" y="15" width="20" height="6" rx="1" />
      <circle cx="6" cy="6" r="1" fill="currentColor" />
      <circle cx="6" cy="18" r="1" fill="currentColor" />
    </svg>
  )
}

function MigrationIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  )
}

// Map of item titles to their icons
const iconMap: Record<string, () => JSX.Element> = {
  'Getting Started': BookIcon,
  'Button': ButtonIcon,
  'Dialog': DialogIcon,
  'SSR Setup': ServerIcon,
  'Migration': MigrationIcon,
}

export function NavSection({ title, items }: NavSectionProps) {
  return (
    <div>
      <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {title}
      </h3>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const IconComponent = iconMap[item.title]
          return (
            <li key={item.href}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {IconComponent && (
                      <span className={`flex-shrink-0 ${isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                        <IconComponent />
                      </span>
                    )}
                    <span>{item.title}</span>
                  </>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
