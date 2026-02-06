/**
 * CSS Theme Generator
 *
 * Transforms theme configurations into Tailwind v4-compatible CSS.
 * Generates CSS custom properties (--lui-*) that cascade into Shadow DOM.
 *
 * Output includes:
 * - :root block with light mode variables
 * - .dark block with dark mode overrides
 * - @media (prefers-color-scheme: dark) block for system preference support
 * - Border radius variables based on configured scale
 *
 * Covers all component token layers: Button, Dialog, Input, Switch,
 * Checkbox, Radio, Select, Tabs, and Accordion.
 */

import type { ThemeConfig } from './schema.js';
import { deriveDarkMode, deriveForeground, deriveTint } from './color-scale.js';

/**
 * Border radius values for each scale option.
 * Maps the config radius (sm/md/lg) to actual rem values.
 */
const RADIUS_VALUES: Record<ThemeConfig['radius'], { sm: string; md: string; lg: string }> = {
  sm: {
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.375rem',
  },
  md: {
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
  },
  lg: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
  },
};

/**
 * Derive a complete set of semantic + component tokens for one mode.
 */
function deriveTokens(colors: ThemeConfig['colors'], darkColors: {
  primary: string;
  secondary: string;
  destructive: string;
  background: string;
  foreground: string;
  muted: string;
}) {
  return {
    light: {
      ...colors,
      primaryForeground: deriveForeground(colors.primary),
      secondaryForeground: deriveForeground(colors.secondary),
      destructiveForeground: deriveForeground(colors.destructive),
      mutedForeground: deriveForeground(colors.muted),
      // Tints for selection/highlight states
      primaryTint10: deriveTint(colors.primary, colors.background, 0.10),
      primaryTint15: deriveTint(colors.primary, colors.background, 0.15),
      primaryTint12: deriveTint(colors.primary, colors.background, 0.12),
      primaryTint06: deriveTint(colors.primary, colors.background, 0.06),
      primaryTint08: deriveTint(colors.primary, colors.background, 0.08),
    },
    dark: {
      ...darkColors,
      primaryForeground: deriveForeground(darkColors.primary),
      secondaryForeground: deriveForeground(darkColors.secondary),
      destructiveForeground: deriveForeground(darkColors.destructive),
      mutedForeground: deriveForeground(darkColors.muted),
      // Tints for selection/highlight states
      primaryTint10: deriveTint(darkColors.primary, darkColors.background, 0.10),
      primaryTint15: deriveTint(darkColors.primary, darkColors.background, 0.15),
      primaryTint12: deriveTint(darkColors.primary, darkColors.background, 0.12),
      primaryTint06: deriveTint(darkColors.primary, darkColors.background, 0.06),
      primaryTint08: deriveTint(darkColors.primary, darkColors.background, 0.08),
    },
  };
}

/**
 * Generate the CSS variable block content for a given set of tokens.
 */
