const { computeOverallScore } = require('../services/scoring.service');
const db = require('../db');

async function getSummary(req, res) {
  try {
    const orgId = req.user.organizationId;
    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID is missing from user session.' });
    }

    const scores = await computeOverallScore(orgId);

    // Group emissions by date, scoped to the current organization
    const emissionsTrend = await db.carbonTransaction.groupBy({
      by: ['date'],
      where: {
        department: { organizationId: orgId }
      },
      _sum: { co2Calculated: true },
      orderBy: { date: 'asc' },
    });

    // Retrieve recent notifications, scoped to organization or global broadcasts
    const recentActivity = await db.notification.findMany({
      where: {
        OR: [
          { employeeId: null },
          { employee: { organizationId: orgId } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return res.json({
      environmental_score: scores.environmental,
      social_score: scores.social,
      governance_score: scores.governance,
      overall_score: scores.overall,
      department_ranking: scores.byDepartment,
      emissions_trend: emissionsTrend.map(t => ({
        date: t.date,
        co2: t._sum.co2Calculated,
      })),
      recent_activity: recentActivity,
    });
  } catch (err) {
    console.error('Failed to compute dashboard summary:', err);
    return res.status(500).json({ error: 'Failed to compute dashboard summary' });
  }
}

module.exports = { getSummary };
