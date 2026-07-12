const db = require('../db');
const badgeService = require('../services/badge.service');

exports.getCSRActivities = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT a.*, c.name AS "categoryName", c.type AS "categoryType"
       FROM csractivity a
       LEFT JOIN category c ON a."categoryId" = c.id
       WHERE a."organizationId" = $1`,
      [req.user.organizationId]
    );
    const formatted = rows.map(r => ({
      id: r.id,
      title: r.title,
      categoryId: r.categoryId,
      description: r.description,
      evidenceRequired: r.evidenceRequired,
      status: r.status,
      organizationId: r.organizationId,
      category: {
        name: r.categoryName,
        type: r.categoryType
      }
    }));
    res.json(formatted);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getActivityById = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT a.*, c.name AS "categoryName", c.type AS "categoryType"
       FROM csractivity a
       LEFT JOIN category c ON a."categoryId" = c.id
       WHERE a.id = $1`,
      [Number(req.params.id)]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    const r = rows[0];
    const formatted = {
      id: r.id,
      title: r.title,
      categoryId: r.categoryId,
      description: r.description,
      evidenceRequired: r.evidenceRequired,
      status: r.status,
      organizationId: r.organizationId,
      category: {
        name: r.categoryName,
        type: r.categoryType
      }
    };
    res.json(formatted);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createCSRActivity = async (req, res) => {
  try {
    const { title, categoryId, description, evidenceRequired, status } = req.body;
    const { rows } = await db.query(
      `INSERT INTO csractivity (title, "categoryId", description, "evidenceRequired", status, "organizationId")
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, categoryId, description, evidenceRequired ?? true, status || 'Open', req.user.organizationId]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.joinActivity = async (req, res) => {
  try {
    const { csrActivityId, proofUrl } = req.body;
    const { rows } = await db.query(
      `INSERT INTO employeeparticipation ("employeeId", "csrActivityId", "proofUrl", "approvalStatus", "pointsEarned")
       VALUES ($1, $2, $3, 'Pending', 0) RETURNING *`,
      [req.user.id, Number(csrActivityId), proofUrl || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getParticipations = async (req, res) => {
  try {
    const { status } = req.query;

    let sql = `
      SELECT p.*, 
             e.name AS "employeeName", e.email AS "employeeEmail",
             a.title AS "activityTitle", a.description AS "activityDescription"
      FROM employeeparticipation p
      INNER JOIN employee e ON p."employeeId" = e.id
      INNER JOIN csractivity a ON p."csrActivityId" = a.id
      WHERE e."organizationId" = $1
    `;
    const params = [req.user.organizationId];

    if (status) {
      sql += ' AND p."approvalStatus" = $2';
      params.push(status);
    }

    const { rows } = await db.query(sql, params);

    const formatted = rows.map(r => ({
      id: r.id,
      employee_id: r.employeeId,
      proof_url: r.proofUrl,
      approvalStatus: r.approvalStatus,
      pointsEarned: r.pointsEarned,
      completionDate: r.completionDate,
      employee: {
        name: r.employeeName,
        email: r.employeeEmail
      },
      csrActivity: {
        title: r.activityTitle,
        description: r.activityDescription
      }
    }));

    res.json(formatted);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.approveParticipation = async (req, res) => {
  try {
    const { id } = req.params;
    const { points } = req.body || {};

    const partRes = await db.query(
      `SELECT p.* FROM employeeparticipation p WHERE p.id = $1`,
      [Number(id)]
    );
    if (!partRes.rows[0]) return res.status(404).json({ error: 'Participation request not found' });
    const part = partRes.rows[0];

    const pointsAwarded = Number(points) || 50;

    const { rows } = await db.query(
      `UPDATE employeeparticipation SET "approvalStatus" = 'Approved', "pointsEarned" = $1 WHERE id = $2 RETURNING *`,
      [pointsAwarded, Number(id)]
    );
    const updatedPart = rows[0];

    await db.query(
      `UPDATE employee SET "xpTotal" = "xpTotal" + $1 WHERE id = $2`,
      [pointsAwarded, updatedPart.employeeId]
    );
    await badgeService.checkAndAwardBadges(updatedPart.employeeId);

    res.json(updatedPart);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.rejectParticipation = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      `UPDATE employeeparticipation SET "approvalStatus" = 'Rejected', "pointsEarned" = 0 WHERE id = $1 RETURNING *`,
      [Number(id)]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
