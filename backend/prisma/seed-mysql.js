require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  let connection;

  if (databaseUrl && databaseUrl.startsWith('mysql:')) {
    connection = await mysql.createConnection(databaseUrl);
  } else {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ecosphere',
    });
  }

  console.log('Clearing existing MySQL database data...');
  // Disable foreign key checks to truncate safely
  await connection.query('SET FOREIGN_KEY_CHECKS = 0');
  
  const tables = [
    'Notification', 'DepartmentScore', 'RewardRedemption', 'Reward', 'EmployeeBadge', 'Badge', 
    'ChallengeParticipation', 'Challenge', 'EmployeeParticipation', 'CSRActivity', 'ComplianceIssue', 
    'Audit', 'PolicyAcknowledgement', 'ESGPolicy', 'EnvironmentalGoal', 'CarbonTransaction', 
    'EmissionFactor', 'Category', 'Employee', 'Department', 'Organization'
  ];

  for (const table of tables) {
    await connection.query(`TRUNCATE TABLE ${table}`);
  }
  
  await connection.query('SET FOREIGN_KEY_CHECKS = 1');

  console.log('Seeding default organization...');
  const [orgResult] = await connection.query(
    'INSERT INTO Organization (name, industry, size, country) VALUES (?, ?, ?, ?)',
    ['EcoSphere Corp', 'Manufacturing', '501-1000', 'UK']
  );
  const orgId = orgResult.insertId;

  console.log('Seeding departments...');
  const [mfgResult] = await connection.query(
    'INSERT INTO Department (name, code, head, employeeCount, organizationId) VALUES (?, ?, ?, ?, ?)',
    ['Manufacturing', 'MFG', 'K. Sharma', 142, orgId]
  );
  const mfgId = mfgResult.insertId;

  const [logResult] = await connection.query(
    'INSERT INTO Department (name, code, head, employeeCount, parentDepartmentId, organizationId) VALUES (?, ?, ?, ?, ?, ?)',
    ['Logistics', 'LOG', 'R. Iyer', 58, mfgId, orgId]
  );
  const logId = logResult.insertId;

  const [corResult] = await connection.query(
    'INSERT INTO Department (name, code, head, employeeCount, organizationId) VALUES (?, ?, ?, ?, ?)',
    ['Corporate', 'COR', 'A. Mehta', 41, orgId]
  );
  const corId = corResult.insertId;

  const [rndResult] = await connection.query(
    'INSERT INTO Department (name, code, head, employeeCount, organizationId) VALUES (?, ?, ?, ?, ?)',
    ['R&D', 'RND', 'P. Singh', 22, orgId]
  );
  const rndId = rndResult.insertId;

  const [slsResult] = await connection.query(
    'INSERT INTO Department (name, code, head, employeeCount, organizationId) VALUES (?, ?, ?, ?, ?)',
    ['Sales', 'SLS', 'D. Kapoor', 30, orgId]
  );
  const slsId = slsResult.insertId;

  console.log('Seeding employees...');
  const passwordHash = await bcrypt.hash('admin123', 10);
  const employeePasswordHash = await bcrypt.hash('employee123', 10);

  // Admin user
  const [adminResult] = await connection.query(
    'INSERT INTO Employee (name, email, passwordHash, role, departmentId, organizationId) VALUES (?, ?, ?, ?, ?, ?)',
    ['Admin User', 'admin@ecosphere.io', passwordHash, 'admin', corId, orgId]
  );
  const adminId = adminResult.insertId;

  // Priya Sharma (MFG Manager)
  const [priyaResult] = await connection.query(
    'INSERT INTO Employee (name, email, passwordHash, role, departmentId, organizationId) VALUES (?, ?, ?, ?, ?, ?)',
    ['Priya Sharma', 'priya@ecosphere.io', employeePasswordHash, 'employee', mfgId, orgId]
  );
  const priyaId = priyaResult.insertId;

  // Aditi Rao (MFG Employee)
  const [aditiResult] = await connection.query(
    'INSERT INTO Employee (name, email, passwordHash, role, departmentId, xpTotal, organizationId) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['Aditi Rao', 'aditi@ecosphere.io', employeePasswordHash, 'employee', mfgId, 3910, orgId]
  );
  const aditiId = aditiResult.insertId;

  // Karan Patel (LOG Employee)
  const [karanResult] = await connection.query(
    'INSERT INTO Employee (name, email, passwordHash, role, departmentId, xpTotal, organizationId) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['Karan Patel', 'karan@ecosphere.io', employeePasswordHash, 'employee', logId, 450, orgId]
  );
  const karanId = karanResult.insertId;

  // Rohan Sen (SLS Employee)
  const [rohanResult] = await connection.query(
    'INSERT INTO Employee (name, email, passwordHash, role, departmentId, xpTotal, organizationId) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['Rohan Sen', 'rohan@ecosphere.io', employeePasswordHash, 'employee', slsId, 30, orgId]
  );
  const rohanId = rohanResult.insertId;

  // Vikram Malhotra (COR Employee)
  const [vikramResult] = await connection.query(
    'INSERT INTO Employee (name, email, passwordHash, role, departmentId, xpTotal, organizationId) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['Vikram Malhotra', 'vikram@ecosphere.io', employeePasswordHash, 'employee', corId, 120, orgId]
  );
  const _vikramId = vikramResult.insertId;

  console.log('Seeding emission factors...');
  const factors = [
    ['Diesel (average blend)', 'litre', 2.58, 'DESNZ 2026'],
    ['Petrol (average blend)', 'litre', 2.08, 'DESNZ 2026'],
    ['Grid Electricity (UK)', 'kWh', 0.131, 'DESNZ 2026'],
    ['Natural Gas', 'kWh', 0.182, 'DESNZ 2026'],
    ['Road Freight', 'tonne-km', 0.10, 'DESNZ 2026'],
    ['Air Freight', 'tonne-km', 0.60, 'DESNZ 2026'],
  ];

  const efMap = {};
  for (const f of factors) {
    const [efRes] = await connection.query(
      'INSERT INTO EmissionFactor (name, unit, co2PerUnit, source) VALUES (?, ?, ?, ?)',
      f
    );
    efMap[f[0]] = efRes.insertId;
  }

  console.log('Seeding carbon transactions...');
  const transactions = [
    [mfgId, efMap['Grid Electricity (UK)'], 25000, 25000 * 0.131, 'Purchase', new Date('2026-06-15')],
    [mfgId, efMap['Diesel (average blend)'], 1200, 1200 * 2.58, 'Fleet', new Date('2026-06-28')],
    [logId, efMap['Road Freight'], 15000, 15000 * 0.10, 'Fleet', new Date('2026-07-02')],
    [corId, efMap['Grid Electricity (UK)'], 4200, 4200 * 0.131, 'Purchase', new Date('2026-07-05')],
    [rndId, efMap['Natural Gas'], 8000, 8000 * 0.182, 'Expense', new Date('2026-07-08')],
  ];

  for (const t of transactions) {
    await connection.query(
      'INSERT INTO CarbonTransaction (departmentId, emissionFactorId, quantity, co2Calculated, sourceType, date) VALUES (?, ?, ?, ?, ?, ?)',
      t
    );
  }

  console.log('Seeding environmental goals...');
  const goals = [
    ['Reduce Grid Dependence', mfgId, 3000.0, 25000 * 0.131, new Date('2026-12-31'), 'On Track'],
    ['Optimize Logistics Routes', logId, 1200.0, 15000 * 0.10, new Date('2026-09-30'), 'On Track'],
    ['HQ Efficiency Goal', corId, 500.0, 4200 * 0.131, new Date('2026-12-31'), 'On Track'],
  ];

  for (const g of goals) {
    await connection.query(
      'INSERT INTO EnvironmentalGoal (name, departmentId, targetCo2, currentCo2, deadline, status) VALUES (?, ?, ?, ?, ?, ?)',
      g
    );
  }

  console.log('Seeding categories...');
  const [csrCatRes] = await connection.query(
    'INSERT INTO Category (name, type, status) VALUES (?, ?, ?)',
    ['Community Outreach', 'CSR_ACTIVITY', 'Active']
  );
  const csrCatId = csrCatRes.insertId;

  const [chalCatRes] = await connection.query(
    'INSERT INTO Category (name, type, status) VALUES (?, ?, ?)',
    ['Office Footprint Reduction', 'CHALLENGE', 'Active']
  );
  const chalCatId = chalCatRes.insertId;

  console.log('Seeding CSR activities...');
  const [actTreeRes] = await connection.query(
    'INSERT INTO CSRActivity (title, categoryId, description, evidenceRequired, status, organizationId) VALUES (?, ?, ?, ?, ?, ?)',
    ['Tree Plantation Drive', csrCatId, 'Plant saplings at local municipal ground. 1 sapling = 50 XP.', true, 'Open', orgId]
  );
  const actTreeId = actTreeRes.insertId;

  const [actWorkshopRes] = await connection.query(
    'INSERT INTO CSRActivity (title, categoryId, description, evidenceRequired, status, organizationId) VALUES (?, ?, ?, ?, ?, ?)',
    ['Eco-Awareness Workshop', csrCatId, 'Conduct or attend the monthly ESG literacy session.', false, 'Open', orgId]
  );
  const actWorkshopId = actWorkshopRes.insertId;

  console.log('Seeding employee participation & streak history...');
  // Seed a 5-day consecutive check-in streak for Aditi Rao
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const checkDate = new Date();
    checkDate.setDate(today.getDate() - i);
    await connection.query(
      'INSERT INTO EmployeeParticipation (employeeId, csrActivityId, proofUrl, approvalStatus, pointsEarned, completionDate) VALUES (?, ?, ?, ?, ?, ?)',
      [aditiId, actWorkshopId, `streak_day_${5-i}.pdf`, 'Approved', 20, checkDate]
    );
  }

  // Seed one pending tree plantation for Aditi
  await connection.query(
    'INSERT INTO EmployeeParticipation (employeeId, csrActivityId, proofUrl, approvalStatus, pointsEarned, completionDate) VALUES (?, ?, ?, ?, ?, ?)',
    [aditiId, actTreeId, 'tree_sapling_aditi.jpg', 'Pending', 50, today]
  );

  // Seed one approved participation for Karan
  await connection.query(
    'INSERT INTO EmployeeParticipation (employeeId, csrActivityId, proofUrl, approvalStatus, pointsEarned, completionDate) VALUES (?, ?, ?, ?, ?, ?)',
    [karanId, actWorkshopId, 'workshop_karan_attendance.pdf', 'Approved', 30, new Date('2026-07-01')]
  );

  console.log('Seeding ESG policies...');
  const [polAntiRes] = await connection.query(
    'INSERT INTO ESGPolicy (title, description, departmentId, version, status, organizationId) VALUES (?, ?, ?, ?, ?, ?)',
    ['Anti-Corruption Policy', 'Guidelines on avoiding conflicts of interest and bribes.', null, '1.1', 'Active', orgId]
  );
  const polAntiId = polAntiRes.insertId;

  const [polSafetyRes] = await connection.query(
    'INSERT INTO ESGPolicy (title, description, departmentId, version, status, organizationId) VALUES (?, ?, ?, ?, ?, ?)',
    ['Factory Floor Health & Safety', 'Mandatory safety wear protocols on assembly floor.', mfgId, '2.0', 'Active', orgId]
  );
  const polSafetyId = polSafetyRes.insertId;

  console.log('Seeding policy acknowledgements...');
  await connection.query(
    'INSERT INTO PolicyAcknowledgement (policyId, employeeId, acknowledgedAt) VALUES (?, ?, ?)',
    [polAntiId, aditiId, new Date('2026-07-08')]
  );
  await connection.query(
    'INSERT INTO PolicyAcknowledgement (policyId, employeeId, acknowledgedAt) VALUES (?, ?, ?)',
    [polSafetyId, aditiId, new Date('2026-07-09')]
  );
  await connection.query(
    'INSERT INTO PolicyAcknowledgement (policyId, employeeId, acknowledgedAt) VALUES (?, ?, ?)',
    [polAntiId, karanId, new Date('2026-07-10')]
  );

  console.log('Seeding audits...');
  const [auditRes] = await connection.query(
    'INSERT INTO Audit (title, departmentId, auditorName, date, findingsSummary, status) VALUES (?, ?, ?, ?, ?, ?)',
    ['Assembly Floor Safety Audit', mfgId, 'Bureau Veritas', new Date('2026-07-01'), 'Evaluated warehouse helmet check-ins.', 'Completed']
  );
  const auditId = auditRes.insertId;

  console.log('Seeding compliance issues...');
  await connection.query(
    'INSERT INTO ComplianceIssue (auditId, title, severity, departmentId, ownerEmployeeId, dueDate, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [auditId, 'Missing Safety Signages in Zone B', 'Medium', mfgId, priyaId, new Date('2026-08-01'), 'Open', 'zone signages required.']
  );

  console.log('Seeding challenges...');
  const [chalCommuteRes] = await connection.query(
    'INSERT INTO Challenge (title, categoryId, description, xp, difficulty, evidenceRequired, deadline, status, organizationId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ['Cycle to Work Day', chalCatId, 'Commute without private fuel vehicles today.', 150, 'Medium', true, new Date('2026-07-15'), 'Active', orgId]
  );
  const chalCommuteId = chalCommuteRes.insertId;

  const [chalCupRes] = await connection.query(
    'INSERT INTO Challenge (title, categoryId, description, xp, difficulty, evidenceRequired, deadline, status, organizationId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ['Reusable Cup Challenge', chalCatId, 'Avoid single-use paper cups at the cafeteria.', 80, 'Easy', false, new Date('2026-07-20'), 'Active', orgId]
  );
  const chalCupId = chalCupRes.insertId;

  console.log('Seeding challenge participation...');
  await connection.query(
    'INSERT INTO ChallengeParticipation (challengeId, employeeId, progressPct, proofUrl, approvalStatus, xpAwarded) VALUES (?, ?, ?, ?, ?, ?)',
    [chalCommuteId, aditiId, 100.0, 'cycle_commute.jpg', 'Approved', 150]
  );
  await connection.query(
    'INSERT INTO ChallengeParticipation (challengeId, employeeId, progressPct, proofUrl, approvalStatus, xpAwarded) VALUES (?, ?, ?, ?, ?, ?)',
    [chalCupId, aditiId, 100.0, null, 'Approved', 80]
  );

  console.log('Seeding badges...');
  const [badgeRes] = await connection.query(
    'INSERT INTO Badge (name, description, icon, unlockRule) VALUES (?, ?, ?, ?)',
    ['Green Pioneer', 'Unlock by earning 500 XP.', 'pioneer_medal.png', '{"type":"xp","threshold":500}']
  );
  const badgeId = badgeRes.insertId;

  console.log('Seeding employee badges...');
  await connection.query(
    'INSERT INTO EmployeeBadge (employeeId, badgeId) VALUES (?, ?)',
    [aditiId, badgeId]
  );

  console.log('Seeding rewards...');
  await connection.query(
    'INSERT INTO Reward (name, description, pointsRequired, stock, status, organizationId) VALUES (?, ?, ?, ?, ?, ?)',
    ['Organic Coffee Mug', 'Eco-friendly mug.', 200, 50, 'Active', orgId]
  );
  await connection.query(
    'INSERT INTO Reward (name, description, pointsRequired, stock, status, organizationId) VALUES (?, ?, ?, ?, ?, ?)',
    ['Extra WFH Day Pass', 'Requires manager review.', 500, 10, 'Active', orgId]
  );

  console.log('Seeding department scores...');
  await connection.query(
    'INSERT INTO DepartmentScore (departmentId, envScore, socialScore, govScore, totalScore) VALUES (?, ?, ?, ?, ?)',
    [mfgId, 85, 90, 75, 83.5]
  );
  await connection.query(
    'INSERT INTO DepartmentScore (departmentId, envScore, socialScore, govScore, totalScore) VALUES (?, ?, ?, ?, ?)',
    [logId, 45, 30, 40, 39.5]
  );
  await connection.query(
    'INSERT INTO DepartmentScore (departmentId, envScore, socialScore, govScore, totalScore) VALUES (?, ?, ?, ?, ?)',
    [corId, 60, 50, 80, 62.0]
  );

  console.log('Seeding recent notifications...');
  await connection.query(
    'INSERT INTO Notification (employeeId, type, message, isRead) VALUES (?, ?, ?, ?)',
    [null, 'System', 'Welcome to EcoSphere ESG Platform!', false]
  );
  await connection.query(
    'INSERT INTO Notification (employeeId, type, message, isRead) VALUES (?, ?, ?, ?)',
    [adminId, 'Action Required', 'New policy acknowledgement pending review.', false]
  );

  console.log('Database seeding completed successfully!');
  await connection.end();
}

seed().catch(err => {
  console.error('MySQL seeding error:', err);
  process.exit(1);
});
