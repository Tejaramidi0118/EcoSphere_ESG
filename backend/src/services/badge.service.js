const prisma = require('../db');

exports.checkAndAwardBadges = async (employeeId) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { badges: true }
    });
    if (!employee) return;
    
    const allBadges = await prisma.badge.findMany();
    
    for (const badge of allBadges) {
      const alreadyHas = employee.badges.find(b => b.badgeId === badge.id);
      if (alreadyHas) continue;

      const rule = JSON.parse(badge.unlockRule);
      if (rule.type === 'xp' && employee.xpTotal >= rule.threshold) {
        await prisma.employeeBadge.create({
          data: {
            employeeId,
            badgeId: badge.id
          }
        });
        await prisma.notification.create({
          data: {
            employeeId,
            type: 'Badge',
            message: `Congratulations! You unlocked the ${badge.name} badge!`
          }
        });
      }
    }
  } catch (err) {
    console.error('Error awarding badges:', err);
  }
};
