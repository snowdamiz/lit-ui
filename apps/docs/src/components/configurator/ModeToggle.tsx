/**
 * ModeToggle - Light/Dark Mode Switch
 *
 * Allows users to switch between light and dark mode.
 * Syncs with the global ThemeContext so both header toggle and configurator toggle
 * control the same theme state.
 */

import { Sun, Moon } from "lucide-react";
import { useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useConfigurator } from "../../contexts/ConfiguratorContext";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const { activeMode, setActiveMode } = useConfigurator();

  // Sync configurator activeMode with docs theme
  useEffect(() => {
    if (activeMode !== theme) {
      setActiveMode(theme);
    }
  }, [theme, activeMode, setActiveMode]);

  const handleModeChange = (mode: "light" | "dark") => {
    setTheme(mode); // This updates docs theme, useEffect syncs activeMode
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Editing Mode
      </label>
      <div className="flex gap-2">
        <button
          onClick={() => handleModeChange("light")}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors rounded-lg border
            ${
              theme === "light"
                ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }
          `}
          type="button"
        >
          <Sun size={16} />
          Light
        </button>
        <button
          onClick={() => handleModeChange("dark")}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors rounded-lg border
            ${
              theme === "dark"
                ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
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
