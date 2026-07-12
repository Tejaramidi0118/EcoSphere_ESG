const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.get('/esg-config', settingsController.getEsgConfig);
router.put('/esg-config', settingsController.updateEsgConfig);
router.get('/departments', settingsController.getDepartments);
router.get('/categories', settingsController.getCategories);

module.exports = router;
