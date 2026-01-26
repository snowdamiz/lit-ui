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
    <div className="grid grid-cols-2 gap-3">
      {presetThemes.map((preset) => {
        const isActive = activePreset?.id === preset.id;
        return (
          <button
            key={preset.id}
            onClick={() => handleSelectPreset(preset)}
            className={`
              group relative p-4 rounded-xl text-left transition-all border
              ${
                isActive
                  ? "bg-gray-100 border-gray-300"
                  : "bg-gray-50 hover:bg-gray-100 border-gray-200"
              }
            `}
          >
            {/* Color preview dots */}
            <div className="flex gap-1.5 mb-3">
              <div
                className="w-5 h-5 rounded-full ring-1 ring-gray-300"
                style={{
                  backgroundColor: oklchToHex(preset.config.colors.primary),
                }}
                title="Primary"
              />
              <div
                className="w-5 h-5 rounded-full ring-1 ring-gray-300"
                style={{
                  backgroundColor: oklchToHex(preset.config.colors.secondary),
                }}
                title="Secondary"
              />
              <div
                className="w-5 h-5 rounded-full ring-1 ring-gray-300"
                style={{
                  backgroundColor: oklchToHex(preset.config.colors.destructive),
                }}
                title="Destructive"
              />
            </div>
            <div className="text-sm font-semibold text-gray-900">
              {preset.name}
            </div>
            <div className="text-xs text-gray-500">
              {preset.description}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default PresetSelector;
