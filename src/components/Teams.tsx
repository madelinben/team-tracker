import { Minus, Plus, Save, Shuffle } from "lucide-react";
import { useState } from "react";
import { makeTeams, type Player, type SquadData, TEAM_NAMES, teamRating } from "../lib/squad";

const TEAM_COLOURS = [
  "border-t-rose-600",
  "border-t-sky-600",
  "border-t-emerald-600",
  "border-t-amber-500",
  "border-t-slate-300",
  "border-t-slate-900",
];

interface Props {
  data: SquadData;
  onChange: (d: SquadData) => void;
  onSaved: () => void;
}

export function Teams({ data, onChange, onSaved }: Props) {
  const { options } = data;
  const available = data.players.filter((p) => p.available);
  const byId = new Map(data.players.map((p) => [p.id, p]));
  const teams = (data.draw ?? []).map((ids) => ids.flatMap((id) => byId.get(id) ?? []));
  const [goals, setGoals] = useState<number[]>([]);

  const setOptions = (change: Partial<SquadData["options"]>) =>
    onChange({ ...data, options: { ...options, ...change }, draw: null });

  function draw() {
    setGoals([]);
    onChange({ ...data, draw: makeTeams(available, options).map((t) => t.map((p) => p.id)) });
  }

  function saveResult() {
    if (!data.draw) return;
    onChange({
      ...data,
      draw: null,
      matches: [
        ...data.matches,
        {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          teams: data.draw,
          goals: data.draw.map((_, i) => goals[i] ?? 0),
        },
      ],
    });
    setGoals([]);
    onSaved();
  }

  const toggle = "flex min-h-11 items-center gap-2 text-sm font-semibold";
  return (
    <section aria-labelledby="teams-h" className="flex flex-col gap-4">
      <h2 id="teams-h" className="text-xl font-extrabold">
        Pick teams
      </h2>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <div className="flex items-center gap-2">
          <span id="team-count" className="text-sm font-semibold">
            Teams
          </span>
          <button
            type="button"
            aria-label="Fewer teams"
            onClick={() => setOptions({ teams: Math.max(2, options.teams - 1) })}
            className="grid size-11 place-items-center rounded-xl ring-1 ring-slate-300 hover:bg-slate-50"
          >
            <Minus size={16} aria-hidden="true" />
          </button>
          <output aria-labelledby="team-count" className="w-6 text-center text-lg font-black tabular-nums">
            {options.teams}
          </output>
          <button
            type="button"
            aria-label="More teams"
            onClick={() => setOptions({ teams: Math.min(TEAM_NAMES.length, options.teams + 1) })}
            className="grid size-11 place-items-center rounded-xl ring-1 ring-slate-300 hover:bg-slate-50"
          >
            <Plus size={16} aria-hidden="true" />
          </button>
        </div>
        <label className={toggle}>
          <input
            type="checkbox"
            checked={options.balance}
            onChange={(e) => setOptions({ balance: e.target.checked })}
            className="size-5 accent-emerald-700"
          />
          Balance by skill
        </label>
        <label className={toggle}>
          <input
            type="checkbox"
            checked={options.spreadPositions}
            onChange={(e) => setOptions({ spreadPositions: e.target.checked })}
            className="size-5 accent-emerald-700"
          />
          Spread positions
        </label>
      </div>

      <button
        type="button"
        onClick={draw}
        disabled={available.length < 2}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 font-extrabold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:bg-slate-300 disabled:text-slate-600"
      >
        <Shuffle size={18} aria-hidden="true" />
        {data.draw ? "Reshuffle" : `Pick teams from ${available.length} players`}
      </button>
      {available.length < 2 && (
        <p className="text-center text-sm text-slate-600">Tick at least two available players first.</p>
      )}

      {teams.length > 0 && (
        <>
          <ul aria-live="polite" className="grid gap-3 sm:grid-cols-2">
            {teams.map((team, i) => (
              <TeamCard
                key={TEAM_NAMES[i]}
                name={TEAM_NAMES[i] ?? `Team ${i + 1}`}
                colour={TEAM_COLOURS[i] ?? ""}
                team={team}
                goals={goals[i] ?? 0}
                onGoals={(g) => setGoals(teams.map((_, j) => (j === i ? g : (goals[j] ?? 0))))}
              />
            ))}
          </ul>
          <button
            type="button"
            onClick={saveResult}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 font-bold text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            <Save size={18} aria-hidden="true" />
            Save result to the table
          </button>
        </>
      )}
    </section>
  );
}

interface TeamCardProps {
  name: string;
  colour: string;
  team: Player[];
  goals: number;
  onGoals: (goals: number) => void;
}

function TeamCard({ name, colour, team, goals, onGoals }: TeamCardProps) {
  const id = `goals-${name}`;
  return (
    <li className={`rounded-2xl border-t-8 bg-white p-4 ring-1 ring-slate-200 ${colour}`}>
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-extrabold">{name}</h3>
        <span className="text-sm tabular-nums text-slate-600">skill {teamRating(team)}</span>
      </div>
      <ul className="mt-2 flex flex-col gap-1">
        {team.map((p) => (
          <li key={p.id} className="flex justify-between text-sm">
            <span className="font-semibold">{p.name}</span>
            <span className="text-slate-600">{p.position === "ANY" ? "" : p.position}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-2">
        <label htmlFor={id} className="text-sm font-semibold">
          Goals
        </label>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          max={99}
          value={goals}
          onChange={(e) => onGoals(Math.max(0, Math.min(99, Number(e.target.value) || 0)))}
          className="min-h-11 w-20 rounded-xl border border-slate-300 px-3 text-lg font-bold tabular-nums"
        />
      </div>
    </li>
  );
}
