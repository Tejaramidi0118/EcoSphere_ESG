const express = require('express');
const router = express.Router();
const socialController = require('../controllers/social.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.use(verifyToken);
router.get('/csr-activities', socialController.getCSRActivities);
router.get('/csr-activities/:id', socialController.getActivityById);
router.post('/csr-activities', isAdmin, socialController.createCSRActivity);
router.post('/participation', socialController.joinActivity);
router.get('/participation', isAdmin, socialController.getParticipations);
router.put('/participation/:id/approve', isAdmin, socialController.approveParticipation);
router.put('/participation/:id/reject', isAdmin, socialController.rejectParticipation);

module.exports = router;
