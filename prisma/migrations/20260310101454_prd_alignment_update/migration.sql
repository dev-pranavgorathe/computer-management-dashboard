-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "refId" TEXT NOT NULL,
    "podName" TEXT NOT NULL,
    "shippingAddress" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "cpus" INTEGER NOT NULL DEFAULT 1,
    "components" TEXT,
    "serials" TEXT,
    "trackingId" TEXT,
    "qcReport" TEXT,
    "signedQc" TEXT,
    "orderDate" DATETIME NOT NULL,
    "dispatchDate" DATETIME,
    "deliveryDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalCost" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    CONSTRAINT "Shipment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "refId" TEXT NOT NULL,
    "ticket" TEXT NOT NULL,
    "podName" TEXT NOT NULL,
    "phase" TEXT,
    "deviceType" TEXT NOT NULL DEFAULT 'CPU',
    "deviceSerial" TEXT,
    "issue" TEXT NOT NULL,
    "description" TEXT,
    "contactPerson" TEXT,
    "mobileNumber" TEXT,
    "reportedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "solvedDate" DATETIME,
    "resolution" TEXT,
    "remarks" TEXT,
    "attachments" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    CONSTRAINT "Complaint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Repossession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "refId" TEXT NOT NULL,
    "ticket" TEXT NOT NULL,
    "podName" TEXT NOT NULL,
    "shippingAddress" TEXT,
    "contactPerson" TEXT,
    "mobileNumber" TEXT,
    "components" TEXT,
    "serials" TEXT,
    "reshippedDate" DATETIME,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    CONSTRAINT "Repossession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Redeployment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "refId" TEXT NOT NULL,
    "podName" TEXT NOT NULL,
    "shippingAddress" TEXT,
    "contactPerson" TEXT,
    "mobileNumber" TEXT,
    "sourcePod" TEXT,
    "components" TEXT,
    "serials" TEXT,
    "complaintTicket" TEXT,
    "trackingId" TEXT,
    "orderDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dispatchDate" DATETIME,
    "deliveryDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    CONSTRAINT "Redeployment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "changes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "id", "image", "name", "password", "role", "updatedAt") SELECT "createdAt", "email", "emailVerified", "id", "image", "name", "password", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_refId_key" ON "Shipment"("refId");

-- CreateIndex
CREATE INDEX "Shipment_userId_idx" ON "Shipment"("userId");

-- CreateIndex
CREATE INDEX "Shipment_status_idx" ON "Shipment"("status");

-- CreateIndex
CREATE INDEX "Shipment_orderDate_idx" ON "Shipment"("orderDate");

-- CreateIndex
CREATE INDEX "Shipment_isDeleted_idx" ON "Shipment"("isDeleted");

-- CreateIndex
CREATE INDEX "Shipment_refId_idx" ON "Shipment"("refId");

-- CreateIndex
CREATE UNIQUE INDEX "Complaint_refId_key" ON "Complaint"("refId");

-- CreateIndex
CREATE UNIQUE INDEX "Complaint_ticket_key" ON "Complaint"("ticket");

-- CreateIndex
CREATE INDEX "Complaint_userId_idx" ON "Complaint"("userId");

-- CreateIndex
CREATE INDEX "Complaint_status_idx" ON "Complaint"("status");

-- CreateIndex
CREATE INDEX "Complaint_priority_idx" ON "Complaint"("priority");

-- CreateIndex
CREATE INDEX "Complaint_deviceSerial_idx" ON "Complaint"("deviceSerial");

-- CreateIndex
CREATE INDEX "Complaint_isDeleted_idx" ON "Complaint"("isDeleted");

-- CreateIndex
CREATE INDEX "Complaint_refId_idx" ON "Complaint"("refId");

-- CreateIndex
CREATE INDEX "Complaint_ticket_idx" ON "Complaint"("ticket");

-- CreateIndex
CREATE UNIQUE INDEX "Repossession_refId_key" ON "Repossession"("refId");

-- CreateIndex
CREATE UNIQUE INDEX "Repossession_ticket_key" ON "Repossession"("ticket");

-- CreateIndex
CREATE INDEX "Repossession_userId_idx" ON "Repossession"("userId");

-- CreateIndex
CREATE INDEX "Repossession_status_idx" ON "Repossession"("status");

-- CreateIndex
CREATE INDEX "Repossession_isDeleted_idx" ON "Repossession"("isDeleted");

-- CreateIndex
CREATE INDEX "Repossession_refId_idx" ON "Repossession"("refId");

-- CreateIndex
CREATE INDEX "Repossession_ticket_idx" ON "Repossession"("ticket");

-- CreateIndex
CREATE UNIQUE INDEX "Redeployment_refId_key" ON "Redeployment"("refId");

-- CreateIndex
CREATE INDEX "Redeployment_userId_idx" ON "Redeployment"("userId");

-- CreateIndex
CREATE INDEX "Redeployment_status_idx" ON "Redeployment"("status");

-- CreateIndex
CREATE INDEX "Redeployment_isDeleted_idx" ON "Redeployment"("isDeleted");

-- CreateIndex
CREATE INDEX "Redeployment_refId_idx" ON "Redeployment"("refId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "Session_sessionToken_idx" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "VerificationToken_token_idx" ON "VerificationToken"("token");
