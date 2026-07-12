const db = require('../db');

exports.checkAndAwardBadges = async (employeeId) => {
  try {
    const { rows: empRows } = await db.query(
      `SELECT e.*, COALESCE(json_agg(eb."badgeId") FILTER (WHERE eb.id IS NOT NULL), '[]') AS badge_ids
       FROM employee e
       LEFT JOIN employeebadge eb ON eb."employeeId" = e.id
       WHERE e.id = $1
       GROUP BY e.id`,
      [employeeId]
    );
    const employee = empRows[0];
    if (!employee) return;

    const { rows: allBadges } = await db.query('SELECT * FROM badge');

    for (const badge of allBadges) {
      const alreadyHas = employee.badge_ids.includes(badge.id);
      if (alreadyHas) continue;

      const rule = JSON.parse(badge.unlockRule);
      if (rule.type === 'xp' && employee.xpTotal >= rule.threshold) {
        await db.query(
          `INSERT INTO employeebadge ("employeeId", "badgeId") VALUES ($1, $2)`,
          [employeeId, badge.id]
        );
        await db.query(
          `INSERT INTO notification ("employeeId", type, message) VALUES ($1, $2, $3)`,
          [employeeId, 'Badge', `Congratulations! You unlocked the ${badge.name} badge!`]
        );
      }
    }
  } catch (err) {
    console.error('Error awarding badges:', err);
  }
};
