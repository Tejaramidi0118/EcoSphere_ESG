const db = require('../db');

exports.getPolicies = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM esgpolicy WHERE "organizationId" = $1 AND status = 'Active' ORDER BY id DESC`,
      [req.user.organizationId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createPolicy = async (req, res) => {
  try {
    const { title, description, departmentId, version, status } = req.body;
    const { rows } = await db.query(
      `INSERT INTO esgpolicy (title, description, "departmentId", version, status, "organizationId")
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description, departmentId || null, version || '1.0', status || 'Active', req.user.organizationId]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.acknowledgePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      `INSERT INTO policyacknowledgement ("policyId", "employeeId") VALUES ($1, $2) RETURNING *`,
      [Number(id), req.user.id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAcknowledgements = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      `SELECT pa.*, e.name AS "employeeName", e.email AS "employeeEmail"
       FROM policyacknowledgement pa
       INNER JOIN employee e ON pa."employeeId" = e.id
       WHERE pa."policyId" = $1`,
      [Number(id)]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAudits = async (req, res) => {
  try {
    const empRes = await db.query('SELECT "departmentId" FROM employee WHERE id = $1', [req.user.id]);
    const { departmentId } = empRes.rows[0];
    const { rows } = await db.query(
      'SELECT * FROM audit WHERE "departmentId" = $1',
      [departmentId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createAudit = async (req, res) => {
  try {
    const { title, departmentId, auditorName, date, findingsSummary, status } = req.body;
    const { rows } = await db.query(
      `INSERT INTO audit (title, "departmentId", "auditorName", date, "findingsSummary", status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, departmentId, auditorName, date, findingsSummary || '', status || 'Scheduled']
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getComplianceIssues = async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM complianceissue WHERE "ownerEmployeeId" = $1',
      [req.user.id]
    );
    const enriched = rows.map(issue => ({
      ...issue,
      isOverdue: new Date(issue.dueDate) < new Date() && issue.status !== 'Resolved'
    }));
    res.json(enriched);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createComplianceIssue = async (req, res) => {
  try {
    const { auditId, title, severity, departmentId, ownerEmployeeId, dueDate, status, description } = req.body;
    const { rows } = await db.query(
      `INSERT INTO complianceissue ("auditId", title, severity, "departmentId", "ownerEmployeeId", "dueDate", status, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [auditId || null, title, severity, departmentId, ownerEmployeeId, dueDate, status || 'Open', description]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateComplianceIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { rows } = await db.query(
      'UPDATE complianceissue SET status = $1 WHERE id = $2 RETURNING *',
      [status, Number(id)]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
