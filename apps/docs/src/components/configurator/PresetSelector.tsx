/**
 * PresetSelector - Preset theme selection grid
 *
 * Displays available preset themes with color bar previews.
 * Clicking a preset applies it via loadThemeConfig.
 */

import { useConfigurator } from "../../contexts/ConfiguratorContext";
import { presetThemes, type PresetTheme } from "../../data/presets";
import { oklchToHex } from "../../utils/color-utils";

export function PresetSelector() {
  const { loadThemeConfig, lightColors } = useConfigurator();

  // Check which preset matches current state (if any)
  const activePreset = presetThemes.find((preset) =>
    Object.entries(preset.config.colors).every(
      ([key, value]) => lightColors[key as keyof typeof lightColors] === value
    )
  );

  const handleSelectPreset = (preset: PresetTheme) => {
    loadThemeConfig(preset.config);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {presetThemes.map((preset) => {
        const isActive = activePreset?.id === preset.id;
        const primaryHex = oklchToHex(preset.config.colors.primary);
        const secondaryHex = oklchToHex(preset.config.colors.secondary);
        const foregroundHex = oklchToHex(preset.config.colors.foreground);
        const backgroundHex = oklchToHex(preset.config.colors.background);

        return (
          <button
            key={preset.id}
            onClick={() => handleSelectPreset(preset)}
            className={`
              group relative p-3 rounded-xl text-left transition-all border
              ${
                isActive
                  ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 ring-1 ring-gray-300 dark:ring-gray-600"
                  : "bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
              }
            `}
          >
            {/* Color bar preview */}
            <div
              className="h-8 rounded-md mb-2.5 flex overflow-hidden ring-1 ring-gray-200 dark:ring-gray-700"
            >
              <div className="flex-1" style={{ backgroundColor: primaryHex }} />
              <div className="flex-1" style={{ backgroundColor: secondaryHex }} />
              <div className="flex-1" style={{ backgroundColor: foregroundHex }} />
              <div className="flex-1" style={{ backgroundColor: backgroundHex }} />
            </div>

            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {preset.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {preset.description}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default PresetSelector;
