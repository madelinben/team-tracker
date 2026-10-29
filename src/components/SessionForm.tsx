import { Save, X } from "lucide-react";
import type { StatDef } from "../lib/sports";
import { sportById } from "../lib/sports";
import { type Match, movePlayer, type Player, TEAM_NAMES, teamRating } from "../lib/team";
import { field, primary } from "./ui";

export const TEAM_COLOURS = [
  "border-t-rose-600",
  "border-t-sky-600",
  "border-t-emerald-600",
  "border-t-amber-500",
  "border-t-slate-300",
  "border-t-slate-900",
  "border-t-orange-500",
  "border-t-violet-600",
];

interface Props {
  session: Match;
  players: readonly Player[];
  stats: readonly StatDef[];
  onChange: (m: Match) => void;
  onSave: () => void;
  onCancel?: () => void;
  saveLabel: string;
}

const clamp = (v: string) => Math.max(0, Math.min(999, Number(v) || 0));

/** Line-ups, score and per-player counts for one session. Controlled: the parent persists it. */
export function SessionForm({
  session,
  players,
  stats,
  onChange,
  onSave,
  onCancel,
  saveLabel,
}: Props) {
  const sport = sportById(session.sport);
  const byId = new Map(players.map((p) => [p.id, p]));
  const playing = session.teams.flat().flatMap((id) => byId.get(id) ?? []);
  const benched = players.filter((p) => !session.teams.some((t) => t.includes(p.id)));
  const smallest = session.teams.reduce(
    (best, t, i) => (t.length < (session.teams[best]?.length ?? 0) ? i : best),
    0
  );

  const setStat = (playerId: string, statId: string, n: number) =>
    onChange({
      ...session,
      stats: { ...session.stats, [playerId]: { ...session.stats?.[playerId], [statId]: n } },
    });

  return (
    <div className="flex flex-col gap-4">
      <ul aria-live="polite" className="grid gap-3 sm:grid-cols-2">
        {session.teams.map((ids, i) => {
          const name = TEAM_NAMES[i] ?? `Team ${i + 1}`;
          const team = ids.flatMap((id) => byId.get(id) ?? []);
          return (
            <li
              key={name}
              className={`rounded-2xl border-t-8 bg-white p-4 ring-1 ring-slate-200 ${TEAM_COLOURS[i] ?? ""}`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-lg font-extrabold">{name}</h3>
                <span className="text-sm tabular-nums text-slate-600">
                  skill {teamRating(team)}
                </span>
              </div>
              <label className="mt-2 flex items-center gap-2 text-sm font-semibold">
                {sport.scoreLabel}
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={999}
                  value={session.scores[i] ?? 0}
                  onChange={(e) =>
                    onChange({
                      ...session,
                      scores: session.teams.map((_, j) =>
                        j === i ? clamp(e.target.value) : (session.scores[j] ?? 0)
                      ),
                    })
                  }
                  className="min-h-11 w-20 rounded-xl border border-slate-300 px-3 text-lg font-bold tabular-nums"
                />
              </label>
              <ul className="mt-3 flex flex-col divide-y divide-slate-100">
                {team.map((p) => (
                  <li key={p.id} className="flex flex-col gap-1.5 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="min-w-0 truncate font-semibold">
                        {p.name}{" "}
                        <span className="text-xs font-normal text-slate-600">
                          {sport.positions.find((o) => o.id === p.position)?.id}
                        </span>
                      </span>
                      <label className="sr-only" htmlFor={`move-${session.id}-${p.id}`}>
                        {p.name} plays for
                      </label>
                      <select
                        id={`move-${session.id}-${p.id}`}
                        value={i}
                        onChange={(e) =>
                          onChange({
                            ...session,
                            teams: movePlayer(session.teams, p.id, Number(e.target.value)),
                          })
                        }
                        className={`${field} min-h-10 text-xs`}
                      >
                        {session.teams.map((_, j) => (
                          <option key={TEAM_NAMES[j]} value={j}>
                            {TEAM_NAMES[j] ?? `Team ${j + 1}`}
                          </option>
                        ))}
                        <option value={-1}>Not playing</option>
                      </select>
                    </div>
                    {stats.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {stats.map((s) => (
                          <label
                            key={s.id}
                            className="flex flex-col text-[0.7rem] font-semibold text-slate-600"
                          >
                            {s.label}
                            <span className="sr-only"> for {p.name}</span>
                            <input
                              type="number"
                              inputMode="numeric"
                              min={0}
                              max={999}
                              value={session.stats?.[p.id]?.[s.id] ?? 0}
                              onChange={(e) => setStat(p.id, s.id, clamp(e.target.value))}
                              className="min-h-10 w-16 rounded-lg border border-slate-300 px-2 text-base font-bold tabular-nums text-slate-900"
                            />
                          </label>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        {benched.length > 0 && (
          <label className="flex min-w-48 flex-1 flex-col gap-1 text-sm font-semibold">
            Add a late arrival
            <select
              value=""
              onChange={(e) =>
                e.target.value &&
                onChange({
                  ...session,
                  teams: movePlayer(session.teams, e.target.value, smallest),
                })
              }
              className={field}
            >
              <option value="">Choose a player</option>
              {benched.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Played on
          <input
            type="date"
            value={session.date.slice(0, 10)}
            onChange={(e) => e.target.value && onChange({ ...session, date: e.target.value })}
            className={field}
          />
        </label>
        <label className="flex min-w-48 flex-1 flex-col gap-1 text-sm font-semibold">
          Player of the match
          <select
            value={session.motm ?? ""}
            onChange={(e) => onChange({ ...session, motm: e.target.value || undefined })}
            className={field}
          >
            <option value="">Nobody picked</option>
            {playing.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={onSave} className={`${primary} min-h-12 flex-1`}>
          <Save size={18} aria-hidden="true" />
          {saveLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-12 items-center gap-1 rounded-xl px-4 text-sm font-semibold ring-1 ring-slate-300 hover:bg-slate-100"
          >
            <X size={16} aria-hidden="true" />
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
