export interface SlotDef {
  name: string;
  description: string;
}

interface SlotsTableProps {
  slots: SlotDef[];
}

export function SlotsTable({ slots }: SlotsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-3 px-4 text-left font-semibold text-gray-900">Slot</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-900">Description</th>
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <tr key={slot.name} className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-900">{slot.name}</td>
              <td className="py-3 px-4 text-gray-700">{slot.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
