export function AdminSchemaBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
      <p className="font-medium text-amber-50">Database setup needed</p>
      <p className="mt-1 leading-relaxed text-amber-100/90">
        {message.includes("nurture_step") ? (
          <>
            Your <code className="rounded bg-black/30 px-1 text-amber-50">leads</code> table is missing nurture columns.
            In Supabase → <strong className="text-white">SQL Editor</strong>, run{" "}
            <code className="rounded bg-black/30 px-1">supabase/migrations/20260405120000_ensure_leads_nurture_columns.sql</code>{" "}
            or the full <code className="rounded bg-black/30 px-1">20260206120000_nurture_lead_events_admin.sql</code>.
          </>
        ) : (
          message
        )}
      </p>
    </div>
  )
}
