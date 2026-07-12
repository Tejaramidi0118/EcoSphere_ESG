const db = require('../db');

// Environmental: average goal-progress % for dept's goals (higher = better, means under target)
async function computeEnvScore(departmentId) {
  try {
    const { rows } = await db.query(
      `SELECT "currentCo2", "targetCo2" FROM environmentalgoal WHERE "departmentId" = $1`,
      [departmentId]
    );
    if (rows.length === 0) return 0;
    const sum = rows.reduce((acc, g) => {
      const pct = g.currentCo2 <= g.targetCo2
        ? 100
        : Math.max(0, 100 - ((g.currentCo2 - g.targetCo2) / g.targetCo2) * 100);
      return acc + pct;
    }, 0);
    return Math.round(sum / rows.length);
  } catch (err) {
    console.error('computeEnvScore error:', err);
    return 0;
  }
}

// Social: % of dept employees' participations that are Approved
async function computeSocialScore(departmentId) {
  try {
    const { rows } = await db.query(
      `SELECT p."approvalStatus"
       FROM employeeparticipation p
       INNER JOIN employee e ON p."employeeId" = e.id
       WHERE e."departmentId" = $1`,
      [departmentId]
    );
    if (rows.length === 0) return 0;
    const approved = rows.filter(r => r.approvalStatus === 'Approved').length;
    return Math.round((approved / rows.length) * 100);
  } catch (err) {
    console.error('computeSocialScore error:', err);
    return 0;
  }
}

// Governance: acknowledgement rate minus open compliance issue penalty
async function computeGovScore(departmentId, organizationId) {
  try {
    const { rows: policies } = await db.query(
      `SELECT id FROM esgpolicy WHERE "organizationId" = $1 AND ("departmentId" = $2 OR "departmentId" IS NULL)`,
      [organizationId, departmentId]
    );
    const { rows: employees } = await db.query(
      `SELECT id FROM employee WHERE "departmentId" = $1`,
      [departmentId]
    );

    let ackRate = 100;
    if (policies.length > 0 && employees.length > 0) {
      const totalExpected = policies.length * employees.length;
      const policyIds = policies.map(p => p.id);
      const employeeIds = employees.map(e => e.id);

      // PostgreSQL uses ANY($1) for array containment
      const { rows: ackRows } = await db.query(
        `SELECT COUNT(id) AS count FROM policyacknowledgement WHERE "policyId" = ANY($1) AND "employeeId" = ANY($2)`,
        [policyIds, employeeIds]
      );
      const acks = parseInt(ackRows[0]?.count || 0, 10);
      ackRate = Math.round((acks / totalExpected) * 100);
    }

    const { rows: issueRows } = await db.query(
      `SELECT COUNT(id) AS count FROM complianceissue WHERE "departmentId" = $1 AND status = 'Open'`,
      [departmentId]
    );
    const openIssues = parseInt(issueRows[0]?.count || 0, 10);
    const penalty = Math.min(50, openIssues * 10);
    return Math.max(0, ackRate - penalty);
  } catch (err) {
    console.error('computeGovScore error:', err);
    return 0;
  }
}

const WEIGHTS = { env: 0.4, social: 0.3, gov: 0.3 };

async function computeDepartmentScore(departmentId, organizationId) {
  const [envScore, socialScore, govScore] = await Promise.all([
    computeEnvScore(departmentId),
    computeSocialScore(departmentId),
    computeGovScore(departmentId, organizationId),
  ]);

  const totalScore = Math.round(envScore * WEIGHTS.env + socialScore * WEIGHTS.social + govScore * WEIGHTS.gov);

  const { rows: depts } = await db.query('SELECT name FROM department WHERE id = $1', [departmentId]);
  const deptName = depts[0]?.name || `Department ${departmentId}`;

  const { rows: employees } = await db.query(
    `SELECT id, name, "xpTotal" FROM employee WHERE "departmentId" = $1 ORDER BY "xpTotal" DESC`,
    [departmentId]
  );

  return { departmentId, departmentName: deptName, envScore, socialScore, govScore, totalScore, employees };
}

async function computeOverallScore(organizationId) {
  if (!organizationId) throw new Error('organizationId is required.');

  const { rows: departments } = await db.query(
    `SELECT id FROM department WHERE "organizationId" = $1 AND status = 'Active'`,
    [organizationId]
  );

  const scores = await Promise.all(departments.map(d => computeDepartmentScore(d.id, organizationId)));
  const sortedScores = scores.sort((a, b) => b.totalScore - a.totalScore);

  const avg = (key) => Math.round(scores.reduce((sum, d) => sum + d[key], 0) / (scores.length || 1));
  return {
    environmental: avg('envScore'),
    social: avg('socialScore'),
    governance: avg('govScore'),
    overall: avg('totalScore'),
    byDepartment: sortedScores,
  };
}

module.exports = { computeDepartmentScore, computeOverallScore, computeEnvScore, computeSocialScore, computeGovScore };
