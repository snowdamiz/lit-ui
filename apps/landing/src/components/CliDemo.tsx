import { useEffect, useState, useRef, useCallback } from 'react'

interface TerminalLine {
  type: 'command' | 'output' | 'success'
  text: string
  delay: number
}

const terminalSequence: TerminalLine[] = [
  { type: 'command', text: 'npx lit-ui init', delay: 0 },
  { type: 'output', text: '', delay: 600 },
  { type: 'output', text: 'lit-ui init', delay: 700 },
  { type: 'output', text: '', delay: 900 },
  { type: 'success', text: 'Created lit-ui.json', delay: 1200 },
  { type: 'success', text: 'Copied base files to src/lib/lit-ui', delay: 1500 },
  { type: 'output', text: '', delay: 1700 },
  { type: 'success', text: 'lit-ui initialized successfully!', delay: 2000 },
  { type: 'output', text: '', delay: 2200 },
  { type: 'output', text: 'Next steps:', delay: 2400 },
  { type: 'output', text: '  lit-ui add button', delay: 2600 },
  { type: 'output', text: '', delay: 3000 },
  { type: 'command', text: 'npx lit-ui add button dialog', delay: 3400 },
  { type: 'output', text: '', delay: 4000 },
  { type: 'success', text: 'Added button', delay: 4300 },
  { type: 'success', text: 'Added dialog', delay: 4600 },
  { type: 'output', text: '', delay: 4800 },
  { type: 'output', text: 'Files created:', delay: 5000 },
  { type: 'output', text: '  src/components/ui/button.ts', delay: 5200 },
  { type: 'output', text: '  src/components/ui/dialog.ts', delay: 5400 },
]

function CliDemo() {
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const hasPlayedRef = useRef(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const playAnimation = useCallback(() => {
    // Clear any existing timers
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []

    setVisibleLines(0)

    terminalSequence.forEach((line, index) => {
      const timer = setTimeout(() => {
        setVisibleLines(index + 1)
      }, line.delay)
      timersRef.current.push(timer)
    })
  }, [])

  // Intersection observer - trigger animation when section comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPlayedRef.current) {
          hasPlayedRef.current = true
          playAnimation()
        }
      },
      { threshold: 0.3 }
    )

    const section = document.getElementById('cli-demo-section')
    if (section) {
      observer.observe(section)
    }

    return () => {
      observer.disconnect()
      timersRef.current.forEach(clearTimeout)
    }
  }, [playAnimation])

  const handleReplay = () => {
    playAnimation()
  }

  return (
    <section id="cli-demo-section" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
            Quick Setup
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-[-0.02em] text-gray-900 dark:text-gray-100 md:text-4xl lg:text-5xl">
            Get Started in Seconds
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
            Add components to your project with a simple CLI command. No complex
            setup required.
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          <div className="code-block overflow-hidden rounded-2xl terminal-glow">
            <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-gray-700 transition-colors hover:bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-gray-700 transition-colors hover:bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-gray-700 transition-colors hover:bg-green-400" />
                </div>
                <span className="ml-2 text-xs font-medium text-gray-500">Terminal</span>
              </div>
              <button
                onClick={handleReplay}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-400 transition-all hover:bg-gray-800 hover:text-gray-300"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Replay
              </button>
            </div>
            <div className="min-h-[400px] p-5 font-mono text-sm">
              {terminalSequence.slice(0, visibleLines).map((line, index) => (
                <div
                  key={index}
                  className="mb-1.5 animate-fade-in-up"
                  style={{ animationDelay: '0s', opacity: 1 }}
                >
                  {line.type === 'command' && (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-400">$</span>
                      <span className="font-medium text-white">{line.text}</span>
                      {index === visibleLines - 1 && (
                        <span className="inline-block h-4 w-2 animate-pulse rounded-sm bg-white" />
                      )}
                    </div>
                  )}
                  {line.type === 'output' && (
                    <div className="text-gray-400 pl-4">{line.text}</div>
                  )}
                  {line.type === 'success' && (
                    <div className="flex items-center gap-2 pl-4 text-white">
                      <svg
                        className="h-4 w-4 text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {line.text}
                    </div>
                  )}
                </div>
              ))}
              {visibleLines === 0 && (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-400">$</span>
                  <span className="inline-block h-4 w-2 animate-pulse rounded-sm bg-white" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CliDemo
