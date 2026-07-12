const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');

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
      },
      secret,
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      user: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        departmentId: employee.departmentId,
        departmentName: employee.department?.name,
        xpTotal: employee.xpTotal,
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

    return res.json({ user: employee });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'An error occurred fetching user profile.' });
  }
};

module.exports = {
  login,
  me,
};
