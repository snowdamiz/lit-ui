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
    <div className="my-6">
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      {description && <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>}

      <div className="group/block rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 card-elevated">
        {/* Live preview - on top */}
        <div className="relative">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-gray-50 dark:from-gray-800 to-gray-50/50 dark:to-gray-800/50 border-b border-gray-100 dark:border-gray-800">
            <span className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Live
            </span>
          </div>
          <div className="relative p-8 flex items-center justify-center min-h-[120px] bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:16px_16px]">
            <div className="relative">{preview}</div>
          </div>
        </div>

        {/* Code block - below */}
        <div className="border-t border-gray-200 dark:border-gray-800">
          <FrameworkTabs html={html} react={react} vue={vue} svelte={svelte} />
        </div>
      </div>
    </div>
  );
}
