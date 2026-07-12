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
    res.json(rows);
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
    res.json(rows[0]);
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
    const { rows } = await db.query(
      `SELECT p.*, e.name AS "employeeName", a.title AS "activityTitle"
       FROM employeeparticipation p
       INNER JOIN employee e ON p."employeeId" = e.id
       INNER JOIN csractivity a ON p."csrActivityId" = a.id
       WHERE e."organizationId" = $1`,
      [req.user.organizationId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.approveParticipation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, points } = req.body;
    const { rows } = await db.query(
      `UPDATE employeeparticipation SET "approvalStatus" = $1, "pointsEarned" = $2 WHERE id = $3 RETURNING *`,
      [status || 'Approved', Number(points) || 50, Number(id)]
    );
    const part = rows[0];

    if (part.approvalStatus === 'Approved') {
      await db.query(
        `UPDATE employee SET "xpTotal" = "xpTotal" + $1 WHERE id = $2`,
        [part.pointsEarned, part.employeeId]
      );
      await badgeService.checkAndAwardBadges(part.employeeId);
    }
    res.json(part);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
