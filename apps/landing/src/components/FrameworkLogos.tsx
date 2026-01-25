const frameworks = [
  {
    name: 'React',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
        <path d="M12 13.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        <path
          fillRule="evenodd"
          d="M12 21.35c6.627 0 12-4.03 12-5.35s-5.373-5.35-12-5.35S0 14.69 0 16s5.373 5.35 12 5.35zm0-1.5c5.523 0 10-3.134 10-3.85s-4.477-3.85-10-3.85S2 15.285 2 16s4.477 3.85 10 3.85z"
          transform="rotate(60 12 12)"
        />
        <path
          fillRule="evenodd"
          d="M12 21.35c6.627 0 12-4.03 12-5.35s-5.373-5.35-12-5.35S0 14.69 0 16s5.373 5.35 12 5.35zm0-1.5c5.523 0 10-3.134 10-3.85s-4.477-3.85-10-3.85S2 15.285 2 16s4.477 3.85 10 3.85z"
          transform="rotate(-60 12 12)"
        />
        <path
          fillRule="evenodd"
          d="M12 21.35c6.627 0 12-4.03 12-5.35s-5.373-5.35-12-5.35S0 14.69 0 16s5.373 5.35 12 5.35zm0-1.5c5.523 0 10-3.134 10-3.85s-4.477-3.85-10-3.85S2 15.285 2 16s4.477 3.85 10 3.85z"
        />
      </svg>
    ),
  },
  {
    name: 'Vue',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
        <path d="M2 3h3.5L12 13.5 18.5 3H22L12 21 2 3z" />
        <path d="M6.5 3L12 12l5.5-9h-3L12 7.5 9.5 3h-3z" opacity="0.6" />
      </svg>
    ),
  },
  {
    name: 'Svelte',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
        <path d="M20.68 3.17a7.35 7.35 0 00-9.93 1.67l-4.1 5.33a5.64 5.64 0 00-.8 4.73 5.26 5.26 0 001.42 2.38 5.64 5.64 0 00-.8 2.28 5.26 5.26 0 00.8 3.95 7.35 7.35 0 009.93-1.67l4.1-5.33a5.64 5.64 0 00.8-4.73 5.26 5.26 0 00-1.42-2.38 5.64 5.64 0 00.8-2.28 5.26 5.26 0 00-.8-3.95z" />
        <path
          d="M9.3 18.83a4.26 4.26 0 01-2.2-.2 2.95 2.95 0 01-1.52-1.23 2.62 2.62 0 01-.36-1.97 3.2 3.2 0 01.18-.62l.1-.22.2.15a6.26 6.26 0 001.91 1.08l.18.06-.02.18a.79.79 0 00.15.5.88.88 0 00.47.37 1.36 1.36 0 001.07-.17l4.1-5.33a.76.76 0 00.14-.56.88.88 0 00-.47-.67 1.36 1.36 0 00-1.07.17l-1.56 2.03a4.26 4.26 0 01-3.39.52 2.95 2.95 0 01-1.52-1.24 2.62 2.62 0 01-.36-1.97 3.2 3.2 0 01.71-1.44l4.1-5.33a4.26 4.26 0 013.39-.52 2.95 2.95 0 011.52 1.24 2.62 2.62 0 01.36 1.97 3.2 3.2 0 01-.18.62l-.1.22-.2-.15a6.26 6.26 0 00-1.91-1.08l-.18-.06.02-.18a.79.79 0 00-.15-.5.88.88 0 00-.47-.37 1.36 1.36 0 00-1.07.17l-4.1 5.33a.76.76 0 00-.14.56.88.88 0 00.47.67 1.36 1.36 0 001.07-.17l1.56-2.03a4.26 4.26 0 013.39-.52 2.95 2.95 0 011.52 1.24 2.62 2.62 0 01.36 1.97 3.2 3.2 0 01-.71 1.44l-4.1 5.33a4.26 4.26 0 01-3.19.72z"
          fill="white"
        />
      </svg>
    ),
  },
  {
    name: 'Angular',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
        <path d="M12 2L2 6.5l1.5 13L12 22l8.5-2.5 1.5-13L12 2zm0 2.2l7 3.2-1.2 10L12 19.8l-5.8-2.4L5 7.4l7-3.2zm0 1.6L7.4 16h1.8l.9-2.4h3.8l.9 2.4h1.8L12 5.8zm0 3.4l1.3 3.4H10.7L12 9.2z" />
      </svg>
    ),
  },
  {
    name: 'HTML',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
        <path d="M4 3l1.67 18.67L12 23l6.33-1.33L20 3H4zm13.33 5.33H8.33l.17 2h8.67l-.5 5.5L12 17l-4.67-1.17-.17-2.16h2l.08 1.08L12 15.5l2.75-.75.25-2.75H7.67l-.5-5h9.66l-.5 1.33z" />
      </svg>
    ),
  },
]

function FrameworkLogos() {
  return (
    <section className="relative py-16 md:py-20">
      {/* Divider */}
      <div className="mx-auto max-w-4xl px-6">
        <div className="divider-fade" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="text-center">
          <p className="mb-10 text-lg text-gray-500">
            One component.{' '}
            <span className="font-semibold text-gray-900">Every framework.</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {frameworks.map((framework, index) => (
              <div
                key={framework.name}
                className="group flex flex-col items-center gap-3"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-400 shadow-sm transition-all duration-300 group-hover:border-gray-300 group-hover:bg-gray-50 group-hover:text-gray-900 group-hover:shadow-md group-hover:-translate-y-1">
                  {framework.icon}
                </div>
                <span className="text-sm font-medium text-gray-400 transition-colors duration-300 group-hover:text-gray-900">
                  {framework.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-auto max-w-4xl px-6">
        <div className="divider-fade" />
      </div>
    </section>
  )
}

export default FrameworkLogos
