import { formatInTimeZone } from "date-fns-tz";
import { rsvpTotals } from "@/lib/rsvp/csv";
import type { RsvpRow } from "@/lib/supabase/database.types";

function when(iso: string, timeZone: string): string {
  try {
    return formatInTimeZone(new Date(iso), timeZone, "d MMM yyyy, HH:mm");
  } catch {
    return iso;
  }
}

export function RsvpTotals({ rows }: { rows: RsvpRow[] }) {
  const t = rsvpTotals(rows);
  const tiles = [
    { label: "Responses", value: t.responses },
    { label: "Attending", value: t.attending },
    { label: "Declined", value: t.declined },
    { label: "Total guests", value: t.guests },
  ];
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <dt className="text-xs uppercase tracking-wide text-stone-500">{tile.label}</dt>
          <dd className="mt-1 text-2xl font-semibold text-stone-900">{tile.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function RsvpTable({ rows, timeZone }: { rows: RsvpRow[]; timeZone: string }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-stone-600">
        No RSVPs yet. Share your invitation link and replies will show up here.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-stone-200 text-sm">
        <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Attending</th>
            <th className="px-4 py-3 font-medium">Guests</th>
            <th className="px-4 py-3 font-medium">Dietary</th>
            <th className="px-4 py-3 font-medium">Message</th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">Submitted</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {rows.map((r) => (
            <tr key={r.id} className="align-top">
              <td className="px-4 py-3 font-medium text-stone-900">{r.name}</td>
              <td className="px-4 py-3">
                <span
                  className={
                    r.attending
                      ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                      : "rounded-full bg-stone-200 px-2 py-0.5 text-xs font-medium text-stone-700"
                  }
                >
                  {r.attending ? "Yes" : "No"}
                </span>
              </td>
              <td className="px-4 py-3 tabular-nums">{r.attending ? r.guests : "—"}</td>
              <td className="max-w-xs whitespace-pre-wrap px-4 py-3 text-stone-700">{r.dietary || "—"}</td>
              <td className="max-w-sm whitespace-pre-wrap px-4 py-3 text-stone-700">{r.message || "—"}</td>
              <td className="whitespace-nowrap px-4 py-3 text-stone-500">{when(r.created_at, timeZone)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
