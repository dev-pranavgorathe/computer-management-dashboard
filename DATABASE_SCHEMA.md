# Database Schema Documentation

Complete database schema reference for the Computer Management Dashboard.

## 📊 Database Overview

**Database:** PostgreSQL 15+ (Supabase)  
**ORM:** Prisma 5.22.0  
**Connection:** Connection pooling enabled

---

## 🗃️ Tables

### users

User accounts and authentication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, UUID | Unique identifier |
| email | String | UNIQUE, NOT NULL | User email |
| name | String? | - | Full name |
| password | String | NOT NULL | Hashed password (bcrypt) |
| role | Enum | NOT NULL, DEFAULT 'USER' | ADMIN, MANAGER, USER, VIEWER |
| emailVerified | DateTime? | - | Email verification timestamp |
| image | String? | - | Profile image URL |
| createdAt | DateTime | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updatedAt | DateTime | NOT NULL | Last update timestamp |

**Indexes:**
- `email` (UNIQUE)
- `role`

**Relations:**
- Has many: `shipments`, `complaints`, `redeployments`, `repossessions`

---

### shipments

Equipment shipment records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, UUID | Unique identifier |
| refId | String | UNIQUE, NOT NULL | Reference ID (SHP-XXX) |
| podName | String | NOT NULL | POD name |
| shippingAddress | String | NOT NULL | Delivery address |
| state | String? | - | State/Province |
| pincode | String? | - | Postal code |
| contactPerson | String | NOT NULL | Contact name |
| mobileNumber | String | NOT NULL | Phone (normalized) |
| cpus | Int | NOT NULL, DEFAULT 1 | Number of CPUs |
| components | String | NOT NULL | Component list |
| serials | String? | - | Serial numbers |
| trackingId | String? | - | Courier tracking ID |
| qcReport | String? | - | QC report URL |
| signedQc | String? | - | Signed QC URL |
| additionalDocs | String? | - | Additional docs URL |
| purpose | Enum | NOT NULL, DEFAULT 'OTHER' | NEW_POD, MANDEEP, REPLACEMENT, OTHER |
| orderDate | DateTime | NOT NULL | Order date |
| dispatchDate | DateTime? | - | Dispatch date |
| deliveryDate | DateTime? | - | Delivery date |
| totalCost | Float | NOT NULL, DEFAULT 0 | Total cost |
| notes | String? | - | Additional notes |
| status | Enum | NOT NULL, DEFAULT 'PENDING' | PENDING, PROCESSING, SHIPPED, DELIVERED, COMPLETED |
| mailSent | Boolean | NOT NULL, DEFAULT false | Email sent flag |
| team | String? | - | Team assignment |
| location | String? | - | Location |
| approvalStatus | Enum | DEFAULT 'PENDING' | PENDING, APPROVED, REJECTED |
| ownerId | String? | FOREIGN KEY | Owner user ID |
| userId | String | NOT NULL, FOREIGN KEY | Creator user ID |
| createdAt | DateTime | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updatedAt | DateTime | NOT NULL | Last update timestamp |
| deletedAt | DateTime? | - | Soft delete timestamp |
| isDeleted | Boolean | NOT NULL, DEFAULT false | Soft delete flag |

**Indexes:**
- `refId` (UNIQUE)
- `podName`
- `status`
- `orderDate`
- `userId`
- `ownerId`
- `isDeleted`

**Relations:**
- Belongs to: `users` (creator)
- Belongs to: `users` (owner)
- Has many: `complaints`, `redeployments`, `repossessions`

---

### complaints

