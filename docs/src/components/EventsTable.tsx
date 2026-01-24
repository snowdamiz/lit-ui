export interface EventDef {
  name: string;
  detail: string;
  description: string;
}

interface EventsTableProps {
  events: EventDef[];
}

export function EventsTable({ events }: EventsTableProps) {
  return (
    <div className="space-y-3">
      {events.map((event, index) => (
        <div
          key={event.name}
          className="group relative rounded-xl border border-gray-200 bg-white p-4 card-elevated"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          {/* Subtle gradient on hover */}
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-gray-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

          <div className="relative flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-all group-hover:bg-gray-900 group-hover:text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <code className="px-2 py-1 bg-gray-900 text-white rounded-lg text-sm font-mono font-medium">
                  {event.name}
                </code>
              </div>
              <div className="mb-2">
                <code className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                  {event.detail}
                </code>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
