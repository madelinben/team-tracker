export interface PositionDef {
  id: string;
  label: string;
  /** Every team should get one before any team gets two (keeper, quarterback, centre) */
  unique?: boolean;
}

export interface Sport {
  id: string;
  label: string;
  /** What the scoreboard counts */
  scoreLabel: string;
  /** Draws possible in a normal match (knockout ties still need a winner) */
  draws: boolean;
  points: { win: number; draw: number; loss: number };
  positions: PositionDef[];
}

const LEAGUE = { win: 3, draw: 1, loss: 0 };
const NO_DRAW = { win: 2, draw: 1, loss: 0 };
const keeper = { id: "GK", label: "Goalkeeper", unique: true };

/** Presets only shape positions and scoring: the "Any sport" entry covers everything else */
export const SPORTS: readonly Sport[] = [
  {
    id: "any",
    label: "Any sport",
    scoreLabel: "Score",
    draws: true,
    points: LEAGUE,
    positions: [],
  },
  {
    id: "football",
    label: "Football / 5-a-side",
    scoreLabel: "Goals",
    draws: true,
    points: LEAGUE,
    positions: [
      keeper,
      { id: "DEF", label: "Defender" },
      { id: "MID", label: "Midfielder" },
      { id: "FWD", label: "Forward" },
    ],
  },
  {
    id: "american-football",
    label: "American football / flag",
    scoreLabel: "Points",
    draws: true,
    points: NO_DRAW,
    positions: [
      { id: "QB", label: "Quarterback", unique: true },
      { id: "OFF", label: "Offence" },
      { id: "DEF", label: "Defence" },
    ],
  },
  {
    id: "rugby",
    label: "Rugby / touch / tag",
    scoreLabel: "Points",
    draws: true,
    points: { win: 4, draw: 2, loss: 0 },
    positions: [
      { id: "FWD", label: "Forward" },
      { id: "BCK", label: "Back" },
    ],
  },
  {
    id: "netball",
    label: "Netball",
    scoreLabel: "Goals",
    draws: true,
    points: LEAGUE,
    positions: ["GS", "GA", "WA", "C", "WD", "GD", "GK"].map((id) => ({
      id,
      label: id,
      unique: true,
    })),
  },
  {
    id: "basketball",
    label: "Basketball",
    scoreLabel: "Points",
    draws: false,
    points: NO_DRAW,
    positions: [
      { id: "G", label: "Guard" },
      { id: "F", label: "Forward" },
      { id: "C", label: "Centre", unique: true },
    ],
  },
  {
    id: "hockey",
    label: "Hockey",
    scoreLabel: "Goals",
    draws: true,
    points: LEAGUE,
    positions: [
      keeper,
      { id: "DEF", label: "Defender" },
      { id: "MID", label: "Midfielder" },
      { id: "FWD", label: "Forward" },
    ],
  },
  {
    id: "volleyball",
    label: "Volleyball",
    scoreLabel: "Sets",
    draws: false,
    points: NO_DRAW,
    positions: [
      { id: "S", label: "Setter", unique: true },
      { id: "L", label: "Libero", unique: true },
      { id: "H", label: "Hitter" },
    ],
  },
  {
    id: "cricket",
    label: "Cricket",
    scoreLabel: "Runs",
    draws: true,
    points: { win: 2, draw: 1, loss: 0 },
    positions: [
      { id: "WK", label: "Wicketkeeper", unique: true },
      { id: "BAT", label: "Batter" },
      { id: "BWL", label: "Bowler" },
      { id: "AR", label: "All-rounder" },
    ],
  },
  {
    id: "handball",
    label: "Handball / water polo",
    scoreLabel: "Goals",
    draws: true,
    points: NO_DRAW,
    positions: [keeper, { id: "FLD", label: "Court player" }],
  },
  {
    id: "ultimate",
    label: "Ultimate frisbee",
    scoreLabel: "Points",
    draws: false,
    points: NO_DRAW,
    positions: [
      { id: "H", label: "Handler" },
      { id: "C", label: "Cutter" },
    ],
  },
  {
    id: "rounders",
    label: "Rounders / softball",
    scoreLabel: "Rounders",
    draws: true,
    points: NO_DRAW,
    positions: [
      { id: "BWL", label: "Bowler", unique: true },
      { id: "BS", label: "Backstop", unique: true },
      { id: "FLD", label: "Fielder" },
    ],
  },
];

export function sportById(id: string): Sport {
  return SPORTS.find((s) => s.id === id) ?? (SPORTS[0] as Sport);
}

/** Outcome points for one side given both scores */
export function resultPoints(sport: Sport, ours: number, theirs: number): number {
  return ours > theirs ? sport.points.win : ours === theirs ? sport.points.draw : sport.points.loss;
}