Complaint/issue records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, UUID | Unique identifier |
| refId | String | UNIQUE, NOT NULL | Reference ID (CMP-XXX) |
| ticket | String | UNIQUE, NOT NULL | Ticket number (TKT-XXXXX) |
| podName | String | NOT NULL | POD name |
| issue | String | NOT NULL | Issue description |
| category | String? | - | Complaint category |
| priority | Enum | NOT NULL, DEFAULT 'MEDIUM' | LOW, MEDIUM, HIGH, CRITICAL |
| status | Enum | NOT NULL, DEFAULT 'OPEN' | OPEN, IN_PROGRESS, RESOLVED, CLOSED |
| resolution | String? | - | Resolution notes |
| resolvedAt | DateTime? | - | Resolution timestamp |
| shipmentId | String? | FOREIGN KEY | Related shipment |
| userId | String | NOT NULL, FOREIGN KEY | Creator user ID |
| createdAt | DateTime | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updatedAt | DateTime | NOT NULL | Last update timestamp |
| deletedAt | DateTime? | - | Soft delete timestamp |
| isDeleted | Boolean | NOT NULL, DEFAULT false | Soft delete flag |

**Indexes:**
- `refId` (UNIQUE)
- `ticket` (UNIQUE)
- `podName`
- `status`
- `priority`
- `userId`

**Relations:**
- Belongs to: `users`
- Belongs to: `shipments` (optional)

---

### redeployments

Equipment redeployment records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, UUID | Unique identifier |
| refId | String | UNIQUE, NOT NULL | Reference ID (RDP-XXX) |
| podName | String | NOT NULL | POD name |
| fromLocation | String | NOT NULL | Current location |
| toLocation | String | NOT NULL | New location |
| reason | String | NOT NULL | Reason for redeployment |
| status | Enum | NOT NULL, DEFAULT 'PENDING' | PENDING, APPROVED, IN_TRANSIT, COMPLETED |
| shipmentId | String? | FOREIGN KEY | Related shipment |
| userId | String | NOT NULL, FOREIGN KEY | Creator user ID |
| createdAt | DateTime | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updatedAt | DateTime | NOT NULL | Last update timestamp |
| deletedAt | DateTime? | - | Soft delete timestamp |
| isDeleted | Boolean | NOT NULL, DEFAULT false | Soft delete flag |

**Indexes:**
- `refId` (UNIQUE)
- `podName`
- `status`

**Relations:**
- Belongs to: `users`
- Belongs to: `shipments` (optional)

---

### repossessions

Equipment repossession records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, UUID | Unique identifier |
| refId | String | UNIQUE, NOT NULL | Reference ID (REP-XXX) |
| podName | String | NOT NULL | POD name |
| reason | String | NOT NULL | Reason for repossession |
| status | Enum | NOT NULL, DEFAULT 'REQUESTED' | REQUESTED, APPROVED, SCHEDULED, COMPLETED |
| shipmentId | String? | FOREIGN KEY | Related shipment |
| userId | String | NOT NULL, FOREIGN KEY | Creator user ID |
| createdAt | DateTime | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updatedAt | DateTime | NOT NULL | Last update timestamp |
| deletedAt | DateTime? | - | Soft delete timestamp |
| isDeleted | Boolean | NOT NULL, DEFAULT false | Soft delete flag |

**Indexes:**
- `refId` (UNIQUE)
- `podName`
- `status`

**Relations:**
- Belongs to: `users`
- Belongs to: `shipments` (optional)

---

### audit_logs

System audit trail.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, UUID | Unique identifier |
| action | Enum | NOT NULL | CREATE, UPDATE, DELETE, APPROVE |
| entityType | String | NOT NULL | Entity type (Shipment, Complaint, etc.) |
| entityId | String | NOT NULL | Entity ID |
| userId | String | NOT NULL, FOREIGN KEY | User who performed action |
| changes | String? | - | JSON of changes |
| ipAddress | String? | - | Client IP address |
| userAgent | String? | - | Client user agent |
| createdAt | DateTime | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `entityType`, `entityId`
- `userId`
- `createdAt`

**Relations:**
- Belongs to: `users`

---

### approval_requests

