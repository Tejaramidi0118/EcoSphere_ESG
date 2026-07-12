const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const parts = await prisma.challengeParticipation.findMany();
  const seen = new Set();
  let deleted = 0;
  
  for (const p of parts) {
    const key = `${p.employeeId}-${p.challengeId}`;
    if (seen.has(key)) {
      await prisma.challengeParticipation.delete({ where: { id: p.id }});
      deleted++;
    } else {
      seen.add(key);
    }
  }
  
  console.log(`Successfully cleared ${deleted} duplicate challenge participations.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
