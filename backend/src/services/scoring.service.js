const db = require('../db');

// Environmental score: average goal progress % across a department's goals, capped at 100
async function computeEnvScore(departmentId) {
  const goals = await db.environmentalGoal.findMany({ where: { departmentId } });
  if (goals.length === 0) return 0;
  const progressSum = goals.reduce((sum, g) => {
    // goal is "reduce to target" so progress% = how close currentCo2 has come down toward target from a baseline
    // if currentCo2 <= targetCo2, goal met (100%), else scaled
    const simplePct = g.currentCo2 <= g.targetCo2 ? 100 : Math.max(0, 100 - ((g.currentCo2 - g.targetCo2) / g.targetCo2) * 100);
    return sum + simplePct;
  }, 0);
  return Math.round(progressSum / goals.length);
}

// Social score: % of CSR participations Approved (out of all participations for dept's employees)
async function computeSocialScore(departmentId) {
  const participations = await db.employeeParticipation.findMany({
    where: { employee: { departmentId } },
  });
  if (participations.length === 0) return 0;
  const approved = participations.filter(p => p.approvalStatus === 'Approved').length;
  return Math.round((approved / participations.length) * 100);
}

// Governance score: % policies acknowledged minus penalty per open compliance issue
async function computeGovScore(departmentId) {
  const policies = await db.eSGPolicy.findMany({
    where: { OR: [{ departmentId }, { departmentId: null }] },
  });
  const employees = await db.employee.findMany({ where: { departmentId } });
  let ackRate = 100;
  if (policies.length > 0 && employees.length > 0) {
    const totalExpected = policies.length * employees.length;
    const acks = await db.policyAcknowledgement.count({
      where: { policyId: { in: policies.map(p => p.id) }, employeeId: { in: employees.map(e => e.id) } },
    });
    ackRate = Math.round((acks / totalExpected) * 100);
  }
  const openIssues = await db.complianceIssue.count({ where: { departmentId, status: 'Open' } });
  const penalty = Math.min(50, openIssues * 10); // each open issue costs 10 points, capped
  return Math.max(0, ackRate - penalty);
}

// Weights — configurable later via Settings, hardcoded default for now
const WEIGHTS = { env: 0.4, social: 0.3, gov: 0.3 };

async function computeDepartmentScore(departmentId) {
  const [envScore, socialScore, govScore] = await Promise.all([
    computeEnvScore(departmentId),
    computeSocialScore(departmentId),
    computeGovScore(departmentId),
  ]);
  const totalScore = Math.round(
    envScore * WEIGHTS.env + socialScore * WEIGHTS.social + govScore * WEIGHTS.gov
  );
  return { departmentId, envScore, socialScore, govScore, totalScore };
}

async function computeOverallScore() {
  const departments = await db.department.findMany({ where: { status: 'Active' } });
  const scores = await Promise.all(departments.map(d => computeDepartmentScore(d.id)));
  const avg = (key) => Math.round(scores.reduce((sum, d) => sum + d[key], 0) / (scores.length || 1));
  return {
    environmental: avg('envScore'),
    social: avg('socialScore'),
    governance: avg('govScore'),
    overall: avg('totalScore'),
    byDepartment: scores,
  };
}

module.exports = {
  computeDepartmentScore,
  computeOverallScore,
  computeEnvScore,
  computeSocialScore,
  computeGovScore,
};