function generateVariableBlock(
  t: {
    primary: string;
    secondary: string;
    destructive: string;
    background: string;
    foreground: string;
    muted: string;
    primaryForeground: string;
    secondaryForeground: string;
    destructiveForeground: string;
    mutedForeground: string;
    primaryTint10: string;
    primaryTint15: string;
    primaryTint12: string;
    primaryTint06: string;
    primaryTint08: string;
  },
  radiusValues: { sm: string; md: string; lg: string },
  includeRadius: boolean,
): string {
  const lines: string[] = [];

  // Semantic Colors
  lines.push(
    `  /* Semantic Colors */`,
    `  --color-primary: ${t.primary};`,
    `  --color-primary-foreground: ${t.primaryForeground};`,
    `  --color-secondary: ${t.secondary};`,
    `  --color-secondary-foreground: ${t.secondaryForeground};`,
    `  --color-destructive: ${t.destructive};`,
    `  --color-destructive-foreground: ${t.destructiveForeground};`,
    `  --color-background: ${t.background};`,
    `  --color-foreground: ${t.foreground};`,
    `  --color-muted: ${t.muted};`,
    `  --color-muted-foreground: ${t.mutedForeground};`,
    `  --color-accent: ${t.muted};`,
    `  --color-accent-foreground: ${t.foreground};`,
    `  --color-border: ${t.muted};`,
    `  --color-ring: ${t.primary};`,
    `  --color-card: ${t.background};`,
    `  --color-card-foreground: ${t.foreground};`,
    `  --color-input: ${t.muted};`,
  );

  // Button Component Variables
  lines.push(
    ``,
    `  /* Button Component */`,
  );
  if (includeRadius) {
    lines.push(`  --ui-button-radius: ${radiusValues.md};`);
  }
  lines.push(
    `  --ui-button-primary-bg: ${t.primary};`,
    `  --ui-button-primary-text: ${t.primaryForeground};`,
    `  --ui-button-secondary-bg: ${t.secondary};`,
    `  --ui-button-secondary-text: ${t.secondaryForeground};`,
    `  --ui-button-secondary-hover-bg: ${t.muted};`,
    `  --ui-button-destructive-bg: ${t.destructive};`,
    `  --ui-button-destructive-text: ${t.destructiveForeground};`,
    `  --ui-button-outline-bg: transparent;`,
    `  --ui-button-outline-text: ${t.foreground};`,
    `  --ui-button-outline-border: ${t.muted};`,
    `  --ui-button-outline-hover-bg: ${t.muted};`,
    `  --ui-button-ghost-bg: transparent;`,
    `  --ui-button-ghost-text: ${t.foreground};`,
    `  --ui-button-ghost-hover-bg: ${t.muted};`,
  );

  // Dialog Component Variables
  lines.push(
    ``,
    `  /* Dialog Component */`,
  );
  if (includeRadius) {
    lines.push(`  --ui-dialog-radius: ${radiusValues.lg};`);
  }
  lines.push(
    `  --ui-dialog-bg: ${t.background};`,
    `  --ui-dialog-text: ${t.foreground};`,
    `  --ui-dialog-body-color: ${t.mutedForeground};`,
  );

  // Input Component Variables
  lines.push(
    ``,
    `  /* Input Component */`,
  );
  if (includeRadius) {
    lines.push(`  --ui-input-radius: ${radiusValues.md};`);
  }
  lines.push(
    `  --ui-input-bg: ${t.background};`,
    `  --ui-input-text: ${t.foreground};`,
    `  --ui-input-border: ${t.muted};`,
    `  --ui-input-placeholder: ${t.mutedForeground};`,
    `  --ui-input-border-focus: ${t.primary};`,
    `  --ui-input-ring: ${t.primary};`,
    `  --ui-input-border-error: ${t.destructive};`,
    `  --ui-input-text-error: ${t.destructive};`,
    `  --ui-input-bg-disabled: ${t.muted};`,
    `  --ui-input-text-disabled: ${t.mutedForeground};`,
    `  --ui-input-border-disabled: ${t.muted};`,
  );

  // Textarea Component Variables
  lines.push(
    ``,
    `  /* Textarea Component */`,
  );
  if (includeRadius) {
    lines.push(`  --ui-textarea-radius: ${radiusValues.md};`);
  }
  lines.push(
    `  --ui-textarea-bg: ${t.background};`,
    `  --ui-textarea-text: ${t.foreground};`,
    `  --ui-textarea-border: ${t.muted};`,
    `  --ui-textarea-placeholder: ${t.mutedForeground};`,
    `  --ui-textarea-border-focus: ${t.primary};`,
    `  --ui-textarea-ring: ${t.primary};`,
    `  --ui-textarea-border-error: ${t.destructive};`,
    `  --ui-textarea-text-error: ${t.destructive};`,
  );

  // Switch Component Variables
  lines.push(
    ``,
    `  /* Switch Component */`,
    `  --ui-switch-track-bg: ${t.muted};`,
    `  --ui-switch-track-border: ${t.muted};`,
    `  --ui-switch-track-bg-checked: ${t.primary};`,
    `  --ui-switch-ring: ${t.primary};`,
    `  --ui-switch-border-error: ${t.destructive};`,
    `  --ui-switch-text-error: ${t.destructive};`,
  );

  // Checkbox Component Variables
  lines.push(
    ``,
    `  /* Checkbox Component */`,
  );
  if (includeRadius) {
    lines.push(`  --ui-checkbox-radius: ${radiusValues.sm};`);
  }
  lines.push(
    `  --ui-checkbox-border: ${t.muted};`,
    `  --ui-checkbox-bg-checked: ${t.primary};`,
    `  --ui-checkbox-border-checked: ${t.primary};`,
    `  --ui-checkbox-bg-indeterminate: ${t.primary};`,
    `  --ui-checkbox-border-indeterminate: ${t.primary};`,
    `  --ui-checkbox-ring: ${t.primary};`,
    `  --ui-checkbox-border-error: ${t.destructive};`,
    `  --ui-checkbox-text-error: ${t.destructive};`,
  );

  // Radio Component Variables
  lines.push(
    ``,
    `  /* Radio Component */`,
    `  --ui-radio-border: ${t.muted};`,
    `  --ui-radio-border-checked: ${t.primary};`,
    `  --ui-radio-dot-color: ${t.primary};`,
    `  --ui-radio-ring: ${t.primary};`,
    `  --ui-radio-border-error: ${t.destructive};`,
    `  --ui-radio-text-error: ${t.destructive};`,
  );

  // Select Component Variables
  lines.push(
    ``,
    `  /* Select Component */`,
  );
  if (includeRadius) {
    lines.push(`  --ui-select-radius: ${radiusValues.md};`);
  }
  lines.push(
    `  --ui-select-bg: ${t.background};`,
    `  --ui-select-text: ${t.foreground};`,
    `  --ui-select-border: ${t.muted};`,
    `  --ui-select-placeholder: ${t.mutedForeground};`,
    `  --ui-select-border-focus: ${t.primary};`,
    `  --ui-select-ring: ${t.primary};`,
    `  --ui-select-border-error: ${t.destructive};`,
    `  --ui-select-dropdown-bg: ${t.background};`,
    `  --ui-select-dropdown-border: ${t.muted};`,
    `  --ui-select-option-bg-hover: ${t.muted};`,
    `  --ui-select-option-bg-active: ${t.muted};`,
    `  --ui-select-option-text: ${t.foreground};`,
    `  --ui-select-option-check: ${t.primary};`,
    `  --ui-select-tag-bg: ${t.secondary};`,
    `  --ui-select-tag-text: ${t.secondaryForeground};`,
    `  --ui-select-checkbox-border: ${t.muted};`,
    `  --ui-select-checkbox-bg-checked: ${t.primary};`,
  );

  // Tabs Component Variables
  lines.push(
    ``,
    `  /* Tabs Component */`,
    `  --ui-tabs-border: ${t.muted};`,
    `  --ui-tabs-list-bg: ${t.muted};`,
    `  --ui-tabs-tab-text: ${t.mutedForeground};`,
    `  --ui-tabs-tab-hover-text: ${t.foreground};`,
    `  --ui-tabs-tab-active-text: ${t.foreground};`,
    `  --ui-tabs-tab-active-bg: ${t.background};`,
    `  --ui-tabs-panel-text: ${t.foreground};`,
    `  --ui-tabs-ring: ${t.primary};`,
    `  --ui-tabs-indicator-color: ${t.primary};`,
  );

  // Accordion Component Variables
  lines.push(
    ``,
    `  /* Accordion Component */`,
    `  --ui-accordion-border: ${t.muted};`,
    `  --ui-accordion-header-text: ${t.foreground};`,
    `  --ui-accordion-header-hover-bg: ${t.muted};`,
    `  --ui-accordion-panel-text: ${t.mutedForeground};`,
    `  --ui-accordion-ring: ${t.primary};`,
  );

  // Calendar Component Variables
  lines.push(
    ``,
    `  /* Calendar Component */`,
    `  --ui-calendar-bg: ${t.background};`,
    `  --ui-calendar-text: ${t.foreground};`,
    `  --ui-calendar-border: ${t.muted};`,
    `  --ui-calendar-hover-bg: ${t.muted};`,
    `  --ui-calendar-weekday-color: ${t.mutedForeground};`,
    `  --ui-calendar-today-border: 2px solid ${t.primary};`,
    `  --ui-calendar-selected-bg: ${t.primary};`,
    `  --ui-calendar-selected-text: ${t.primaryForeground};`,
    `  --ui-calendar-focus-ring: ${t.primary};`,
  );

  // Popover Component Variables
  lines.push(
    ``,
    `  /* Popover Component */`,
    `  --ui-popover-bg: ${t.background};`,
    `  --ui-popover-text: ${t.foreground};`,
    `  --ui-popover-border: ${t.muted};`,
  );

  // Tooltip Component Variables (inverted - dark bg, light text)
  lines.push(
    ``,
    `  /* Tooltip Component */`,
    `  --ui-tooltip-bg: ${t.foreground};`,
    `  --ui-tooltip-text: ${t.background};`,
  );

  // Toast Component Variables
  lines.push(
    ``,
    `  /* Toast Component */`,
    `  --ui-toast-bg: ${t.background};`,
    `  --ui-toast-text: ${t.foreground};`,
    `  --ui-toast-border: ${t.muted};`,
  );

  // Data Table Component Variables
  lines.push(
    ``,
    `  /* Data Table Component */`,
    `  --ui-data-table-header-bg: ${t.muted};`,
    `  --ui-data-table-row-bg: ${t.background};`,
    `  --ui-data-table-row-hover-bg: ${t.muted};`,
    `  --ui-data-table-border-color: ${t.muted};`,
    `  --ui-data-table-text-color: ${t.foreground};`,
    `  --ui-data-table-header-text: ${t.mutedForeground};`,
    `  --ui-data-table-selected-bg: ${t.primaryTint10};`,
    `  --ui-data-table-selected-hover-bg: ${t.primaryTint15};`,
    `  --ui-data-table-banner-bg: ${t.primaryTint08};`,
  );

  // Date Picker Component Variables
  lines.push(
    ``,
    `  /* Date Picker Component */`,
    `  --ui-date-picker-popup-bg: ${t.background};`,
    `  --ui-date-picker-popup-border: ${t.muted};`,
    `  --ui-date-picker-preset-border: ${t.muted};`,
    `  --ui-date-picker-preset-bg: ${t.secondary};`,
    `  --ui-date-picker-preset-text: ${t.foreground};`,
    `  --ui-date-picker-preset-bg-hover: ${t.muted};`,
    `  --ui-date-picker-preset-border-hover: ${t.mutedForeground};`,
  );

  // Date Range Picker Component Variables
  lines.push(
    ``,
    `  /* Date Range Picker Component */`,
    `  --ui-range-selected-bg: ${t.primary};`,
    `  --ui-range-selected-text: ${t.primaryForeground};`,
    `  --ui-range-highlight-bg: ${t.primaryTint12};`,
    `  --ui-range-highlight-text: ${t.foreground};`,
    `  --ui-range-preview-bg: ${t.primaryTint06};`,
  );

  // Time Picker Component Variables
  lines.push(
    ``,
    `  /* Time Picker Component */`,
    `  --ui-time-picker-popup-bg: ${t.background};`,
    `  --ui-time-picker-popup-border: ${t.muted};`,
    `  --ui-time-picker-primary: ${t.primary};`,
    `  --ui-time-picker-tab-bg: ${t.secondary};`,
    `  --ui-time-picker-tab-bg-hover: ${t.muted};`,
    `  --ui-time-picker-preset-border: ${t.muted};`,
    `  --ui-time-picker-preset-bg: ${t.secondary};`,
    `  --ui-time-picker-preset-text: ${t.foreground};`,
    `  --ui-time-picker-preset-bg-hover: ${t.muted};`,
    `  --ui-time-picker-preset-border-hover: ${t.mutedForeground};`,
  );

  return lines.join('\n');
}

