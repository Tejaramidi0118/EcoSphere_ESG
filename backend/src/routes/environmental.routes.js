const express = require('express');
const {
  getEmissionFactors,
  createEmissionFactor,
  getCarbonTransactions,
  createCarbonTransaction,
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} = require('../controllers/environmental.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Emission Factors
router.get('/emission-factors', verifyToken, getEmissionFactors);
router.post('/emission-factors', verifyToken, isAdmin, createEmissionFactor);

// Carbon Transactions
router.get('/carbon-transactions', verifyToken, getCarbonTransactions);
router.post('/carbon-transactions', verifyToken, createCarbonTransaction);

// Environmental Goals
router.get('/goals', verifyToken, getGoals);
router.post('/goals', verifyToken, isAdmin, createGoal);
router.put('/goals/:id', verifyToken, updateGoal);
router.delete('/goals/:id', verifyToken, isAdmin, deleteGoal);

module.exports = router;