Approval workflow requests.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, UUID | Unique identifier |
| entityType | String | NOT NULL | Entity type |
| entityId | String | NOT NULL | Entity ID |
| action | Enum | NOT NULL | DELETE, COMPLETE |
| status | Enum | NOT NULL, DEFAULT 'PENDING' | PENDING, APPROVED, REJECTED |
| reason | String? | - | Reason for request |
| payload | String? | - | JSON payload |
| requesterId | String | NOT NULL, FOREIGN KEY | Requesting user |
| approverId | String? | FOREIGN KEY | Approving user |
| createdAt | DateTime | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updatedAt | DateTime | NOT NULL | Last update timestamp |

**Indexes:**
- `entityType`, `entityId`
- `status`
- `requesterId`

**Relations:**
- Belongs to: `users` (requester)
- Belongs to: `users` (approver, optional)

---

## 🔗 Entity Relationships

```
User (1) ────────> (N) Shipment
  │                        │
  │                        ├─> Complaint (N)
  │                        │
  │                        ├─> Redeployment (N)
  │                        │
  │                        └─> Repossession (N)
  │
  ├───────────────────────> (N) AuditLog
  │
  └───────────────────────> (N) ApprovalRequest

Shipment (1) ────────> (N) Complaint
  │
  ├───────────────────────> (N) Redeployment
  │
  └───────────────────────> (N) Repossession
```

---

## 📈 Database Performance

### Indexes

**Primary Indexes:**
- All primary keys use UUID v4
- Unique indexes on reference IDs (refId)
- Foreign key indexes on all relations

**Query Optimization:**
- Composite indexes on commonly queried fields:
  - `(status, createdAt)`
  - `(podName, status)`
  - `(userId, isDeleted)`

### Connection Pooling

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  relationMode = "prisma"
}
```

Pool settings (Supabase):
- **Max connections:** 20
- **Idle timeout:** 30 seconds
- **Connection timeout:** 10 seconds

---

## 🔐 Data Integrity

### Cascading Rules

- **Soft Delete:** Records are soft-deleted (`isDeleted = true`)
- **Orphan Prevention:** Child records require valid parent
- **Audit Trail:** All changes logged to `audit_logs`

### Constraints

**NOT NULL Constraints:**
- `podName` on all main tables
- `userId` on all user-created records
- `status` on all status-tracked tables

**UNIQUE Constraints:**
- `refId` on all reference tables
- `ticket` on complaints
- `email` on users

---

## 🔄 Migrations

### Running Migrations

```bash
# Create migration
npx prisma migrate dev --name describe_change

# Apply to production
npx prisma migrate deploy

# Reset (development only)
npx prisma migrate reset
```

### Migration History

All migrations stored in `prisma/migrations/`:
- `20250318000000_initial_schema`
- `20250318000001_add_audit_logs`
- `20250318000002_add_approval_requests`

---

## 📊 Database Size Estimation

**Per Record Size:**
- Shipment: ~2 KB
- Complaint: ~1 KB
- User: ~500 bytes
- AuditLog: ~500 bytes

**Scaling Estimates:**
- 10,000 shipments: ~20 MB
- 5,000 complaints: ~5 MB
- 100 users: ~50 KB
- 50,000 audit logs: ~25 MB

**Total with 10K shipments:** ~50 MB

---

## 🛠️ Database Maintenance

### Backup Strategy

**Automated Backups:**
- Daily full backups (retained 30 days)
- Hourly incremental backups
- Point-in-time recovery enabled

**Manual Backup:**
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Cleanup Queries

```sql
-- Remove old soft-deleted records (90+ days)
DELETE FROM shipments 
WHERE "isDeleted" = true 
  AND "deletedAt" < NOW() - INTERVAL '90 days';

-- Archive old audit logs (1+ year)
DELETE FROM audit_logs 
WHERE "createdAt" < NOW() - INTERVAL '1 year';
```

---

## 📝 Schema Changes

### Adding a New Field

1. Update `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name add_field_name`
3. Update API validations in `src/lib/validations.ts`
4. Update frontend forms
5. Test and deploy

### Example: Adding Priority to Shipments

```prisma
model Shipment {
  // ... existing fields
  priority Priority @default(MEDIUM)
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

```bash
npx prisma migrate dev --name add_shipment_priority
```

---

**Last Updated:** March 18, 2026
