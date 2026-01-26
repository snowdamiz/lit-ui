/**
 * CollapsibleColorPicker - Minimal Expandable Color Picker
 *
 * Shows a compact color swatch with label. Expands on click to reveal
 * the full color picker interface. Only one picker should be expanded
 * at a time for a clean UX.
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import Saturation from "@uiw/react-color-saturation";
import Hue from "@uiw/react-color-hue";
import { ChevronDown, RotateCcw } from "lucide-react";
import { useConfigurator, type ColorKey } from "../../contexts/ConfiguratorContext";
import {
  oklchToHsv,
  hsvToOklch,
  oklchToHex,
  hexToOklch,
  isValidHex,
} from "../../utils/color-utils";

interface CollapsibleColorPickerProps {
  colorKey: ColorKey;
  label: string;
  description?: string;
  expanded: boolean;
  onToggle: () => void;
}

export function CollapsibleColorPicker({
  colorKey,
  label,
  description,
  expanded,
  onToggle,
}: CollapsibleColorPickerProps) {
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

  // Local state for hex input
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

  // Handle hex input change
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
  const handleReset = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeMode === "dark") {
      resetDarkColor(colorKey);
    } else {
      resetLightColor(colorKey);
    }
  }, [activeMode, colorKey, resetDarkColor, resetLightColor]);

  return (
    <div className="group rounded-xl border border-gray-200 bg-white overflow-hidden transition-all card-elevated">
      {/* Collapsed header - always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
        type="button"
      >
        {/* Color swatch */}
        <div
          className="w-10 h-10 rounded-lg border border-gray-200 shrink-0 shadow-sm"
          style={{ backgroundColor: hexValue }}
        />

        {/* Label and description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{label}</span>
            {isOverridden && (
              <button
                onClick={handleReset}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded"
                title="Reset to auto-derived value"
                type="button"
              >
                <RotateCcw size={12} />
              </button>
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-500 truncate">{description}</p>
          )}
        </div>

        {/* Hex value display */}
        <code className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {hexValue}
        </code>

        {/* Expand indicator */}
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Expanded picker panel */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50/50 animate-fade-in-up"
          style={{ animationDuration: '0.2s' }}
        >
          {/* Saturation picker */}
          <div className="rounded-lg overflow-hidden mb-3" style={{ height: 140 }}>
            <Saturation
              hsva={hsva}
              onChange={handleColorChange}
              style={{ width: "100%", height: "100%" }}
            />
          </div>

          {/* Hue slider */}
          <div className="rounded-full overflow-hidden mb-3" style={{ height: 14 }}>
            <Hue
              hue={hsva.h}
              onChange={(newHue) => handleColorChange({ ...hsva, h: newHue.h })}
              style={{ width: "100%", height: "100%" }}
            />
          </div>

          {/* Hex input row */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Hex
            </label>
            <input
              type="text"
              value={hexInput}
              onChange={handleHexInputChange}
              onBlur={handleHexBlur}
              onKeyDown={handleHexKeyDown}
              className="flex-1 px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="#000000"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default CollapsibleColorPicker;
