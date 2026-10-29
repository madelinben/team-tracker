import { Minus, Plus, Shuffle } from "lucide-react";
import { newDraft, saveMatch, type TeamData } from "../lib/data";
import { sportById } from "../lib/sports";
import { makeTeams, statColumns, TEAM_NAMES } from "../lib/team";
import { SessionForm } from "./SessionForm";

interface Props {
  data: TeamData;
  onChange: (d: TeamData) => void;
  onSaved: () => void;
}

export function Teams({ data, onChange, onSaved }: Props) {
  const { options } = data;
  const sport = sportById(options.sport);
  const available = data.players.filter((p) => p.available);

  const setOptions = (change: Partial<TeamData["options"]>) =>
    onChange({ ...data, options: { ...options, ...change }, draft: null });

  const draw = () =>
    onChange({
      ...data,
      draft: newDraft(
        sport.id,
        makeTeams(available, options).map((t) => t.map((p) => p.id))
      ),
    });

  function saveResult() {
    if (!data.draft) return;
    onChange({ ...data, draft: null, matches: saveMatch(data.matches, data.draft) });
    onSaved();
  }

  const toggle = "flex min-h-11 items-center gap-2 text-sm font-semibold";
  return (
    <section aria-labelledby="teams-h" className="flex flex-col gap-4">
      <h2 id="teams-h" className="text-xl font-extrabold">
        Pick teams <span className="text-base font-semibold text-slate-600">· {sport.label}</span>
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
          <output
            aria-labelledby="team-count"
            className="w-6 text-center text-lg font-black tabular-nums"
          >
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
        {data.draft ? "Reshuffle" : `Pick teams from ${available.length} players`}
      </button>
      {available.length < 2 && (
        <p className="text-center text-sm text-slate-600">
          Tick at least two available players first.
        </p>
      )}

      {data.draft && (
        <SessionForm
          session={data.draft}
          players={data.players}
          stats={statColumns(sportById(data.draft.sport), data.stats)}
          onChange={(draft) => onChange({ ...data, draft })}
          onSave={saveResult}
          saveLabel="Save session"
        />
      )}
    </section>
  );
}
