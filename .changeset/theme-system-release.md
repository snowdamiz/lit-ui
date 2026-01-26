---
"@lit-ui/cli": minor
"@lit-ui/button": minor
"@lit-ui/core": minor
---

### @lit-ui/cli
- Add `theme` command for standalone theme application
- Add `--theme` argument to `init` command for theme configuration during setup
- Implement complete theme system with OKLCH color scale generation
- Add CSS theme generator with custom property output
- Add theme config URL encoding for shareable configurations
- Export `generateScale` utility from `@lit-ui/cli/theme`

### @lit-ui/button
- Add automatic text contrast for buttons using CSS relative color syntax
- Improve accessibility with dynamic foreground color calculation

### @lit-ui/core
- Add safelist.css for commonly used utility classes
- Extend tailwind.css with additional theme-aware styles
