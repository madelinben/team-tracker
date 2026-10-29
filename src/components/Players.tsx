import { Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import type { TeamData } from "../lib/data";
import { SPORTS, sportById } from "../lib/sports";
import type { Player } from "../lib/team";
import { field } from "./ui";

export function Players({ data, onChange }: { data: TeamData; onChange: (d: TeamData) => void }) {
  const [name, setName] = useState("");
  const sport = sportById(data.options.sport);
  const available = data.players.filter((p) => p.available).length;

  const setPlayers = (players: Player[]) => onChange({ ...data, players, draw: null });
  const patch = (id: string, change: Partial<Player>) =>
    setPlayers(data.players.map((p) => (p.id === id ? { ...p, ...change } : p)));

  function add(e: React.FormEvent) {
    e.preventDefault();
    const names = name
      .split(/[,\n]/)
      .map((n) => n.trim())
      .filter(Boolean);
    if (!names.length) return;
    setPlayers([
      ...data.players,
      ...names.map(
        (n): Player => ({
          id: crypto.randomUUID(),
          name: n.slice(0, 40),
          rating: 3,
          position: "",
          available: true,
        })
      ),
    ]);
    setName("");
  }

  return (
    <section aria-labelledby="players-h" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 id="players-h" className="text-xl font-extrabold">
          Squad
        </h2>
        <p className="text-sm tabular-nums text-slate-600">
          {available} of {data.players.length} available
        </p>
      </div>
      <label className="flex flex-col gap-1 text-sm font-semibold">
        Sport
        <select
          value={sport.id}
          onChange={(e) =>
            onChange({ ...data, options: { ...data.options, sport: e.target.value }, draw: null })
          }
          className={field}
        >
          {SPORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <form onSubmit={add} className="flex gap-2">
        <label htmlFor="new-player" className="sr-only">
          Player names, separated by commas
        </label>
        <input
          id="new-player"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add players: Sam, Alex, Jo"
          className={`${field} flex-1`}
        />
        <button
          type="submit"
          className="inline-flex min-h-11 items-center gap-1 rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          <Plus size={16} aria-hidden="true" />
          Add
        </button>
      </form>

      {data.players.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-center text-slate-600 ring-1 ring-slate-200">
          Add everyone who might play. Untick anyone who can't make it this week.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {data.players.map((p) => (
            <li
              key={p.id}
              className={`flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 ring-1 ring-slate-200 ${p.available ? "" : "opacity-60"}`}
            >
              <label className="flex min-h-11 min-w-0 flex-1 items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  checked={p.available}
                  onChange={(e) => patch(p.id, { available: e.target.checked })}
                  className="size-5 accent-emerald-700"
                />
                <span className="truncate">{p.name}</span>
                <span className="sr-only">available</span>
              </label>
              {sport.positions.length > 0 && (
                <>
                  <label className="sr-only" htmlFor={`pos-${p.id}`}>
                    {p.name} position
                  </label>
                  <select
                    id={`pos-${p.id}`}
                    value={sport.positions.some((o) => o.id === p.position) ? p.position : ""}
                    onChange={(e) => patch(p.id, { position: e.target.value })}
                    className={field}
                  >
                    <option value="">Any position</option>
                    {sport.positions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </>
              )}
              <fieldset className="flex items-center">
                <legend className="sr-only">{p.name} skill rating</legend>
                {[1, 2, 3, 4, 5].map((r) => (
                  <label key={r} className="grid size-9 cursor-pointer place-items-center">
                    <input
                      type="radio"
                      name={`rating-${p.id}`}
                      value={r}
                      checked={p.rating === r}
                      onChange={() => patch(p.id, { rating: r })}
                      className="peer sr-only"
                    />
                    <Star
                      size={20}
                      aria-hidden="true"
                      className={`rounded peer-focus-visible:outline-2 peer-focus-visible:outline-emerald-700 ${r <= p.rating ? "fill-amber-400 text-amber-500" : "text-slate-300"}`}
                    />
                    <span className="sr-only">{r} of 5</span>
                  </label>
                ))}
              </fieldset>
              <button
                type="button"
                onClick={() => setPlayers(data.players.filter((x) => x.id !== p.id))}
                className="grid size-11 place-items-center rounded-xl text-rose-700 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-rose-700"
                aria-label={`Remove ${p.name}`}
              >
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
