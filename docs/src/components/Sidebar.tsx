import { navigation } from '../nav'
import { NavSection } from './NavSection'

export function Sidebar() {
  return (
    <nav className="py-6 px-3">
      <div className="space-y-6">
        {navigation.map((section) => (
          <NavSection
            key={section.title}
            title={section.title}
            items={section.items}
          />
        ))}
      </div>
    </nav>
  )
}
