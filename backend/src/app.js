const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const prisma = require('./db');
const authRoutes = require('./routes/auth.routes');
const environmentalRoutes = require('./routes/environmental.routes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/environmental', environmentalRoutes);

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
