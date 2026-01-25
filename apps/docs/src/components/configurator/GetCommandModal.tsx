/**
 * GetCommandModal - CLI Command Display Modal
 *
 * Displays the CLI commands needed to apply the user's custom theme.
 * Shows both init command (for new projects) and theme command (for existing).
 */

import { useState, useEffect, useRef } from "react";
import { Check, Copy } from "lucide-react";
import { useConfigurator } from "../../contexts/ConfiguratorContext";

// Side-effect imports to register custom elements
import "@lit-ui/dialog";
import "@lit-ui/button";

interface GetCommandModalProps {
  open: boolean;
  onClose: () => void;
}

export function GetCommandModal({ open, onClose }: GetCommandModalProps) {
  const { getEncodedConfig } = useConfigurator();
  const dialogRef = useRef<HTMLElement>(null);
  const [copiedInit, setCopiedInit] = useState(false);
  const [copiedTheme, setCopiedTheme] = useState(false);

  // Generate CLI commands
  const encoded = getEncodedConfig();
  const initCommand = `npx @lit-ui/cli init --theme=${encoded}`;
  const themeCommand = `npx @lit-ui/cli theme ${encoded}`;

  // Handle dialog close events
  useEffect(() => {
    const el = dialogRef.current;
    if (el) {
      const handleClose = () => onClose();
      el.addEventListener("close", handleClose);
      return () => el.removeEventListener("close", handleClose);
    }
  }, [onClose]);

  // Copy to clipboard helper
  const copyToClipboard = async (
    text: string,
    setCopied: (v: boolean) => void
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <lui-dialog
      ref={dialogRef}
      {...(open ? { open: true } : {})}
      show-close-button
      size="lg"
    >
      <span slot="title">Get CLI Command</span>

      <div className="space-y-6">
        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Run one of these commands to apply your custom theme configuration.
        </p>

        {/* Init command (new projects) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              New Projects
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              For new installations
            </span>
          </div>
          <div className="relative">
            <pre className="p-4 pr-12 bg-gray-900 text-gray-100 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all">
              {initCommand}
            </pre>
            <button
              onClick={() => copyToClipboard(initCommand, setCopiedInit)}
              className="absolute right-2 top-2 p-2 text-gray-400 hover:text-gray-200 transition-colors rounded"
              title="Copy to clipboard"
              type="button"
            >
              {copiedInit ? (
                <Check size={16} className="text-green-400" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
        </div>

        {/* Theme command (existing projects) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Existing Projects
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Update theme only
            </span>
          </div>
          <div className="relative">
            <pre className="p-4 pr-12 bg-gray-900 text-gray-100 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all">
              {themeCommand}
            </pre>
            <button
              onClick={() => copyToClipboard(themeCommand, setCopiedTheme)}
              className="absolute right-2 top-2 p-2 text-gray-400 hover:text-gray-200 transition-colors rounded"
              title="Copy to clipboard"
              type="button"
            >
              {copiedTheme ? (
                <Check size={16} className="text-green-400" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
        </div>

        {/* Help text */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <strong>Tip:</strong> The <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">init</code> command
            sets up the full project with your theme. Use{" "}
            <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">theme</code> if you already have a
            Lit UI project and just want to update colors.
          </p>
        </div>
      </div>

      <div slot="footer" className="flex justify-end">
        <lui-button variant="primary" onClick={onClose}>
          Done
        </lui-button>
      </div>
    </lui-dialog>
  );
}

export default GetCommandModal;