/**
 * Generate Tailwind v4-compatible CSS from a theme configuration.
 *
 * @param config - Complete theme configuration
 * @returns CSS string with :root, .dark, and @media blocks
 */
export function generateThemeCSS(config: ThemeConfig): string {
  const { colors, radius } = config;
  const radiusValues = RADIUS_VALUES[radius];

  // Derive dark mode variants
  const darkColors = {
    primary: deriveDarkMode(colors.primary),
    secondary: deriveDarkMode(colors.secondary),
    destructive: deriveDarkMode(colors.destructive),
    background: deriveDarkMode(colors.background),
    foreground: deriveDarkMode(colors.foreground),
    muted: deriveDarkMode(colors.muted),
  };

  const tokens = deriveTokens(colors, darkColors);

  const lightBlock = generateVariableBlock(tokens.light, radiusValues, true);
  const darkBlock = generateVariableBlock(tokens.dark, radiusValues, false);

  return `/**
 * Lit UI Theme CSS
 * Generated by Lit UI CLI
 *
 * This file contains CSS custom properties for theming.
 * Component-level variables (--ui-button-*, --ui-dialog-*, etc.) are set
 * directly to ensure they cascade properly into Shadow DOM.
 */

/* ==========================================================================
 * Light Mode (Default)
 * ========================================================================== */
:root {
  /* Auto-contrast threshold for button text color calculation */
  --ui-contrast-threshold: 0.7;

${lightBlock}
}

/* ==========================================================================
 * Dark Mode (Class-based)
 * Applied when .dark class is present on an ancestor element.
 * ========================================================================== */
.dark {
${darkBlock}
}

/* ==========================================================================
 * Dark Mode (System Preference)
 * Applied when user's system prefers dark mode and .light class is not present.
 * ========================================================================== */
@media (prefers-color-scheme: dark) {
  :root:not(.light) {
${darkBlock}
  }
}
`;
}
