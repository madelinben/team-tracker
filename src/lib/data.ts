import type { Competition } from "./competition.ts";
import type { StatDef } from "./sports.ts";
import type { Match, Player, TeamOptions } from "./team.ts";

export interface TeamData {
  version: 1;
  /** Master list: everyone who ever plays, whichever side they end up on */
  players: Player[];
  options: TeamOptions;
  /** Next session, picked but not played: survives reloads until saved */
  draft: Match | null;
  matches: Match[];
  competitions: Competition[];
  /** The squad's own stats on top of the sport's presets */
  stats: StatDef[];
}

export const EMPTY: TeamData = {
  version: 1,
  players: [],
  options: { sport: "football", teams: 2, balance: true, spreadPositions: true },
  draft: null,
  matches: [],
  competitions: [],
  stats: [],
};

export function parseTeam(raw: unknown): TeamData | null {
  if (typeof raw !== "object" || raw === null) return null;
  const d = raw as Partial<TeamData>;
  return d.version === 1 && Array.isArray(d.players) && Array.isArray(d.matches)
    ? {
        ...EMPTY,
        ...d,
        version: 1,
        draft: d.draft ?? null,
        competitions: d.competitions ?? [],
        stats: d.stats ?? [],
      }
    : null;
}

export const today = () => new Date().toISOString().slice(0, 10);

/** A fresh session from picked teams */
export function newDraft(sport: string, teams: string[][]): Match {
  return { id: crypto.randomUUID(), date: today(), sport, teams, scores: teams.map(() => 0) };
}

/** Add a new session or replace an edited one */
export function saveMatch(matches: readonly Match[], match: Match): Match[] {
  return matches.some((m) => m.id === match.id)
    ? matches.map((m) => (m.id === match.id ? match : m))
    : [...matches, match];
}
