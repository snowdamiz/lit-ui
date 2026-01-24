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
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-3 px-4 text-left font-semibold text-gray-900">Prop</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-900">Type</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-900">Default</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-900">Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name} className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-900">{prop.name}</td>
              <td className="py-3 px-4 font-mono text-gray-600">{prop.type}</td>
              <td className="py-3 px-4 font-mono text-gray-500">
                {prop.default ?? '—'}
              </td>
              <td className="py-3 px-4 text-gray-700">{prop.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
