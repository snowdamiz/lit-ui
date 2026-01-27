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
      { title: "Installation", href: "/installation" },
    ],
  },
  {
    title: "Guides",
    items: [
      { title: "Styling", href: "/guides/styling" },
      { title: "SSR Setup", href: "/guides/ssr" },
      { title: "Migration", href: "/guides/migration" },
      { title: "Agent Skills", href: "/guides/agent-skills" },
    ],
  },
  {
    title: "Components",
    items: [
      { title: "Button", href: "/components/button" },
      { title: "Checkbox", href: "/components/checkbox" },
      { title: "Dialog", href: "/components/dialog" },
      { title: "Input", href: "/components/input" },
      { title: "Radio", href: "/components/radio" },
      { title: "Select", href: "/components/select" },
      { title: "Switch", href: "/components/switch" },
      { title: "Textarea", href: "/components/textarea" },
    ],
  },
  {
    title: "Tools",
    items: [
      { title: "Theme Configurator", href: "/configurator" },
    ],
  },
]
