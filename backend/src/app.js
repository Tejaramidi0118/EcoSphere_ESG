const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const prisma = require('./db');
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

app.get('/api/departments', async (req, res) => {
  try {
    const depts = await prisma.department.findMany({
      orderBy: { name: 'asc' },
    });
    return res.json(depts);
  } catch (err) {
    console.error('Fetch departments error:', err);
    return res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    // Check DB connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

const PORT = process.env.PORT || 5555;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Close Prisma client and server gracefully on process exit
process.on('SIGTERM', () => {
  server.close(() => {
    prisma.$disconnect();
    console.log('Server and database client shutdown complete.');
  });
});

module.exports = app;
