# 📋 Product Requirements Document (PRD)
## Computer Management Dashboard

**Version:** 1.0.0  
**Date:** March 18, 2026  
**Author:** Development Team  
**Status:** Production

---

## 1. Executive Summary

### 1.1 Purpose
The Computer Management Dashboard is a comprehensive web-based application designed to manage and track computer-related operations for an organization. It provides a centralized system for managing shipments, complaints, redeployments, and repossessions of computer equipment across multiple Points of Distribution (PODs).

### 1.2 Scope
This PRD covers the complete feature set of the Computer Management Dashboard including:
- Shipment management and tracking
- Complaint registration and resolution
- Equipment redeployment tracking
- Repossession management
- User authentication and authorization
- Reporting and analytics
- Mobile-responsive interface

### 1.3 Target Audience
- **Primary Users**: IT Administrators, Operations Managers
- **Secondary Users**: Field Technicians, Support Staff
- **Administrators**: System Administrators, Database Administrators

---

## 2. Product Overview

### 2.1 Product Description
A role-based dashboard application built with:
- **Frontend**: Next.js 16.1.6 with TypeScript
- **Backend**: Next.js API Routes with Prisma ORM
- **Database**: Supabase PostgreSQL
- **Deployment**: Vercel (Production)
- **Authentication**: NextAuth.js with role-based access control

### 2.2 User Roles & Permissions

| Role | Description | Permissions |
|------|-------------|-------------|
| **ADMIN** | System administrators | Full access to all features |
| **MANAGER** | Operations managers | Create, update, approve records |
| **USER** | Regular staff | Create and view own records |
| **VIEWER** | Read-only access | View records only |

### 2.3 Key Features

#### 2.3.1 Shipment Management
- **Create Shipments**
  - Required fields: POD Name, Shipping Address, Contact Person, Mobile Number
  - Optional: State, Pincode, CPUs, Components, Serials, Tracking ID, QC Reports
  
- **Track Shipments**
  - Status workflow: PENDING → PROCESSING → SHIPPED → DELIVERED → COMPLETED
  - Real-time status updates
  - Automated reference ID generation (SHP-001, SHP-002, etc.)

- **Manage Shipments**
  - Edit shipment details
  - Update status
  - Upload documents (QC Reports, Additional Docs)
  - Add notes and comments

#### 2.3.2 Complaint Management
- **Register Complaints**
  - Required fields: POD Name, Issue Description
  - Ticket generation (CMP-001, CMP-002, etc.)
  - Priority levels: LOW, MEDIUM, HIGH, CRITICAL
  
- **Track Resolution**
  - Status workflow: OPEN → IN_PROGRESS → RESOLVED → CLOSED
  - Resolution notes
  - Time tracking

- **Complaint Analytics**
  - Average resolution time
  - Complaints by category
  - Resolution rate metrics

#### 2.3.3 Redeployment Tracking
- **Create Redeployments**
  - Track equipment moved between locations
  - Link to original shipment
  - Status tracking

- **Redeployment Workflow**
  - PENDING → APPROVED → IN_TRANSIT → COMPLETED
  - Approval required from managers

#### 2.3.4 Repossession Management
- **Record Repossessions**
  - Track equipment recovery
  - Link to original shipment
  - Reason documentation

- **Repossession Process**
  - REQUESTED → APPROVED → SCHEDULED → COMPLETED
  - Asset tracking

#### 2.3.5 Reporting & Analytics
- **Dashboard Overview**
  - Total deployed PCs
  - Active PODs
  - Total shipments
  - Complaints raised/solved
  - Redeployments
  - Repossessions

- **Visual Charts**
  - Bar charts for statistics
  - Status distribution
  - Trend analysis

- **Export Functionality**
  - CSV export
  - Excel export
  - PDF reports (planned)

#### 2.3.6 Authentication & Authorization
- **Login System**
  - Email/password authentication
  - Session management
  - Password reset functionality

- **Role-Based Access**
  - Permission checks on all operations
  - Role-specific UI elements
  - Audit logging

---

## 3. Functional Requirements

### 3.1 Authentication

**FR-1:** Users must authenticate before accessing any protected resources  
**FR-2:** System shall support role-based access control (RBAC)**  
**FR-3:** Session management shall maintain user login state across requests  
**FR-4:** Password reset functionality shall be available for users

### 3.2 Shipment Management

**FR-5:** Users with USER role or higher can create shipments  
**FR-6:** Shipment status shall progress through defined states only  
**FR-7:** Each shipment shall have a unique reference ID (SHP-XXX)
**FR-8:** Shipments shall support document uploads (QC reports, additional docs)
**FR-9:** Users can only edit their own shipments (unless ADMIN/MANAGER)
**FR-10:** Completed shipments shall be locked from further edits

### 3.3 Complaint Management

**FR-11:** Users with USER role or higher can create complaints  
**FR-12:** Complaints shall automatically generate ticket numbers (CMP-XXX)
**FR-13:** Priority levels shall be: LOW, MEDIUM, HIGH, CRITICAL
**FR-14:** Complaint resolution shall track time and resolution details

### 3.4 Redeployment & Repossession

**FR-15:** Redeployments require manager approval  
**FR-16:** Repossessions require manager approval  
**FR-17:** Both shall link to original shipment records

### 3.5 Reporting

