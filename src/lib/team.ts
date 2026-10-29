import { type Sport, sportById } from "./sports.ts";

export interface Player {
  id: string;
  name: string;
  /** 1 (casual) to 5 (strongest): the balancing weight */
  rating: number;
  /** Position id from the sport preset, or "" for anywhere */
  position: string;
  /** Available for the next game */
  available: boolean;
}

export interface TeamOptions {
  sport: string;
  teams: number;
  /** Even out total ratings instead of a pure random draw */
  balance: boolean;
  /** Spread each position across teams; unique positions (keepers) one per team first */
  spreadPositions: boolean;
}

export interface Match {
  id: string;
  date: string;
  sport: string;
  /** Player ids per team, in team order */
  teams: string[][];
  scores: number[];
}

export interface Standing {
  playerId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  diff: number;
  points: number;
}

export const TEAM_NAMES = [
  "Reds",
  "Blues",
  "Greens",
  "Yellows",
  "Whites",
  "Blacks",
  "Oranges",
  "Purples",
];

export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

const sum = (team: Player[]) => team.reduce((n, p) => n + p.rating, 0);
const count = (team: Player[], position: string) =>
  team.filter((p) => p.position === position).length;

/**
 * Deal players into teams whose sizes differ by at most one. Unique positions go first, then
 * strongest first (random within a rating), each to the eligible team with the fewest of that
 * position, then the lowest total rating.
 */
export function makeTeams(
  players: readonly Player[],
  options: TeamOptions,
  random = Math.random
): Player[][] {
  const sport = sportById(options.sport);
  const unique = new Set(sport.positions.filter((p) => p.unique).map((p) => p.id));
  const n = Math.max(1, Math.min(options.teams, players.length));
  const cap = Math.ceil(players.length / n);
  const teams: Player[][] = Array.from({ length: n }, () => []);
  const order = shuffle(players, random);
  if (options.balance) order.sort((a, b) => b.rating - a.rating);
  if (options.spreadPositions)
    order.sort((a, b) => Number(unique.has(b.position)) - Number(unique.has(a.position)));

  for (const p of order) {
    const pick = shuffle(
      teams.filter((t) => t.length < cap),
      random
    ).sort(
      (a, b) =>
        (options.spreadPositions && p.position ? count(a, p.position) - count(b, p.position) : 0) ||
        (options.balance ? sum(a) - sum(b) : 0) ||
        a.length - b.length
    )[0];
    pick?.push(p);
  }
  return teams;
}

export function teamRating(team: readonly Player[]): number {
  return team.reduce((n, p) => n + p.rating, 0);
}

/** Highest score wins; a shared top score is a draw. Points follow each match's sport. */
export function standings(matches: readonly Match[], players: readonly Player[]): Standing[] {
  const table = new Map<string, Standing>(
    players.map((p) => [
      p.id,
      { playerId: p.id, played: 0, won: 0, drawn: 0, lost: 0, diff: 0, points: 0 },
    ])
  );
  for (const m of matches) {
    const sport: Sport = sportById(m.sport);
    const best = Math.max(...m.scores);
    const shared = m.scores.filter((g) => g === best).length > 1;
    m.teams.forEach((team, i) => {
      const score = m.scores[i] ?? 0;
      const others = m.scores.filter((_, j) => j !== i);
      const against = others.length ? Math.max(...others) : 0;
      for (const id of team) {
        const s = table.get(id);
        if (!s) continue;
        s.played++;
        s.diff += score - against;
        if (score === best && !shared) {
          s.won++;
          s.points += sport.points.win;
        } else if (score === best) {
          s.drawn++;
          s.points += sport.points.draw;
        } else {
          s.lost++;
          s.points += sport.points.loss;
        }
      }
    });
  }
  return [...table.values()]
    .filter((s) => s.played > 0)
    .sort((a, b) => b.points - a.points || b.diff - a.diff || a.played - b.played);
}
