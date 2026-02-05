import { useState, useRef, useEffect } from 'react';
import { CodeBlock } from './CodeBlock';
import { Framework, useFramework } from '../contexts/FrameworkContext';

// Re-export for convenience (needed by pages not using context)
export type { Framework };

interface FrameworkTabsProps {
  html?: string;  // Optional for backward compatibility
  react: string;
  vue: string;
  svelte: string;
}

const languageMap: Record<Framework, string> = {
  html: 'html',
  react: 'tsx',
  vue: 'vue',
  svelte: 'svelte',
};

const labelMap: Record<Framework, string> = {
  html: 'HTML',
  react: 'React',
  vue: 'Vue',
  svelte: 'Svelte',
};

function FrameworkTabsInner({
  html = '',
  react,
  vue,
  svelte,
  useContextState,
}: FrameworkTabsProps & { useContextState: boolean }) {
  // Either use context or local state based on detection
  const contextState = useContextState ? useFramework() : null;
  const [localFramework, setLocalFramework] = useState<Framework>(html ? 'html' : 'react');

  const framework = contextState?.framework ?? localFramework;
  const setFramework = contextState?.setFramework ?? setLocalFramework;

  // If no html provided and context has html selected, show react instead
  const effectiveFramework = (!html && framework === 'html') ? 'react' : framework;

  const codeMap: Record<Framework, string> = { html, react, vue, svelte };
  const code = codeMap[effectiveFramework];
  const language = languageMap[effectiveFramework];

  // Determine which tabs to show (skip html if not provided)
  const tabs: Framework[] = html
    ? ['html', 'react', 'vue', 'svelte']
    : ['react', 'vue', 'svelte'];

  // Sliding indicator
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const container = tabsRef.current;
    if (!container) return;

    const activeButton = container.querySelector<HTMLButtonElement>(
      `[data-framework="${effectiveFramework}"]`
    );
    if (!activeButton) return;

    setIndicatorStyle({
      left: activeButton.offsetLeft,
      width: activeButton.offsetWidth,
    });
  }, [effectiveFramework]);

  return (
    <div>
      {/* Tab header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-800">
        <div ref={tabsRef} className="relative flex gap-1" role="tablist">
          {/* Sliding indicator */}
          <div
            className="absolute top-0 h-full rounded-md bg-gray-900 dark:bg-gray-100 transition-all duration-300"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
              transitionTimingFunction: 'var(--ease-out-expo)',
            }}
          />
          {tabs.map((fw) => (
            <button
              key={fw}
              role="tab"
              data-framework={fw}
              aria-selected={effectiveFramework === fw}
              onClick={() => setFramework(fw)}
              className={`relative z-10 px-2.5 py-1 text-xs font-medium rounded-md transition-colors duration-200 focus-ring ${
                effectiveFramework === fw
                  ? 'text-white dark:text-gray-900'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {labelMap[fw]}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400">Code</span>
      </div>
      {/* Code block without rounded corners for seamless integration */}
      <div className="[&_.code-block]:rounded-none [&_.code-block]:border-0 [&_.code-block]:shadow-none [&_.terminal-glow]:before:hidden">
        <CodeBlock code={code} language={language} showHeader={false} />
      </div>
    </div>
  );
}

export function FrameworkTabs(props: FrameworkTabsProps) {
  // Try to use context - if not in provider, useFramework will throw
  // We need to detect this without breaking hook rules
  let hasContext = false;
  try {
    // This is safe because we're just checking, not conditionally calling hooks
    useFramework();
    hasContext = true;
  } catch {
    hasContext = false;
  }

  return <FrameworkTabsInner {...props} useContextState={hasContext} />;
}
