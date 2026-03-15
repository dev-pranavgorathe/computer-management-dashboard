# 🎭 DEMO ACCOUNTS - ROLE-BASED TESTING

## ✅ **Demo Accounts Created & Seeded**

All accounts are **LIVE** and ready for testing!

---

## 📋 **Demo Credentials**

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **ADMIN** | `demo.admin@cmd.local` | `Demo@123` | Full system access |
| **MANAGER** | `demo.manager@cmd.local` | `Demo@123` | Team management + approvals |
| **USER** | `demo.user@cmd.local` | `Demo@123` | Create/edit own records |
| **VIEWER** | `demo.viewer@cmd.local` | `Demo@123` | Read-only access |

---

## 🔐 **Role-Based Access Testing Checklist**

### **1. ADMIN (demo.admin@cmd.local)**

**Can Access:**
- ✅ Dashboard (all tabs)
- ✅ Shipments (full CRUD)
- ✅ Complaints (full CRUD)
- ✅ Repossession (full CRUD)
- ✅ Redeployment (full CRUD)
- ✅ Templates (full CRUD)
- ✅ **Approvals** (view + approve/reject)
- ✅ **Audit Logs** (view + export)
- ✅ **Permissions** (manage roles + users)
- ✅ Summary Reports (full access)

**Special Powers:**
- ✅ Delete any record without approval
- ✅ Mark shipments as COMPLETED directly
- ✅ View all audit logs
- ✅ Change user roles
- ✅ Override approvals
- ✅ Manage system settings

**Test Actions:**
- [ ] Login successful
- [ ] View all menu items
- [ ] Create a shipment
- [ ] Delete a shipment (no approval needed)
- [ ] Mark shipment as COMPLETED
- [ ] View Audit Logs
- [ ] View Approval Queue
- [ ] Approve/reject a request
- [ ] Access Permissions page
- [ ] Change a user's role

---

### **2. MANAGER (demo.manager@cmd.local)**

**Can Access:**
- ✅ Dashboard (all tabs)
- ✅ Shipments (full CRUD)
- ✅ Complaints (full CRUD + resolve)
- ✅ Repossession (full CRUD + approve)
- ✅ Redeployment (full CRUD + approve)
- ✅ Templates (view + edit)
- ✅ **Approvals** (view + approve/reject)
- ✅ **Audit Logs** (view + export)
- ❌ Permissions (NO access)
- ✅ Summary Reports (full access)

**Special Powers:**
- ✅ Approve/reject requests
- ✅ Mark shipments as COMPLETED directly
- ✅ Delete records (needs approval for some)
- ✅ View team audit logs
- ✅ Export reports

**Test Actions:**
- [ ] Login successful
- [ ] View all menu items except Permissions
- [ ] Create a shipment
- [ ] Delete a shipment (check if approval needed)
- [ ] Mark shipment as COMPLETED
- [ ] View Audit Logs
- [ ] View Approval Queue
- [ ] Approve/reject a request
- [ ] Try accessing /permissions (should fail)

---

### **3. USER (demo.user@cmd.local)**

**Can Access:**
- ✅ Dashboard (view)
- ✅ Shipments (create + edit own)
- ✅ Complaints (create + edit own)
- ✅ Repossession (view only)
- ✅ Redeployment (view only)
- ❌ Templates (NO access)
- ❌ Approvals (NO access)
- ❌ Audit Logs (NO access)
- ❌ Permissions (NO access)
- ✅ Summary Reports (view only)

**Restrictions:**
- ❌ Cannot delete shipments (requires approval)
- ❌ Cannot mark as COMPLETED (requires approval)
- ❌ Cannot view approvals
- ❌ Cannot view audit logs
- ❌ Cannot manage users

**Test Actions:**
- [ ] Login successful
- [ ] View limited menu items
- [ ] Create a shipment
- [ ] Edit own shipment
- [ ] Try to delete a shipment (should request approval)
- [ ] Try to mark as COMPLETED (should request approval)
- [ ] Try accessing /approvals (should fail)
- [ ] Try accessing /audit-logs (should fail)
- [ ] Try accessing /permissions (should fail)

