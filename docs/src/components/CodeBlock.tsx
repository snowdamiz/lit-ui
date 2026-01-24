import { Highlight, themes } from 'prism-react-renderer';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
}

export function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative code-block rounded-lg overflow-hidden">
      {filename && (
        <div className="px-4 py-2 border-b border-gray-800 text-gray-400 text-sm font-mono">
          {filename}
        </div>
      )}
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 text-gray-400 hover:text-white rounded transition-colors"
        aria-label={copied ? 'Copied!' : 'Copy code'}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
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
  );
}
