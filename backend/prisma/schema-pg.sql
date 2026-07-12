-- EcoSphere ESG Platform — PostgreSQL Schema for Supabase
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

CREATE TABLE IF NOT EXISTS organization (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(255) NOT NULL,
  size VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS department (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(255) NOT NULL,
  head VARCHAR(255) NOT NULL,
  "parentDepartmentId" INT NULL REFERENCES department(id) ON DELETE SET NULL,
  "employeeCount" INT NOT NULL DEFAULT 0,
  status VARCHAR(255) NOT NULL DEFAULT 'Active',
  "organizationId" INT NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  UNIQUE ("organizationId", code)
);
CREATE INDEX IF NOT EXISTS idx_dept_status ON department(status);
CREATE INDEX IF NOT EXISTS idx_dept_org ON department("organizationId");

CREATE TABLE IF NOT EXISTS employee (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  "passwordHash" VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL DEFAULT 'employee',
  "departmentId" INT NOT NULL REFERENCES department(id) ON DELETE RESTRICT,
  "xpTotal" INT NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "organizationId" INT NOT NULL REFERENCES organization(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_emp_org ON employee("organizationId");

CREATE TABLE IF NOT EXISTS category (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  status VARCHAR(255) NOT NULL DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS emissionfactor (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(255) NOT NULL,
  "co2PerUnit" DOUBLE PRECISION NOT NULL,
  source VARCHAR(255) NOT NULL DEFAULT 'DESNZ 2026'
);

CREATE TABLE IF NOT EXISTS carbontransaction (
  id SERIAL PRIMARY KEY,
  "departmentId" INT NOT NULL REFERENCES department(id) ON DELETE RESTRICT,
  "emissionFactorId" INT NOT NULL REFERENCES emissionfactor(id) ON DELETE RESTRICT,
  quantity DOUBLE PRECISION NOT NULL,
  "co2Calculated" DOUBLE PRECISION NOT NULL,
  "sourceType" VARCHAR(255) NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tx_dept ON carbontransaction("departmentId");
CREATE INDEX IF NOT EXISTS idx_tx_date ON carbontransaction(date);

CREATE TABLE IF NOT EXISTS environmentalgoal (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  "departmentId" INT NOT NULL REFERENCES department(id) ON DELETE RESTRICT,
  "targetCo2" DOUBLE PRECISION NOT NULL,
  "currentCo2" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  deadline TIMESTAMP NOT NULL,
  status VARCHAR(255) NOT NULL DEFAULT 'Active'
);
CREATE INDEX IF NOT EXISTS idx_goal_dept ON environmentalgoal("departmentId");
CREATE INDEX IF NOT EXISTS idx_goal_status ON environmentalgoal(status);

CREATE TABLE IF NOT EXISTS esgpolicy (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  "departmentId" INT NULL REFERENCES department(id) ON DELETE SET NULL,
  version VARCHAR(255) NOT NULL DEFAULT '1.0',
  status VARCHAR(255) NOT NULL DEFAULT 'Active',
  "organizationId" INT NOT NULL REFERENCES organization(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_policy_org ON esgpolicy("organizationId");

CREATE TABLE IF NOT EXISTS policyacknowledgement (
  id SERIAL PRIMARY KEY,
  "policyId" INT NOT NULL REFERENCES esgpolicy(id) ON DELETE CASCADE,
  "employeeId" INT NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
  "acknowledgedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  "departmentId" INT NOT NULL REFERENCES department(id) ON DELETE RESTRICT,
  "auditorName" VARCHAR(255) NOT NULL,
  date TIMESTAMP NOT NULL,
  "findingsSummary" TEXT NOT NULL,
  status VARCHAR(255) NOT NULL DEFAULT 'Scheduled'
);

CREATE TABLE IF NOT EXISTS complianceissue (
  id SERIAL PRIMARY KEY,
  "auditId" INT NULL REFERENCES audit(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  severity VARCHAR(255) NOT NULL,
  "departmentId" INT NOT NULL REFERENCES department(id) ON DELETE RESTRICT,
  "ownerEmployeeId" INT NOT NULL REFERENCES employee(id) ON DELETE RESTRICT,
  "dueDate" TIMESTAMP NOT NULL,
  status VARCHAR(255) NOT NULL DEFAULT 'Open',
  description TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_comp_status ON complianceissue(status);
CREATE INDEX IF NOT EXISTS idx_comp_dept ON complianceissue("departmentId");

CREATE TABLE IF NOT EXISTS csractivity (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  "categoryId" INT NOT NULL REFERENCES category(id) ON DELETE RESTRICT,
  description TEXT NOT NULL,
  "evidenceRequired" BOOLEAN NOT NULL DEFAULT TRUE,
  status VARCHAR(255) NOT NULL DEFAULT 'Open',
  "organizationId" INT NOT NULL REFERENCES organization(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_csr_org ON csractivity("organizationId");

CREATE TABLE IF NOT EXISTS employeeparticipation (
  id SERIAL PRIMARY KEY,
  "employeeId" INT NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
  "csrActivityId" INT NOT NULL REFERENCES csractivity(id) ON DELETE CASCADE,
  "proofUrl" VARCHAR(255) NULL,
  "approvalStatus" VARCHAR(255) NOT NULL DEFAULT 'Pending',
  "pointsEarned" INT NOT NULL DEFAULT 0,
  "completionDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_part_status ON employeeparticipation("approvalStatus");

CREATE TABLE IF NOT EXISTS challenge (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  "categoryId" INT NOT NULL REFERENCES category(id) ON DELETE RESTRICT,
  description TEXT NOT NULL,
  xp INT NOT NULL,
  difficulty VARCHAR(255) NOT NULL,
  "evidenceRequired" BOOLEAN NOT NULL DEFAULT TRUE,
  deadline TIMESTAMP NOT NULL,
  status VARCHAR(255) NOT NULL DEFAULT 'Draft',
  "organizationId" INT NOT NULL REFERENCES organization(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_chal_status ON challenge(status);
CREATE INDEX IF NOT EXISTS idx_chal_org ON challenge("organizationId");

CREATE TABLE IF NOT EXISTS challengeparticipation (
  id SERIAL PRIMARY KEY,
  "challengeId" INT NOT NULL REFERENCES challenge(id) ON DELETE CASCADE,
  "employeeId" INT NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
  "progressPct" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  "proofUrl" VARCHAR(255) NULL,
  "approvalStatus" VARCHAR(255) NOT NULL DEFAULT 'Pending',
  "xpAwarded" INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS badge (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  icon VARCHAR(255) NOT NULL,
  "unlockRule" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS employeebadge (
  id SERIAL PRIMARY KEY,
  "employeeId" INT NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
  "badgeId" INT NOT NULL REFERENCES badge(id) ON DELETE CASCADE,
  "awardedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reward (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  "pointsRequired" INT NOT NULL,
  stock INT NOT NULL,
  status VARCHAR(255) NOT NULL DEFAULT 'Active',
  "organizationId" INT NOT NULL REFERENCES organization(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_rew_org ON reward("organizationId");

CREATE TABLE IF NOT EXISTS rewardredemption (
  id SERIAL PRIMARY KEY,
  "employeeId" INT NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
  "rewardId" INT NOT NULL REFERENCES reward(id) ON DELETE CASCADE,
  "redeemedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "pointsDeducted" INT NOT NULL
);

CREATE TABLE IF NOT EXISTS departmentscore (
  id SERIAL PRIMARY KEY,
  "departmentId" INT NOT NULL REFERENCES department(id) ON DELETE CASCADE,
  "envScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  "socialScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  "govScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  "computedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification (
  id SERIAL PRIMARY KEY,
  "employeeId" INT NULL REFERENCES employee(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  message VARCHAR(255) NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
