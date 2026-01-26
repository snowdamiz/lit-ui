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
      <label className="text-sm font-medium text-gray-500">
        Editing Mode
      </label>
      <div className="flex gap-2">
        <button
          onClick={() => setActiveMode("light")}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors rounded-lg border
            ${
              activeMode === "light"
                ? "bg-gray-100 border-gray-300 text-gray-900"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
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
            flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors rounded-lg border
            ${
              activeMode === "dark"
                ? "bg-gray-100 border-gray-300 text-gray-900"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
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
