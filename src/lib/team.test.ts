import assert from "node:assert/strict";
import { test } from "node:test";
import { advance, champion, create, knockout, leagueTable, roundRobin, winnerOf } from "./competition.ts";
import { makeTeams, type Player, standings, teamRating } from "./team.ts";

const p = (id: string, rating: number, position = ""): Player => ({ id, name: id, rating, position, available: true });

test("makeTeams: sizes within one, one keeper each, balanced", () => {
  const players = [p("a", 5, "GK"), p("b", 3, "GK"), ...Array.from({ length: 9 }, (_, i) => p(`x${i}`, (i % 5) + 1))];
  const teams = makeTeams(players, { sport: "football", teams: 2, balance: true, spreadPositions: true });
  assert.deepEqual(teams.map((t) => t.length).sort(), [5, 6]);
  for (const t of teams) assert.equal(t.filter((x) => x.position === "GK").length, 1);
  assert.ok(Math.abs(teamRating(teams[0] ?? []) - teamRating(teams[1] ?? [])) <= 3);
});

test("makeTeams: netball gives each team one of every position", () => {
  const pos = ["GS", "GA", "WA", "C", "WD", "GD", "GK"];
  const players = [...pos, ...pos].map((x, i) => p(`${x}${i}`, 3, x));
  for (const t of makeTeams(players, { sport: "netball", teams: 2, balance: true, spreadPositions: true }))
    assert.deepEqual(t.map((x) => x.position).sort(), [...pos].sort());
});

test("standings use the sport's points", () => {
  const players = [p("a", 1), p("b", 1)];
  const rugby = standings([{ id: "1", date: "", sport: "rugby", teams: [["a"], ["b"]], scores: [20, 10] }], players);
  assert.deepEqual(rugby.map((s) => [s.playerId, s.points, s.diff]), [["a", 4, 10], ["b", 0, -10]]);
});

test("roundRobin: everyone meets everyone once, odd counts handled", () => {
  const f = roundRobin(5);
  assert.equal(f.length, 10);
  const pairs = new Set(f.map((x) => [x.home, x.away].sort().join("-")));
  assert.equal(pairs.size, 10);
  assert.equal(roundRobin(4, true).length, 12);
});

test("knockout: byes, advance and champion", () => {
  assert.equal(knockout(5).length, 4);
  let c = create("Cup", "football", "knockout", ["A", "B", "C"]);
  c = { ...c, fixtures: c.fixtures.map((f) => (f.away === null ? f : { ...f, homeScore: 2, awayScore: 1 })) };
  c = advance(c);
  const final = c.fixtures.find((f) => f.round === 2);
  assert.ok(final);
  c = { ...c, fixtures: c.fixtures.map((f) => (f.round === 2 ? { ...f, homeScore: 0, awayScore: 3 } : f)) };
  assert.equal(champion(c), final && winnerOf({ ...final, homeScore: 0, awayScore: 3 }));
});

test("leagueTable ranks by points then goal difference", () => {
  const c = create("League", "football", "league", ["A", "B"]);
  const [f] = c.fixtures;
  assert.ok(f);
  const t = leagueTable({ ...c, fixtures: [{ ...f, homeScore: 1, awayScore: 1 }] });
  assert.deepEqual(t.map((r) => r.points), [1, 1]);
});
