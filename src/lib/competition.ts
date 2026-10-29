import { resultPoints, sportById } from "./sports.ts";
import { shuffle } from "./team.ts";

export type Format = "league" | "knockout";

export interface Fixture {
  id: string;
  round: number;
  /** Entrant indexes; away null is a bye (home goes through) */
  home: number;
  away: number | null;
  homeScore: number | null;
  awayScore: number | null;
}

export interface Competition {
  id: string;
  name: string;
  sport: string;
  format: Format;
  entrants: string[];
  fixtures: Fixture[];
}

export interface Row {
  entrant: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  for: number;
  against: number;
  points: number;
}

const fixture = (round: number, home: number, away: number | null): Fixture => ({
  id: `${round}-${home}-${away ?? "bye"}`,
  round,
  home,
  away,
  homeScore: null,
  awayScore: null,
});

/** Circle method: everyone plays everyone once (twice with return legs), one game each per round */
export function roundRobin(n: number, returnLegs = false): Fixture[] {
  const slots: (number | null)[] = Array.from({ length: n }, (_, i) => i);
  if (n % 2) slots.push(null);
  const rounds = slots.length - 1;
  const out: Fixture[] = [];
  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < slots.length / 2; i++) {
      const a = slots[i] ?? null;
      const b = slots[slots.length - 1 - i] ?? null;
      if (a === null || b === null) continue;
      const [home, away] = r % 2 ? [b, a] : [a, b];
      out.push(fixture(r + 1, home, away));
      if (returnLegs) out.push(fixture(r + 1 + rounds, away, home));
    }
    slots.splice(1, 0, slots.pop() ?? null);
  }
  return out.sort((x, y) => x.round - y.round);
}

/** Random draw; byes fill the bracket up to the next power of two */
export function knockout(n: number, random = Math.random): Fixture[] {
  const size = 2 ** Math.ceil(Math.log2(Math.max(2, n)));
  const seeds = shuffle(
    Array.from({ length: n }, (_, i) => i),
    random
  );
  const byes = size - n;
  const out: Fixture[] = [];
  let i = 0;
  for (let b = 0; b < byes; b++) out.push(fixture(1, seeds[i++] ?? 0, null));
  while (i < n) out.push(fixture(1, seeds[i++] ?? 0, seeds[i++] ?? null));
  return out;
}

export function create(
  name: string,
  sport: string,
  format: Format,
  entrants: string[],
  returnLegs = false
): Competition {
  return {
    id: crypto.randomUUID(),
    name,
    sport,
    format,
    entrants,
    fixtures:
      format === "league" ? roundRobin(entrants.length, returnLegs) : knockout(entrants.length),
  };
}

export const played = (f: Fixture) =>
  f.away === null || (f.homeScore !== null && f.awayScore !== null);

/** Winning entrant, or null while unplayed or level */
export function winnerOf(f: Fixture): number | null {
  if (f.away === null) return f.home;
  if (f.homeScore === null || f.awayScore === null || f.homeScore === f.awayScore) return null;
  return f.homeScore > f.awayScore ? f.home : f.away;
}

export function leagueTable(c: Competition): Row[] {
  const sport = sportById(c.sport);
  const rows: Row[] = c.entrants.map((_, entrant) => ({
    entrant,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    for: 0,
    against: 0,
    points: 0,
  }));
  for (const f of c.fixtures) {
    if (f.away === null || f.homeScore === null || f.awayScore === null) continue;
    for (const [me, ours, theirs] of [
      [f.home, f.homeScore, f.awayScore],
      [f.away, f.awayScore, f.homeScore],
    ] as const) {
      const r = rows[me];
      if (!r) continue;
      r.played++;
      r.for += ours;
      r.against += theirs;
      r.points += resultPoints(sport, ours, theirs);
      if (ours > theirs) r.won++;
      else if (ours === theirs) r.drawn++;
      else r.lost++;
    }
  }
  return rows.sort(
    (a, b) => b.points - a.points || b.for - b.against - (a.for - a.against) || b.for - a.for
  );
}

/** Knockout: once every tie in the latest round has a winner, draw the next round in bracket order */
export function advance(c: Competition): Competition {
  if (c.format !== "knockout") return c;
  const round = Math.max(...c.fixtures.map((f) => f.round));
  const winners = c.fixtures.filter((f) => f.round === round).map(winnerOf);
  if (winners.length < 2 || winners.some((w) => w === null)) return c;
  const next: Fixture[] = [];
  for (let i = 0; i < winners.length; i += 2)
    next.push(fixture(round + 1, winners[i] ?? 0, winners[i + 1] ?? null));
  return { ...c, fixtures: [...c.fixtures, ...next] };
}

/** Knockout champion once the final is decided */
export function champion(c: Competition): number | null {
  if (c.format !== "knockout") return null;
  const round = Math.max(...c.fixtures.map((f) => f.round));
  const last = c.fixtures.filter((f) => f.round === round);
  return last.length === 1 && last[0] ? winnerOf(last[0]) : null;
}

export function roundName(c: Competition, round: number): string {
  if (c.format === "league") return `Round ${round}`;
  const first = c.fixtures.filter((f) => f.round === 1).length * 2;
  const left = first / 2 ** (round - 1);
  return left === 2
    ? "Final"
    : left === 4
      ? "Semi-finals"
      : left === 8
        ? "Quarter-finals"
        : `Round of ${left}`;
}
