# @lit-ui/button

## 1.0.0

### Minor Changes

- [`c33e0ad`](https://github.com/snowdamiz/lit-ui/commit/c33e0adb8591c0d2db04fa7ecc178475d8e29ba8) Thanks [@snowdamiz](https://github.com/snowdamiz)! - ### @lit-ui/cli

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

### Patch Changes

- Updated dependencies [[`c33e0ad`](https://github.com/snowdamiz/lit-ui/commit/c33e0adb8591c0d2db04fa7ecc178475d8e29ba8)]:
  - @lit-ui/core@1.0.0
