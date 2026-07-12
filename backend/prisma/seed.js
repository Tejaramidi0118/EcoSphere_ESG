const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing database data...');
  // Delete in reverse order of dependencies to avoid foreign key errors
  await prisma.notification.deleteMany({});
  await prisma.departmentScore.deleteMany({});
  await prisma.rewardRedemption.deleteMany({});
  await prisma.reward.deleteMany({});
  await prisma.employeeBadge.deleteMany({});
  await prisma.badge.deleteMany({});
  await prisma.challengeParticipation.deleteMany({});
  await prisma.challenge.deleteMany({});
  await prisma.complianceIssue.deleteMany({});
  await prisma.audit.deleteMany({});
  await prisma.policyAcknowledgement.deleteMany({});
  await prisma.eSGPolicy.deleteMany({});
  await prisma.employeeParticipation.deleteMany({});
  await prisma.cSRActivity.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.environmentalGoal.deleteMany({});
  await prisma.carbonTransaction.deleteMany({});
  await prisma.emissionFactor.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.organization.deleteMany({});

  console.log('Seeding default organization...');
  const org = await prisma.organization.create({
    data: {
      name: 'EcoSphere Corp',
      industry: 'Technology',
      size: '100-500',
      country: 'United Kingdom',
    },
  });

  console.log('Seeding departments...');
  const mfg = await prisma.department.create({
    data: { name: 'Manufacturing', code: 'MFG', head: 'S. Nair', employeeCount: 134, organizationId: org.id },
  });

  const log = await prisma.department.create({
    data: {
      name: 'Logistics',
      code: 'LOG',
      head: 'R. Iyer',
      employeeCount: 58,
      parentDepartmentId: mfg.id,
      organizationId: org.id,
    },
  });

  const cor = await prisma.department.create({
    data: { name: 'Corporate', code: 'COR', head: 'A. Mehta', employeeCount: 41, organizationId: org.id },
  });

  const rnd = await prisma.department.create({
    data: { name: 'R&D', code: 'RND', head: 'P. Singh', employeeCount: 22, organizationId: org.id },
  });

  const sls = await prisma.department.create({
    data: { name: 'Sales', code: 'SLS', head: 'D. Kapoor', employeeCount: 30, organizationId: org.id },
  });

  console.log('Seeding employees...');
  const passwordHash = await bcrypt.hash('admin123', 10);
  const employeePasswordHash = await bcrypt.hash('employee123', 10);

  const admin = await prisma.employee.create({
    data: {
      name: 'Admin User',
      email: 'admin@ecosphere.io',
      passwordHash,
      role: 'admin',
      departmentId: cor.id,
      organizationId: org.id,
    },
  });

  const priya = await prisma.employee.create({
    data: {
      name: 'Priya Sharma',
      email: 'priya@ecosphere.io',
      passwordHash: employeePasswordHash,
      role: 'employee',
      departmentId: mfg.id,
      xpTotal: 80,
      organizationId: org.id,
    },
  });

  const aditi = await prisma.employee.create({
    data: {
      name: 'Aditi Rao',
      email: 'aditi@ecosphere.io',
      passwordHash: employeePasswordHash,
      role: 'employee',
      departmentId: mfg.id,
      xpTotal: 3910,
      organizationId: org.id,
    },
  });

  const karan = await prisma.employee.create({
    data: {
      name: 'Karan Shah',
      email: 'karan@ecosphere.io',
      passwordHash: employeePasswordHash,
      role: 'employee',
      departmentId: rnd.id,
      xpTotal: 250,
      organizationId: org.id,
    },
  });

  const rIyer = await prisma.employee.create({
    data: {
      name: 'R. Iyer',
      email: 'iyer@ecosphere.io',
      passwordHash: employeePasswordHash,
      role: 'employee',
      departmentId: log.id,
      xpTotal: 450,
      organizationId: org.id,
    },
  });

  const sNair = await prisma.employee.create({
    data: {
      name: 'S. Nair',
      email: 'nair@ecosphere.io',
      passwordHash: employeePasswordHash,
      role: 'employee',
      departmentId: mfg.id,
      xpTotal: 510,
      organizationId: org.id,
    },
  });

  const rohan = await prisma.employee.create({
    data: {
      name: 'Rohan Sen',
      email: 'rohan@ecosphere.io',
      passwordHash: employeePasswordHash,
      role: 'employee',
      departmentId: sls.id,
      xpTotal: 30,
      organizationId: org.id,
    },
  });

  const vikram = await prisma.employee.create({
    data: {
      name: 'Vikram Malhotra',
      email: 'vikram@ecosphere.io',
      passwordHash: employeePasswordHash,
      role: 'employee',
      departmentId: cor.id,
      xpTotal: 120,
      organizationId: org.id,
    },
  });

  console.log('Seeding emission factors...');
  const factors = [
    { name: 'Diesel (average blend)', unit: 'litre', co2PerUnit: 2.58, source: 'DESNZ 2026' },
    { name: 'Petrol (average blend)', unit: 'litre', co2PerUnit: 2.08, source: 'DESNZ 2026' },
    { name: 'Grid Electricity (UK)', unit: 'kWh', co2PerUnit: 0.131, source: 'DESNZ 2026' },
    { name: 'Natural Gas', unit: 'kWh', co2PerUnit: 0.182, source: 'DESNZ 2026' },
    { name: 'Road Freight', unit: 'tonne-km', co2PerUnit: 0.10, source: 'DESNZ 2026' },
    { name: 'Air Freight', unit: 'tonne-km', co2PerUnit: 0.60, source: 'DESNZ 2026' },
  ];

  const dbFactors = {};
  for (const f of factors) {
    dbFactors[f.name] = await prisma.emissionFactor.create({ data: f });
  }

  console.log('Seeding carbon transactions...');
  // Seed some historic carbon transactions
  await prisma.carbonTransaction.create({
    data: {
      departmentId: log.id,
      emissionFactorId: dbFactors['Diesel (average blend)'].id,
      quantity: 145500, // liters
      co2Calculated: 145500 * 2.58,
      sourceType: 'Fleet',
      date: new Date('2026-05-10'),
    },
  });

  await prisma.carbonTransaction.create({
    data: {
      departmentId: mfg.id,
      emissionFactorId: dbFactors['Grid Electricity (UK)'].id,
      quantity: 119512, // kWh
      co2Calculated: 119512 * 0.131,
      sourceType: 'Manufacturing',
      date: new Date('2026-06-15'),
    },
  });

  await prisma.carbonTransaction.create({
    data: {
      departmentId: cor.id,
      emissionFactorId: dbFactors['Natural Gas'].id,
      quantity: 437158, // kWh
      co2Calculated: 437158 * 0.182,
      sourceType: 'Expense',
      date: new Date('2026-04-20'),
    },
  });

  console.log('Seeding environmental goals...');
  await prisma.environmentalGoal.create({
    data: {
      name: 'Reduce Fleet Emissions',
      departmentId: log.id,
      targetCo2: 500000, // 500 t in kg
      currentCo2: 390000,
      deadline: new Date('2026-12-31'),
      status: 'Active',
    },
  });

  await prisma.environmentalGoal.create({
    data: {
      name: 'Cut Packaging Waste',
      departmentId: mfg.id,
      targetCo2: 120000, // 120 t in kg
      currentCo2: 98000,
      deadline: new Date('2026-09-30'),
      status: 'On Track',
    },
  });

  await prisma.environmentalGoal.create({
    data: {
      name: 'Office Energy Cut',
      departmentId: cor.id,
      targetCo2: 80000, // 80 t in kg
      currentCo2: 80000,
      deadline: new Date('2026-06-30'),
      status: 'Completed',
    },
  });

  console.log('Seeding categories...');
  const catCommunity = await prisma.category.create({
    data: { name: 'Community Service', type: 'CSR_ACTIVITY' },
  });
  const catHealth = await prisma.category.create({
    data: { name: 'Health & Wellness', type: 'CSR_ACTIVITY' },
  });
  const catEnvironment = await prisma.category.create({
    data: { name: 'Environment & Climate', type: 'CSR_ACTIVITY' },
  });
  const catEducation = await prisma.category.create({
    data: { name: 'Education & ESG Training', type: 'CSR_ACTIVITY' },
  });

  const catGreenCh = await prisma.category.create({
    data: { name: 'Green Challenge', type: 'CHALLENGE' },
  });
  const catWasteCh = await prisma.category.create({
    data: { name: 'Waste Reduction', type: 'CHALLENGE' },
  });
  const catSustCh = await prisma.category.create({
    data: { name: 'Sustainable Living', type: 'CHALLENGE' },
  });

  console.log('Seeding CSR activities...');
  const actTree = await prisma.cSRActivity.create({
    data: {
      title: 'Tree Plantation Drive',
      categoryId: catEnvironment.id,
      description: 'Planting trees around local industrial parks to reduce carbon footprint. Evidence of planting a sapling is required.',
      evidenceRequired: true,
      status: 'Open',
      organizationId: org.id,
    },
  });

  const actBlood = await prisma.cSRActivity.create({
    data: {
      title: 'Annual Blood Donation',
      categoryId: catHealth.id,
      description: 'Donate blood at the corporate healthcare camp. Certified receipt/slip required.',
      evidenceRequired: true,
      status: 'Open',
      organizationId: org.id,
    },
  });

  const actBeach = await prisma.cSRActivity.create({
    data: {
      title: 'Beach Cleanup Campaign',
      categoryId: catEnvironment.id,
      description: 'Cleaning plastic waste from the public beach. No specific evidence required, just check in.',
      evidenceRequired: false,
      status: 'Open',
      organizationId: org.id,
    },
  });

  const actWorkshop = await prisma.cSRActivity.create({
    data: {
      title: 'ESG Fundamentals Workshop',
      categoryId: catEducation.id,
      description: 'Understand regulatory ESG compliance requirements. Attendance checklist based.',
      evidenceRequired: false,
      status: 'Open',
      organizationId: org.id,
    },
  });

  console.log('Seeding employee participation & streak history...');
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const checkDate = new Date();
    checkDate.setDate(today.getDate() - i);
    await prisma.employeeParticipation.create({
      data: {
        employeeId: aditi.id,
        csrActivityId: actWorkshop.id,
        proofUrl: `streak_day_${5 - i}.pdf`,
        approvalStatus: 'Approved',
        pointsEarned: 20,
        completionDate: checkDate,
      },
    });
  }

  await prisma.employeeParticipation.create({
    data: {
      employeeId: aditi.id,
      csrActivityId: actTree.id,
      proofUrl: 'tree_sapling_aditi.jpg',
      approvalStatus: 'Pending',
      pointsEarned: 50,
      completionDate: today,
    },
  });

  await prisma.employeeParticipation.create({
    data: {
      employeeId: karan.id,
      csrActivityId: actWorkshop.id,
      proofUrl: 'workshop_karan_attendance.pdf',
      approvalStatus: 'Approved',
      pointsEarned: 30,
      completionDate: new Date('2026-07-01'),
    },
  });

  console.log('Seeding ESG policies...');
  const polAnti = await prisma.eSGPolicy.create({
    data: {
      title: 'Anti-Corruption Policy',
      description: 'Rules and guidelines on avoiding bribery, corruption, and conflict of interest.',
      version: '1.0',
      status: 'Active',
      organizationId: org.id,
    },
  });

  const polPrivacy = await prisma.eSGPolicy.create({
    data: {
      title: 'Data Privacy Policy',
      description: 'Org-wide standards on user and client data collection, storage, and privacy.',
      version: '1.0',
      status: 'Active',
      organizationId: org.id,
    },
  });

  const polLabor = await prisma.eSGPolicy.create({
    data: {
      title: 'Fair Labor Practices Guidelines',
      description: 'Working hour checks, workplace safety, and equal opportunity standards specifically for manufacturing operations.',
      version: '1.1',
      status: 'Active',
      departmentId: mfg.id,
      organizationId: org.id,
    },
  });

  console.log('Seeding policy acknowledgements...');
  await prisma.policyAcknowledgement.create({
    data: { policyId: polAnti.id, employeeId: aditi.id, acknowledgedAt: new Date('2026-03-15') },
  });
  await prisma.policyAcknowledgement.create({
    data: { policyId: polPrivacy.id, employeeId: aditi.id, acknowledgedAt: new Date('2026-03-15') },
  });
  await prisma.policyAcknowledgement.create({
    data: { policyId: polLabor.id, employeeId: aditi.id, acknowledgedAt: new Date('2026-04-01') },
  });
  await prisma.policyAcknowledgement.create({
    data: { policyId: polAnti.id, employeeId: karan.id, acknowledgedAt: new Date('2026-05-10') },
  });

  console.log('Seeding audits...');
  const auditWaste = await prisma.audit.create({
    data: {
      title: 'Q2 Waste Audit',
      departmentId: mfg.id,
      auditorName: 'S. Nair',
      date: new Date('2026-06-12'),
      findingsSummary: '3 minor issues regarding non-labeled recycling containers in assembly line A.',
      status: 'Completed',
    },
  });

  const auditVendor = await prisma.audit.create({
    data: {
      title: 'Vendor Compliance Check',
      departmentId: log.id,
      auditorName: 'R. Iyer',
      date: new Date('2026-07-01'),
      findingsSummary: '1 open issue regarding logistics subcontractor diesel certification.',
      status: 'Under Review',
    },
  });

  console.log('Seeding compliance issues...');
  await prisma.complianceIssue.create({
    data: {
      auditId: auditWaste.id,
      title: 'Missing MSDS sheets',
      severity: 'High',
      departmentId: mfg.id,
      ownerEmployeeId: sNair.id,
      dueDate: new Date('2026-08-31'),
      status: 'Open',
      description: 'Material Safety Data Sheets missing for cleaning chemicals in Bay 3.',
    },
  });

  await prisma.complianceIssue.create({
    data: {
      auditId: auditVendor.id,
      title: 'Late subcontractor disclosure',
      severity: 'Medium',
      departmentId: log.id,
      ownerEmployeeId: rIyer.id,
      dueDate: new Date('2026-07-10'),
      status: 'Resolved',
      description: 'Subcontractor emissions certification forms were delivered 5 days past due date.',
    },
  });

  console.log('Seeding challenges...');
  const chalSust = await prisma.challenge.create({
    data: {
      title: 'Sustainability Sprint',
      categoryId: catGreenCh.id,
      description: 'Go a whole week with zero-single-use plastics. Upload a summary report / proof.',
      xp: 200,
      difficulty: 'Hard',
      deadline: new Date('2026-07-20'),
      status: 'Active',
      organizationId: org.id,
    },
  });

  const chalRecycle = await prisma.challenge.create({
    data: {
      title: 'Recycle Challenge',
      categoryId: catWasteCh.id,
      description: 'Recycle 5 items of cardboard, paper, or plastic. Photo proof is required.',
      xp: 80,
      difficulty: 'Easy',
      deadline: new Date('2026-07-15'),
      status: 'Active',
      organizationId: org.id,
    },
  });

  const chalCommute = await prisma.challenge.create({
    data: {
      title: 'Commute Green Week',
      categoryId: catSustCh.id,
      description: 'Commute to work using public transport, carpool, or bicycle for 3 days.',
      xp: 120,
      difficulty: 'Medium',
      deadline: new Date('2026-07-25'),
      status: 'Draft',
      organizationId: org.id,
    },
  });

  console.log('Seeding challenge participation...');
  await prisma.challengeParticipation.create({
    data: {
      challengeId: chalRecycle.id,
      employeeId: aditi.id,
      progressPct: 100,
      proofUrl: 'recycled_items.jpg',
      approvalStatus: 'Approved',
      xpAwarded: 80,
    },
  });

  await prisma.challengeParticipation.create({
    data: {
      challengeId: chalSust.id,
      employeeId: karan.id,
      progressPct: 50,
      proofUrl: 'zero_plastic_day3.jpg',
      approvalStatus: 'Pending',
      xpAwarded: 0,
    },
  });

  console.log('Seeding badges...');
  const badgeBeginner = await prisma.badge.create({
    data: {
      name: 'Green Beginner',
      description: 'First steps on the sustainability path. Awarded for earning 50 XP.',
      icon: 'Leaf',
      unlockRule: JSON.stringify({ type: 'xp', threshold: 50 }),
    },
  });

  const badgeSaver = await prisma.badge.create({
    data: {
      name: 'Carbon Saver',
      description: 'Consistently reducing carbon footprints. Awarded for earning 200 XP.',
      icon: 'ShieldAlert',
      unlockRule: JSON.stringify({ type: 'xp', threshold: 200 }),
    },
  });

  const badgeChamp = await prisma.badge.create({
    data: {
      name: 'Sustainability Champion',
      description: 'Leading the company ESG objectives. Awarded for earning 500 XP.',
      icon: 'Award',
      unlockRule: JSON.stringify({ type: 'xp', threshold: 500 }),
    },
  });

  const badgeTeam = await prisma.badge.create({
    data: {
      name: 'Team Player',
      description: 'Actively participating in sustainability challenges. Awarded for completing 3 challenges.',
      icon: 'Users',
      unlockRule: JSON.stringify({ type: 'challenges_completed', threshold: 3 }),
    },
  });

  console.log('Seeding employee badges...');
  await prisma.employeeBadge.create({
    data: { employeeId: aditi.id, badgeId: badgeBeginner.id, awardedAt: new Date('2026-03-20') },
  });
  await prisma.employeeBadge.create({
    data: { employeeId: aditi.id, badgeId: badgeSaver.id, awardedAt: new Date('2026-05-15') },
  });
  await prisma.employeeBadge.create({
    data: { employeeId: aditi.id, badgeId: badgeChamp.id, awardedAt: new Date('2026-06-01') },
  });
  await prisma.employeeBadge.create({
    data: { employeeId: karan.id, badgeId: badgeBeginner.id, awardedAt: new Date('2026-06-10') },
  });

  console.log('Seeding rewards...');
  await prisma.reward.create({
    data: { name: 'Eco Tote Bag', description: 'Reusable organic cotton shopping bag.', pointsRequired: 100, stock: 50, organizationId: org.id },
  });
  await prisma.reward.create({
    data: { name: 'Extra Day Off', description: 'One paid leave coupon (subject to manager approval).', pointsRequired: 1000, stock: 5, organizationId: org.id },
  });
  await prisma.reward.create({
    data: { name: 'Company Swag Pack', description: 'Recycled steel bottle, pen, and notebook.', pointsRequired: 300, stock: 20, organizationId: org.id },
  });

  console.log('Seeding department scores...');
  // Seed some initial department scores
  await prisma.departmentScore.create({
    data: {
      departmentId: mfg.id,
      envScore: 82.5,
      socialScore: 75.0,
      govScore: 90.0,
      totalScore: 82.5 * 0.4 + 75.0 * 0.3 + 90.0 * 0.3,
    },
  });

  await prisma.departmentScore.create({
    data: {
      departmentId: log.id,
      envScore: 78.0,
      socialScore: 80.0,
      govScore: 85.0,
      totalScore: 78.0 * 0.4 + 80.0 * 0.3 + 85.0 * 0.3,
    },
  });

  await prisma.departmentScore.create({
    data: {
      departmentId: cor.id,
      envScore: 95.0,
      socialScore: 90.0,
      govScore: 95.0,
      totalScore: 95.0 * 0.4 + 90.0 * 0.3 + 95.0 * 0.3,
    },
  });

  console.log('Seeding notifications...');
  await prisma.notification.create({
    data: {
      employeeId: aditi.id,
      type: 'Badge',
      message: 'Congratulations! You unlocked the badge "Sustainability Champion"!',
    },
  });

  await prisma.notification.create({
    data: {
      employeeId: sNair.id,
      type: 'Compliance',
      message: 'Attention: You have a compliance issue "Missing MSDS sheets" due soon (2026-08-31).',
    },
  });

  await prisma.notification.create({
    data: {
      employeeId: null, // Broadcast
      type: 'General',
      message: 'Welcome to EcoSphere! Let\'s build a sustainable future together.',
    },
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
