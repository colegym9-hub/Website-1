type Ev = { id: string; type: string; payload: unknown; created_at: string | null }

export function LeadEventsList({ events }: { events: Ev[] }) {
  if (!events.length) return <p className="text-[#666] text-sm">No events yet.</p>
  return (
    <ul className="space-y-2 text-sm border border-[#2a2a2a] rounded-lg divide-y divide-[#222]">
      {events.map(e => (
        <li key={e.id} className="p-3 flex flex-col gap-1">
          <div className="flex justify-between gap-4">
            <span className="text-[var(--ac-accent)]">{e.type}</span>
            <span className="text-[#666] text-xs whitespace-nowrap">
              {e.created_at ? new Date(e.created_at).toLocaleString() : ""}
            </span>
          </div>
          {e.payload != null && Object.keys(e.payload as object).length > 0 && (
            <pre className="text-[10px] text-[#888] overflow-auto max-h-24">{JSON.stringify(e.payload, null, 2)}</pre>
          )}
        </li>
      ))}
    </ul>
  )
}
