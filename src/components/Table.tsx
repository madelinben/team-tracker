import { Trash2, Trophy } from "lucide-react";
import type { TeamData } from "../lib/data";
import { standings, TEAM_NAMES } from "../lib/team";

export function Table({ data, onChange }: { data: TeamData; onChange: (d: TeamData) => void }) {
  const names = new Map(data.players.map((p) => [p.id, p.name]));
  const rows = standings(data.matches, data.players);
  const recent = [...data.matches].reverse().slice(0, 10);

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl bg-white p-8 text-center text-slate-600 ring-1 ring-slate-200">
        Pick teams and save a result, and the table appears here.
      </p>
    );
  }

  function clear() {
    if (confirm("Clear every result? Players are kept.")) onChange({ ...data, matches: [] });
  }

  const cell = "px-2 py-2 text-right tabular-nums";
  return (
    <section aria-labelledby="table-h" className="flex flex-col gap-5">
      <h2 id="table-h" className="text-xl font-extrabold">
        League table
      </h2>
      <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-200">
        <table className="w-full text-sm">
          <caption className="sr-only">Players by points, then score difference</caption>
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th scope="col" className="px-3 py-2 text-left">
                Player
              </th>
              <th scope="col" className={cell}>
                <abbr title="Played">P</abbr>
              </th>
              <th scope="col" className={cell}>
                <abbr title="Won">W</abbr>
              </th>
              <th scope="col" className={cell}>
                <abbr title="Drawn">D</abbr>
              </th>
              <th scope="col" className={cell}>
                <abbr title="Lost">L</abbr>
              </th>
              <th scope="col" className={cell}>
                <abbr title="Score difference">+/-</abbr>
              </th>
              <th scope="col" className={`${cell} pr-3`}>
                Pts
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.playerId} className="border-t border-slate-100">
                <th
                  scope="row"
                  className="flex items-center gap-2 px-3 py-2 text-left font-semibold"
                >
                  {i === 0 ? (
                    <Trophy size={14} className="text-amber-600" aria-label="Leader" />
                  ) : (
                    <span className="w-3.5 text-slate-500">{i + 1}</span>
                  )}
                  {names.get(r.playerId)}
                </th>
                <td className={cell}>{r.played}</td>
                <td className={cell}>{r.won}</td>
                <td className={cell}>{r.drawn}</td>
                <td className={cell}>{r.lost}</td>
                <td className={cell}>{r.diff > 0 ? `+${r.diff}` : r.diff}</td>
                <td className={`${cell} pr-3 font-black text-emerald-800`}>{r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section aria-labelledby="recent-h">
        <h3
          id="recent-h"
          className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-600"
        >
          Recent games
        </h3>
        <ul className="flex flex-col gap-1 text-sm">
          {recent.map((m) => (
            <li
              key={m.id}
              className="flex justify-between gap-3 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200"
            >
              <span className="text-slate-600">
                {new Date(m.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </span>
              <span className="font-semibold tabular-nums">
                {m.scores.map((g, i) => `${TEAM_NAMES[i]} ${g}`).join(" · ")}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        onClick={clear}
        className="flex min-h-11 items-center justify-center gap-1 rounded-xl text-sm font-semibold text-rose-700 hover:bg-rose-50"
      >
        <Trash2 size={16} aria-hidden="true" /> Clear results
      </button>
    </section>
  );
}
