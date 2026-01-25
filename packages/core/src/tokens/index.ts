/**
 * Design Tokens for @lit-ui/core
 *
 * These tokens reference CSS custom properties defined in tailwind.css.
 * Use these for programmatic access to design system values.
 *
 * @example
 * ```typescript
 * import { tokens } from '@lit-ui/core/tokens';
 *
 * // Use in styles
 * css`color: ${tokens.color.primary};`
 * ```
 */

export const tokens = {
  color: {
    // Semantic colors (respond to light/dark theme)
    primary: 'var(--color-primary)',
    primaryForeground: 'var(--color-primary-foreground)',
    secondary: 'var(--color-secondary)',
    secondaryForeground: 'var(--color-secondary-foreground)',
    destructive: 'var(--color-destructive)',
    destructiveForeground: 'var(--color-destructive-foreground)',
    muted: 'var(--color-muted)',
    mutedForeground: 'var(--color-muted-foreground)',
    accent: 'var(--color-accent)',
    accentForeground: 'var(--color-accent-foreground)',
    background: 'var(--color-background)',
    foreground: 'var(--color-foreground)',
    border: 'var(--color-border)',
    input: 'var(--color-input)',
    ring: 'var(--color-ring)',
    card: 'var(--color-card)',
    cardForeground: 'var(--color-card-foreground)',
  },
  spacing: {
    0: 'var(--spacing-0)',
    px: 'var(--spacing-px)',
    0.5: 'var(--spacing-0\\.5)',
    1: 'var(--spacing-1)',
    2: 'var(--spacing-2)',
    3: 'var(--spacing-3)',
    4: 'var(--spacing-4)',
    5: 'var(--spacing-5)',
    6: 'var(--spacing-6)',
    8: 'var(--spacing-8)',
    10: 'var(--spacing-10)',
    12: 'var(--spacing-12)',
    16: 'var(--spacing-16)',
    20: 'var(--spacing-20)',
    24: 'var(--spacing-24)',
  },
  radius: {
    none: 'var(--radius-none)',
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
    '2xl': 'var(--radius-2xl)',
    '3xl': 'var(--radius-3xl)',
    full: 'var(--radius-full)',
  },
  shadow: {
    xs: 'var(--shadow-xs)',
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
    '2xl': 'var(--shadow-2xl)',
  },
  fontFamily: {
    sans: 'var(--font-family-sans)',
    mono: 'var(--font-family-mono)',
  },
  zIndex: {
    0: 'var(--z-0)',
    10: 'var(--z-10)',
    20: 'var(--z-20)',
    30: 'var(--z-30)',
    40: 'var(--z-40)',
    50: 'var(--z-50)',
  },
} as const;

// Type helpers for token paths
export type ColorToken = keyof typeof tokens.color;
export type SpacingToken = keyof typeof tokens.spacing;
export type RadiusToken = keyof typeof tokens.radius;
export type ShadowToken = keyof typeof tokens.shadow;
export type FontFamilyToken = keyof typeof tokens.fontFamily;
export type ZIndexToken = keyof typeof tokens.zIndex;
