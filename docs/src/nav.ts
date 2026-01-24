export interface NavItem {
  title: string
  href: string
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const navigation: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/" },
      { title: "Installation", href: "/installation" },
      { title: "Quick Start", href: "/quick-start" },
    ],
  },
  {
    title: "Components",
    items: [
      { title: "Button", href: "/components/button" },
      { title: "Dialog", href: "/components/dialog" },
    ],
  },
  {
    title: "Guides",
    items: [
      { title: "React", href: "/guides/react" },
      { title: "Vue", href: "/guides/vue" },
      { title: "Svelte", href: "/guides/svelte" },
      { title: "Theming", href: "/guides/theming" },
      { title: "Accessibility", href: "/guides/accessibility" },
    ],
  },
]
