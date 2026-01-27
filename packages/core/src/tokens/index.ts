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
  input: {
    // Layout
    radius: 'var(--ui-input-radius)',
    borderWidth: 'var(--ui-input-border-width)',
    transition: 'var(--ui-input-transition)',

    // Typography
    fontSizeSm: 'var(--ui-input-font-size-sm)',
    fontSizeMd: 'var(--ui-input-font-size-md)',
    fontSizeLg: 'var(--ui-input-font-size-lg)',

    // Spacing
    paddingXSm: 'var(--ui-input-padding-x-sm)',
    paddingYSm: 'var(--ui-input-padding-y-sm)',
    paddingXMd: 'var(--ui-input-padding-x-md)',
    paddingYMd: 'var(--ui-input-padding-y-md)',
    paddingXLg: 'var(--ui-input-padding-x-lg)',
    paddingYLg: 'var(--ui-input-padding-y-lg)',

    // Default state
    bg: 'var(--ui-input-bg)',
    text: 'var(--ui-input-text)',
    border: 'var(--ui-input-border)',
    placeholder: 'var(--ui-input-placeholder)',

    // Focus state
    borderFocus: 'var(--ui-input-border-focus)',
    ring: 'var(--ui-input-ring)',

    // Error state
    borderError: 'var(--ui-input-border-error)',
    textError: 'var(--ui-input-text-error)',

    // Disabled state
    bgDisabled: 'var(--ui-input-bg-disabled)',
    textDisabled: 'var(--ui-input-text-disabled)',
    borderDisabled: 'var(--ui-input-border-disabled)',
  },
  textarea: {
    // Layout
    radius: 'var(--ui-textarea-radius)',
    borderWidth: 'var(--ui-textarea-border-width)',
    minHeight: 'var(--ui-textarea-min-height)',
    transition: 'var(--ui-textarea-transition)',

    // Typography
    fontSizeSm: 'var(--ui-textarea-font-size-sm)',
    fontSizeMd: 'var(--ui-textarea-font-size-md)',
    fontSizeLg: 'var(--ui-textarea-font-size-lg)',

    // Spacing
    paddingXSm: 'var(--ui-textarea-padding-x-sm)',
    paddingYSm: 'var(--ui-textarea-padding-y-sm)',
    paddingXMd: 'var(--ui-textarea-padding-x-md)',
    paddingYMd: 'var(--ui-textarea-padding-y-md)',
    paddingXLg: 'var(--ui-textarea-padding-x-lg)',
    paddingYLg: 'var(--ui-textarea-padding-y-lg)',

    // Default state
    bg: 'var(--ui-textarea-bg)',
    text: 'var(--ui-textarea-text)',
    border: 'var(--ui-textarea-border)',
    placeholder: 'var(--ui-textarea-placeholder)',

    // Focus state
    borderFocus: 'var(--ui-textarea-border-focus)',
    ring: 'var(--ui-textarea-ring)',

    // Error state
    borderError: 'var(--ui-textarea-border-error)',
    textError: 'var(--ui-textarea-text-error)',

    // Disabled state
    bgDisabled: 'var(--ui-textarea-bg-disabled)',
    textDisabled: 'var(--ui-textarea-text-disabled)',
    borderDisabled: 'var(--ui-textarea-border-disabled)',
  },
  select: {
    // Layout
    radius: 'var(--ui-select-radius)',
    borderWidth: 'var(--ui-select-border-width)',
    transition: 'var(--ui-select-transition)',
    dropdownShadow: 'var(--ui-select-dropdown-shadow)',
    dropdownMaxHeight: 'var(--ui-select-dropdown-max-height)',
    optionHeight: 'var(--ui-select-option-height)',
    zIndex: 'var(--ui-select-z-index)',

    // Typography
    fontSizeSm: 'var(--ui-select-font-size-sm)',
    fontSizeMd: 'var(--ui-select-font-size-md)',
    fontSizeLg: 'var(--ui-select-font-size-lg)',

    // Spacing
    paddingXSm: 'var(--ui-select-padding-x-sm)',
    paddingYSm: 'var(--ui-select-padding-y-sm)',
    paddingXMd: 'var(--ui-select-padding-x-md)',
    paddingYMd: 'var(--ui-select-padding-y-md)',
    paddingXLg: 'var(--ui-select-padding-x-lg)',
    paddingYLg: 'var(--ui-select-padding-y-lg)',

    // Trigger state
    bg: 'var(--ui-select-bg)',
    text: 'var(--ui-select-text)',
    border: 'var(--ui-select-border)',
    placeholder: 'var(--ui-select-placeholder)',

    // Focus state
    borderFocus: 'var(--ui-select-border-focus)',
    ring: 'var(--ui-select-ring)',

    // Error state
    borderError: 'var(--ui-select-border-error)',
    textError: 'var(--ui-select-text-error)',

    // Disabled state
    bgDisabled: 'var(--ui-select-bg-disabled)',
    textDisabled: 'var(--ui-select-text-disabled)',
    borderDisabled: 'var(--ui-select-border-disabled)',

    // Dropdown
    dropdownBg: 'var(--ui-select-dropdown-bg)',
    dropdownBorder: 'var(--ui-select-dropdown-border)',

    // Option
    optionBg: 'var(--ui-select-option-bg)',
    optionBgHover: 'var(--ui-select-option-bg-hover)',
    optionBgActive: 'var(--ui-select-option-bg-active)',
    optionText: 'var(--ui-select-option-text)',
    optionTextDisabled: 'var(--ui-select-option-text-disabled)',
    optionCheck: 'var(--ui-select-option-check)',

    // Tag tokens (multi-select)
    tagBg: 'var(--ui-select-tag-bg)',
    tagText: 'var(--ui-select-tag-text)',
    tagGap: 'var(--ui-select-tag-gap)',
    tagPaddingX: 'var(--ui-select-tag-padding-x)',
    tagPaddingY: 'var(--ui-select-tag-padding-y)',

    // Checkbox tokens (multi-select)
    checkboxBorder: 'var(--ui-select-checkbox-border)',
    checkboxBgChecked: 'var(--ui-select-checkbox-bg-checked)',
    checkboxCheck: 'var(--ui-select-checkbox-check)',
  },
} as const;

// Type helpers for token paths
export type ColorToken = keyof typeof tokens.color;
export type SpacingToken = keyof typeof tokens.spacing;
export type RadiusToken = keyof typeof tokens.radius;
export type ShadowToken = keyof typeof tokens.shadow;
export type FontFamilyToken = keyof typeof tokens.fontFamily;
export type ZIndexToken = keyof typeof tokens.zIndex;
export type InputToken = keyof typeof tokens.input;
export type TextareaToken = keyof typeof tokens.textarea;
export type SelectToken = keyof typeof tokens.select;
