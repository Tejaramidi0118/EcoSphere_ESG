const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');
const authRoutes = require('./routes/auth.routes');
const environmentalRoutes = require('./routes/environmental.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const reportsRoutes = require('./routes/reports.routes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/environmental', environmentalRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);

const { verifyToken } = require('./middleware/auth');

app.get('/api/departments', verifyToken, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM department WHERE "organizationId" = $1 ORDER BY name ASC`,
      [req.user.organizationId]
    );
    return res.json(rows);
  } catch (err) {
    console.error('Fetch departments error:', err);
    return res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', database: 'Supabase PostgreSQL connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

const PORT = process.env.PORT || 5555;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} — connected to Supabase`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    db.end();
    console.log('Server and Supabase pool shut down.');
  });
});

module.exports = app;
