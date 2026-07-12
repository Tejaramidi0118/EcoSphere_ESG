const { computeOverallScore } = require('../services/scoring.service');
const db = require('../db');

async function getSummary(req, res) {
  try {
    const orgId = req.user.organizationId;
    if (!orgId) return res.status(400).json({ error: 'Organization ID is missing from user session.' });

    const scores = await computeOverallScore(orgId);

    const { rows: emissionsRows } = await db.query(
      `SELECT DATE(t.date) AS date, SUM(t."co2Calculated") AS co2
       FROM carbontransaction t
       INNER JOIN department d ON t."departmentId" = d.id
       WHERE d."organizationId" = $1
       GROUP BY DATE(t.date)
       ORDER BY DATE(t.date) ASC`,
      [orgId]
    );

    const { rows: activityRows } = await db.query(
      `SELECT n.* FROM notification n
       WHERE n."employeeId" IS NULL
          OR n."employeeId" IN (SELECT id FROM employee WHERE "organizationId" = $1)
       ORDER BY n."createdAt" DESC
       LIMIT 5`,
      [orgId]
    );

    return res.json({
      environmental_score: scores.environmental,
      social_score: scores.social,
      governance_score: scores.governance,
      overall_score: scores.overall,
      department_ranking: scores.byDepartment,
      emissions_trend: emissionsRows.map(t => ({ date: t.date, co2: t.co2 })),
      recent_activity: activityRows,
    });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    return res.status(500).json({ error: 'Failed to compute dashboard summary' });
  }
}

module.exports = { getSummary };
