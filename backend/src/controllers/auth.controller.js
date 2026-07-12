const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const formatDateStr = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const calculateUserStreak = async (employeeId) => {
  try {
    const { rows } = await db.query(
      `SELECT "completionDate" FROM employeeparticipation WHERE "employeeId" = $1 AND "approvalStatus" = 'Approved'`,
      [employeeId]
    );
    if (rows.length === 0) return 0;

    const dates = new Set();
    rows.forEach(c => {
      if (c.completionDate) dates.add(formatDateStr(new Date(c.completionDate)));
    });

    let streak = 0;
    let checkDate = new Date();
    if (!dates.has(formatDateStr(checkDate))) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (dates.has(formatDateStr(checkDate))) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  } catch (err) {
    console.error('Streak calc error:', err);
    return 0;
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  try {
    const { rows } = await db.query(
      `SELECT e.*, d.name AS "departmentName"
       FROM employee e
       LEFT JOIN department d ON e."departmentId" = d.id
       WHERE e.email = $1`,
      [email]
    );
    const employee = rows[0];
    if (!employee) return res.status(401).json({ error: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, employee.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password.' });

    const secret = process.env.JWT_SECRET || 'ecosphere_super_secret_jwt_key_2026';
    const token = jwt.sign(
      { id: employee.id, role: employee.role, departmentId: employee.departmentId, organizationId: employee.organizationId },
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
        departmentName: employee.departmentName,
        organizationId: employee.organizationId,
        xpTotal: employee.xpTotal,
        streakDays,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'An error occurred during login.' });
  }
};

const me = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT e.id, e.name, e.email, e.role, e."departmentId", e."organizationId", e."xpTotal",
              d.name AS "departmentName", d.code AS "departmentCode"
       FROM employee e
       LEFT JOIN department d ON e."departmentId" = d.id
       WHERE e.id = $1`,
      [req.user.id]
    );
    const employee = rows[0];
    if (!employee) return res.status(404).json({ error: 'User not found.' });

    const streakDays = await calculateUserStreak(employee.id);

    return res.json({
      user: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        departmentId: employee.departmentId,
        organizationId: employee.organizationId,
        xpTotal: employee.xpTotal,
        department: { name: employee.departmentName, code: employee.departmentCode },
        streakDays,
      }
    });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ error: 'An error occurred fetching user profile.' });
  }
};

const registerOrganization = async (req, res) => {
  const { orgName, industry, size, country, adminName, email, password } = req.body;
  if (!orgName || !industry || !size || !country || !adminName || !email || !password) {
    return res.status(400).json({ error: 'All fields are required to register an organization.' });
  }

  try {
    const existing = await db.query('SELECT id FROM employee WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Email is already registered.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const orgRes = await client.query(
        `INSERT INTO organization (name, industry, size, country) VALUES ($1,$2,$3,$4) RETURNING id`,
        [orgName, industry, size, country]
      );
      const orgId = orgRes.rows[0].id;

      const corRes = await client.query(
        `INSERT INTO department (name, code, head, "employeeCount", "organizationId") VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        ['Corporate', 'COR', adminName, 1, orgId]
      );
      const corDeptId = corRes.rows[0].id;

      const adminRes = await client.query(
        `INSERT INTO employee (name, email, "passwordHash", role, "departmentId", "organizationId") VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
        [adminName, email, passwordHash, 'admin', corDeptId, orgId]
      );

      await client.query('COMMIT');
      return res.status(201).json({
        message: 'Organization registered successfully.',
        organization: { id: orgId, name: orgName, industry, size, country },
        admin: { id: adminRes.rows[0].id, name: adminName, email, role: 'admin' },
      });
    } catch (txErr) {
      await client.query('ROLLBACK');
      throw txErr;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Register org error:', err);
    return res.status(500).json({ error: 'An error occurred during organization registration.' });
  }
};

const registerEmployee = async (req, res) => {
  const { name, email, password, organizationId, departmentId } = req.body;
  if (!name || !email || !password || !organizationId || !departmentId) {
    return res.status(400).json({ error: 'Name, email, password, organization, and department are required.' });
  }

  try {
    const existing = await db.query('SELECT id FROM employee WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Email is already registered.' });

    const dept = await db.query(`SELECT "organizationId" FROM department WHERE id = $1`, [parseInt(departmentId, 10)]);
    if (!dept.rows[0] || dept.rows[0].organizationId !== parseInt(organizationId, 10)) {
      return res.status(400).json({ error: 'Selected department does not belong to the selected organization.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const empRes = await client.query(
        `INSERT INTO employee (name, email, "passwordHash", role, "departmentId", "organizationId") VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
        [name, email, passwordHash, 'employee', parseInt(departmentId, 10), parseInt(organizationId, 10)]
      );
      await client.query(
        `UPDATE department SET "employeeCount" = "employeeCount" + 1 WHERE id = $1`,
        [parseInt(departmentId, 10)]
      );
      await client.query('COMMIT');
      return res.status(201).json({ message: 'Employee registered successfully.', employee: { id: empRes.rows[0].id, name, email, role: 'employee' } });
    } catch (txErr) {
      await client.query('ROLLBACK');
      throw txErr;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Register employee error:', err);
    return res.status(500).json({ error: 'An error occurred during employee registration.' });
  }
};

const getPublicOrganizations = async (req, res) => {
  try {
    const { rows: orgs } = await db.query('SELECT id, name FROM organization ORDER BY name ASC');
    const { rows: depts } = await db.query(`SELECT id, name, code, "organizationId" FROM department`);
    const result = orgs.map(org => ({
      id: org.id,
      name: org.name,
      departments: depts.filter(d => d.organizationId === org.id).map(d => ({ id: d.id, name: d.name, code: d.code }))
    }));
    return res.json(result);
  } catch (err) {
    console.error('Fetch orgs error:', err);
    return res.status(500).json({ error: 'Failed to fetch organizations list.' });
  }
};

module.exports = { login, me, registerOrganization, registerEmployee, getPublicOrganizations };
