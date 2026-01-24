import { useState } from 'react';
import { CodeBlock } from './CodeBlock';

type Framework = 'react' | 'vue' | 'svelte';

interface FrameworkTabsProps {
  react: string;
  vue: string;
  svelte: string;
}

const languageMap: Record<Framework, string> = {
  react: 'tsx',
  vue: 'vue',
  svelte: 'svelte',
};

export function FrameworkTabs({ react, vue, svelte }: FrameworkTabsProps) {
  const [active, setActive] = useState<Framework>('react');

  const codeMap: Record<Framework, string> = { react, vue, svelte };
  const code = codeMap[active];
  const language = languageMap[active];

  return (
    <div>
      <div className="flex border-b border-gray-200" role="tablist">
        {(['react', 'vue', 'svelte'] as const).map((fw) => (
          <button
            key={fw}
            role="tab"
            aria-selected={active === fw}
            onClick={() => setActive(fw)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              active === fw
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {fw.charAt(0).toUpperCase() + fw.slice(1)}
          </button>
        ))}
      </div>
      <CodeBlock code={code} language={language} />
    </div>
  );
}
