const prisma = require('../db');
const badgeService = require('../services/badge.service');

exports.getChallenges = async (req, res) => {
  try {
    const challenges = await prisma.challenge.findMany({
      where: { organizationId: req.user.organizationId, status: 'Active' },
      include: { category: true }
    });
    res.json(challenges);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.joinChallenge = async (req, res) => {
  try {
    const { challenge_id } = req.body;
    
    const existing = await prisma.challengeParticipation.findFirst({
      where: { employeeId: req.user.id, challengeId: Number(challenge_id) }
    });
    if (existing) {
      return res.status(400).json({ error: "You already accepted this challenge!" });
    }

    const part = await prisma.challengeParticipation.create({
      data: {
        employeeId: req.user.id,
        challengeId: Number(challenge_id),
      }
    });
    res.json(part);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getMyParticipations = async (req, res) => {
  try {
    const parts = await prisma.challengeParticipation.findMany({
      where: { employeeId: req.user.id },
      include: { challenge: true }
    });
    res.json(parts);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.submitChallengeProof = async (req, res) => {
  try {
    const { id } = req.params;
    const { proofUrl } = req.body;
    const part = await prisma.challengeParticipation.update({
      where: { id: Number(id) },
      data: { proofUrl, approvalStatus: 'Pending', progressPct: 100 }
    });
    res.json(part);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getPendingParticipations = async (req, res) => {
  try {
    const parts = await prisma.challengeParticipation.findMany({
      where: { approvalStatus: 'Pending', employee: { organizationId: req.user.organizationId } },
      include: { employee: true, challenge: true }
    });
    res.json(parts);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.approveChallengeParticipation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const targetPart = await prisma.challengeParticipation.findUnique({ where: { id: Number(id) }, include: { challenge: true } });
    if (!targetPart) return res.status(404).json({ error: "Not found" });

    const updatedPart = await prisma.challengeParticipation.update({
      where: { id: Number(id) },
      data: { approvalStatus: status || 'Approved', xpAwarded: status === 'Approved' ? targetPart.challenge.xp : 0 }
    });

    if (updatedPart.approvalStatus === 'Approved') {
      await prisma.employee.update({
        where: { id: targetPart.employeeId },
        data: { xpTotal: { increment: updatedPart.xpAwarded } }
      });
      await badgeService.checkAndAwardBadges(targetPart.employeeId);
    }
    res.json(updatedPart);
  } catch (err) { res.status(500).json({ error: err.message }); }
};


exports.getBadges = async (req, res) => {
  try {
    const badges = await prisma.badge.findMany();
    res.json(badges);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getMyBadges = async (req, res) => {
  try {
    const myBadges = await prisma.employeeBadge.findMany({
      where: { employeeId: req.user.id },
      include: { badge: true }
    });
    res.json(myBadges);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getRewards = async (req, res) => {
  try {
    const rewards = await prisma.reward.findMany({
      where: { organizationId: req.user.organizationId, status: 'Active' }
    });
    res.json(rewards);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.redeemReward = async (req, res) => {
  try {
    const { id } = req.params;
    const reward = await prisma.reward.findUnique({ where: { id: Number(id) }});
    const employee = await prisma.employee.findUnique({ where: { id: req.user.id }});

    if (employee.xpTotal < reward.pointsRequired) {
      return res.status(400).json({ error: 'Insufficient XP! You need to earn more points to claim this reward.' });
    }
    if (reward.stock <= 0) {
      return res.status(400).json({ error: 'This reward is currently out of stock.' });
    }

    const redemption = await prisma.$transaction([
      prisma.employee.update({ where: { id: employee.id }, data: { xpTotal: { decrement: reward.pointsRequired } } }),
      prisma.reward.update({ where: { id: reward.id }, data: { stock: { decrement: 1 } } }),
      prisma.rewardRedemption.create({
        data: { employeeId: employee.id, rewardId: reward.id, pointsDeducted: reward.pointsRequired }
      })
    ]);
    res.json(redemption[2]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const { scope } = req.query;
    if (scope === 'department') {
      const depts = await prisma.departmentScore.findMany({
        include: { department: true },
        orderBy: { totalScore: 'desc' },
        take: 10
      });
      res.json(depts.map(d => ({ id: d.departmentId, name: d.department.name, total_xp: d.totalScore })));
    } else {
      const emps = await prisma.employee.findMany({
        where: { organizationId: req.user.organizationId },
        include: { department: true },
        orderBy: { xpTotal: 'desc' },
        take: 10
      });
      res.json(emps.map(e => ({ id: e.id, name: e.name, department: e.department, total_xp: e.xpTotal })));
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
};
