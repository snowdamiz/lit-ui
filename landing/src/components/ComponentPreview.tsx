import { useState } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'

const buttonVariants: { name: ButtonVariant; label: string }[] = [
  { name: 'primary', label: 'Primary' },
  { name: 'secondary', label: 'Secondary' },
  { name: 'outline', label: 'Outline' },
  { name: 'ghost', label: 'Ghost' },
  { name: 'destructive', label: 'Destructive' },
]

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-gray-900 text-white hover:bg-gray-800',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  outline: 'border border-gray-200 text-gray-900 hover:bg-gray-50 hover:border-gray-300',
  ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
}

function ComponentPreview() {
  const [activeVariant, setActiveVariant] = useState<ButtonVariant>('primary')
  const [isLoading, setIsLoading] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleLoadingToggle = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <section id="components" className="relative py-24 md:py-32">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-gray-50/50 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Interactive Preview
          </p>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
            Beautiful Components
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-500 leading-relaxed">
            Carefully crafted components with multiple variants, states, and
            accessibility built-in.
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm card-elevated">
            {/* Component header */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 shadow-sm">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Button</h3>
                  <p className="text-sm text-gray-500">Interactive button component</p>
                </div>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                lit-button
              </span>
            </div>

            {/* Preview area */}
            <div className="p-8">
              {/* Variant selector */}
              <div className="mb-8">
                <label className="mb-3 block text-sm font-medium text-gray-700">
                  Variant
                </label>
                <div className="flex flex-wrap gap-2">
                  {buttonVariants.map((variant) => (
                    <button
                      key={variant.name}
                      onClick={() => setActiveVariant(variant.name)}
                      className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                        activeVariant === variant.name
                          ? 'bg-gray-900 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                    >
                      {variant.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* State toggles */}
              <div className="mb-8">
                <label className="mb-3 block text-sm font-medium text-gray-700">
                  States
                </label>
                <div className="flex gap-6">
                  <label className="flex cursor-pointer items-center gap-2.5 select-none">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={isLoading}
                        onChange={(e) => setIsLoading(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="h-5 w-5 rounded-md border-2 border-gray-300 bg-white transition-all peer-checked:border-gray-900 peer-checked:bg-gray-900 peer-focus-visible:ring-2 peer-focus-visible:ring-gray-900 peer-focus-visible:ring-offset-2" />
                      <svg
                        className="absolute left-0.5 top-0.5 h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Loading</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2.5 select-none">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={isDisabled}
                        onChange={(e) => setIsDisabled(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="h-5 w-5 rounded-md border-2 border-gray-300 bg-white transition-all peer-checked:border-gray-900 peer-checked:bg-gray-900 peer-focus-visible:ring-2 peer-focus-visible:ring-gray-900 peer-focus-visible:ring-offset-2" />
                      <svg
                        className="absolute left-0.5 top-0.5 h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Disabled</span>
                  </label>
                </div>
              </div>

              {/* Button preview */}
              <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-8">
                <button
                  disabled={isDisabled}
                  onClick={handleLoadingToggle}
                  className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all shadow-sm ${
                    variantStyles[activeVariant]
                  } ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  {isLoading && (
                    <svg
                      className="h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                  {isLoading ? 'Loading...' : 'Click me'}
                </button>

                <button
                  onClick={() => setDialogOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                  Open Dialog
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dialog overlay */}
        {dialogOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setDialogOpen(false)}
          >
            <div
              className="m-4 max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl animate-fade-in-up"
              onClick={(e) => e.stopPropagation()}
              style={{ animationDelay: '0s', opacity: 1 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Dialog Component</h3>
                <button
                  onClick={() => setDialogOpen(false)}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <p className="mb-6 text-sm text-gray-500 leading-relaxed">
                This is a dialog component with smooth animations, backdrop blur,
                and keyboard accessibility. Press Escape or click outside to close.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDialogOpen(false)}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setDialogOpen(false)}
                  className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-800"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default ComponentPreview
