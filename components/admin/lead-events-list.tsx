type Ev = { id: string; type: string; payload: unknown; created_at: string | null }

export function LeadEventsList({ events }: { events: Ev[] }) {
  if (!events.length) return <p className="text-sm text-[var(--ac-text-muted)]">No events yet.</p>
  return (
    <ul className="divide-y divide-[var(--ac-divider)] overflow-hidden rounded-xl border border-[var(--ac-divider)] bg-[var(--ac-surface)] text-sm">
      {events.map(e => (
        <li key={e.id} className="flex flex-col gap-1 p-3">
          <div className="flex justify-between gap-4">
            <span className="font-medium text-[var(--ac-accent)]">{e.type}</span>
            <span className="whitespace-nowrap text-xs text-[var(--ac-text-muted)]">
              {e.created_at ? new Date(e.created_at).toLocaleString() : ""}
            </span>
          </div>
          {e.payload != null && Object.keys(e.payload as object).length > 0 && (
            <pre className="max-h-24 overflow-auto text-[10px] text-[var(--ac-text-muted)]">
              {JSON.stringify(e.payload, null, 2)}
            </pre>
          )}
        </li>
      ))}
    </ul>
  )
}
