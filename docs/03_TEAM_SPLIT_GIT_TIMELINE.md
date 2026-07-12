# EcoSphere — Team Split, Git Workflow, Hour-by-Hour Timeline

## 1. Ownership split (minimizes merge conflicts by file, not just by "feature")

**Developer A — "Environmental + Reports + Dashboard"**
- Backend: `environmental.routes.js`, `reports.routes.js`, dashboard aggregation endpoint
- Frontend: `pages/Dashboard.jsx`, `pages/environmental/*`, `pages/reports/*`
- DB tables owned: EmissionFactor, CarbonTransaction, EnvironmentalGoal, DepartmentScore (env portion)

**Developer B — "Social + Governance + Gamification + Settings"**
- Backend: `social.routes.js`, `governance.routes.js`, `gamification.routes.js`, `settings.routes.js`
- Frontend: `pages/social/*`, `pages/governance/*`, `pages/gamification/*`, `pages/settings/*`
- DB tables owned: CSRActivity, EmployeeParticipation, ESGPolicy, PolicyAcknowledgement, Audit, ComplianceIssue, Challenge, ChallengeParticipation, Badge, Reward

**Shared (touch only during merge windows, one person at a time):**
- `prisma/schema.prisma` (whole schema lives in one file — coordinate before editing)
- `scoring.service.js`, `badge.service.js`
- `components/Sidebar.jsx`, `App.jsx` route list, global CSS/theme
- `seed.js`

**Rule of thumb:** if you're touching a file with the other dev's module name in the path, stop and ping them first.

## 2. Git workflow (simple — you are 2 people, not 10)

```
main            ← only working, demo-able code. Never push broken code here.
  └── dev-a     ← Developer A's working branch
  └── dev-b     ← Developer B's working branch
```

- No `develop` branch, no per-feature branches — that's overhead for 2 people in 8 hours.
- Commit small, commit often: **every 30–45 min**, even mid-feature ("wip: goal progress bar").
- Merge to `main` at each scheduled checkpoint (see timeline) — not continuously, to avoid interrupting flow, but at LEAST every 90 minutes so divergence never gets big.
- Merge order at each checkpoint: whoever finishes first merges to `main`, the other rebases/pulls before continuing.
- Conflict avoidance: since you own separate files, conflicts should only occur in the 4 shared files above — resolve those live, together, don't do it async.

**Commit message convention (just so history is readable, not for show):**
`feat(environmental): add goal progress calculation`
`fix(gamification): badge not auto-awarding at threshold`
`chore(shared): update schema for ComplianceIssue`

## 3. Hour-by-hour timeline (8 hours, adjust start time to your actual slot)

| Time | Dev A | Dev B | Shared / Checkpoint |
|---|---|---|---|
| 0:00–0:30 | Repo scaffold, Prisma schema first draft together | — | **Both:** agree schema, agree API contract shape, seed script skeleton |
| 0:30–1:30 | Auth backend + Dashboard skeleton + Env routes (CRUD skeletons) | Social + Governance route skeletons | Push to own branches every 30 min |
| 1:30–2:00 | — | — | **Checkpoint 1:** merge both branches → `main`. Confirm backend boots, seed runs |
| 2:00–3:30 | Emission Factors + Carbon Transactions + Goals (full CRUD + progress calc) | CSR Activities + Employee Participation (join/approve flow) | |
| 3:30–4:00 | — | — | **Checkpoint 2:** merge. Smoke test both modules against seeded data |
| 4:00–5:00 | Dashboard: wire real score aggregation, KPI tiles, charts | Challenges + Challenge Participation + XP awarding | |
| 5:00–5:30 | LUNCH/BREAK (stagger if needed, don't skip — fatigue kills the last 2 hours) | | |
| 5:30–6:30 | Reports module (1 real report + export) | Badges auto-award logic + Leaderboard | |
| 6:30–7:00 | — | — | **Checkpoint 3 (critical):** full merge, full click-through of app together, log every bug found |
| 7:00–7:30 | Bug fixes (Env/Reports side) | Bug fixes + Governance module if time allows (else cut) | Prioritize bugs that break the demo path, ignore cosmetic ones |
| 7:30–7:50 | — | — | **Freeze code.** Seed clean demo data. Do NOT commit anything after this without testing live |
| 7:50–8:00 | Demo dry run together, assign who says what | | |

**If you're behind at Checkpoint 2 (3:30):** cut Governance module entirely and Rewards redemption — go straight to Should/Could cuts in the scope doc. Don't try to catch up by skipping the 6:30 integration checkpoint — an untested merge at hour 7:50 is how demos crash.

## 4. Demo-day discipline
- Nobody merges to `main` in the last 20 minutes.
- Keep a running `BUGS.md` during Checkpoint 3 instead of fixing live — triage together, fix top 5 only.
