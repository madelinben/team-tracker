# Squad Tracker

Pick fair football teams from any number of players and keep a running league table.

- Add the whole squad once, tick who is available this week
- Skill rating (1 to 5 stars) balances total team strength
- Positions: one keeper per team before anyone gets two, defenders/midfielders/forwards spread evenly
- 2 to 6 teams, sizes never differ by more than one, reshuffle until happy
- Record goals per team: 3 points a win, 1 a draw, goal difference tiebreak
- Data stays in the browser (localStorage). Download a backup file and restore it on any device.

Two ways this repo ships, from the same `src/`:

| Target | How |
|---|---|
| **GitHub Pages** (`madelinben.github.io/squad-tracker/`) | `pnpm build:demo` builds `demo/` into `docs/` (Pages source: `main` / `/docs`) |
| **get-out-there** (Cloudflare) | imported as workspace package `@get-out-there/squad` (`SquadApp`) |

```bash
pnpm install
pnpm dev          # demo at http://localhost:3103/squad-tracker/
pnpm test         # logic unit tests
pnpm build:demo   # static site -> docs/
```

Package rules: no router/auth/app imports; Tailwind default palette only (no custom tokens); host must `@source` this folder. Peer deps: react, react-dom, lucide-react.

Host hook: `<SquadApp beforeExport={gate} />` runs `gate(label)` before a backup download or restore (e.g. an ad gate); reject to cancel.
