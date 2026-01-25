import { useState } from 'react'

const frameworks = ['React', 'Vue', 'Svelte', 'HTML'] as const
type Framework = (typeof frameworks)[number]

const codeExamples: Record<Framework, { code: string; language: string }> = {
  React: {
    language: 'tsx',
    code: `import { useState } from 'react'
import 'lit-ui'

function App() {
  const [loading, setLoading] = useState(false)

  return (
    <ui-button
      variant="primary"
      loading={loading}
      onClick={() => setLoading(true)}
    >
      Click me
    </ui-button>
  )
}`,
  },
  Vue: {
    language: 'vue',
    code: `<script setup>
import { ref } from 'vue'
import 'lit-ui'

const loading = ref(false)
</script>

<template>
  <ui-button
    variant="primary"
    :loading="loading"
    @click="loading = true"
  >
    Click me
  </ui-button>
</template>`,
  },
  Svelte: {
    language: 'svelte',
    code: `<script>
  import 'lit-ui'

  let loading = $state(false)
</script>

<ui-button
  variant="primary"
  {loading}
  onclick={() => loading = true}
>
  Click me
</ui-button>`,
  },
  HTML: {
    language: 'html',
    code: `<script type="module">
  import 'lit-ui'

  const btn = document.querySelector('ui-button')
  btn.addEventListener('click', () => {
    btn.loading = true
  })
</script>

<ui-button variant="primary">
  Click me
</ui-button>`,
  },
}

type Token = { type: string; value: string }

const keywords = new Set(['import', 'from', 'function', 'return', 'const', 'let', 'var', 'export', 'default', 'ref'])

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < line.length) {
    // Whitespace
    if (/\s/.test(line[i])) {
      let ws = ''
      while (i < line.length && /\s/.test(line[i])) {
        ws += line[i++]
      }
      tokens.push({ type: 'text', value: ws })
      continue
    }

    // Comments
    if (line.slice(i, i + 2) === '//') {
      tokens.push({ type: 'comment', value: line.slice(i) })
      break
    }

    // Strings
    if (line[i] === '"' || line[i] === "'" || line[i] === '`') {
      const quote = line[i]
      let str = quote
      i++
      while (i < line.length && line[i] !== quote) {
        str += line[i++]
      }
      if (i < line.length) str += line[i++]
      tokens.push({ type: 'string', value: str })
      continue
    }

    // Tags (JSX/HTML)
    if (line[i] === '<') {
      let tag = '<'
      i++
      if (line[i] === '/') {
        tag += line[i++]
      }
      while (i < line.length && /[\w-]/.test(line[i])) {
        tag += line[i++]
      }
      tokens.push({ type: 'tag', value: tag })
      continue
    }

    // Closing angle bracket
    if (line[i] === '>') {
      tokens.push({ type: 'punctuation', value: '>' })
      i++
      continue
    }

    // Punctuation
    if (/[{}()[\];,=]/.test(line[i])) {
      tokens.push({ type: 'punctuation', value: line[i++] })
      continue
    }

    // Words (identifiers, keywords)
    if (/[\w$@:]/.test(line[i])) {
      let word = ''
      while (i < line.length && /[\w$@:-]/.test(line[i])) {
        word += line[i++]
      }
      if (keywords.has(word)) {
        tokens.push({ type: 'keyword', value: word })
      } else if (word.startsWith('@') || word.startsWith(':')) {
        tokens.push({ type: 'attr', value: word })
      } else {
        tokens.push({ type: 'text', value: word })
      }
      continue
    }

    // Anything else
    tokens.push({ type: 'text', value: line[i++] })
  }

  return tokens
}

function renderTokens(tokens: Token[]): React.ReactNode[] {
  return tokens.map((token, i) => {
    // React automatically escapes text content, so no manual escaping needed
    const value = token.value
    switch (token.type) {
      case 'keyword':
        return <span key={i} className="token-keyword">{value}</span>
      case 'string':
        return <span key={i} className="token-string">{value}</span>
      case 'comment':
        return <span key={i} className="token-comment">{value}</span>
      case 'tag':
        return <span key={i} className="token-tag">{value}</span>
      case 'attr':
        return <span key={i} className="token-attr">{value}</span>
      case 'punctuation':
        return <span key={i} className="token-punctuation">{value}</span>
      default:
        return <span key={i}>{value}</span>
    }
  })
}

function highlightCode(code: string) {
  const lines = code.split('\n')

  return lines.map((line, i) => {
    const tokens = tokenizeLine(line)

    return (
      <div key={i} className="table-row">
        <span className="table-cell select-none pr-4 text-right text-gray-600">
          {i + 1}
        </span>
        <span className="table-cell">
          {tokens.length > 0 ? renderTokens(tokens) : '\u00A0'}
        </span>
      </div>
    )
  })
}

function CodeShowcase() {
  const [activeFramework, setActiveFramework] = useState<Framework>('React')
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeExamples[activeFramework].code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="code" className="relative py-24 md:py-32">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/50 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Universal Syntax
          </p>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
            Same Component, Any Framework
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-500 leading-relaxed">
            Write once, use everywhere. lit-ui components work seamlessly across
            all major frameworks.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          {/* Framework tabs */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
              {frameworks.map((framework) => (
                <button
                  key={framework}
                  onClick={() => setActiveFramework(framework)}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                    activeFramework === framework
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {framework}
                </button>
              ))}
            </div>
          </div>

          {/* Code block */}
          <div className="code-block overflow-hidden rounded-xl terminal-glow">
            <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-gray-700 transition-colors hover:bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-gray-700 transition-colors hover:bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-gray-700 transition-colors hover:bg-green-400" />
                </div>
                <span className="ml-2 text-xs font-medium text-gray-500">
                  {codeExamples[activeFramework].language}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-400 transition-all hover:bg-gray-800 hover:text-gray-300"
              >
                {copied ? (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="overflow-x-auto p-5">
              <pre className="table font-mono text-sm leading-relaxed text-white">
                {highlightCode(codeExamples[activeFramework].code)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CodeShowcase
