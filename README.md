# Team Tracker

Pick fair teams for any team sport, keep a player table, and run leagues and knockout cups.

- Sports presets for football and 5-a-side, American football and flag, rugby, netball, basketball, hockey, volleyball, cricket, handball and water polo, ultimate, rounders and softball, or **any sport** with no positions
- Tick who is available, rate skill 1 to 5, set positions: unique positions (keeper, quarterback, netball bibs) go one per team first
- 2 to 8 teams, sizes never differ by more than one, reshuffle until happy
- One master squad; every session stores its own line-ups, so players can switch sides week to week. Move players between teams, bench no-shows, add late arrivals
- Per-player stats each session: sport presets (goals, assists, saves; points, rebounds; runs, wickets…) plus your own, and player of the match
- Leaderboard across all sessions, sortable by points, wins, MOTM or any stat, with win rate and per-session averages; edit or delete past sessions
- Points follow the sport (football 3/1/0, rugby 4/2/0, others 2/1/0)
- Leagues (round robin, optional home and away) and knockout cups with byes for any teams or players, from five-a-side to padel pairs or quiz teams
- Data stays in the browser (localStorage). Download a backup file and restore it on any device.

Two ways this repo ships, from the same `src/`:

| Target | How |
|---|---|
| **GitHub Pages** (`madelinben.github.io/team-tracker/`) | `pnpm build:demo` builds `demo/` into `docs/` (Pages source: `main` / `/docs`) |
| **get-out-there** (Cloudflare) | imported as workspace package `@get-out-there/team` (`TeamApp`) |

```bash
pnpm install
pnpm dev          # demo at http://localhost:3103/team-tracker/
pnpm test         # logic unit tests
pnpm build:demo   # static site -> docs/
```

Package rules: no router/auth/app imports; Tailwind default palette only (no custom tokens); host must `@source` this folder. Peer deps: react, react-dom, lucide-react.

Host hook: `<TeamApp beforeExport={gate} />` runs `gate(label)` before a backup download or restore (e.g. an ad gate); reject to cancel.
