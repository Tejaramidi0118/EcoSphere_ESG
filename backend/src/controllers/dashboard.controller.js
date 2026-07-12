const { computeOverallScore } = require('../services/scoring.service');
const db = require('../db');

async function getSummary(req, res) {
  try {
    const scores = await computeOverallScore();

    // Group emissions by date to show trends
    const emissionsTrend = await db.carbonTransaction.groupBy({
      by: ['date'],
      _sum: { co2Calculated: true },
      orderBy: { date: 'asc' },
    });

    // Retrieve recent notification logs for the activity board
    const recentActivity = await db.notification.findMany({
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
