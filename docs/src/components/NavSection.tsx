import { useState } from 'react'
import * as Collapsible from '@radix-ui/react-collapsible'
import { ChevronRight } from 'lucide-react'
import { NavLink } from 'react-router'
import type { NavItem } from '../nav'

interface NavSectionProps {
  title: string
  items: NavItem[]
  defaultOpen?: boolean
}

export function NavSection({ title, items, defaultOpen = false }: NavSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
        <span>{title}</span>
        <ChevronRight
          className={`h-4 w-4 text-gray-500 transition-transform duration-150 ${
            open ? 'rotate-90' : ''
          }`}
        />
      </Collapsible.Trigger>
      <Collapsible.Content className="CollapsibleContent overflow-hidden">
        <ul className="mt-1 space-y-1 pl-2">
          {items.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `block px-3 py-1.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {item.title}
              </NavLink>
            </li>
          ))}
        </ul>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
