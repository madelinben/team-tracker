import { ListOrdered, Shirt, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { DataBackup } from "./components/DataBackup";
import { Leagues } from "./components/Leagues";
import { Players } from "./components/Players";
import { Table } from "./components/Table";
import { Teams } from "./components/Teams";
import { EMPTY, parseTeam, type TeamData } from "./lib/data";
import { type BeforeExport, load, save } from "./lib/storage";

const KEY = "team-tracker";
type Tab = "players" | "teams" | "table" | "leagues";

const TABS = [
  { id: "players", label: "Squad", Icon: Users },
  { id: "teams", label: "Pick", Icon: Shirt },
  { id: "table", label: "Table", Icon: ListOrdered },
  { id: "leagues", label: "Leagues", Icon: Trophy },
] as const;

export function TeamApp({ beforeExport }: { beforeExport?: BeforeExport }) {
  const [tab, setTab] = useState<Tab>("players");
  const [data, setData] = useState<TeamData>(EMPTY);
  const [ready, setReady] = useState(false);

  // Load after mount: localStorage is unavailable during SSR and would cause a hydration mismatch.
  useEffect(() => {
    setData(parseTeam(load<unknown>(KEY, null)) ?? EMPTY);
    setReady(true);
  }, []);

  const update = (next: TeamData) => {
    setData(next);
    save(KEY, next);
  };

  if (!ready) return <div className="h-full animate-pulse bg-slate-100" />;

  return (
    <div className="flex h-full flex-col bg-slate-50 text-slate-900">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-2xl flex-col gap-5 p-4">
          {tab === "players" && (
            <>
              <Players data={data} onChange={update} />
              <DataBackup filename="team-tracker.json" data={data} parse={parseTeam} onRestore={update} beforeExport={beforeExport} />
            </>
          )}
          {tab === "teams" && <Teams data={data} onChange={update} onSaved={() => setTab("table")} />}
          {tab === "table" && <Table data={data} onChange={update} />}
          {tab === "leagues" && <Leagues data={data} onChange={update} />}
        </div>
      </div>
      <nav aria-label="Team Tracker" className="grid grid-cols-4 gap-1 border-t border-slate-200 bg-white p-1.5">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            aria-current={tab === id ? "page" : undefined}
            onClick={() => setTab(id)}
            className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-xs font-extrabold transition active:scale-[0.97] sm:flex-row sm:gap-2 sm:text-sm ${
              tab === id ? "bg-emerald-700 text-white" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Icon size={18} aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
