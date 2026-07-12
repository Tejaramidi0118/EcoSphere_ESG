const express = require('express');
const router = express.Router();
const governanceController = require('../controllers/governance.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.use(verifyToken);
router.get('/policies', governanceController.getPolicies);
router.post('/policies', isAdmin, governanceController.createPolicy);
router.post('/policies/:id/acknowledge', governanceController.acknowledgePolicy);
router.get('/policies/:id/acknowledgements', isAdmin, governanceController.getAcknowledgements);
router.get('/audits', governanceController.getAudits);
router.post('/audits', isAdmin, governanceController.createAudit);
router.get('/compliance-issues', governanceController.getComplianceIssues);
router.post('/compliance-issues', isAdmin, governanceController.createComplianceIssue);
router.put('/compliance-issues/:id', governanceController.updateComplianceIssue);

module.exports = router;
