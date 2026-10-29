export type Position = "GK" | "DEF" | "MID" | "FWD" | "ANY";

export const POSITIONS: readonly { id: Position; label: string }[] = [
  { id: "ANY", label: "Any" },
  { id: "GK", label: "Goalkeeper" },
  { id: "DEF", label: "Defender" },
  { id: "MID", label: "Midfielder" },
  { id: "FWD", label: "Forward" },
];

export interface Player {
  id: string;
  name: string;
  /** 1 (casual) to 5 (strongest): the balancing weight */
  rating: number;
  position: Position;
  /** Available for the next game */
  available: boolean;
}

export interface TeamOptions {
  teams: number;
  /** Even out total ratings instead of a pure random draw */
  balance: boolean;
  /** Spread players of each position across teams (one keeper each before any team gets two) */
  spreadPositions: boolean;
}

export interface Match {
  id: string;
  date: string;
  /** Player ids per team, in team order */
  teams: string[][];
  goals: number[];
}

export interface Standing {
  playerId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalDiff: number;
  points: number;
}

export interface SquadData {
  version: 1;
  players: Player[];
  options: TeamOptions;
  /** Teams from the last draw, kept until a result is recorded */
  draw: string[][] | null;
  matches: Match[];
}

export const EMPTY: SquadData = {
  version: 1,
  players: [],
  options: { teams: 2, balance: true, spreadPositions: true },
  draw: null,
  matches: [],
};

export const TEAM_NAMES = ["Reds", "Blues", "Greens", "Yellows", "Whites", "Blacks"];

export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

const sum = (team: Player[]) => team.reduce((n, p) => n + p.rating, 0);
const count = (team: Player[], position: Position) => team.filter((p) => p.position === position).length;

/**
 * Deal players into teams whose sizes differ by at most one. Strongest first (random within a
 * rating), each to the eligible team with the fewest of that position, then the lowest total.
 */
export function makeTeams(players: readonly Player[], options: TeamOptions, random = Math.random): Player[][] {
  const n = Math.max(1, Math.min(options.teams, players.length));
  const cap = Math.ceil(players.length / n);
  const teams: Player[][] = Array.from({ length: n }, () => []);
  const order = shuffle(players, random);
  if (options.balance) order.sort((a, b) => b.rating - a.rating);
  // keepers go first so every team gets one before anyone gets a second
  if (options.spreadPositions) order.sort((a, b) => Number(b.position === "GK") - Number(a.position === "GK"));

  for (const p of order) {
    const open = teams.filter((t) => t.length < cap);
    const pick = shuffle(open, random).sort(
      (a, b) =>
        (options.spreadPositions && p.position !== "ANY" ? count(a, p.position) - count(b, p.position) : 0) ||
        (options.balance ? sum(a) - sum(b) : 0) ||
        a.length - b.length
    )[0];
    pick?.push(p);
  }
  return teams;
}

export function teamRating(team: readonly Player[]): number {
  return sum([...team]);
}

/** 3 points a win, 1 a draw. Players no longer in the squad are dropped. */
export function standings(matches: readonly Match[], players: readonly Player[]): Standing[] {
  const table = new Map<string, Standing>(
    players.map((p) => [p.id, { playerId: p.id, played: 0, won: 0, drawn: 0, lost: 0, goalDiff: 0, points: 0 }])
  );
  for (const m of matches) {
    const best = Math.max(...m.goals);
    const winners = m.goals.filter((g) => g === best).length;
    m.teams.forEach((team, i) => {
      const goals = m.goals[i] ?? 0;
      const others = m.goals.filter((_, j) => j !== i);
      const conceded = others.length ? Math.max(...others) : 0;
      for (const id of team) {
        const s = table.get(id);
        if (!s) continue;
        s.played++;
        s.goalDiff += goals - conceded;
        if (goals === best && winners === 1) {
          s.won++;
          s.points += 3;
        } else if (goals === best) {
          s.drawn++;
          s.points += 1;
        } else s.lost++;
      }
    });
  }
  return [...table.values()]
    .filter((s) => s.played > 0)
    .sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || a.played - b.played);
}

export function parseSquad(raw: unknown): SquadData | null {
  if (typeof raw !== "object" || raw === null) return null;
  const d = raw as Partial<SquadData>;
  return d.version === 1 && Array.isArray(d.players) && Array.isArray(d.matches) && d.options
    ? { ...EMPTY, ...d, version: 1 }
    : null;
}
