const prisma = require('../db');

const getEmissionFactors = async (req, res) => {
  try {
    const factors = await prisma.emissionFactor.findMany({
      orderBy: { name: 'asc' },
    });
    return res.json(factors);
  } catch (error) {
    console.error('Get emission factors error:', error);
    return res.status(500).json({ error: 'An error occurred fetching emission factors.' });
  }
};

const createEmissionFactor = async (req, res) => {
  const { name, unit, co2PerUnit, source } = req.body;

  if (!name || !unit || co2PerUnit === undefined) {
    return res.status(400).json({ error: 'Name, unit, and co2PerUnit are required.' });
  }

  try {
    const factor = await prisma.emissionFactor.create({
      data: {
        name,
        unit,
        co2PerUnit: parseFloat(co2PerUnit),
        source: source || 'DESNZ 2026',
      },
    });
    return res.status(201).json(factor);
  } catch (error) {
    console.error('Create emission factor error:', error);
    return res.status(500).json({ error: 'An error occurred creating emission factor.' });
  }
};

const getCarbonTransactions = async (req, res) => {
  const orgId = req.user.organizationId;
  if (!orgId) {
    return res.status(400).json({ error: 'Organization ID is missing from user session.' });
  }

  const { departmentId, from, to } = req.query;
  
  // Scope by organizationId transitively through department
  const where = {
    department: { organizationId: orgId }
  };

  if (departmentId) {
    where.departmentId = parseInt(departmentId, 10);
  }

  if (from || to) {
    where.date = {};
    if (from) {
      where.date.gte = new Date(from);
    }
    if (to) {
      where.date.lte = new Date(to);
    }
  }

  try {
    const transactions = await prisma.carbonTransaction.findMany({
      where,
      include: {
        department: {
          select: { name: true, code: true },
        },
        emissionFactor: {
          select: { name: true, unit: true, co2PerUnit: true, source: true },
        },
      },
      orderBy: { date: 'desc' },
    });
    return res.json(transactions);
  } catch (error) {
    console.error('Get carbon transactions error:', error);
    return res.status(500).json({ error: 'An error occurred fetching carbon transactions.' });
  }
};

const createCarbonTransaction = async (req, res) => {
  const orgId = req.user.organizationId;
  if (!orgId) {
    return res.status(400).json({ error: 'Organization ID is missing from user session.' });
  }

  const { departmentId, emissionFactorId, quantity, sourceType, date } = req.body;

  if (!departmentId || !emissionFactorId || quantity === undefined || !sourceType) {
    return res.status(400).json({ error: 'departmentId, emissionFactorId, quantity, and sourceType are required.' });
  }

  try {
    // Verify target department belongs to the user's organization
    const dept = await prisma.department.findUnique({
      where: { id: parseInt(departmentId, 10) }
    });

    if (!dept || dept.organizationId !== orgId) {
      return res.status(400).json({ error: 'Invalid department for this organization.' });
    }

    // Look up emission factor to get co2PerUnit
    const factor = await prisma.emissionFactor.findUnique({
      where: { id: parseInt(emissionFactorId, 10) },
    });

    if (!factor) {
      return res.status(404).json({ error: 'Emission factor not found.' });
    }

    const co2Calculated = parseFloat(quantity) * factor.co2PerUnit;

    const transaction = await prisma.carbonTransaction.create({
      data: {
        departmentId: parseInt(departmentId, 10),
        emissionFactorId: parseInt(emissionFactorId, 10),
        quantity: parseFloat(quantity),
        co2Calculated,
        sourceType,
        date: date ? new Date(date) : new Date(),
      },
      include: {
        department: { select: { name: true, code: true } },
        emissionFactor: { select: { name: true, unit: true } },
      },
    });

    // Automatically increment currentCo2 on active goals for this department
    await prisma.environmentalGoal.updateMany({
      where: {
        departmentId: parseInt(departmentId, 10),
        status: { in: ['Active', 'On Track'] },
      },
      data: {
        currentCo2: {
          increment: co2Calculated,
        },
      },
    });

    return res.status(201).json(transaction);
  } catch (error) {
    console.error('Create carbon transaction error:', error);
    return res.status(500).json({ error: 'An error occurred creating carbon transaction.' });
  }
};

