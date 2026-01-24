export interface SlotDef {
  name: string;
  description: string;
}

interface SlotsTableProps {
  slots: SlotDef[];
}

export function SlotsTable({ slots }: SlotsTableProps) {
  return (
    <div className="space-y-3">
      {slots.map((slot, index) => (
        <div
          key={slot.name}
          className="group relative rounded-xl border border-gray-200 bg-white p-4 card-elevated"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          {/* Subtle gradient on hover */}
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-gray-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

          <div className="relative flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-all group-hover:bg-gray-900 group-hover:text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
            </div>
            <div className="flex-1">
              <code className="px-2 py-1 bg-gray-900 text-white rounded-lg text-sm font-mono font-medium">
                {slot.name}
              </code>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{slot.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