---

### **4. VIEWER (demo.viewer@cmd.local)**

**Can Access:**
- ✅ Dashboard (view only)
- ✅ Shipments (view only)
- ✅ Complaints (view only)
- ❌ Repossession (NO access)
- ❌ Redeployment (NO access)
- ❌ Templates (NO access)
- ❌ Approvals (NO access)
- ❌ Audit Logs (NO access)
- ❌ Permissions (NO access)
- ✅ Summary Reports (view only)

**Restrictions:**
- ❌ Cannot create any records
- ❌ Cannot edit any records
- ❌ Cannot delete any records
- ❌ Cannot access approvals
- ❌ Cannot view audit logs
- ❌ Read-only access

**Test Actions:**
- [ ] Login successful
- [ ] View very limited menu items
- [ ] View shipments (read-only)
- [ ] View complaints (read-only)
- [ ] Try to create a shipment (should fail)
- [ ] Try to edit a shipment (should fail)
- [ ] Try to delete a shipment (should fail)
- [ ] Try accessing /approvals (should fail)
- [ ] Try accessing /audit-logs (should fail)

---

## 🧪 **Automated Testing Results**

### **Database Seeding: ✅ SUCCESS**
- ✅ 4 demo users created
- ✅ 3 demo shipments created
- ✅ 1 pending approval request created
- ✅ All users have email verified
- ✅ All users are active

### **Test Data Created:**
- **SHP-DEMO-001**: DELIVERED (Owner: Manager)
- **SHP-DEMO-002**: PENDING (Owner: User) - Has approval request
- **SHP-DEMO-003**: ORDER_SENT (Owner: Manager)

---

## 🎯 **Manual Testing Steps**

### **Test 1: Admin Full Access**
```
URL: https://computer-management-dashboard.vercel.app
Email: demo.admin@cmd.local
Password: Demo@123

Expected: See all menu items, full CRUD access, can manage roles
```

### **Test 2: Manager Approval Flow**
```
URL: https://computer-management-dashboard.vercel.app
Email: demo.manager@cmd.local
Password: Demo@123

Expected: Can approve/reject, but cannot access Permissions
```

### **Test 3: User Approval Required**
```
URL: https://computer-management-dashboard.vercel.app
Email: demo.user@cmd.local
Password: Demo@123

Expected: Limited access, delete/complete actions require approval
```

### **Test 4: Viewer Read-Only**
```
URL: https://computer-management-dashboard.vercel.app
Email: demo.viewer@cmd.local
Password: Demo@123

Expected: Can only view, no create/edit/delete actions
```

---

## 📊 **Permission Matrix Quick Reference**

| Feature | ADMIN | MANAGER | USER | VIEWER |
|---------|-------|---------|------|--------|
| **Dashboard** | ✅ Full | ✅ Full | ✅ View | ✅ View |
| **Shipments** | ✅ CRUD | ✅ CRUD | ✅ CR (own) | ✅ R |
| **Approvals** | ✅ Full | ✅ Approve | ❌ No | ❌ No |
| **Audit Logs** | ✅ Full | ✅ View | ❌ No | ❌ No |
| **Permissions** | ✅ Manage | ❌ No | ❌ No | ❌ No |
| **Delete Records** | ✅ Direct | ⚠️ Some need approval | ⚠️ Needs approval | ❌ No |
| **Complete Shipment** | ✅ Direct | ✅ Direct | ⚠️ Needs approval | ❌ No |

---

## 🚀 **Live Testing URL**

**Production Site:** `https://computer-management-dashboard.vercel.app`

**Quick Test:**
1. Open the URL
2. Click "Sign In"
3. Use any demo account above
4. Test role-based features

---

## ✅ **Status: READY FOR TESTING**

All demo accounts are:
- ✅ Created in database
- ✅ Email verified
- ✅ Active status
- ✅ Assigned correct roles
- ✅ Linked to test data
- ✅ Ready for login

**Start testing now!** 🎉
