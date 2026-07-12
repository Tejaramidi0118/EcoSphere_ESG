const db = require('../db');

let globalConfig = {
  weights: { env: 40, social: 30, gov: 30 },
  auto_emission_calc: true,
  auto_badge_award: true
};

exports.getEsgConfig = async (req, res) => {
  res.json(globalConfig);
};

exports.updateEsgConfig = async (req, res) => {
  globalConfig = { ...globalConfig, ...req.body };
  res.json(globalConfig);
};

exports.getDepartments = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM department WHERE "organizationId" = $1 ORDER BY name ASC`,
      [req.user.organizationId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getCategories = async (req, res) => {
  try {
    const { type } = req.query;
    let sql = 'SELECT * FROM category';
    const params = [];
    if (type) { sql += ' WHERE type = $1'; params.push(type); }
    const { rows } = await db.query(sql, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
