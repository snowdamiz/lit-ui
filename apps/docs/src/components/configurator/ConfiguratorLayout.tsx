/**
 * ConfiguratorLayout - Sidebar + Preview Layout
 *
 * Provides the overall layout structure for the theme configurator with
 * a fixed sidebar on the left and flexible preview area on the right.
 */

import { ReactNode } from "react";
import { ShareButton } from "./ShareButton";

interface ConfiguratorLayoutProps {
  sidebar: ReactNode;
  preview: ReactNode;
  onGetCommand: () => void;
}

export function ConfiguratorLayout({
  sidebar,
  preview,
  onGetCommand,
}: ConfiguratorLayoutProps) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-80 lg:w-96 shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        {/* Sidebar header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Theme Configurator
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Customize your Lit UI theme
              </p>
            </div>
            <ShareButton />
          </div>
        </div>

        {/* Scrollable sidebar content */}
        <div className="flex-1 overflow-y-auto p-4">{sidebar}</div>

        {/* Sidebar footer with Get Command button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onGetCommand}
            className="w-full px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 text-sm font-medium rounded-lg transition-colors"
            type="button"
          >
            Get CLI Command
          </button>
        </div>
      </aside>

      {/* Preview area */}
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
        {preview}
      </main>
    </div>
  );
}

export default ConfiguratorLayout;
