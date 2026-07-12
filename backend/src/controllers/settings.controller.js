const prisma = require('../db');

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
    const depts = await prisma.department.findMany({
      where: { organizationId: req.user.organizationId }
    });
    res.json(depts);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getCategories = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    const categories = await prisma.category.findMany({ where: filter });
    res.json(categories);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
