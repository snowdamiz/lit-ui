/**
 * ColorPickerGroup - Individual Color Picker Component
 *
 * Provides a complete color picking interface for a single theme color:
 * - Saturation square for hue/saturation selection
 * - Hue slider for hue adjustment
 * - Hex input for direct value entry
 * - Reset button for overridden colors
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import Saturation from "@uiw/react-color-saturation";
import Hue from "@uiw/react-color-hue";
import { RotateCcw } from "lucide-react";
import { useConfigurator, type ColorKey } from "../../contexts/ConfiguratorContext";
import {
  oklchToHsv,
  hsvToOklch,
  oklchToHex,
  hexToOklch,
  isValidHex,
} from "../../utils/color-utils";

interface ColorPickerGroupProps {
  colorKey: ColorKey;
  label: string;
}

export function ColorPickerGroup({ colorKey, label }: ColorPickerGroupProps) {
  const {
    activeMode,
    lightColors,
    darkColors,
    darkOverrides,
    lightOverrides,
    setLightColor,
    setDarkColor,
    resetDarkColor,
    resetLightColor,
  } = useConfigurator();

  // Get current OKLCH value based on active mode
  const oklchValue = activeMode === "light" ? lightColors[colorKey] : darkColors[colorKey];

  // Convert to formats needed by picker components
  const hsva = useMemo(() => {
    const hsv = oklchToHsv(oklchValue);
    return { ...hsv, a: 1 };
  }, [oklchValue]);

  const hexValue = useMemo(() => oklchToHex(oklchValue), [oklchValue]);

  // Local state for hex input (controlled input with validation on blur)
  const [hexInput, setHexInput] = useState(hexValue);

  // Sync hex input when external value changes
  useEffect(() => {
    setHexInput(hexValue);
  }, [hexValue]);

  // Check if current color is overridden
  const isOverridden = activeMode === "dark"
    ? darkOverrides.has(colorKey)
    : lightOverrides.has(colorKey);

  // Handle color change from Saturation/Hue picker
  const handleColorChange = useCallback(
    (newHsva: { h: number; s: number; v: number; a: number }) => {
      const oklch = hsvToOklch({ h: newHsva.h, s: newHsva.s, v: newHsva.v });
      if (activeMode === "light") {
        setLightColor(colorKey, oklch);
      } else {
        setDarkColor(colorKey, oklch);
      }
    },
    [activeMode, colorKey, setLightColor, setDarkColor]
  );

  // Handle hex input change (just update local state)
  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHexInput(e.target.value);
  };

  // Validate and apply hex on blur
  const handleHexBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const hex = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
      if (isValidHex(hex)) {
        const oklch = hexToOklch(hex);
        if (activeMode === "light") {
          setLightColor(colorKey, oklch);
        } else {
          setDarkColor(colorKey, oklch);
        }
      } else {
        // Reset to current valid value if invalid
        setHexInput(hexValue);
      }
    },
    [activeMode, colorKey, setLightColor, setDarkColor, hexValue]
  );

  // Handle Enter key in hex input
  const handleHexKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  // Handle reset click
  const handleReset = useCallback(() => {
    if (activeMode === "dark") {
      resetDarkColor(colorKey);
    } else {
      resetLightColor(colorKey);
    }
  }, [activeMode, colorKey, resetDarkColor, resetLightColor]);

  return (
    <div className="space-y-2">
      {/* Label with reset button */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {isOverridden && (
          <button
            onClick={handleReset}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            title="Reset to derived value"
            type="button"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>

      {/* Saturation picker */}
      <div className="rounded-md overflow-hidden" style={{ height: 120 }}>
        <Saturation
          hsva={hsva}
          onChange={handleColorChange}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Hue slider */}
      <div className="rounded-full overflow-hidden" style={{ height: 12 }}>
        <Hue
          hue={hsva.h}
          onChange={(newHue) => handleColorChange({ ...hsva, h: newHue.h })}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Color preview and hex input */}
      <div className="flex items-center gap-2">
        {/* Color swatch preview */}
        <div
          className="w-8 h-8 rounded border border-gray-200 dark:border-gray-700 shrink-0"
          style={{ backgroundColor: hexValue }}
        />
        {/* Hex input */}
        <input
          type="text"
          value={hexInput}
          onChange={handleHexInputChange}
          onBlur={handleHexBlur}
          onKeyDown={handleHexKeyDown}
          className="flex-1 px-2 py-1 text-sm font-mono border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

export default ColorPickerGroup;
