const db = require('../db');
const { computeOverallScore } = require('../services/scoring.service');

async function getEnvironmentalReport(req, res) {
  try {
    const orgId = req.user.organizationId;
    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID is missing from user session.' });
    }

    const { department_id, from, to } = req.query;
    const where = {
      department: { organizationId: orgId }
    };

    if (department_id) {
      where.departmentId = Number(department_id);
    }

    if (from || to) {
      where.date = {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to) }),
      };
    }

    const transactions = await db.carbonTransaction.findMany({
      where,
      include: { emissionFactor: true, department: true },
    });

    const goalsWhere = {
      department: { organizationId: orgId }
    };
    if (department_id) {
      goalsWhere.departmentId = Number(department_id);
    }

    const goals = await db.environmentalGoal.findMany({
      where: goalsWhere,
      include: { department: true },
    });

    const totalCo2 = transactions.reduce((sum, t) => sum + t.co2Calculated, 0);

    return res.json({
      totalCo2,
      transactionCount: transactions.length,
      transactions,
      goals,
    });
  } catch (error) {
    console.error('Failed to generate environmental report:', error);
    return res.status(500).json({ error: 'Failed to generate environmental report' });
  }
}

async function getEsgSummary(req, res) {
  try {
    const orgId = req.user.organizationId;
    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID is missing from user session.' });
    }

    const scores = await computeOverallScore(orgId);
    return res.json(scores);
  } catch (error) {
    console.error('Failed to generate ESG summary:', error);
    return res.status(500).json({ error: 'Failed to generate ESG summary' });
  }
}

module.exports = { getEnvironmentalReport, getEsgSummary };
