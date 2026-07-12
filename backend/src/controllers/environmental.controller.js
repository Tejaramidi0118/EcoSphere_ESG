const db = require('../db');

const getEmissionFactors = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM emissionfactor ORDER BY name ASC');
    return res.json(rows);
  } catch (err) {
    console.error('Get emission factors error:', err);
    return res.status(500).json({ error: 'An error occurred fetching emission factors.' });
  }
};

const createEmissionFactor = async (req, res) => {
  const { name, unit, co2PerUnit, source } = req.body;
  if (!name || !unit || co2PerUnit === undefined) {
    return res.status(400).json({ error: 'Name, unit, and co2PerUnit are required.' });
  }
  try {
    const { rows } = await db.query(
      `INSERT INTO emissionfactor (name, unit, "co2PerUnit", source) VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, unit, parseFloat(co2PerUnit), source || 'DESNZ 2026']
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create emission factor error:', err);
    return res.status(500).json({ error: 'An error occurred creating emission factor.' });
  }
};

const getCarbonTransactions = async (req, res) => {
  const orgId = req.user.organizationId;
  if (!orgId) return res.status(400).json({ error: 'Organization ID is missing from user session.' });

  const { departmentId, from, to } = req.query;
  const params = [orgId];
  let paramIdx = 2;
  let sql = `
    SELECT t.*, d.name AS "departmentName", d.code AS "departmentCode",
           ef.name AS "efName", ef.unit AS "efUnit", ef."co2PerUnit" AS "efCo2PerUnit", ef.source AS "efSource"
    FROM carbontransaction t
    INNER JOIN department d ON t."departmentId" = d.id
    INNER JOIN emissionfactor ef ON t."emissionFactorId" = ef.id
    WHERE d."organizationId" = $1
  `;

  if (departmentId) { sql += ` AND t."departmentId" = $${paramIdx++}`; params.push(parseInt(departmentId, 10)); }
  if (from)         { sql += ` AND t.date >= $${paramIdx++}`;           params.push(new Date(from)); }
  if (to)           { sql += ` AND t.date <= $${paramIdx++}`;           params.push(new Date(to)); }
  sql += ' ORDER BY t.date DESC';

  try {
    const { rows } = await db.query(sql, params);
    const transactions = rows.map(r => ({
      id: r.id, departmentId: r.departmentId, emissionFactorId: r.emissionFactorId,
      quantity: r.quantity, co2Calculated: r.co2Calculated, sourceType: r.sourceType, date: r.date,
      department: { name: r.departmentName, code: r.departmentCode },
      emissionFactor: { name: r.efName, unit: r.efUnit, co2PerUnit: r.efCo2PerUnit, source: r.efSource },
    }));
    return res.json(transactions);
  } catch (err) {
    console.error('Get carbon transactions error:', err);
    return res.status(500).json({ error: 'An error occurred fetching carbon transactions.' });
  }
};

const createCarbonTransaction = async (req, res) => {
  const orgId = req.user.organizationId;
  if (!orgId) return res.status(400).json({ error: 'Organization ID is missing from user session.' });

  const { departmentId, emissionFactorId, quantity, sourceType, date } = req.body;
  if (!departmentId || !emissionFactorId || quantity === undefined || !sourceType) {
    return res.status(400).json({ error: 'departmentId, emissionFactorId, quantity, and sourceType are required.' });
  }

  try {
    const deptRes = await db.query(`SELECT "organizationId" FROM department WHERE id = $1`, [parseInt(departmentId, 10)]);
    const dept = deptRes.rows[0];
    if (!dept || dept.organizationId !== orgId) return res.status(400).json({ error: 'Invalid department for this organization.' });

    const efRes = await db.query(`SELECT "co2PerUnit", name, unit FROM emissionfactor WHERE id = $1`, [parseInt(emissionFactorId, 10)]);
    const factor = efRes.rows[0];
    if (!factor) return res.status(404).json({ error: 'Emission factor not found.' });

    const co2Calculated = parseFloat(quantity) * factor.co2PerUnit;
    const txDate = date ? new Date(date) : new Date();

    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const insertRes = await client.query(
        `INSERT INTO carbontransaction ("departmentId","emissionFactorId",quantity,"co2Calculated","sourceType",date)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
        [parseInt(departmentId, 10), parseInt(emissionFactorId, 10), parseFloat(quantity), co2Calculated, sourceType, txDate]
      );
      await client.query(
        `UPDATE environmentalgoal SET "currentCo2" = "currentCo2" + $1 WHERE "departmentId" = $2 AND status IN ('Active','On Track')`,
        [co2Calculated, parseInt(departmentId, 10)]
      );
      await client.query('COMMIT');

      const txRes = await db.query(
        `SELECT t.*, d.name AS "departmentName", d.code AS "departmentCode", ef.name AS "efName", ef.unit AS "efUnit"
         FROM carbontransaction t
         INNER JOIN department d ON t."departmentId" = d.id
         INNER JOIN emissionfactor ef ON t."emissionFactorId" = ef.id
         WHERE t.id = $1`,
        [insertRes.rows[0].id]
      );
      const r = txRes.rows[0];
      return res.status(201).json({
        id: r.id, departmentId: r.departmentId, quantity: r.quantity, co2Calculated: r.co2Calculated,
        sourceType: r.sourceType, date: r.date,
        department: { name: r.departmentName, code: r.departmentCode },
        emissionFactor: { name: r.efName, unit: r.efUnit },
      });
    } catch (txErr) {
      await client.query('ROLLBACK');
      throw txErr;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Create carbon transaction error:', err);
    return res.status(500).json({ error: 'An error occurred creating carbon transaction.' });
  }
};

