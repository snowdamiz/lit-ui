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
      { title: "Accessibility", href: "/guides/accessibility" },
      { title: "Agent Skills", href: "/guides/agent-skills" },
      { title: "Form Integration", href: "/guides/form-integration" },
      { title: "Internationalization", href: "/guides/i18n" },
      { title: "Migration", href: "/guides/migration" },
      { title: "SSR Setup", href: "/guides/ssr" },
      { title: "Styling", href: "/guides/styling" },
    ],
  },
  {
    title: "Components",
    items: [
      { title: "Button", href: "/components/button" },
      { title: "Calendar", href: "/components/calendar" },
      { title: "Checkbox", href: "/components/checkbox" },
      { title: "Date Picker", href: "/components/date-picker" },
      { title: "Date Range Picker", href: "/components/date-range-picker" },
      { title: "Dialog", href: "/components/dialog" },
      { title: "Input", href: "/components/input" },
      { title: "Popover", href: "/components/popover" },
      { title: "Radio", href: "/components/radio" },
      { title: "Select", href: "/components/select" },
      { title: "Switch", href: "/components/switch" },
      { title: "Textarea", href: "/components/textarea" },
      { title: "Time Picker", href: "/components/time-picker" },
      { title: "Toast", href: "/components/toast" },
      { title: "Tooltip", href: "/components/tooltip" },
    ],
  },
  {
    title: "Tools",
    items: [
      { title: "Theme Configurator", href: "/configurator" },
    ],
  },
]
