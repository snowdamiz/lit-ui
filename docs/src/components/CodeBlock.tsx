import { Highlight, themes } from 'prism-react-renderer';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
  showHeader?: boolean;
}

export function CodeBlock({ code, language, filename, showHeader = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative code-block rounded-xl overflow-hidden terminal-glow transition-all duration-300">
      {/* Terminal header bar - optional */}
      {showHeader && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80 border-b border-gray-700/50">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            {filename && (
              <span className="ml-3 text-gray-400 text-sm font-mono">{filename}</span>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-md transition-colors focus-ring"
            aria-label={copied ? 'Copied!' : 'Copy code'}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      )}
      {/* Code content with copy button when header is hidden */}
      <div className="relative group">
        {!showHeader && (
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus-ring z-10"
            aria-label={copied ? 'Copied!' : 'Copy code'}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        )}
        <Highlight theme={themes.nightOwl} code={code.trim()} language={language}>
          {({ tokens, getLineProps, getTokenProps }) => (
            <pre className="p-4 overflow-x-auto text-sm">
              <code>
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })}>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </div>
                ))}
              </code>
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}
