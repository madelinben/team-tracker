import { ArrowLeft, Plus, Trash2, Trophy } from "lucide-react";
import { useState } from "react";
import { advance, type Competition, champion, create, type Fixture, type Format, leagueTable, roundName } from "../lib/competition";
import type { TeamData } from "../lib/data";
import { SPORTS, sportById } from "../lib/sports";
import { card, field, primary } from "./ui";

export function Leagues({ data, onChange }: { data: TeamData; onChange: (d: TeamData) => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = data.competitions.find((c) => c.id === openId);
  const save = (c: Competition) => onChange({ ...data, competitions: data.competitions.map((x) => (x.id === c.id ? c : x)) });

  if (open) return <CompetitionView competition={open} onChange={save} onBack={() => setOpenId(null)} />;

  return (
    <section aria-labelledby="leagues-h" className="flex flex-col gap-4">
      <h2 id="leagues-h" className="text-xl font-extrabold">
        Leagues and cups
      </h2>
      <p className="text-sm text-slate-700">
        Run a league or knockout cup for any teams or players: five-a-side, padel pairs, darts, netball, quiz teams.
      </p>
      <CreateForm
        defaultSport={data.options.sport}
        onCreate={(c) => {
          onChange({ ...data, competitions: [c, ...data.competitions] });
          setOpenId(c.id);
        }}
      />
      {data.competitions.length > 0 && (
        <ul className="flex flex-col gap-2">
          {data.competitions.map((c) => {
            const done = c.fixtures.filter((f) => f.away !== null && f.homeScore !== null).length;
            const total = c.fixtures.filter((f) => f.away !== null).length;
            return (
              <li key={c.id} className={`${card} flex items-center gap-2 p-2`}>
                <button
                  type="button"
                  onClick={() => setOpenId(c.id)}
                  className="flex min-h-12 flex-1 flex-col items-start justify-center rounded-xl px-2 text-left hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-emerald-700"
                >
                  <span className="font-bold">{c.name}</span>
                  <span className="text-sm text-slate-600">
                    {c.format === "league" ? "League" : "Knockout"} · {sportById(c.sport).label} · {c.entrants.length} entrants · {done}/{total} played
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete ${c.name}?`)) onChange({ ...data, competitions: data.competitions.filter((x) => x.id !== c.id) });
                  }}
                  aria-label={`Delete ${c.name}`}
                  className="grid size-11 place-items-center rounded-xl text-rose-700 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-rose-700"
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function CreateForm({ defaultSport, onCreate }: { defaultSport: string; onCreate: (c: Competition) => void }) {
  const [name, setName] = useState("");
  const [sport, setSport] = useState(defaultSport);
  const [format, setFormat] = useState<Format>("league");
  const [returnLegs, setReturnLegs] = useState(false);
  const [entrants, setEntrants] = useState("");
  const list = [
    ...new Set(
      entrants
        .split(/[,\n]/)
        .map((e) => e.trim().slice(0, 40))
        .filter(Boolean)
    ),
  ];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim() || list.length < 2) return;
        onCreate(create(name.trim().slice(0, 60), sport, format, list, returnLegs));
        setName("");
        setEntrants("");
      }}
      className={`${card} flex flex-col gap-3`}
    >
      <label className="flex flex-col gap-1 text-sm font-semibold">
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tuesday 5-a-side league" className={field} required />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Sport
          <select value={sport} onChange={(e) => setSport(e.target.value)} className={field}>
            {SPORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="flex flex-col gap-1">
          <legend className="text-sm font-semibold">Format</legend>
          <div className="flex gap-2">
            {(["league", "knockout"] as const).map((f) => (
              <label key={f} className="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-xl text-sm font-semibold ring-1 ring-slate-300 has-checked:bg-emerald-700 has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-emerald-700">
                <input type="radio" name="format" value={f} checked={format === f} onChange={() => setFormat(f)} className="sr-only" />
                {f === "league" ? "League" : "Knockout"}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      {format === "league" && (
        <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={returnLegs} onChange={(e) => setReturnLegs(e.target.checked)} className="size-5 accent-emerald-700" />
          Play everyone twice (home and away)
        </label>
      )}
      <label className="flex flex-col gap-1 text-sm font-semibold">
        Teams or players, separated by commas
        <textarea value={entrants} onChange={(e) => setEntrants(e.target.value)} rows={2} placeholder="Red Lions, Blue Devils, Green Machine" className={`${field} py-2`} />
      </label>
      <button type="submit" disabled={!name.trim() || list.length < 2} className={primary}>
        <Plus size={16} aria-hidden="true" />
        Create with {list.length} entrants
      </button>
    </form>
  );
}

function CompetitionView({ competition: c, onChange, onBack }: { competition: Competition; onChange: (c: Competition) => void; onBack: () => void }) {
  const sport = sportById(c.sport);
  const rounds = [...new Set(c.fixtures.map((f) => f.round))];
  const winner = champion(c);

  function score(f: Fixture, side: "homeScore" | "awayScore", value: string) {
    const n = value === "" ? null : Math.max(0, Math.min(999, Number(value) || 0));
    const next = { ...c, fixtures: c.fixtures.map((x) => (x.id === f.id ? { ...x, [side]: n } : x)) };
    onChange(advance(next));
  }

  return (
    <section aria-labelledby="comp-h" className="flex flex-col gap-4">
      <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-1 self-start text-sm font-semibold text-emerald-800 underline hover:no-underline">
        <ArrowLeft size={16} aria-hidden="true" />
        All leagues and cups
      </button>
      <h2 id="comp-h" className="text-xl font-extrabold">
        {c.name}
      </h2>
      {winner !== null && (
        <p className="flex items-center gap-2 rounded-2xl bg-amber-50 p-4 font-bold text-amber-900 ring-1 ring-amber-300">
          <Trophy size={20} aria-hidden="true" /> {c.entrants[winner]} win the cup
        </p>
      )}
      {c.format === "league" && <LeagueTable competition={c} />}
      {rounds.map((r) => (
        <section key={r} aria-labelledby={`round-${r}`} className="flex flex-col gap-2">
          <h3 id={`round-${r}`} className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            {roundName(c, r)}
          </h3>
          <ul className="flex flex-col gap-2">
            {c.fixtures
              .filter((f) => f.round === r)
              .map((f) => {
                const home = c.entrants[f.home] ?? "";
                if (f.away === null) {
                  return (
                    <li key={f.id} className="rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-slate-200">
                      <span className="font-semibold">{home}</span> <span className="text-slate-600">has a bye</span>
                    </li>
                  );
                }
                const away = c.entrants[f.away] ?? "";
                const level = c.format === "knockout" && f.homeScore !== null && f.homeScore === f.awayScore;
                return (
                  <li key={f.id} className="flex flex-col gap-1 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">
                    <div className="grid grid-cols-[1fr_4rem_auto_4rem_1fr] items-center gap-2">
                      <span className="truncate text-right font-semibold">{home}</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        aria-label={`${home} ${sport.scoreLabel.toLowerCase()} against ${away}`}
                        value={f.homeScore ?? ""}
                        onChange={(e) => score(f, "homeScore", e.target.value)}
                        className={`${field} w-16 text-center font-bold tabular-nums`}
                      />
                      <span aria-hidden="true" className="text-slate-500">–</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        aria-label={`${away} ${sport.scoreLabel.toLowerCase()} against ${home}`}
                        value={f.awayScore ?? ""}
                        onChange={(e) => score(f, "awayScore", e.target.value)}
                        className={`${field} w-16 text-center font-bold tabular-nums`}
                      />
                      <span className="truncate font-semibold">{away}</span>
                    </div>
                    {level && <p className="text-center text-xs font-semibold text-rose-700">Knockout ties need a winner: enter the score after extra time or penalties.</p>}
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </section>
  );
}

function LeagueTable({ competition: c }: { competition: Competition }) {
  const cell = "px-2 py-2 text-right tabular-nums";
  return (
    <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-200">
      <table className="w-full text-sm">
        <caption className="sr-only">{c.name} table</caption>
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            <th scope="col" className="px-3 py-2 text-left">Team</th>
            <th scope="col" className={cell}><abbr title="Played">P</abbr></th>
            <th scope="col" className={cell}><abbr title="Won">W</abbr></th>
            <th scope="col" className={cell}><abbr title="Drawn">D</abbr></th>
            <th scope="col" className={cell}><abbr title="Lost">L</abbr></th>
            <th scope="col" className={cell}><abbr title="Score difference">+/-</abbr></th>
            <th scope="col" className={`${cell} pr-3`}>Pts</th>
          </tr>
        </thead>
        <tbody>
          {leagueTable(c).map((r, i) => (
            <tr key={r.entrant} className="border-t border-slate-100">
              <th scope="row" className="px-3 py-2 text-left font-semibold">
                <span className="mr-2 text-slate-500">{i + 1}</span>
                {c.entrants[r.entrant]}
              </th>
              <td className={cell}>{r.played}</td>
              <td className={cell}>{r.won}</td>
              <td className={cell}>{r.drawn}</td>
              <td className={cell}>{r.lost}</td>
              <td className={cell}>{r.for - r.against}</td>
              <td className={`${cell} pr-3 font-black text-emerald-800`}>{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
