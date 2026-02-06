/**
 * ThemePreview - Live Component Preview with CSS Injection
 *
 * Displays a variety of components with dynamically injected theme CSS.
 * The preview updates in real-time as the user adjusts colors in the configurator.
 */

import { useEffect, useState, useRef } from "react";
import { useConfigurator } from "../../contexts/ConfiguratorContext";

// Side-effect imports to register custom elements
import "@lit-ui/button";
import "@lit-ui/dialog";
import "@lit-ui/input";
import "@lit-ui/switch";
import "@lit-ui/checkbox";
import "@lit-ui/tabs";

// Note: JSX types for custom elements are declared globally in
// components/LivePreview.tsx

const STYLE_ID = "configurator-preview-theme";
const PREVIEW_ID = "theme-preview-container";

/**
 * Scope CSS selectors to the preview container.
 *
 * The generated theme CSS uses:
 * - `:root { ... }` for light mode variables
 * - `.dark { ... }` for dark mode variables (standalone class selector)
 * - `@media (prefers-color-scheme: dark) { :root:not(.light) { ... } }` for system preference
 *
 * We transform these to be scoped to the preview container:
 * - `:root` -> `#theme-preview-container`
 * - `.dark` -> `#theme-preview-container.dark`
 *
 * This ensures proper CSS specificity (ID+class beats ID alone) so dark mode
 * variables correctly override light mode variables when .dark class is present.
 */
