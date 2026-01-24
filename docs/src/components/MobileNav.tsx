import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Menu, X } from 'lucide-react'
import { useLocation } from 'react-router'
import { navigation } from '../nav'
import { NavSection } from './NavSection'

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // Close sheet on route change
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className="md:hidden p-2 -mr-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="SheetOverlay fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="SheetContent fixed left-0 top-0 bottom-0 w-72 bg-white shadow-lg z-50 focus:outline-none">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <span className="font-semibold text-gray-900">Navigation</span>
            <Dialog.Close asChild>
              <button
                className="p-2 -mr-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>
          <nav className="py-4 px-2 space-y-4 overflow-y-auto h-[calc(100%-65px)]">
            {navigation.map((section, index) => (
              <NavSection
                key={section.title}
                title={section.title}
                items={section.items}
                defaultOpen={index === 0}
              />
            ))}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
