/**
 * ColorSection - Groups Related Colors with Title
 *
 * Provides visual grouping for color pickers with a semantic role label.
 */

import { ReactNode } from "react";

interface ColorSectionProps {
  title: string;
  children: ReactNode;
}

export function ColorSection({ title, children }: ColorSectionProps) {
  return (
    <div className="pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
        {title}
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

export default ColorSection;
