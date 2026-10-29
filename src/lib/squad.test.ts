import assert from "node:assert/strict";
import { test } from "node:test";
import { makeTeams, type Player, standings, teamRating } from "./squad.ts";

const p = (id: string, rating: number, position: Player["position"] = "ANY"): Player => ({
  id,
  name: id,
  rating,
  position,
  available: true,
});

test("makeTeams keeps sizes within one and spreads keepers", () => {
  const players = [p("a", 5, "GK"), p("b", 3, "GK"), ...Array.from({ length: 9 }, (_, i) => p(`x${i}`, (i % 5) + 1))];
  const teams = makeTeams(players, { teams: 2, balance: true, spreadPositions: true });
  assert.deepEqual(teams.map((t) => t.length).sort(), [5, 6]);
  for (const t of teams) assert.equal(t.filter((x) => x.position === "GK").length, 1);
  assert.ok(Math.abs(teamRating(teams[0] ?? []) - teamRating(teams[1] ?? [])) <= 3);
});

test("makeTeams never makes more teams than players", () => {
  assert.equal(makeTeams([p("a", 1)], { teams: 4, balance: false, spreadPositions: false }).length, 1);
});

test("standings: 3 for a win, 1 for a draw, goal difference tiebreak", () => {
  const players = [p("a", 1), p("b", 1), p("c", 1), p("d", 1)];
  const table = standings(
    [
      { id: "1", date: "", teams: [["a", "b"], ["c", "d"]], goals: [3, 1] },
      { id: "2", date: "", teams: [["a", "c"], ["b", "d"]], goals: [2, 2] },
    ],
    players
  );
  assert.deepEqual(
    table.map((s) => [s.playerId, s.points, s.goalDiff]),
    [
      ["a", 4, 2],
      ["b", 4, 2],
      ["c", 1, -2],
      ["d", 1, -2],
    ]
  );
});
