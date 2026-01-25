import type { ReactNode } from 'react'

export interface NavItem {
  title: string
  href: string
  icon?: ReactNode
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const navigation: NavSection[] = [
  {
    title: "Overview",
    items: [
      { title: "Getting Started", href: "/getting-started" },
    ],
  },
  {
    title: "Components",
    items: [
      { title: "Button", href: "/components/button" },
      { title: "Dialog", href: "/components/dialog" },
    ],
  },
]
