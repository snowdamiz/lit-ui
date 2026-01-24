export interface PropDef {
  name: string;
  type: string;
  default?: string;
  description: string;
}

interface PropsTableProps {
  props: PropDef[];
}

export function PropsTable({ props }: PropsTableProps) {
  return (
    <div className="space-y-3">
      {props.map((prop, index) => (
        <div
          key={prop.name}
          className="group relative rounded-xl border border-gray-200 bg-white p-4 card-elevated"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          {/* Subtle gradient on hover */}
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-gray-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

          <div className="relative">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-3">
                <code className="px-2 py-1 bg-gray-900 text-white rounded-lg text-sm font-mono font-medium">
                  {prop.name}
                </code>
                {prop.default && (
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-500">
                    default: <code className="font-mono">{prop.default}</code>
                  </span>
                )}
              </div>
            </div>
            <div className="mb-2">
              <code className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                {prop.type}
              </code>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{prop.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
