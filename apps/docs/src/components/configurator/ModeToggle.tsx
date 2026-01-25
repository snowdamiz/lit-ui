/**
 * ModeToggle - Light/Dark Mode Switch
 *
 * Allows users to switch between editing light and dark mode colors.
 * This controls which color set is being modified, not the actual page theme.
 */

import { Sun, Moon } from "lucide-react";
import { useConfigurator } from "../../contexts/ConfiguratorContext";

export function ModeToggle() {
  const { activeMode, setActiveMode } = useConfigurator();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Editing Mode
      </label>
      <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveMode("light")}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors
            ${
              activeMode === "light"
                ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }
          `}
          type="button"
        >
          <Sun size={16} />
          Light
        </button>
        <button
          onClick={() => setActiveMode("dark")}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors
            ${
              activeMode === "dark"
                ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }
          `}
          type="button"
        >
          <Moon size={16} />
          Dark
        </button>
      </div>
    </div>
  );
}

export default ModeToggle;
