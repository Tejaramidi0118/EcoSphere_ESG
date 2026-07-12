# EcoSphere — Project Brief & Scope (8-Hour Build)

Stack assumption: **React (frontend) + Node/Express (backend) + PostgreSQL (DB)**.
Team: **2 developers**. Total build time: ~8 hours (assume ~6.5h coding, 1h integration/buffer, 30min demo prep).

---

## 1. ESG in one page (so both devs and judges are aligned)

- **Environmental (E):** Measuring and reducing a company's physical footprint — carbon emissions, energy, waste. In EcoSphere: Emission Factors → Carbon Transactions → Environmental Goals → Environmental Score.
- **Social (S):** How the company treats people — employees, community. In EcoSphere: CSR Activities → Employee Participation → Diversity metrics → Social Score.
- **Governance (G):** Rules, ethics, compliance. In EcoSphere: Policies → Acknowledgements → Audits → Compliance Issues → Governance Score.
- **Why this is hard today:** ERPs capture operational data (purchases, manufacturing, HR) but ESG reporting is usually a separate manual spreadsheet exercise, done quarterly, disconnected from daily operations. EcoSphere's pitch is: **ESG is computed automatically from the same operational data the ERP already has**, plus gamification to drive employee participation (the weakest link in most ESG programs today).

## 2. The core business workflow (memorize this — it's your demo narrative)

```
Master Config (Departments, Emission Factors, Categories, Goals, Policies, Challenges)
        │
Daily Ops (Purchase / Manufacturing / Expense / Fleet) 
        │
Carbon Transactions (auto-calculated: qty × Emission Factor)
        │
Employee Participation (CSR) + Challenge Participation + Policy Ack + Audits
        │
Environmental Score / Social Score / Governance Score  (per Department)
        │
Department Total Score → Overall ESG Score (weighted: E 40% / S 30% / G 30%, configurable)
        │
Dashboard & Reports
```

**This single diagram is your elevator pitch.** If a judge asks "what does this app actually do," you trace this pipeline.

## 3. What judges are almost certainly scoring

1. **Does the core loop actually work end-to-end** (operational data → score → dashboard) — not just static UI.
2. **Is the data model coherent** (not just pretty screens with no real relationships).
3. **Gamification actually drives behavior** (XP, badges auto-awarding, leaderboard updating live) — this is the differentiator vs a plain ESG dashboard, so don't under-invest here.
4. **Polish of 1–2 screens done well** beats 7 screens done half-well.
5. **A crisp demo story**, not a feature list recited.

## 4. MoSCoW — decide this NOW, not at hour 7

### MUST HAVE (the demo dies without these)
- Auth (simple — even hardcoded roles: Admin / Employee is fine)
- Departments (CRUD, minimal)
- Emission Factors + Carbon Transactions (manual entry is fine; auto-calc from ops is a stretch goal)
- Environmental Goals with progress %
- CSR Activities + Employee Participation (join + approve flow)
- Challenges (at least Draft/Active/Completed) + Challenge Participation + XP awarding
- Badges (auto-award on XP threshold — this is a "wow" feature, cheap to build, keep it)
- Leaderboard (simple ranked query, sums XP)
- Dashboard with the 4 scores (E/S/G/Overall) — even a simplified score formula is fine
- One working report (pick Environmental or ESG Summary) with PDF or on-screen export

### SHOULD HAVE (build if Must-haves done by hour 5)
- Governance module (Policies, Acknowledgements, Audits, Compliance Issues) — can be the *thinnest* module since it has the least gamification payoff visually
- Rewards redemption (deduct XP/points)
- Notification system (in-app toast/list is enough — skip email entirely)
- Diversity Dashboard (simple bar/pie chart, static-ish data is OK)

### COULD HAVE (only if way ahead of schedule)
- Custom Report Builder with filters
- Auto emission calculation from Purchase/Manufacturing/Fleet records
- CSV/Excel export
- Mobile-responsive polish

### WON'T HAVE (explicitly cut — say this out loud to your teammate)
- AI-generated summaries / chatbot / NLG reports (nice line in the pitch deck, not worth build time — see note below)
- Real email delivery
- Multi-tenant/org support
- Full audit trail / tracked changes
- Fine-grained RBAC beyond Admin/Employee

> **On "AI Enhancements":** don't build a real AI feature under time pressure — instead, wire ONE lightweight call (e.g., "Generate ESG Summary" button that calls an LLM API with your computed scores and returns 3 sentences of narrative text). That's ~30 minutes of work for a genuine demo "wow," vs hours for a chatbot nobody asked for. Treat it as a stretch, not a pillar.

## 5. Score formula (concrete, so you're not inventing it live)

```
DeptEnvScore  = weighted avg of (Goal progress %, capped 100)
DeptSocialScore = weighted avg of (CSR participation rate, Diversity index)
DeptGovScore   = weighted avg of (Policy ack rate, 100 - open compliance issues penalty)
DeptTotalScore = 0.4*Env + 0.3*Social + 0.3*Gov   (per spec's default weighting)
OverallESGScore = avg(DeptTotalScore across departments), or weighted by employee count
```
Keep the exact formula simple and documented in one place (`scoring.js`) — judges will forgive a simple formula, they won't forgive an unexplained magic number on the dashboard.
