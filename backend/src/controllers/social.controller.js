const prisma = require('../db');
const badgeService = require('../services/badge.service');

exports.getCSRActivities = async (req, res) => {
  try {
    const activities = await prisma.cSRActivity.findMany({
      where: { organizationId: req.user.organizationId },
      include: { category: true }
    });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getActivityById = async (req, res) => {
  try {
    const activity = await prisma.cSRActivity.findUnique({
      where: { id: Number(req.params.id) },
      include: { category: true }
    });
    if (!activity) return res.status(404).json({ error: 'Not found' });
    res.json(activity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCSRActivity = async (req, res) => {
  try {
    const activity = await prisma.cSRActivity.create({
      data: { ...req.body, organizationId: req.user.organizationId }
    });
    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.joinActivity = async (req, res) => {
  try {
    const { csrActivityId, proofUrl } = req.body;
    const part = await prisma.employeeParticipation.create({
      data: {
        employeeId: req.user.id,
        csrActivityId: Number(csrActivityId),
        proofUrl,
        approvalStatus: 'Pending',
        pointsEarned: 0
      }
    });
    res.status(201).json(part);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getParticipations = async (req, res) => {
  try {
    const parts = await prisma.employeeParticipation.findMany({
      where: { employee: { organizationId: req.user.organizationId } },
      include: { employee: true, csrActivity: true }
    });
    res.json(parts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.approveParticipation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, points } = req.body;
    const part = await prisma.employeeParticipation.update({
      where: { id: Number(id) },
      data: { approvalStatus: status || 'Approved', pointsEarned: Number(points) || 50 }
    });

    if (part.approvalStatus === 'Approved') {
      await prisma.employee.update({
        where: { id: part.employeeId },
        data: { xpTotal: { increment: part.pointsEarned } }
      });
      await badgeService.checkAndAwardBadges(part.employeeId);
    }
    res.json(part);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
