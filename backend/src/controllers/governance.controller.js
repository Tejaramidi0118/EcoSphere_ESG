const prisma = require('../db');

exports.getPolicies = async (req, res) => {
  try {
    const policies = await prisma.eSGPolicy.findMany({
      where: { organizationId: req.user.organizationId, status: 'Active' },
      orderBy: { id: 'desc' }
    });
    res.json(policies);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createPolicy = async (req, res) => {
  try {
    const policy = await prisma.eSGPolicy.create({
      data: { ...req.body, organizationId: req.user.organizationId }
    });
    res.status(201).json(policy);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.acknowledgePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const ack = await prisma.policyAcknowledgement.create({
      data: { policyId: Number(id), employeeId: req.user.id }
    });
    res.json(ack);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAcknowledgements = async (req, res) => {
  try {
    const { id } = req.params;
    const acks = await prisma.policyAcknowledgement.findMany({
      where: { policyId: Number(id) },
      include: { employee: true }
    });
    res.json(acks);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAudits = async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({ where: { id: req.user.id }});
    const audits = await prisma.audit.findMany({
      where: { departmentId: employee.departmentId }
    });
    res.json(audits);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createAudit = async (req, res) => {
  try {
    const audit = await prisma.audit.create({ data: req.body });
    res.status(201).json(audit);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getComplianceIssues = async (req, res) => {
  try {
    const issues = await prisma.complianceIssue.findMany({
      where: { ownerEmployeeId: req.user.id }
    });
    const enriched = issues.map(issue => ({
      ...issue,
      isOverdue: new Date(issue.dueDate) < new Date() && issue.status !== 'Resolved'
    }));
    res.json(enriched);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createComplianceIssue = async (req, res) => {
  try {
    const issue = await prisma.complianceIssue.create({ data: req.body });
    res.status(201).json(issue);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateComplianceIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const issue = await prisma.complianceIssue.update({
      where: { id: Number(id) },
      data: { status }
    });
    res.json(issue);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
