import { Award, Pencil, Trash2, Trophy } from "lucide-react";
import { useState } from "react";
import { saveMatch, type TeamData } from "../lib/data";
import { type StatDef, sportById } from "../lib/sports";
import { type Column, type Match, rank, standings, statColumns, TEAM_NAMES } from "../lib/team";
import { SessionForm } from "./SessionForm";

const COLUMNS: { id: Column; short: string; title: string }[] = [
  { id: "played", short: "P", title: "Played" },
  { id: "won", short: "W", title: "Won" },
  { id: "diff", short: "+/-", title: "Score difference" },
  { id: "points", short: "Pts", title: "Points" },
  { id: "motm", short: "MOTM", title: "Player of the match" },
];

const day = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function Table({ data, onChange }: { data: TeamData; onChange: (d: TeamData) => void }) {
  const [by, setBy] = useState<Column | StatDef>("points");
  const [editing, setEditing] = useState<Match | null>(null);
  const names = new Map(data.players.map((p) => [p.id, p.name]));
  const stats = statColumns(sportById(data.options.sport), data.stats);
  const rows = rank(standings(data.matches, data.players), by);
  const sessions = [...data.matches].sort((a, b) => b.date.localeCompare(a.date));

  if (editing) {
    return (
      <section aria-labelledby="edit-h" className="flex flex-col gap-4">
        <h2 id="edit-h" className="text-xl font-extrabold">
          Edit session · {day(editing.date)}
        </h2>
        <SessionForm
          session={editing}
          players={data.players}
          stats={statColumns(sportById(editing.sport), data.stats)}
          onChange={setEditing}
          onSave={() => {
            document.querySelector("[data-scroll]")?.scrollTo(0, 0);
            onChange({ ...data, matches: saveMatch(data.matches, editing) });
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
          saveLabel="Save changes"
        />
      </section>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl bg-white p-8 text-center text-slate-600 ring-1 ring-slate-200">
        Pick teams and save a session, and the leaderboard appears here.
      </p>
    );
  }

  const remove = (m: Match) =>
    confirm(`Delete the session on ${day(m.date)}?`) &&
    onChange({ ...data, matches: data.matches.filter((x) => x.id !== m.id) });

  const cell = "px-2 py-2 text-right tabular-nums";
  const sortable = (key: Column | StatDef, short: string, title: string) => {
    const active =
      typeof key === "string" ? by === key : typeof by !== "string" && by.id === key.id;
    return (
      <th
        key={typeof key === "string" ? key : key.id}
        scope="col"
        aria-sort={active ? "descending" : undefined}
        className="px-1 py-1 text-right"
      >
        <button
          type="button"
          onClick={() => setBy(key)}
          aria-label={`Sort by ${title}`}
          title={title}
          className={`min-h-9 rounded-lg px-1.5 font-semibold hover:bg-slate-200 ${active ? "text-emerald-800 underline underline-offset-4" : ""}`}
        >
          {short}
        </button>
      </th>
    );
  };

  return (
    <section aria-labelledby="table-h" className="flex flex-col gap-5">
      <h2 id="table-h" className="text-xl font-extrabold">
        Leaderboard
      </h2>
      <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-200">
        <table className="w-full text-sm">
          <caption className="sr-only">
            Every player across all sessions, whichever side they played for. Column buttons sort
            the table.
          </caption>
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th scope="col" className="sticky left-0 z-10 bg-slate-50 px-3 py-2 text-left">
                Player
              </th>
              {COLUMNS.map((c) => sortable(c.id, c.short, c.title))}
              {stats.map((s) => sortable(s, s.label.slice(0, 4), s.label))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.playerId} className="border-t border-slate-100">
                <th
                  scope="row"
                  className="sticky left-0 z-10 max-w-32 bg-white px-3 py-2 text-left font-semibold"
                >
                  <span className="flex items-center gap-2">
                    {i === 0 ? (
                      <Trophy size={14} className="shrink-0 text-amber-600" aria-label="Top" />
                    ) : (
                      <span className="w-3.5 shrink-0 text-slate-500">{i + 1}</span>
                    )}
                    <span className="truncate">{names.get(r.playerId)}</span>
                  </span>
                </th>
                <td className={cell}>{r.played}</td>
                <td className={cell}>
                  {r.won}
                  <span className="ml-1 text-xs text-slate-500">
                    {Math.round((r.won / r.played) * 100)}%
                  </span>
                </td>
                <td className={cell}>{r.diff > 0 ? `+${r.diff}` : r.diff}</td>
                <td className={`${cell} font-black text-emerald-800`}>{r.points}</td>
                <td className={cell}>{r.motm || ""}</td>
                {stats.map((s) => (
                  <td key={s.id} className={`${cell} pr-3`}>
                    {r.totals[s.id] ?? 0}
                    {(r.totals[s.id] ?? 0) > 0 && (
                      <span className="ml-1 text-xs text-slate-500">
                        {((r.totals[s.id] ?? 0) / r.played).toFixed(1)}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="-mt-3 text-xs text-slate-600">
        Small figures: win rate, and average per session.
      </p>

      <section aria-labelledby="sessions-h" className="flex flex-col gap-2">
        <h3
          id="sessions-h"
          className="text-sm font-semibold uppercase tracking-wide text-slate-600"
        >
          Sessions ({sessions.length})
        </h3>
        <ul className="flex flex-col gap-2 text-sm">
          {sessions.map((m) => (
            <li key={m.id} className="rounded-xl bg-white ring-1 ring-slate-200">
              <details className="group">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2">
                  <span className="text-slate-600">{day(m.date)}</span>
                  <span className="font-semibold tabular-nums">
                    {m.scores.map((g, i) => `${TEAM_NAMES[i]} ${g}`).join(" · ")}
                  </span>
                </summary>
                <div className="flex flex-col gap-2 border-t border-slate-100 px-3 py-2">
                  {m.teams.map((ids, i) => (
                    <p key={TEAM_NAMES[i]}>
                      <span className="font-semibold">{TEAM_NAMES[i]}:</span>{" "}
                      {ids.map((id) => names.get(id) ?? "Removed player").join(", ")}
                    </p>
                  ))}
                  {m.motm && (
                    <p className="flex items-center gap-1">
                      <Award size={14} aria-hidden="true" className="text-amber-600" />
                      Player of the match: {names.get(m.motm)}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.currentTarget.closest("[data-scroll]")?.scrollTo(0, 0);
                        setEditing(m);
                      }}
                      className="inline-flex min-h-11 items-center gap-1 rounded-xl px-3 font-semibold ring-1 ring-slate-300 hover:bg-slate-100"
                    >
                      <Pencil size={14} aria-hidden="true" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(m)}
                      className="inline-flex min-h-11 items-center gap-1 rounded-xl px-3 font-semibold text-rose-700 hover:bg-rose-50"
                    >
                      <Trash2 size={14} aria-hidden="true" /> Delete
                    </button>
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
