import { navigation } from '../nav'
import { NavSection } from './NavSection'

export function Sidebar() {
  return (
    <nav className="py-4 px-2 space-y-4">
      {navigation.map((section, index) => (
        <NavSection
          key={section.title}
          title={section.title}
          items={section.items}
          defaultOpen={index === 0}
        />
      ))}
    </nav>
  )
}
