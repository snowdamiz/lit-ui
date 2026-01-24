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
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-3 px-4 text-left font-semibold text-gray-900">Event</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-900">Detail</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-900">Description</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.name} className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-900">{event.name}</td>
              <td className="py-3 px-4 font-mono text-gray-600">{event.detail}</td>
              <td className="py-3 px-4 text-gray-700">{event.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