const getGoals = async (req, res) => {
  const orgId = req.user.organizationId;
  if (!orgId) {
    return res.status(400).json({ error: 'Organization ID is missing from user session.' });
  }

  const { departmentId, status } = req.query;
  
  // Scope by organizationId transitively through department
  const where = {
    department: { organizationId: orgId }
  };

  if (departmentId) {
    where.departmentId = parseInt(departmentId, 10);
  }

  if (status) {
    where.status = status;
  }

  try {
    const goals = await prisma.environmentalGoal.findMany({
      where,
      include: {
        department: {
          select: { name: true, code: true },
        },
      },
      orderBy: { deadline: 'asc' },
    });
    return res.json(goals);
  } catch (error) {
    console.error('Get goals error:', error);
    return res.status(500).json({ error: 'An error occurred fetching environmental goals.' });
  }
};

const createGoal = async (req, res) => {
  const orgId = req.user.organizationId;
  if (!orgId) {
    return res.status(400).json({ error: 'Organization ID is missing from user session.' });
  }

  const { name, departmentId, targetCo2, deadline } = req.body;

  if (!name || !departmentId || targetCo2 === undefined || !deadline) {
    return res.status(400).json({ error: 'name, departmentId, targetCo2, and deadline are required.' });
  }

  try {
    // Verify target department belongs to the user's organization
    const dept = await prisma.department.findUnique({
      where: { id: parseInt(departmentId, 10) }
    });

    if (!dept || dept.organizationId !== orgId) {
      return res.status(400).json({ error: 'Invalid department for this organization.' });
    }

    const goal = await prisma.environmentalGoal.create({
      data: {
        name,
        departmentId: parseInt(departmentId, 10),
        targetCo2: parseFloat(targetCo2),
        currentCo2: 0.0,
        deadline: new Date(deadline),
        status: 'Active',
      },
      include: {
        department: { select: { name: true, code: true } },
      },
    });
    return res.status(201).json(goal);
  } catch (error) {
    console.error('Create goal error:', error);
    return res.status(500).json({ error: 'An error occurred creating environmental goal.' });
  }
};

const updateGoal = async (req, res) => {
  const orgId = req.user.organizationId;
  if (!orgId) {
    return res.status(400).json({ error: 'Organization ID is missing from user session.' });
  }

  const { id } = req.params;
  const { name, targetCo2, currentCo2, deadline, status } = req.body;

  try {
    // Verify goal belongs to user's organization
    const goalCheck = await prisma.environmentalGoal.findUnique({
      where: { id: parseInt(id, 10) },
      include: { department: true }
    });

    if (!goalCheck || goalCheck.department.organizationId !== orgId) {
      return res.status(403).json({ error: 'Forbidden. You do not own this goal.' });
    }

    const data = {};
    if (name !== undefined) data.name = name;
    if (targetCo2 !== undefined) data.targetCo2 = parseFloat(targetCo2);
    if (currentCo2 !== undefined) data.currentCo2 = parseFloat(currentCo2);
    if (deadline !== undefined) data.deadline = new Date(deadline);
    if (status !== undefined) data.status = status;

    const goal = await prisma.environmentalGoal.update({
      where: { id: parseInt(id, 10) },
      data,
      include: {
        department: { select: { name: true, code: true } },
      },
    });

    return res.json(goal);
  } catch (error) {
    console.error('Update goal error:', error);
    return res.status(500).json({ error: 'An error occurred updating environmental goal.' });
  }
};

const deleteGoal = async (req, res) => {
  const orgId = req.user.organizationId;
  if (!orgId) {
    return res.status(400).json({ error: 'Organization ID is missing from user session.' });
  }

  const { id } = req.params;

  try {
    // Verify goal belongs to user's organization
    const goalCheck = await prisma.environmentalGoal.findUnique({
      where: { id: parseInt(id, 10) },
      include: { department: true }
    });

    if (!goalCheck || goalCheck.department.organizationId !== orgId) {
      return res.status(403).json({ error: 'Forbidden. You do not own this goal.' });
    }

    await prisma.environmentalGoal.delete({
      where: { id: parseInt(id, 10) },
    });
    return res.json({ message: 'Environmental goal deleted successfully.' });
  } catch (error) {
    console.error('Delete goal error:', error);
    return res.status(500).json({ error: 'An error occurred deleting environmental goal.' });
  }
};

module.exports = {
  getEmissionFactors,
  createEmissionFactor,
  getCarbonTransactions,
  createCarbonTransaction,
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
};
