/**
 * ThemePreview - Live Component Preview with CSS Injection
 *
 * Displays Button and Dialog components with dynamically injected theme CSS.
 * The preview updates in real-time as the user adjusts colors in the configurator.
 */

import { useEffect, useState, useRef } from "react";
import { useConfigurator } from "../../contexts/ConfiguratorContext";

// Side-effect imports to register custom elements
import "@lit-ui/button";
import "@lit-ui/dialog";

// Note: JSX types for lui-button and lui-dialog are declared in
// pages/components/ButtonPage.tsx and DialogPage.tsx

const STYLE_ID = "configurator-preview-theme";

export function ThemePreview() {
  const { getGeneratedCSS, activeMode } = useConfigurator();
  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);

  // Inject theme CSS into document head
  useEffect(() => {
    let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null;

    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = STYLE_ID;
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = getGeneratedCSS();
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

  return (
    <div
      className={`min-h-full p-8 ${activeMode === "dark" ? "dark" : ""}`}
      style={{
        backgroundColor: activeMode === "dark" ? "var(--lui-background)" : "var(--lui-background)",
      }}
    >
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Section: Buttons */}
        <section>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Buttons
          </h3>
          <div
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: activeMode === "dark" ? "#1f2937" : "#ffffff",
              borderColor: activeMode === "dark" ? "#374151" : "#e5e7eb",
            }}
          >
            {/* Primary row */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
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
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
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
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
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
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Outline & Ghost
              </p>
              <div className="flex flex-wrap gap-2">
                <lui-button variant="outline">Outline</lui-button>
                <lui-button variant="ghost">Ghost</lui-button>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Dialog */}
        <section>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Dialog
          </h3>
          <div
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: activeMode === "dark" ? "#1f2937" : "#ffffff",
              borderColor: activeMode === "dark" ? "#374151" : "#e5e7eb",
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
              <p
                style={{
                  color: activeMode === "dark" ? "#d1d5db" : "#4b5563",
                }}
              >
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
              backgroundColor: activeMode === "dark" ? "#374151" : "#e5e7eb",
              color: activeMode === "dark" ? "#d1d5db" : "#4b5563",
            }}
          >
            {activeMode === "dark" ? "Dark Mode Preview" : "Light Mode Preview"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ThemePreview;