const getGoals = async (req, res) => {
  const orgId = req.user.organizationId;
  if (!orgId) return res.status(400).json({ error: 'Organization ID is missing from user session.' });

  const { departmentId, status } = req.query;
  const params = [orgId];
  let paramIdx = 2;
  let sql = `
    SELECT g.*, d.name AS "departmentName", d.code AS "departmentCode"
    FROM environmentalgoal g
    INNER JOIN department d ON g."departmentId" = d.id
    WHERE d."organizationId" = $1
  `;

  if (departmentId) { sql += ` AND g."departmentId" = $${paramIdx++}`; params.push(parseInt(departmentId, 10)); }
  if (status)       { sql += ` AND g.status = $${paramIdx++}`;         params.push(status); }
  sql += ' ORDER BY g.deadline ASC';

  try {
    const { rows } = await db.query(sql, params);
    return res.json(rows.map(r => ({
      id: r.id, name: r.name, departmentId: r.departmentId, targetCo2: r.targetCo2,
      currentCo2: r.currentCo2, deadline: r.deadline, status: r.status,
      department: { name: r.departmentName, code: r.departmentCode },
    })));
  } catch (err) {
    console.error('Get goals error:', err);
    return res.status(500).json({ error: 'An error occurred fetching environmental goals.' });
  }
};

