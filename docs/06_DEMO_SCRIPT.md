# EcoSphere — Demo Script (aim for 4–5 minutes)

## 1. Opening (20 sec) — the problem
"Companies have ESG obligations but their data lives in spreadsheets, disconnected from actual operations, and employee participation is usually near zero because there's no incentive to engage. EcoSphere fixes both: it computes ESG scores directly from operational data, and gamifies participation."

## 2. Dashboard (45 sec)
Show the Executive Dashboard first — 4 score tiles (Environmental/Social/Governance/Overall), emissions trend chart, department ranking.
Say the formula out loud once: *"Overall score is a weighted average — 40% Environmental, 30% Social, 30% Governance, and that weighting is configurable per organization in Settings."*

## 3. Environmental walkthrough (45 sec)
Go to Environmental → show an Emission Factor, then a Carbon Transaction being logged, then flip to Environmental Goals and show the progress bar move.
Say: *"This is normally where an ERP just stops — we turn the raw transaction into a live sustainability KPI automatically."*

## 4. Social + Gamification — the differentiator (90 sec, spend the most time here)
- Show CSR Activities → join an activity → approval queue → approve it live.
- Cut to Challenges → show XP being awarded on approval → Badge unlocking automatically (this is your best "wow" moment — rehearse it so it fires cleanly).
- Show Leaderboard updating.
Say: *"This is the part most ESG platforms skip — turning compliance into something employees actually want to do."*

## 5. Governance (20 sec, keep brief — it's the least visually exciting module)
Show one Policy Acknowledgement and one Compliance Issue with an owner + due date.

## 6. Reports (30 sec)
Generate one report live (Environmental or ESG Summary). If you built the "AI narrative" stretch feature, this is where it goes — one sentence of generated commentary on the score.

## 7. Close (20 sec) — business value + future scope
"In production this plugs into a real ERP's Purchase/Manufacturing/Fleet modules for fully automatic emissions tracking, and the gamification layer is what drives the employee-participation numbers ESG reports actually need. Next steps: multi-org support, real-time IoT emissions feeds, and deeper AI-driven recommendations."

---

## Anticipated judge questions (rehearse answers, don't improvise)

**"How is the score actually calculated?"**
→ Point to the formula, say it's configurable, say you kept it deliberately transparent/simple rather than a black box, because ESG reporting needs to be auditable.

**"What's real vs mocked in this demo?"**
→ Be honest: "All CRUD and the score/XP/badge logic runs live against Postgres. [X] is seeded data for demo speed, [Y] would connect to a real ERP feed in production." Judges respect honesty about scope far more than a bluff.

**"Why gamification for something as serious as compliance?"**
→ Employee engagement is the #1 blocker for ESG program adoption in industry surveys — gamification is a proven lever (same mechanic as internal L&D/wellness platforms), not a gimmick bolted onto a serious topic.

**"How does this scale to multiple organizations?"**
→ Add an `organization_id` to every table (schema already supports this pattern via Department hierarchy) — architecturally it's a straightforward multi-tenancy addition, just cut for time today.

**"What would you build next with more time?"**
→ Auto emission calculation wired to real Purchase/Manufacturing/Fleet records, Custom Report Builder, real notification delivery (email/Slack), and the AI summary as a full feature rather than a single call.

## Roles during demo
- **Driver:** one person clicks through the app (whoever is faster/calmer under pressure).
- **Narrator:** the other talks — problem, architecture, business value — while driver clicks. Don't have one person do both; it looks rushed.
- Do a **full dry run at hour 7:50** exactly as planned in the timeline — not "in your head," actually click through it once, out loud.
