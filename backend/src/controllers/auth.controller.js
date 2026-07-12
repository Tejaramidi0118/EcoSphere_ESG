const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');

// Helper to format date as local YYYY-MM-DD
const formatDateStr = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Calculate user check-in streak dynamically from approved employee participations
const calculateUserStreak = async (employeeId) => {
  try {
    const completions = await prisma.employeeParticipation.findMany({
      where: { employeeId, approvalStatus: 'Approved' },
      select: { completionDate: true }
    });

    if (completions.length === 0) return 0;

    const dates = new Set();
    completions.forEach(c => {
      if (c.completionDate) {
        dates.add(formatDateStr(c.completionDate));
      }
    });

    let streak = 0;
    let checkDate = new Date();
    
    // If no check-in today, check if yesterday had one to maintain streak
    let hasActivityToday = dates.has(formatDateStr(checkDate));
    if (!hasActivityToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (dates.has(formatDateStr(checkDate))) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return streak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { email },
      include: { department: true },
    });

    if (!employee) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, employee.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const secret = process.env.JWT_SECRET || 'ecosphere_super_secret_jwt_key_2026';
    const token = jwt.sign(
      {
        id: employee.id,
        role: employee.role,
        departmentId: employee.departmentId,
        organizationId: employee.organizationId,
      },
      secret,
      { expiresIn: '24h' }
    );

    const streakDays = await calculateUserStreak(employee.id);

    return res.json({
      token,
      user: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        departmentId: employee.departmentId,
        departmentName: employee.department?.name,
        organizationId: employee.organizationId,
        xpTotal: employee.xpTotal,
        streakDays,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'An error occurred during login.' });
  }
};

const me = async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
        organizationId: true,
        xpTotal: true,
        department: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const streakDays = await calculateUserStreak(employee.id);

    return res.json({
      user: {
        ...employee,
        streakDays,
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'An error occurred fetching user profile.' });
  }
};

const registerOrganization = async (req, res) => {
  const { orgName, industry, size, country, adminName, email, password } = req.body;

  if (!orgName || !industry || !size || !country || !adminName || !email || !password) {
    return res.status(400).json({ error: 'All fields are required to register an organization.' });
  }

  try {
    // Check if email already exists
    const existingUser = await prisma.employee.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create organization, departments, and admin employee in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Organization
      const org = await tx.organization.create({
        data: {
          name: orgName,
          industry,
          size,
          country,
        },
      });

      // 2. Create default Corporate department for the admin user
      const corDept = await tx.department.create({
        data: {
          name: 'Corporate',
          code: 'COR',
          head: adminName,
          employeeCount: 1,
          organizationId: org.id,
        },
      });

      // 3. Create Admin Employee
      const adminUser = await tx.employee.create({
        data: {
          name: adminName,
          email,
          passwordHash,
          role: 'admin',
          departmentId: corDept.id,
          organizationId: org.id,
        },
      });

      return { org, adminUser };
    });

    return res.status(201).json({
      message: 'Organization registered successfully.',
      organization: result.org,
      admin: {
        id: result.adminUser.id,
        name: result.adminUser.name,
        email: result.adminUser.email,
        role: result.adminUser.role,
      },
    });
  } catch (error) {
    console.error('Register organization error:', error);
    return res.status(500).json({ error: 'An error occurred during organization registration.' });
  }
};

const registerEmployee = async (req, res) => {
  const { name, email, password, organizationId, departmentId } = req.body;

  if (!name || !email || !password || !organizationId || !departmentId) {
    return res.status(400).json({ error: 'Name, email, password, organization, and department are required.' });
  }

  try {
    // Check if email already exists
    const existingUser = await prisma.employee.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    // Verify department belongs to the organization
    const dept = await prisma.department.findUnique({
      where: { id: parseInt(departmentId, 10) }
    });

    if (!dept || dept.organizationId !== parseInt(organizationId, 10)) {
      return res.status(400).json({ error: 'Selected department does not belong to the selected organization.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      // Create employee account
      const employee = await tx.employee.create({
        data: {
          name,
          email,
          passwordHash,
          role: 'employee',
          departmentId: parseInt(departmentId, 10),
          organizationId: parseInt(organizationId, 10),
        }
      });

      // Increment employee count for the department
      await tx.department.update({
        where: { id: parseInt(departmentId, 10) },
        data: {
          employeeCount: { increment: 1 }
        }
      });

      return employee;
    });

    return res.status(201).json({
      message: 'Employee registered successfully.',
      employee: {
        id: result.id,
        name: result.name,
        email: result.email,
        role: result.role,
      }
    });
  } catch (error) {
    console.error('Register employee error:', error);
    return res.status(500).json({ error: 'An error occurred during employee registration.' });
  }
};

const getPublicOrganizations = async (req, res) => {
  try {
    const orgs = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        departments: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    return res.json(orgs);
  } catch (error) {
    console.error('Fetch public organizations error:', error);
    return res.status(500).json({ error: 'Failed to fetch organizations list.' });
  }
};

module.exports = {
  login,
  me,
  registerOrganization,
  registerEmployee,
  getPublicOrganizations,
};
