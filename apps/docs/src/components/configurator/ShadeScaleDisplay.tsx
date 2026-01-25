/**
 * ShadeScaleDisplay - Visual shade scale preview
 *
 * Shows the derived 50-950 shade scale for a given base color.
 * Uses generateScale from @lit-ui/cli/theme for calculation.
 */

import { useMemo } from "react";
import { generateScale } from "@lit-ui/cli/theme";
import { oklchToHex } from "../../utils/color-utils";

interface ShadeScaleDisplayProps {
  /** Base color in OKLCH format */
  baseColor: string;
  /** Optional label for the scale */
  label?: string;
}

// Shade steps in order
const SHADE_STEPS = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
];

export function ShadeScaleDisplay({ baseColor, label }: ShadeScaleDisplayProps) {
  // Generate the shade scale from base color
  const shades = useMemo(() => {
    try {
      return generateScale(baseColor);
    } catch {
      // Return empty object if color is invalid
      return {} as Record<string, string>;
    }
  }, [baseColor]);

  // Don't render if we have no shades
  if (Object.keys(shades).length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {label}
        </label>
      )}
      <div className="flex gap-0.5">
        {SHADE_STEPS.map((step) => {
          const oklch = shades[step];
          if (!oklch) return null;

          const hex = oklchToHex(oklch);
          return (
            <div
              key={step}
              className="flex-1 h-8 rounded-sm first:rounded-l-md last:rounded-r-md transition-colors"
              style={{ backgroundColor: hex }}
              title={`${step}: ${oklch}`}
            />
          );
        })}
      </div>
      {/* Step labels */}
      <div className="flex gap-0.5">
        {SHADE_STEPS.map((step) => (
          <div
            key={`label-${step}`}
            className="flex-1 text-center text-[9px] text-gray-400 dark:text-gray-500"
          >
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShadeScaleDisplay;
