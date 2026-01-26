/**
 * RadiusSelector - Border Radius Selection
 *
 * Allows users to select the global border radius setting for the theme.
 * Options: sm (small), md (medium), lg (large)
 */

import { useConfigurator } from "../../contexts/ConfiguratorContext";

const RADIUS_OPTIONS = [
  { value: "sm" as const, label: "S", preview: "rounded-sm" },
  { value: "md" as const, label: "M", preview: "rounded-md" },
  { value: "lg" as const, label: "L", preview: "rounded-lg" },
];

export function RadiusSelector() {
  const { radius, setRadius } = useConfigurator();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Border Radius
      </label>
      <div className="flex gap-2">
        {RADIUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setRadius(option.value)}
            className={`
              flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors rounded-lg border
              ${
                radius === option.value
                  ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }
            `}
            type="button"
          >
            {/* Preview square with corresponding radius */}
            <div
              className={`w-4 h-4 border-2 border-gray-400 dark:border-gray-500 ${option.preview}`}
            />
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default RadiusSelector;