function processCSS(css: string): { scopedCSS: string; rootVars: string } {
  // Scope the CSS to the preview container
  const scopedCSS = css
    // Handle :root.dark (if any)
    .replace(/:root\.dark/g, `#${PREVIEW_ID}.dark`)
    // Handle :root:not(.light) in media queries
    .replace(/:root:not\(\.light\)/g, `#${PREVIEW_ID}:not(.light)`)
    // Handle standalone .dark selector (must come before :root replacement)
    // Match .dark at start of line or after whitespace/newline, followed by space and {
    .replace(/^\.dark\s*\{/gm, `#${PREVIEW_ID}.dark {`)
    // Handle :root selector
    .replace(/:root\s*\{/g, `#${PREVIEW_ID} {`);

  // No need to extract variables to :root since we're scoping everything
  // to the preview container and CSS variables inherit through shadow DOM
  return { scopedCSS, rootVars: '' };
}

export function ThemePreview() {
  const { getGeneratedCSS, activeMode } = useConfigurator();
  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);

  // Inject theme CSS into document head
  // CSS variables are kept at :root for dialogs, style rules are scoped to preview
  useEffect(() => {
    let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null;

    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = STYLE_ID;
      document.head.appendChild(styleEl);
    }

    const { scopedCSS, rootVars } = processCSS(getGeneratedCSS());
    styleEl.textContent = rootVars + '\n' + scopedCSS;
  }, [getGeneratedCSS]);

  // Cleanup style element on unmount
  useEffect(() => {
    return () => {
      const styleEl = document.getElementById(STYLE_ID);
      if (styleEl) {
        styleEl.remove();
      }
    };
  }, []);

  // Handle dialog close events
  useEffect(() => {
    const el = dialogRef.current;
    if (el) {
      const handleClose = () => setDialogOpen(false);
      el.addEventListener("close", handleClose);
      return () => el.removeEventListener("close", handleClose);
    }
  }, []);

  const isDark = activeMode === "dark";

  // Colors based on mode for preview container styling
  const colors = {
    sectionBg: isDark ? "#1f2937" : "#ffffff",
    sectionBorder: isDark ? "#374151" : "#e5e7eb",
    labelText: isDark ? "#9ca3af" : "#6b7280",
    bodyText: isDark ? "#d1d5db" : "#4b5563",
    previewBg: isDark ? "#0a0a0a" : "#fafafa",
    badgeBg: isDark ? "#374151" : "#e5e7eb",
    badgeText: isDark ? "#d1d5db" : "#4b5563",
  };

  return (
    <div
      id={PREVIEW_ID}
      className={`min-h-full p-8 ${isDark ? "dark" : "light"}`}
      style={{ backgroundColor: colors.previewBg }}
    >
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Section: Buttons */}
        <section>
          <h3
            className="text-sm font-semibold uppercase tracking-wider mb-4"
            style={{ color: colors.labelText }}
          >
            Buttons
          </h3>
          <div
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: colors.sectionBg,
              borderColor: colors.sectionBorder,
            }}
          >
            {/* Primary row */}
            <div className="mb-4">
              <p
                className="text-xs font-medium mb-2"
                style={{ color: colors.labelText }}
              >
                Primary
              </p>
              <div className="flex flex-wrap gap-2">
                <lui-button variant="primary" size="sm">
                  Small
                </lui-button>
                <lui-button variant="primary" size="md">
                  Medium
                </lui-button>
                <lui-button variant="primary" size="lg">
                  Large
                </lui-button>
              </div>
            </div>

            {/* Secondary row */}
            <div className="mb-4">
              <p
                className="text-xs font-medium mb-2"
                style={{ color: colors.labelText }}
              >
                Secondary
              </p>
              <div className="flex flex-wrap gap-2">
                <lui-button variant="secondary" size="sm">
                  Small
                </lui-button>
                <lui-button variant="secondary" size="md">
                  Medium
                </lui-button>
                <lui-button variant="secondary" size="lg">
                  Large
                </lui-button>
              </div>
            </div>

            {/* Destructive row */}
            <div className="mb-4">
              <p
                className="text-xs font-medium mb-2"
                style={{ color: colors.labelText }}
              >
                Destructive
              </p>
              <div className="flex flex-wrap gap-2">
                <lui-button variant="destructive" size="sm">
                  Small
                </lui-button>
                <lui-button variant="destructive" size="md">
                  Medium
                </lui-button>
                <lui-button variant="destructive" size="lg">
                  Large
                </lui-button>
              </div>
            </div>

            {/* Outline & Ghost row */}
            <div>
              <p
                className="text-xs font-medium mb-2"
                style={{ color: colors.labelText }}
              >
                Outline & Ghost
              </p>
              <div className="flex flex-wrap gap-2">
                <lui-button variant="outline">Outline</lui-button>
                <lui-button variant="ghost">Ghost</lui-button>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Form Controls */}
        <section>
          <h3
            className="text-sm font-semibold uppercase tracking-wider mb-4"
            style={{ color: colors.labelText }}
          >
            Form Controls
          </h3>
          <div
            className="p-6 rounded-lg border space-y-5"
            style={{
              backgroundColor: colors.sectionBg,
              borderColor: colors.sectionBorder,
            }}
          >
            {/* Input */}
            <div>
              <p
                className="text-xs font-medium mb-2"
                style={{ color: colors.labelText }}
              >
                Input
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[180px]">
                  <lui-input label="Name" placeholder="Enter your name" />
                </div>
                <div className="flex-1 min-w-[180px]">
                  <lui-input label="Email" placeholder="you@example.com" type="email" />
                </div>
              </div>
            </div>

            {/* Switch */}
            <div>
              <p
                className="text-xs font-medium mb-2"
                style={{ color: colors.labelText }}
              >
                Switch
              </p>
              <div className="flex flex-wrap gap-4">
                <lui-switch label="Notifications" checked />
                <lui-switch label="Dark mode" />
                <lui-switch label="Disabled" disabled />
              </div>
            </div>

            {/* Checkbox */}
            <div>
              <p
                className="text-xs font-medium mb-2"
                style={{ color: colors.labelText }}
              >
                Checkbox
              </p>
              <div className="flex flex-wrap gap-4">
                <lui-checkbox label="Accept terms" checked />
                <lui-checkbox label="Subscribe" />
                <lui-checkbox label="Disabled" disabled />
              </div>
            </div>
          </div>
        </section>

        {/* Section: Tabs */}
        <section>
          <h3
            className="text-sm font-semibold uppercase tracking-wider mb-4"
            style={{ color: colors.labelText }}
          >
            Tabs
          </h3>
          <div
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: colors.sectionBg,
              borderColor: colors.sectionBorder,
            }}
          >
            <lui-tabs default-value="account">
              <lui-tab-panel value="account" label="Account">
                <p style={{ color: colors.bodyText }}>
                  Manage your account settings and preferences.
                </p>
              </lui-tab-panel>
              <lui-tab-panel value="notifications" label="Notifications">
                <p style={{ color: colors.bodyText }}>
                  Configure how you receive notifications.
                </p>
              </lui-tab-panel>
              <lui-tab-panel value="security" label="Security">
                <p style={{ color: colors.bodyText }}>
                  Update your password and security settings.
                </p>
              </lui-tab-panel>
            </lui-tabs>
          </div>
        </section>

        {/* Section: Dialog */}
        <section>
          <h3
            className="text-sm font-semibold uppercase tracking-wider mb-4"
            style={{ color: colors.labelText }}
          >
            Dialog
          </h3>
          <div
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: colors.sectionBg,
              borderColor: colors.sectionBorder,
            }}
          >
            <lui-button variant="primary" onClick={() => setDialogOpen(true)}>
              Open Dialog
            </lui-button>

            <lui-dialog
              ref={dialogRef}
              {...(dialogOpen ? { open: true } : {})}
              show-close-button
            >
              <span slot="title">Theme Preview</span>
              <p style={{ color: colors.bodyText }}>
                This dialog demonstrates your custom theme colors. The background,
                text, and button colors all reflect your current configuration.
              </p>
              <div slot="footer" className="flex gap-2 justify-end">
                <lui-button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </lui-button>
                <lui-button variant="primary" onClick={() => setDialogOpen(false)}>
                  Confirm
                </lui-button>
              </div>
            </lui-dialog>
          </div>
        </section>

        {/* Mode indicator */}
        <div className="text-center">
          <span
            className="text-xs font-medium px-3 py-1 rounded-full"
            style={{
              backgroundColor: colors.badgeBg,
              color: colors.badgeText,
            }}
          >
            {isDark ? "Dark Mode Preview" : "Light Mode Preview"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ThemePreview;