**FR-18:** Dashboard shall display real-time statistics  
**FR-19:** Data shall be exportable in CSV and Excel formats  
**FR-20:** Reports shall be filterable by date range

### 3.6 Data Validation

**FR-21:** All API inputs shall be validated using Zod schemas  
**FR-22:** Mobile numbers shall be normalized (Ghana +233 → India +91)
**FR-23:** Dates shall be validated for correct format (DD-MM-YYYY or ISO)

### 3.7 Error Handling

**FR-24:** API errors shall return appropriate HTTP status codes  
**FR-25:** Error messages shall be user-friendly and actionable  
**FR-26:** System shall handle database connection failures gracefully

### 3.8 Mobile Responsiveness

**FR-27:** Dashboard shall be fully responsive on mobile devices  
**FR-28:** Touch targets shall be minimum 44px on mobile  
**FR-29:** Tables shall convert to card view on small screens

---

## 4. Non-Functional Requirements

### 4.1 Performance

**NFR-1:** Page load time shall be under 3 seconds  
**NFR-2:** API response time shall be under 500ms for 95% of requests  
**NFR-3:** Database queries shall be optimized with proper indexing

### 4.2 Security

**NFR-4:** All API routes shall require authentication (except auth endpoints)
**NFR-5:** SQL injection prevention through Prisma ORM  
**NFR-6:** XSS prevention through React's automatic escaping  
**NFR-7:** HTTPS only in production
**NFR-8:** Passwords shall be hashed using bcrypt

### 4.3 Availability

**NFR-9:** System shall maintain 99.5% uptime  
**NFR-10:** Automatic failover for database connections  
**NFR-11:** Graceful degradation for non-critical features

### 4.4 Maintainability

**NFR-12:** Code shall follow TypeScript strict mode  
**NFR-13:** API routes shall include comprehensive error handling  
**NFR-14:** Database schema changes shall use Prisma migrations

### 4.5 Scalability

**NFR-15:** System shall support up to 10,000 shipments  
**NFR-16:** Dashboard shall handle 100+ concurrent users  
**NFR-17:** Database shall support horizontal scaling

### 4.6 Compatibility

**NFR-18:** Supported browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
**NFR-19:** Mobile responsive for screens 320px to 2560px width  
**NFR-20:** Support for both iOS and Android devices

---

## 5. Business Rules

  1. **Shipment Status Flow**
     - PENDING → PROCESSING → SHIPPED → DELIVERED → COMPLETED
     - Only ADMIN/MANAGER can mark as COMPLETED
     - COMPLETED shipments are locked from edits

  2. **Complaint Priority**
     - CRITICAL complaints require immediate attention
     - Auto-escalation after 24 hours if unresolved

  3. **Approval Workflow**
     - Redeployments and Repossessions require manager approval
     - Requesters can track approval status
     - Email notifications on approval/rejection

  4. **Data Retention**
     - Soft delete for all records (isDeleted flag)
     - Audit logs retained indefinitely
     - 90-day retention for deleted records

  5. **Mobile Number Normalization**
     - Ghana numbers (+233) converted to India format (+91)
     - Automatic formatting on save

  6. **Reference ID Generation**
     - Shipments: SHP-001, SHP-002, etc.
     - Complaints: CMP-001, CMP-002, etc.
     - Format: XXX-### (3 letters, dash, 3 digits)

---

## 6. User Interface

### 6.1 Layout Structure

**Desktop:**
- Sidebar navigation (fixed, 218px width)
- Header with user info and actions
- Main content area with scroll

**Mobile:**
- Bottom navigation bar (fixed)
- Hamburger menu for additional options
- Card-based layout for data display

### 6.2 Key Pages

1. **Dashboard** (`/`)
   - KPI cards
   - Recent activities
   - Quick stats

2. **Shipments** (`/shipments`)
   - Data table with filters
   - Create/Edit modal
   - Status badges

3. **Complaints** (`/complaints`)
   - Priority indicators
   - Resolution tracking
   - Timeline view

4. **Redeployments** (`/redeployments`)
   - Location tracking
   - Approval status
   - History

5. **Repossessions** (`/repossessions`)
   - Reason documentation
   - Schedule management

### 6.3 Responsive Design
- **Breakpoints:**
  - Mobile: 320px - 480px
  - Tablet: 481px - 768px
  - Desktop: 769px+

- **Touch Targets:** Minimum 44px height/width on mobile

- **Typography:** Scale-friendly text sizing

---

## 7. Glossary

- **POD**: Point of Distribution - Location where computers are deployed
- **Shipment**: Record of computer equipment delivery
- **Complaint**: Issue or problem reported
- **Redeployment**: Moving equipment between locations
- **Repossession**: Recovery of equipment from a location
- **QC Report**: Quality Control Report
- **Ref ID**: Unique reference identifier (e.g., SHP-001)

---

## 8. Appendices

### Appendix A: Error Codes
- `400` - Bad Request / Validation Error
- `401` - Unauthorized / Not Authenticated
- `403` - Forbidden / Insufficient Permissions
- `404` - Not Found
- `500` - Internal Server Error

### Appendix B: Status Codes
- `PENDING` - Awaiting processing
- `PROCESSING` - Being handled
- `SHIPPED` - In transit
- `DELIVERED` - Arrived at destination
- `COMPLETED` - Successfully finished

---

**Document Version:** 1.0  
**Last Updated:** March 18, 2026  
**Next Review:** June 18, 2026
