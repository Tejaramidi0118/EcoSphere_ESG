# EcoSphere — API Spec (REST, JSON)

Base URL: `/api`. All routes except `/auth/login` require `Authorization: Bearer <jwt>`.
`[admin]` = admin-only route.

## Auth
```
POST /auth/login          { email, password } → { token, user }
GET  /auth/me             → current user profile
```

## Departments (Settings) — Dev B
```
GET    /departments
POST   /departments                [admin]
PUT    /departments/:id            [admin]
DELETE /departments/:id            [admin]
```

## Categories (Settings) — Dev B
```
GET    /categories?type=CSR_ACTIVITY|CHALLENGE
POST   /categories                 [admin]
```

## Environmental — Dev A
```
GET    /environmental/emission-factors
POST   /environmental/emission-factors        [admin]

GET    /environmental/carbon-transactions?department_id=&from=&to=
POST   /environmental/carbon-transactions     { department_id, emission_factor_id, quantity, source_type, date }
                                               → server computes co2_calculated

GET    /environmental/goals?department_id=&status=
POST   /environmental/goals                   [admin]
PUT    /environmental/goals/:id
DELETE /environmental/goals/:id                [admin]
```

## Social — Dev B
```
GET    /social/csr-activities
POST   /social/csr-activities                 [admin]

POST   /social/participation                  { csr_activity_id, proof_url } → creates as Pending
GET    /social/participation?status=Pending
PUT    /social/participation/:id/approve       [admin]  → sets Approved, awards points, triggers notification
PUT    /social/participation/:id/reject        [admin]

GET    /social/diversity-metrics               (simple aggregation: gender/age-band counts, can be seeded static)
```

## Governance — Dev B
```
GET    /governance/policies
POST   /governance/policies                    [admin]

POST   /governance/policies/:id/acknowledge     (current employee acknowledges)
GET    /governance/policies/:id/acknowledgements

GET    /governance/audits
POST   /governance/audits                       [admin]

GET    /governance/compliance-issues?status=&severity=
POST   /governance/compliance-issues            [admin]  { audit_id?, title, severity, department_id, owner_employee_id, due_date }
PUT    /governance/compliance-issues/:id         [admin]  (update status → triggers notification if overdue+open)
```

## Gamification — Dev B
```
GET    /gamification/challenges?status=
POST   /gamification/challenges                 [admin]
PUT    /gamification/challenges/:id/status      [admin]  (Draft→Active→Under Review→Completed, or →Archived any time)

POST   /gamification/challenge-participation     { challenge_id, progress_pct, proof_url }
PUT    /gamification/challenge-participation/:id/approve  [admin] → awards XP, triggers badge check

GET    /gamification/badges
GET    /gamification/my-badges

GET    /gamification/rewards
POST   /gamification/rewards/:id/redeem          (checks stock + XP balance, deducts)

GET    /gamification/leaderboard?scope=employee|department
```

## Reports — Dev A
```
GET  /reports/environmental?department_id=&from=&to=
GET  /reports/social?department_id=&from=&to=
GET  /reports/governance?department_id=&from=&to=
GET  /reports/esg-summary?department_id=&from=&to=
POST /reports/custom  { filters: { department_id, from, to, module, employee_id, challenge_id, esg_category } }
GET  /reports/:type/export?format=pdf|excel|csv     (stretch goal)
```

## Dashboard (aggregation) — Dev A
```
GET /dashboard/summary
  → { environmental_score, social_score, governance_score, overall_score,
      emissions_trend: [...], department_ranking: [...], recent_activity: [...] }
```

## Notifications — shared
```
GET /notifications          (current user's, or broadcast)
PUT /notifications/:id/read
```

## Settings / ESG Configuration — Dev B
```
GET  /settings/esg-config
PUT  /settings/esg-config   [admin]  { auto_emission_calc, evidence_required_default, auto_badge_award, weights: {env, social, gov} }
```
