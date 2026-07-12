const express = require('express');
const { login, me, registerOrganization, registerEmployee, getPublicOrganizations } = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/register-org', registerOrganization);
router.post('/register-employee', registerEmployee);
router.get('/public-orgs', getPublicOrganizations);
router.get('/me', verifyToken, me);

module.exports = router;
