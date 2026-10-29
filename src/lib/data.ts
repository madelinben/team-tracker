import type { Competition } from "./competition.ts";
import type { Match, Player, TeamOptions } from "./team.ts";

export interface TeamData {
  version: 1;
  players: Player[];
  options: TeamOptions;
  /** Teams from the last draw, kept until a result is recorded */
  draw: string[][] | null;
  matches: Match[];
  competitions: Competition[];
}

export const EMPTY: TeamData = {
  version: 1,
  players: [],
  options: { sport: "football", teams: 2, balance: true, spreadPositions: true },
  draw: null,
  matches: [],
  competitions: [],
};

export function parseTeam(raw: unknown): TeamData | null {
  if (typeof raw !== "object" || raw === null) return null;
  const d = raw as Partial<TeamData>;
  return d.version === 1 && Array.isArray(d.players) && Array.isArray(d.matches)
    ? { ...EMPTY, ...d, version: 1, competitions: d.competitions ?? [] }
    : null;
}
