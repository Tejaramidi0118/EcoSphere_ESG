require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function seed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Connected to Supabase PostgreSQL.');

  try {
    console.log('Clearing existing data...');
    await client.query(`
      TRUNCATE TABLE notification, departmentscore, rewardredemption, reward,
        employeebadge, badge, challengeparticipation, challenge,
        employeeparticipation, csractivity, complianceissue, audit,
        policyacknowledgement, esgpolicy, environmentalgoal, carbontransaction,
        emissionfactor, category, employee, department, organization
      RESTART IDENTITY CASCADE
    `);

    console.log('Seeding organization...');
    const orgRes = await client.query(
      `INSERT INTO organization (name, industry, size, country) VALUES ($1, $2, $3, $4) RETURNING id`,
      ['EcoSphere Corp', 'Manufacturing', '501-1000', 'UK']
    );
    const orgId = orgRes.rows[0].id;

    console.log('Seeding departments...');
    const mfgRes = await client.query(
      `INSERT INTO department (name, code, head, "employeeCount", "organizationId") VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      ['Manufacturing', 'MFG', 'K. Sharma', 142, orgId]
    );
    const mfgId = mfgRes.rows[0].id;

    const logRes = await client.query(
      `INSERT INTO department (name, code, head, "employeeCount", "parentDepartmentId", "organizationId") VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      ['Logistics', 'LOG', 'R. Iyer', 58, mfgId, orgId]
    );
    const logId = logRes.rows[0].id;

    const corRes = await client.query(
      `INSERT INTO department (name, code, head, "employeeCount", "organizationId") VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      ['Corporate', 'COR', 'A. Mehta', 41, orgId]
    );
    const corId = corRes.rows[0].id;

    const rndRes = await client.query(
      `INSERT INTO department (name, code, head, "employeeCount", "organizationId") VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      ['R&D', 'RND', 'P. Singh', 22, orgId]
    );
    const rndId = rndRes.rows[0].id;

    const slsRes = await client.query(
      `INSERT INTO department (name, code, head, "employeeCount", "organizationId") VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      ['Sales', 'SLS', 'D. Kapoor', 30, orgId]
    );
    const slsId = slsRes.rows[0].id;

    console.log('Seeding employees...');
    const adminHash = await bcrypt.hash('admin123', 10);
    const empHash = await bcrypt.hash('employee123', 10);

    const adminRes = await client.query(
      `INSERT INTO employee (name, email, "passwordHash", role, "departmentId", "organizationId") VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      ['Admin User', 'admin@ecosphere.io', adminHash, 'admin', corId, orgId]
    );
    const adminId = adminRes.rows[0].id;

    await client.query(
      `INSERT INTO employee (name, email, "passwordHash", role, "departmentId", "organizationId") VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      ['Priya Sharma', 'priya@ecosphere.io', empHash, 'employee', mfgId, orgId]
    );

    const aditiRes = await client.query(
      `INSERT INTO employee (name, email, "passwordHash", role, "departmentId", "xpTotal", "organizationId") VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      ['Aditi Rao', 'aditi@ecosphere.io', empHash, 'employee', mfgId, 3910, orgId]
    );
    const aditiId = aditiRes.rows[0].id;

    const karanRes = await client.query(
      `INSERT INTO employee (name, email, "passwordHash", role, "departmentId", "xpTotal", "organizationId") VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      ['Karan Patel', 'karan@ecosphere.io', empHash, 'employee', logId, 450, orgId]
    );
    const karanId = karanRes.rows[0].id;

    await client.query(
      `INSERT INTO employee (name, email, "passwordHash", role, "departmentId", "xpTotal", "organizationId") VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      ['Rohan Sen', 'rohan@ecosphere.io', empHash, 'employee', slsId, 30, orgId]
    );

    await client.query(
      `INSERT INTO employee (name, email, "passwordHash", role, "departmentId", "xpTotal", "organizationId") VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      ['Vikram Malhotra', 'vikram@ecosphere.io', empHash, 'employee', corId, 120, orgId]
    );

    // Priya as manager-level in MFG
    const priyaRes = await client.query(`SELECT id FROM employee WHERE email = 'priya@ecosphere.io'`);
    const priyaId = priyaRes.rows[0].id;

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
    for (const [name, unit, co2, source] of factors) {
      const r = await client.query(
        `INSERT INTO emissionfactor (name, unit, "co2PerUnit", source) VALUES ($1,$2,$3,$4) RETURNING id`,
        [name, unit, co2, source]
      );
      efMap[name] = r.rows[0].id;
    }

    console.log('Seeding carbon transactions...');
    const transactions = [
      [mfgId, efMap['Grid Electricity (UK)'], 25000, 25000 * 0.131, 'Purchase', '2026-06-15'],
      [mfgId, efMap['Diesel (average blend)'], 1200, 1200 * 2.58, 'Fleet', '2026-06-28'],
      [logId, efMap['Road Freight'], 15000, 15000 * 0.10, 'Fleet', '2026-07-02'],
      [corId, efMap['Grid Electricity (UK)'], 4200, 4200 * 0.131, 'Purchase', '2026-07-05'],
      [rndId, efMap['Natural Gas'], 8000, 8000 * 0.182, 'Expense', '2026-07-08'],
    ];

    for (const [dId, efId, qty, co2, src, dt] of transactions) {
      await client.query(
        `INSERT INTO carbontransaction ("departmentId", "emissionFactorId", quantity, "co2Calculated", "sourceType", date) VALUES ($1,$2,$3,$4,$5,$6)`,
        [dId, efId, qty, co2, src, dt]
      );
    }

    console.log('Seeding environmental goals...');
    await client.query(
      `INSERT INTO environmentalgoal (name, "departmentId", "targetCo2", "currentCo2", deadline, status) VALUES ($1,$2,$3,$4,$5,$6)`,
      ['Reduce Grid Dependence', mfgId, 3000.0, 25000 * 0.131, '2026-12-31', 'On Track']
    );
    await client.query(
      `INSERT INTO environmentalgoal (name, "departmentId", "targetCo2", "currentCo2", deadline, status) VALUES ($1,$2,$3,$4,$5,$6)`,
      ['Optimize Logistics Routes', logId, 1200.0, 15000 * 0.10, '2026-09-30', 'On Track']
    );
    await client.query(
      `INSERT INTO environmentalgoal (name, "departmentId", "targetCo2", "currentCo2", deadline, status) VALUES ($1,$2,$3,$4,$5,$6)`,
      ['HQ Efficiency Goal', corId, 500.0, 4200 * 0.131, '2026-12-31', 'On Track']
    );

    console.log('Seeding categories...');
    const csrCatRes = await client.query(
      `INSERT INTO category (name, type, status) VALUES ($1,$2,$3) RETURNING id`,
      ['Community Outreach', 'CSR_ACTIVITY', 'Active']
    );
    const csrCatId = csrCatRes.rows[0].id;

    const chalCatRes = await client.query(
      `INSERT INTO category (name, type, status) VALUES ($1,$2,$3) RETURNING id`,
      ['Office Footprint Reduction', 'CHALLENGE', 'Active']
    );
    const chalCatId = chalCatRes.rows[0].id;

    console.log('Seeding CSR activities...');
    const actTreeRes = await client.query(
      `INSERT INTO csractivity (title, "categoryId", description, "evidenceRequired", status, "organizationId") VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      ['Tree Plantation Drive', csrCatId, 'Plant saplings at local municipal ground. 1 sapling = 50 XP.', true, 'Open', orgId]
    );
    const actTreeId = actTreeRes.rows[0].id;

    const actWorkshopRes = await client.query(
      `INSERT INTO csractivity (title, "categoryId", description, "evidenceRequired", status, "organizationId") VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      ['Eco-Awareness Workshop', csrCatId, 'Conduct or attend the monthly ESG literacy session.', false, 'Open', orgId]
    );
    const actWorkshopId = actWorkshopRes.rows[0].id;

    await client.query(
      `INSERT INTO csractivity (title, "categoryId", description, "evidenceRequired", status, "organizationId") VALUES ($1,$2,$3,$4,$5,$6)`,
      ['Blood Donation Drive', csrCatId, 'Join our quarterly blood donation campaign at the corporate hall. Be a lifesaver!', false, 'Open', orgId]
    );

    await client.query(
      `INSERT INTO csractivity (title, "categoryId", description, "evidenceRequired", status, "organizationId") VALUES ($1,$2,$3,$4,$5,$6)`,
      ['Beach Plastic Collection', csrCatId, 'Help clean the local coast and gather recyclable plastic waste. 1 kg of plastics = 30 XP.', true, 'Open', orgId]
    );

    console.log('Seeding employee participation (streak)...');
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      await client.query(
        `INSERT INTO employeeparticipation ("employeeId", "csrActivityId", "proofUrl", "approvalStatus", "pointsEarned", "completionDate") VALUES ($1,$2,$3,$4,$5,$6)`,
        [aditiId, actWorkshopId, `streak_day_${5-i}.pdf`, 'Approved', 20, d]
      );
    }

    await client.query(
      `INSERT INTO employeeparticipation ("employeeId", "csrActivityId", "proofUrl", "approvalStatus", "pointsEarned", "completionDate") VALUES ($1,$2,$3,$4,$5,$6)`,
      [aditiId, actTreeId, 'tree_sapling_aditi.jpg', 'Pending', 50, today]
    );

    await client.query(
      `INSERT INTO employeeparticipation ("employeeId", "csrActivityId", "proofUrl", "approvalStatus", "pointsEarned", "completionDate") VALUES ($1,$2,$3,$4,$5,$6)`,
      [karanId, actWorkshopId, 'workshop_karan.pdf', 'Approved', 30, '2026-07-01']
    );

    console.log('Seeding ESG policies...');
    const polAntiRes = await client.query(
      `INSERT INTO esgpolicy (title, description, "departmentId", version, status, "organizationId") VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      ['Anti-Corruption Policy', 'Guidelines on avoiding conflicts of interest and bribes.', null, '1.1', 'Active', orgId]
    );
    const polAntiId = polAntiRes.rows[0].id;

    const polSafetyRes = await client.query(
      `INSERT INTO esgpolicy (title, description, "departmentId", version, status, "organizationId") VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      ['Factory Floor Health & Safety', 'Mandatory safety wear protocols on assembly floor.', mfgId, '2.0', 'Active', orgId]
    );
    const polSafetyId = polSafetyRes.rows[0].id;

    console.log('Seeding policy acknowledgements...');
    await client.query(`INSERT INTO policyacknowledgement ("policyId","employeeId","acknowledgedAt") VALUES ($1,$2,$3)`, [polAntiId, aditiId, '2026-07-08']);
    await client.query(`INSERT INTO policyacknowledgement ("policyId","employeeId","acknowledgedAt") VALUES ($1,$2,$3)`, [polSafetyId, aditiId, '2026-07-09']);
    await client.query(`INSERT INTO policyacknowledgement ("policyId","employeeId","acknowledgedAt") VALUES ($1,$2,$3)`, [polAntiId, karanId, '2026-07-10']);

    console.log('Seeding audit...');
    const auditRes = await client.query(
      `INSERT INTO audit (title, "departmentId", "auditorName", date, "findingsSummary", status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      ['Assembly Floor Safety Audit', mfgId, 'Bureau Veritas', '2026-07-01', 'Evaluated warehouse helmet check-ins.', 'Completed']
    );
    const auditId = auditRes.rows[0].id;

    await client.query(
      `INSERT INTO complianceissue ("auditId", title, severity, "departmentId", "ownerEmployeeId", "dueDate", status, description) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [auditId, 'Missing Safety Signages in Zone B', 'Medium', mfgId, priyaId, '2026-08-01', 'Open', 'Zone signages required.']
    );

    console.log('Seeding challenges...');
    const chalCommuteRes = await client.query(
      `INSERT INTO challenge (title, "categoryId", description, xp, difficulty, "evidenceRequired", deadline, status, "organizationId") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      ['Cycle to Work Day', chalCatId, 'Commute without private fuel vehicles today.', 150, 'Medium', true, '2026-07-15', 'Active', orgId]
    );
    const chalCommuteId = chalCommuteRes.rows[0].id;

    const chalCupRes = await client.query(
      `INSERT INTO challenge (title, "categoryId", description, xp, difficulty, "evidenceRequired", deadline, status, "organizationId") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      ['Reusable Cup Challenge', chalCatId, 'Avoid single-use paper cups at the cafeteria.', 80, 'Easy', false, '2026-07-20', 'Active', orgId]
    );
    const chalCupId = chalCupRes.rows[0].id;

    await client.query(
      `INSERT INTO challenge (title, "categoryId", description, xp, difficulty, "evidenceRequired", deadline, status, "organizationId") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      ['Zero Plastic Lunch', chalCatId, 'Choose reusable lunch boxes and avoid purchasing single-use plastic bottles.', 80, 'Easy', false, '2026-07-25', 'Active', orgId]
    );

    await client.query(
      `INSERT INTO challenge (title, "categoryId", description, xp, difficulty, "evidenceRequired", deadline, status, "organizationId") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      ['Equipment Standby Shutdown', chalCatId, 'Confirm all monitors, chargers, and desktop equipment are completely powered off at 5 PM.', 50, 'Easy', false, '2026-07-30', 'Active', orgId]
    );

    await client.query(
      `INSERT INTO challengeparticipation ("challengeId","employeeId","progressPct","proofUrl","approvalStatus","xpAwarded") VALUES ($1,$2,$3,$4,$5,$6)`,
      [chalCommuteId, aditiId, 100.0, 'cycle_commute.jpg', 'Approved', 150]
    );
    await client.query(
      `INSERT INTO challengeparticipation ("challengeId","employeeId","progressPct","proofUrl","approvalStatus","xpAwarded") VALUES ($1,$2,$3,$4,$5,$6)`,
      [chalCupId, aditiId, 100.0, null, 'Approved', 80]
    );

    console.log('Seeding badges...');
    const badgeRes = await client.query(
      `INSERT INTO badge (name, description, icon, "unlockRule") VALUES ($1,$2,$3,$4) RETURNING id`,
      ['Green Pioneer', 'Unlock by earning 500 XP.', 'pioneer_medal.png', '{"type":"xp","threshold":500}']
    );
    const badgeId = badgeRes.rows[0].id;

    await client.query(`INSERT INTO employeebadge ("employeeId","badgeId") VALUES ($1,$2)`, [aditiId, badgeId]);

    console.log('Seeding rewards...');
    await client.query(
      `INSERT INTO reward (name, description, "pointsRequired", stock, status, "organizationId") VALUES ($1,$2,$3,$4,$5,$6)`,
      ['Organic Coffee Mug', 'Eco-friendly mug.', 200, 50, 'Active', orgId]
    );
    await client.query(
      `INSERT INTO reward (name, description, "pointsRequired", stock, status, "organizationId") VALUES ($1,$2,$3,$4,$5,$6)`,
      ['Extra WFH Day Pass', 'Requires manager review.', 500, 10, 'Active', orgId]
    );

    console.log('Seeding department scores...');
    await client.query(
      `INSERT INTO departmentscore ("departmentId","envScore","socialScore","govScore","totalScore") VALUES ($1,$2,$3,$4,$5)`,
      [mfgId, 85, 90, 75, 83.5]
    );
    await client.query(
      `INSERT INTO departmentscore ("departmentId","envScore","socialScore","govScore","totalScore") VALUES ($1,$2,$3,$4,$5)`,
      [logId, 45, 30, 40, 39.5]
    );
    await client.query(
      `INSERT INTO departmentscore ("departmentId","envScore","socialScore","govScore","totalScore") VALUES ($1,$2,$3,$4,$5)`,
      [corId, 60, 50, 80, 62.0]
    );

    console.log('Seeding notifications...');
    await client.query(
      `INSERT INTO notification ("employeeId", type, message, "isRead") VALUES ($1,$2,$3,$4)`,
      [null, 'System', 'Welcome to EcoSphere ESG Platform!', false]
    );
    await client.query(
      `INSERT INTO notification ("employeeId", type, message, "isRead") VALUES ($1,$2,$3,$4)`,
      [adminId, 'Action Required', 'New policy acknowledgement pending review.', false]
    );

    console.log('✅ Supabase seed completed successfully!');
  } finally {
    await client.end();
  }
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
