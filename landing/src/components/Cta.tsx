import { useState } from 'react'
import { getDocsUrl } from '../utils/config'

function Cta() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText('npx lit-ui init')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="get-started" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-transparent to-white" />

      {/* Decorative circles with floating animation */}
      <div className="pointer-events-none absolute -left-48 top-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gray-100 opacity-40 blur-3xl animate-[float_20s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute -right-48 top-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gray-100 opacity-40 blur-3xl animate-[float_25s_ease-in-out_infinite_5s]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Start Building
          </p>
          <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl lg:text-6xl">
            Ready to Build?
          </h2>
          <p className="mx-auto mb-12 max-w-xl text-lg text-gray-500 leading-relaxed">
            Start building beautiful, accessible interfaces today. No complex setup,
            no framework lock-in.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={getDocsUrl()}
              className="group rounded-xl bg-gray-900 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-gray-800 hover:shadow-lg active:scale-[0.98] btn-shadow focus-ring"
            >
              <span className="flex items-center gap-2">
                Get Started
                <svg
                  className="h-5 w-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            </a>

            <a
              href={getDocsUrl()}
              className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-8 py-4 text-lg font-semibold text-gray-900 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-md active:scale-[0.98] focus-ring"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Read the Docs
            </a>
          </div>

          {/* Quick command */}
          <div className="mt-14">
            <p className="mb-4 text-sm font-medium text-gray-500">Or start right now:</p>
            <div className="inline-flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-3 shadow-sm transition-all hover:shadow-md hover:border-gray-300">
              <code className="font-mono text-sm">
                <span className="text-gray-400">$</span>{' '}
                <span className="font-semibold text-gray-900">npx</span>{' '}
                <span className="text-gray-700">lit-ui init</span>
              </code>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900"
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
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Cta
