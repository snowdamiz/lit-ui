/**
 * PresetSelector - Preset theme selection grid
 *
 * Displays available preset themes with color previews.
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
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Presets
      </label>
      <div className="grid grid-cols-2 gap-2">
        {presetThemes.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleSelectPreset(preset)}
            className={`
              p-3 rounded-lg border-2 text-left transition-all
              ${
                activePreset?.id === preset.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }
            `}
          >
            {/* Color preview dots */}
            <div className="flex gap-1 mb-2">
              <div
                className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-600"
                style={{
                  backgroundColor: oklchToHex(preset.config.colors.primary),
                }}
                title="Primary"
              />
              <div
                className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-600"
                style={{
                  backgroundColor: oklchToHex(preset.config.colors.secondary),
                }}
                title="Secondary"
              />
              <div
                className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-600"
                style={{
                  backgroundColor: oklchToHex(preset.config.colors.destructive),
                }}
                title="Destructive"
              />
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {preset.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {preset.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default PresetSelector;
