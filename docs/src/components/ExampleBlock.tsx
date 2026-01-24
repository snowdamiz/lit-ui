import { ReactNode } from 'react';
import { FrameworkTabs } from './FrameworkTabs';

interface ExampleBlockProps {
  title?: string;
  description?: string;
  preview: ReactNode;
  html: string;
  react: string;
  vue: string;
  svelte: string;
}

export function ExampleBlock({
  title,
  description,
  preview,
  html,
  react,
  vue,
  svelte,
}: ExampleBlockProps) {
  return (
    <div className="my-8">
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      {description && <p className="text-gray-600 mb-4">{description}</p>}

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Live preview */}
        <div className="flex-1 p-6 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center min-h-[120px]">
          {preview}
        </div>

        {/* Code tabs */}
        <div className="flex-1">
          <FrameworkTabs html={html} react={react} vue={vue} svelte={svelte} />
        </div>
      </div>
    </div>
  );
}
