const express = require('express');
const router = express.Router();
const { getEnvironmentalReport, getEsgSummary } = require('../controllers/reports.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/environmental', verifyToken, getEnvironmentalReport);
router.get('/esg-summary', verifyToken, getEsgSummary);

module.exports = router;
