const db = require('../db');
const { computeOverallScore } = require('../services/scoring.service');

async function getEnvironmentalReport(req, res) {
  try {
    const orgId = req.user.organizationId;
    if (!orgId) return res.status(400).json({ error: 'Organization ID is missing from user session.' });

    const { department_id, from, to } = req.query;

    const txParams = [orgId];
    let txIdx = 2;
    let txSql = `
      SELECT t.*, d.name AS "departmentName", d.code AS "departmentCode",
             ef.name AS "efName", ef.unit AS "efUnit", ef."co2PerUnit" AS "efCo2PerUnit", ef.source AS "efSource"
      FROM carbontransaction t
      INNER JOIN department d ON t."departmentId" = d.id
      INNER JOIN emissionfactor ef ON t."emissionFactorId" = ef.id
      WHERE d."organizationId" = $1
    `;
    if (department_id) { txSql += ` AND t."departmentId" = $${txIdx++}`; txParams.push(Number(department_id)); }
    if (from)          { txSql += ` AND t.date >= $${txIdx++}`;          txParams.push(new Date(from)); }
    if (to)            { txSql += ` AND t.date <= $${txIdx++}`;          txParams.push(new Date(to)); }
    txSql += ' ORDER BY t.date DESC';

    const { rows: txRows } = await db.query(txSql, txParams);
    const transactions = txRows.map(r => ({
      id: r.id, departmentId: r.departmentId, quantity: r.quantity, co2Calculated: r.co2Calculated,
      sourceType: r.sourceType, date: r.date,
      department: { name: r.departmentName, code: r.departmentCode },
      emissionFactor: { name: r.efName, unit: r.efUnit, co2PerUnit: r.efCo2PerUnit, source: r.efSource },
    }));

    const goalsParams = [orgId];
    let goalsIdx = 2;
    let goalsSql = `
      SELECT g.*, d.name AS "departmentName", d.code AS "departmentCode"
      FROM environmentalgoal g
      INNER JOIN department d ON g."departmentId" = d.id
      WHERE d."organizationId" = $1
    `;
    if (department_id) { goalsSql += ` AND g."departmentId" = $${goalsIdx++}`; goalsParams.push(Number(department_id)); }
    goalsSql += ' ORDER BY g.deadline ASC';

    const { rows: goalRows } = await db.query(goalsSql, goalsParams);
    const goals = goalRows.map(r => ({
      id: r.id, name: r.name, departmentId: r.departmentId, targetCo2: r.targetCo2,
      currentCo2: r.currentCo2, deadline: r.deadline, status: r.status,
      department: { name: r.departmentName, code: r.departmentCode },
    }));

    const totalCo2 = transactions.reduce((sum, t) => sum + t.co2Calculated, 0);
    return res.json({ totalCo2, transactionCount: transactions.length, transactions, goals });
  } catch (err) {
    console.error('Environmental report error:', err);
    return res.status(500).json({ error: 'Failed to generate environmental report' });
  }
}

async function getEsgSummary(req, res) {
  try {
    const orgId = req.user.organizationId;
    if (!orgId) return res.status(400).json({ error: 'Organization ID is missing from user session.' });
    const scores = await computeOverallScore(orgId);
    return res.json(scores);
  } catch (err) {
    console.error('ESG summary error:', err);
    return res.status(500).json({ error: 'Failed to generate ESG summary' });
  }
}

module.exports = { getEnvironmentalReport, getEsgSummary };
