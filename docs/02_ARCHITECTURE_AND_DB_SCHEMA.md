# EcoSphere — Architecture & Database Schema

## 1. Tech stack (fastest-to-ship choice for 8h, 2 devs)

- **Frontend:** React (Vite) + React Router + Recharts (charts) + plain CSS or Tailwind
- **Backend:** Node.js + Express, REST JSON API
- **DB:** PostgreSQL (or SQLite if you want zero setup time — swap later is trivial with an ORM)
- **ORM:** Prisma (fastest schema-to-code loop) or Sequelize
- **Auth:** JWT, 2 roles only — `admin`, `employee`
- **State management (frontend):** React Context for `currentUser` + local component state / SWR-style fetch hooks. Do NOT set up Redux — pure overhead for 8h.
- **Hosting for demo:** run locally, or one-click deploy (Vercel for frontend, Render/Railway for backend) *only if* you have 15 spare minutes near the end — don't risk deployment problems during the demo window.

## 2. Repo / folder structure

```
ecosphere/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── environmental.routes.js   (Dev A)
│   │   │   ├── social.routes.js          (Dev B)
│   │   │   ├── governance.routes.js      (Dev B)
│   │   │   ├── gamification.routes.js    (Dev B)
│   │   │   ├── reports.routes.js         (Dev A)
│   │   │   └── settings.routes.js        (Dev B)
│   │   ├── controllers/     (mirrors routes, 1 file each)
│   │   ├── models/           (Prisma schema OR Sequelize models)
│   │   ├── services/
│   │   │   ├── scoring.service.js        (THE score formula — shared, touch carefully)
│   │   │   ├── badge.service.js           (auto-award logic)
│   │   │   └── notification.service.js
│   │   ├── middleware/auth.js
│   │   └── app.js
│   ├── prisma/schema.prisma
│   └── seed.js
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx             (Dev A)
│   │   │   ├── environmental/            (Dev A)
│   │   │   ├── reports/                  (Dev A)
│   │   │   ├── social/                   (Dev B)
│   │   │   ├── governance/                (Dev B)
│   │   │   ├── gamification/             (Dev B)
│   │   │   └── settings/                 (Dev B)
│   │   ├── components/       (shared: Sidebar, Topbar, ScoreCard, Table, Modal)
│   │   ├── api/               (one file per module, thin fetch wrappers)
│   │   ├── context/AuthContext.jsx
│   │   └── App.jsx
└── README.md
```

**Key rule to avoid merge conflicts:** each dev only touches files inside their own `routes/`, `pages/<their-module>/`, `controllers/`. Shared files (`Sidebar.jsx`, `scoring.service.js`, `schema.prisma`, `App.jsx` routes list) are touched by ONE person at a time, and only during the scheduled merge windows (see timeline doc).

## 3. Database schema (Postgres / Prisma-style, simplified for 8h)

```
Department
  id, name, code, head, parent_department_id (self-fk, nullable), employee_count, status

Employee
  id, name, email, password_hash, role (admin/employee), department_id (fk), xp_total, created_at

Category
  id, name, type (CSR_ACTIVITY | CHALLENGE), status

EmissionFactor
  id, name, unit, co2_per_unit, source (e.g. "DEFRA 2024")

CarbonTransaction
  id, department_id (fk), emission_factor_id (fk), quantity, co2_calculated, source_type (Purchase/Manufacturing/Expense/Fleet/Manual), date

EnvironmentalGoal
  id, name, department_id (fk), target_co2, current_co2 (derived or cached), deadline, status (Active/On Track/Completed/Missed)

ESGPolicy
  id, title, description, department_id (fk, nullable = org-wide), version, status

PolicyAcknowledgement
  id, policy_id (fk), employee_id (fk), acknowledged_at

Audit
  id, title, department_id (fk), auditor_name, date, findings_summary, status (Scheduled/Under Review/Completed)

ComplianceIssue
  id, audit_id (fk, nullable), title, severity (Low/Medium/High), department_id (fk), owner_employee_id (fk), due_date, status (Open/Resolved), description

CSRActivity
  id, title, category_id (fk), description, evidence_required (bool), status (Open/Closed)

EmployeeParticipation
  id, employee_id (fk), csr_activity_id (fk), proof_url, approval_status (Pending/Approved/Rejected), points_earned, completion_date

Challenge
  id, title, category_id (fk), description, xp, difficulty (Easy/Medium/Hard), evidence_required (bool), deadline, status (Draft/Active/Under Review/Completed/Archived)

ChallengeParticipation
  id, challenge_id (fk), employee_id (fk), progress_pct, proof_url, approval_status, xp_awarded

Badge
  id, name, description, icon, unlock_rule (JSON: {type: 'xp'|'challenges_completed', threshold: N})

EmployeeBadge
  id, employee_id (fk), badge_id (fk), awarded_at

Reward
  id, name, description, points_required, stock, status

RewardRedemption
  id, employee_id (fk), reward_id (fk), redeemed_at, points_deducted

DepartmentScore
  id, department_id (fk), env_score, social_score, gov_score, total_score, computed_at

Notification
  id, employee_id (fk, nullable = broadcast), type, message, is_read, created_at
```

**Relationships to double check before you start coding (common bugs):**
- `Department.parent_department_id` is self-referential — handle null root case.
- `CarbonTransaction` should be computable from `quantity * EmissionFactor.co2_per_unit` — do this calc in the service layer, not trusted from frontend input.
- `EmployeeParticipation` and `ChallengeParticipation` are separate tables (spec is explicit about this — don't merge them).
- `ComplianceIssue.due_date` past + `status = Open` → triggers a notification (a scheduled check or computed on read is fine for 8h; don't build a cron job).

## 4. API surface (see `04_API_SPEC.md` for full list) — high level groups
`/auth`, `/departments`, `/environmental/*`, `/social/*`, `/governance/*`, `/gamification/*`, `/reports/*`, `/settings/*`

## 5. Auth (keep it minimal)
- JWT on login, stored in localStorage on frontend.
- Middleware checks token + role for admin-only routes (Settings, approvals).
- Seed 1 admin + ~6 employees across 3 departments (see seed data doc) so demo data looks real immediately.
