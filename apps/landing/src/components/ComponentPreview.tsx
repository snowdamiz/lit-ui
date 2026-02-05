import { useRef, useState, useEffect } from 'react'
import '@lit-ui/button'
import '@lit-ui/dialog'
import type { Dialog } from '@lit-ui/dialog'
import { useReveal } from '../hooks/useReveal'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'

const buttonVariants: { name: ButtonVariant; label: string }[] = [
  { name: 'primary', label: 'Primary' },
  { name: 'secondary', label: 'Secondary' },
  { name: 'outline', label: 'Outline' },
  { name: 'ghost', label: 'Ghost' },
  { name: 'destructive', label: 'Destructive' },
]

function ComponentPreview() {
  const [activeVariant, setActiveVariant] = useState<ButtonVariant>('primary')
  const [isLoading, setIsLoading] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const dialogRef = useRef<Dialog>(null)
  const { ref: sectionRef, isVisible } = useReveal({ threshold: 0.1 })

  const handleLoadingToggle = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  // Handle dialog open/close through the DOM element methods
  // This ensures showModal() is called for proper top-layer rendering
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (dialogOpen) {
      dialog.show()
    } else {
      dialog.close()
    }
  }, [dialogOpen])

  // Handle dialog close event
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleClose = () => setDialogOpen(false)
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [])

  return (
    <section id="components" className="relative py-24 md:py-32">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-gray-50/50 to-transparent" />

      <div ref={sectionRef} className="relative mx-auto max-w-6xl px-6">
        <div className={`mb-12 text-center reveal ${isVisible ? 'revealed' : ''}`}>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-gray-500">
            Interactive Preview
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-[-0.02em] text-gray-900 md:text-4xl lg:text-5xl">
            Beautiful Components
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-500 leading-relaxed">
            Carefully crafted components with multiple variants, states, and
            accessibility built-in.
          </p>
        </div>

        <div
          className={`mx-auto max-w-4xl reveal ${isVisible ? 'revealed' : ''}`}
          style={{ transitionDelay: '0.1s' }}
        >
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
                lui-button
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
                <lui-button
                  variant={activeVariant}
                  loading={isLoading || undefined}
                  disabled={isDisabled || undefined}
                  onClick={handleLoadingToggle}
                  btn-class="bg-gray-900"
                >
                  {isLoading ? 'Loading...' : 'Click me'}
                </lui-button>

                <lui-button
                  variant="outline"
                  onClick={() => setDialogOpen(true)}
                >
                  <svg slot="icon-start" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                  Open Dialog
                </lui-button>
              </div>
            </div>
          </div>
        </div>

        {/* Dialog */}
        <lui-dialog
          ref={dialogRef}
          show-close-button
        >
          <span slot="title">Dialog Component</span>
          <p className="text-sm text-gray-500 leading-relaxed">
            This is a dialog component with smooth animations, backdrop blur,
            and keyboard accessibility. Press Escape or click outside to close.
          </p>
          <div slot="footer">
            <lui-button
              variant="ghost"
              onClick={() => dialogRef.current?.close()}
            >
              Cancel
            </lui-button>
            <lui-button
              variant="primary"
              onClick={() => dialogRef.current?.close()}
            >
              Confirm
            </lui-button>
          </div>
        </lui-dialog>
      </div>
    </section>
  )
}

export default ComponentPreview
