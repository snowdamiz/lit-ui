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
              <div className="w-3 h-3 rounded-full bg-gray-700 transition-colors hover:bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-gray-700 transition-colors hover:bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-gray-700 transition-colors hover:bg-green-400" />
            </div>
            {filename && (
              <span className="ml-3 text-gray-400 text-sm font-mono">{filename}</span>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-md transition-all duration-200 focus-ring"
            aria-label={copied ? 'Copied!' : 'Copy code'}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-400" />
                <span className="text-xs font-medium text-green-400">Copied!</span>
              </>
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
      {/* Code content with copy button when header is hidden */}
      <div className="relative group">
        {!showHeader && (
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 flex items-center gap-1.5 p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 focus-ring z-10"
            aria-label={copied ? 'Copied!' : 'Copy code'}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-400" />
                <span className="text-xs font-medium text-green-400">Copied!</span>
              </>
            ) : (
              <Copy className="h-4 w-4" />
            )}
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