const createGoal = async (req, res) => {
  const orgId = req.user.organizationId;
  if (!orgId) return res.status(400).json({ error: 'Organization ID is missing from user session.' });

  const { name, departmentId, targetCo2, deadline } = req.body;
  if (!name || !departmentId || targetCo2 === undefined || !deadline) {
    return res.status(400).json({ error: 'name, departmentId, targetCo2, and deadline are required.' });
  }

  try {
    const deptRes = await db.query(`SELECT "organizationId" FROM department WHERE id = $1`, [parseInt(departmentId, 10)]);
    const dept = deptRes.rows[0];
    if (!dept || dept.organizationId !== orgId) return res.status(400).json({ error: 'Invalid department for this organization.' });

    const insertRes = await db.query(
      `INSERT INTO environmentalgoal (name, "departmentId", "targetCo2", "currentCo2", deadline, status)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [name, parseInt(departmentId, 10), parseFloat(targetCo2), 0.0, new Date(deadline), 'Active']
    );

    const { rows } = await db.query(
      `SELECT g.*, d.name AS "departmentName", d.code AS "departmentCode"
       FROM environmentalgoal g
       INNER JOIN department d ON g."departmentId" = d.id
       WHERE g.id = $1`,
      [insertRes.rows[0].id]
    );
    const r = rows[0];
    return res.status(201).json({
      id: r.id, name: r.name, departmentId: r.departmentId, targetCo2: r.targetCo2,
      currentCo2: r.currentCo2, deadline: r.deadline, status: r.status,
      department: { name: r.departmentName, code: r.departmentCode },
    });
  } catch (err) {
    console.error('Create goal error:', err);
    return res.status(500).json({ error: 'An error occurred creating environmental goal.' });
  }
};

const updateGoal = async (req, res) => {
  const orgId = req.user.organizationId;
  if (!orgId) return res.status(400).json({ error: 'Organization ID is missing from user session.' });

  const { id } = req.params;
  const { name, targetCo2, currentCo2, deadline, status } = req.body;

  try {
    const check = await db.query(
      `SELECT g.id, d."organizationId" FROM environmentalgoal g INNER JOIN department d ON g."departmentId" = d.id WHERE g.id = $1`,
      [parseInt(id, 10)]
    );
    if (!check.rows[0] || check.rows[0].organizationId !== orgId) return res.status(403).json({ error: 'Forbidden.' });

    const updates = [];
    const params = [];
    let idx = 1;
    if (name !== undefined)       { updates.push(`name = $${idx++}`);          params.push(name); }
    if (targetCo2 !== undefined)  { updates.push(`"targetCo2" = $${idx++}`);   params.push(parseFloat(targetCo2)); }
    if (currentCo2 !== undefined) { updates.push(`"currentCo2" = $${idx++}`);  params.push(parseFloat(currentCo2)); }
    if (deadline !== undefined)   { updates.push(`deadline = $${idx++}`);      params.push(new Date(deadline)); }
    if (status !== undefined)     { updates.push(`status = $${idx++}`);        params.push(status); }

    if (updates.length > 0) {
      params.push(parseInt(id, 10));
      await db.query(`UPDATE environmentalgoal SET ${updates.join(', ')} WHERE id = $${idx}`, params);
    }

    const { rows } = await db.query(
      `SELECT g.*, d.name AS "departmentName", d.code AS "departmentCode"
       FROM environmentalgoal g INNER JOIN department d ON g."departmentId" = d.id WHERE g.id = $1`,
      [parseInt(id, 10)]
    );
    const r = rows[0];
    return res.json({ id: r.id, name: r.name, departmentId: r.departmentId, targetCo2: r.targetCo2, currentCo2: r.currentCo2, deadline: r.deadline, status: r.status, department: { name: r.departmentName, code: r.departmentCode } });
  } catch (err) {
    console.error('Update goal error:', err);
    return res.status(500).json({ error: 'An error occurred updating environmental goal.' });
  }
};

const deleteGoal = async (req, res) => {
  const orgId = req.user.organizationId;
  if (!orgId) return res.status(400).json({ error: 'Organization ID is missing from user session.' });

  const { id } = req.params;
  try {
    const check = await db.query(
      `SELECT g.id, d."organizationId" FROM environmentalgoal g INNER JOIN department d ON g."departmentId" = d.id WHERE g.id = $1`,
      [parseInt(id, 10)]
    );
    if (!check.rows[0] || check.rows[0].organizationId !== orgId) return res.status(403).json({ error: 'Forbidden.' });

    await db.query('DELETE FROM environmentalgoal WHERE id = $1', [parseInt(id, 10)]);
    return res.json({ message: 'Environmental goal deleted successfully.' });
  } catch (err) {
    console.error('Delete goal error:', err);
    return res.status(500).json({ error: 'An error occurred deleting environmental goal.' });
  }
};

module.exports = { getEmissionFactors, createEmissionFactor, getCarbonTransactions, createCarbonTransaction, getGoals, createGoal, updateGoal, deleteGoal };
