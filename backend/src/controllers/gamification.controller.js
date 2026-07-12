const db = require('../db');
const badgeService = require('../services/badge.service');

exports.getChallenges = async (req, res) => {
  try {
    const { rows: challenges } = await db.query(
      `SELECT c.*, cat.name AS "categoryName", cat.type AS "categoryType"
       FROM challenge c
       LEFT JOIN category cat ON c."categoryId" = cat.id
       WHERE c."organizationId" = $1 AND c.status = 'Active'`,
      [req.user.organizationId]
    );

    const { rows: participations } = await db.query(
      `SELECT "challengeId", "approvalStatus" FROM challengeparticipation WHERE "employeeId" = $1`,
      [req.user.id]
    );

    const partMap = {};
    participations.forEach(p => {
      partMap[p.challengeId] = p.approvalStatus;
    });

    const enriched = challenges.map(c => ({
      ...c,
      participationStatus: partMap[c.id] || null
    }));

    res.json(enriched);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.joinChallenge = async (req, res) => {
  try {
    const { challenge_id } = req.body;
    const existing = await db.query(
      `SELECT id FROM challengeparticipation WHERE "employeeId" = $1 AND "challengeId" = $2`,
      [req.user.id, Number(challenge_id)]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'You already accepted this challenge!' });
    }
    const { rows } = await db.query(
      `INSERT INTO challengeparticipation ("employeeId", "challengeId") VALUES ($1, $2) RETURNING *`,
      [req.user.id, Number(challenge_id)]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getMyParticipations = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT cp.*, c.title AS "challengeTitle", c.xp AS "challengeXp", c.difficulty AS "challengeDifficulty", c.description AS "challengeDescription"
       FROM challengeparticipation cp
       INNER JOIN challenge c ON cp."challengeId" = c.id
       WHERE cp."employeeId" = $1`,
      [req.user.id]
    );
    const formatted = rows.map(r => ({
      id: r.id,
      challengeId: r.challengeId,
      employeeId: r.employeeId,
      progressPct: r.progressPct,
      proofUrl: r.proofUrl,
      approvalStatus: r.approvalStatus,
      xpAwarded: r.xpAwarded,
      challenge: {
        title: r.challengeTitle,
        xp: r.challengeXp,
        difficulty: r.challengeDifficulty,
        description: r.challengeDescription
      }
    }));
    res.json(formatted);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.submitChallengeProof = async (req, res) => {
  try {
    const { id } = req.params;
    const { proofUrl } = req.body;
    const { rows } = await db.query(
      `UPDATE challengeparticipation SET "proofUrl" = $1, "approvalStatus" = 'Pending', "progressPct" = 100 WHERE id = $2 RETURNING *`,
      [proofUrl, Number(id)]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getPendingParticipations = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT cp.*, e.name AS "employeeName", c.title AS "challengeTitle", c.xp
       FROM challengeparticipation cp
       INNER JOIN employee e ON cp."employeeId" = e.id
       INNER JOIN challenge c ON cp."challengeId" = c.id
       WHERE cp."approvalStatus" = 'Pending' AND e."organizationId" = $1`,
      [req.user.organizationId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.approveChallengeParticipation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const partRes = await db.query(
      `SELECT cp.*, c.xp FROM challengeparticipation cp INNER JOIN challenge c ON cp."challengeId" = c.id WHERE cp.id = $1`,
      [Number(id)]
    );
    if (!partRes.rows[0]) return res.status(404).json({ error: 'Not found' });
    const targetPart = partRes.rows[0];

    const xpAwarded = status === 'Approved' ? targetPart.xp : 0;
    const { rows } = await db.query(
      `UPDATE challengeparticipation SET "approvalStatus" = $1, "xpAwarded" = $2 WHERE id = $3 RETURNING *`,
      [status || 'Approved', xpAwarded, Number(id)]
    );
    const updatedPart = rows[0];

    if (updatedPart.approvalStatus === 'Approved') {
      await db.query(
        `UPDATE employee SET "xpTotal" = "xpTotal" + $1 WHERE id = $2`,
        [xpAwarded, targetPart.employeeId]
      );
      await badgeService.checkAndAwardBadges(targetPart.employeeId);
    }
    res.json(updatedPart);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getBadges = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM badge');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getMyBadges = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT eb.id, eb."employeeId", eb."badgeId", eb."awardedAt",
              b.name AS "badgeName", b.description AS "badgeDescription", b.icon, b."unlockRule"
       FROM employeebadge eb
       INNER JOIN badge b ON eb."badgeId" = b.id
       WHERE eb."employeeId" = $1`,
      [req.user.id]
    );
    const formatted = rows.map(r => ({
      id: r.id,
      employeeId: r.employeeId,
      badgeId: r.badgeId,
      awardedAt: r.awardedAt,
      awarded_at: r.awardedAt,
      badge: {
        name: r.badgeName,
        description: r.badgeDescription,
        icon: r.icon,
        unlockRule: r.unlockRule
      }
    }));
    res.json(formatted);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getRewards = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM reward WHERE "organizationId" = $1 AND status = 'Active'`,
      [req.user.organizationId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.redeemReward = async (req, res) => {
  try {
    const { id } = req.params;
    const rewardRes = await db.query('SELECT * FROM reward WHERE id = $1', [Number(id)]);
    const employeeRes = await db.query('SELECT * FROM employee WHERE id = $1', [req.user.id]);
    const reward = rewardRes.rows[0];
    const employee = employeeRes.rows[0];

    if (!reward || reward.organizationId !== req.user.organizationId) {
      return res.status(403).json({ error: 'Access denied. This reward does not belong to your organization.' });
    }

    if (employee.xpTotal < reward.pointsRequired) {
      return res.status(400).json({ error: 'Insufficient XP! You need to earn more points to claim this reward.' });
    }
    if (reward.stock <= 0) {
      return res.status(400).json({ error: 'This reward is currently out of stock.' });
    }

    const client = await db.connect();
    try {
      await client.query('BEGIN');
      await client.query(`UPDATE employee SET "xpTotal" = "xpTotal" - $1 WHERE id = $2`, [reward.pointsRequired, employee.id]);
      await client.query(`UPDATE reward SET stock = stock - 1 WHERE id = $1`, [reward.id]);
      const { rows } = await client.query(
        `INSERT INTO rewardredemption ("employeeId", "rewardId", "pointsDeducted") VALUES ($1, $2, $3) RETURNING *`,
        [employee.id, reward.id, reward.pointsRequired]
      );
      await client.query('COMMIT');
      res.json(rows[0]);
    } catch (txErr) {
      await client.query('ROLLBACK');
      throw txErr;
    } finally {
      client.release();
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const { scope } = req.query;
    if (scope === 'department') {
      const { rows } = await db.query(
        `SELECT ds.*, d.name AS "departmentName",
                COALESCE(json_agg(json_build_object('id', e.id, 'name', e.name, 'xpTotal', e."xpTotal") ORDER BY e."xpTotal" DESC) FILTER (WHERE e.id IS NOT NULL), '[]') AS employees
         FROM departmentscore ds
         INNER JOIN department d ON ds."departmentId" = d.id
         LEFT JOIN employee e ON e."departmentId" = d.id
         WHERE d."organizationId" = $1
         GROUP BY ds.id, d.name
         ORDER BY ds."totalScore" DESC
         LIMIT 10`,
        [req.user.organizationId]
      );
      res.json(rows.map(d => ({ id: d.departmentId, name: d.departmentName, total_xp: d.totalScore, employees: d.employees })));
    } else {
      const { rows } = await db.query(
        `SELECT e.id, e.name, e."xpTotal", d.name AS "departmentName", d.code AS "departmentCode"
         FROM employee e
         LEFT JOIN department d ON e."departmentId" = d.id
         WHERE e."organizationId" = $1
         ORDER BY e."xpTotal" DESC
         LIMIT 10`,
        [req.user.organizationId]
      );
      res.json(rows.map(e => ({ id: e.id, name: e.name, department: { name: e.departmentName, code: e.departmentCode }, total_xp: e.xpTotal })));
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getRedemptions = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT rr.id, rr."redeemedAt", rr."pointsDeducted",
              e.name AS "employeeName", e.email AS "employeeEmail",
              r.name AS "rewardName", r.description AS "rewardDescription"
       FROM rewardredemption rr
       INNER JOIN employee e ON rr."employeeId" = e.id
       INNER JOIN reward r ON rr."rewardId" = r.id
       WHERE e."organizationId" = $1
       ORDER BY rr."redeemedAt" DESC`,
      [req.user.organizationId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

