import { ListOrdered, Shirt, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { DataBackup } from "./components/DataBackup";
import { Players } from "./components/Players";
import { Table } from "./components/Table";
import { Teams } from "./components/Teams";
import { EMPTY, parseSquad, type SquadData } from "./lib/squad";
import { type BeforeExport, load, save } from "./lib/storage";

const KEY = "squad-tracker";
type Tab = "players" | "teams" | "table";

const TABS = [
  { id: "players", label: "Players", Icon: Users },
  { id: "teams", label: "Teams", Icon: Shirt },
  { id: "table", label: "Table", Icon: ListOrdered },
] as const;

export function SquadApp({ beforeExport }: { beforeExport?: BeforeExport }) {
  const [tab, setTab] = useState<Tab>("players");
  const [data, setData] = useState<SquadData>(EMPTY);
  const [ready, setReady] = useState(false);

  // Load after mount: localStorage is unavailable during SSR and would cause a hydration mismatch.
  useEffect(() => {
    setData(parseSquad(load<unknown>(KEY, null)) ?? EMPTY);
    setReady(true);
  }, []);

  const update = (next: SquadData) => {
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
              <DataBackup
                filename="squad-tracker.json"
                data={data}
                parse={parseSquad}
                onRestore={update}
                beforeExport={beforeExport}
              />
            </>
          )}
          {tab === "teams" && <Teams data={data} onChange={update} onSaved={() => setTab("table")} />}
          {tab === "table" && <Table data={data} onChange={update} />}
        </div>
      </div>
      <nav aria-label="Squad Tracker" className="grid grid-cols-3 gap-1 border-t border-slate-200 bg-white p-1.5">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            aria-current={tab === id ? "page" : undefined}
            onClick={() => setTab(id)}
            className={`flex min-h-12 items-center justify-center gap-2 rounded-xl text-sm font-extrabold transition active:scale-[0.97] ${
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
