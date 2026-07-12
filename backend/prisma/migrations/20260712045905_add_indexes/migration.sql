-- CreateIndex
CREATE INDEX "CarbonTransaction_departmentId_idx" ON "CarbonTransaction"("departmentId");

-- CreateIndex
CREATE INDEX "CarbonTransaction_date_idx" ON "CarbonTransaction"("date");

-- CreateIndex
CREATE INDEX "Challenge_status_idx" ON "Challenge"("status");

-- CreateIndex
CREATE INDEX "ChallengeParticipation_approvalStatus_idx" ON "ChallengeParticipation"("approvalStatus");

-- CreateIndex
CREATE INDEX "ComplianceIssue_status_idx" ON "ComplianceIssue"("status");

-- CreateIndex
CREATE INDEX "ComplianceIssue_departmentId_idx" ON "ComplianceIssue"("departmentId");

-- CreateIndex
CREATE INDEX "ComplianceIssue_dueDate_idx" ON "ComplianceIssue"("dueDate");

-- CreateIndex
CREATE INDEX "Department_status_idx" ON "Department"("status");

-- CreateIndex
CREATE INDEX "EmployeeParticipation_approvalStatus_idx" ON "EmployeeParticipation"("approvalStatus");

-- CreateIndex
CREATE INDEX "EnvironmentalGoal_departmentId_idx" ON "EnvironmentalGoal"("departmentId");

-- CreateIndex
CREATE INDEX "EnvironmentalGoal_status_idx" ON "EnvironmentalGoal"("status");
