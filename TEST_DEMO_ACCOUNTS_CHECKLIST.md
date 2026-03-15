# Test + Demo Accounts Checklist (Team Dashboard)

Use this for UAT/demo so each role is tested with realistic permissions.

## 1) Demo Accounts (by role)

> ⚠️ Use only for demo/testing. Change passwords before production.

| Role | Name | Email | Password | Expected Access |
|---|---|---|---|---|
| ADMIN | Demo Admin | demo.admin@cmd.local | Demo@123 | Full access + approve/reject + audit logs |
| MANAGER | Demo Manager | demo.manager@cmd.local | Demo@123 | Manage records + approve/reject + audit logs |
| VIEWER | Demo Viewer | demo.viewer@cmd.local | Demo@123 | Read-only screens, no create/update/delete |
| USER | Demo Operator | demo.user@cmd.local | Demo@123 | Create/edit own records, critical actions need approval |

---

## 2) What to test per role

### A) ADMIN
- [ ] Login successful
- [ ] Can create/edit/delete shipment
- [ ] Can set shipment to COMPLETED directly
- [ ] Can open `/approvals` and approve/reject requests
- [ ] Can open `/audit-logs` and view entries
- [ ] Ownership fields visible (`ownerId`, `team`, `location`)

### B) MANAGER
- [ ] Login successful
- [ ] Can create/edit/delete shipment
- [ ] Can set shipment to COMPLETED directly
- [ ] Can approve/reject in `/approvals`
- [ ] Can view `/audit-logs`

### C) USER
- [ ] Login successful
- [ ] Can create shipment
- [ ] Can edit own shipment
- [ ] Delete shipment returns **approval requested** (202)
- [ ] Mark COMPLETED returns **approval requested** (202)
- [ ] Cannot approve/reject requests
- [ ] Cannot access manager/admin-only pages (if blocked by policy)

### D) VIEWER
- [ ] Login successful
- [ ] Can view shipment list/details
- [ ] Cannot create shipment (403)
- [ ] Cannot update shipment (403)
- [ ] Cannot delete shipment (403)
- [ ] Cannot access `/approvals`

---

## 3) End-to-end approval workflow test

1. [ ] Login as USER
2. [ ] Create shipment
3. [ ] Try delete OR set status to COMPLETED
4. [ ] Confirm response: `PENDING_APPROVAL` / approval created
5. [ ] Login as MANAGER or ADMIN
6. [ ] Open `/approvals`
7. [ ] Approve request
8. [ ] Verify shipment state updated:
   - delete → `isDeleted=true`
   - complete → `status=COMPLETED`
9. [ ] Verify audit trail in `/audit-logs`

---

## 4) Data checklist for demo quality

Create at least:
- [ ] 8 shipments (mixed statuses)
- [ ] 2 pending approvals
- [ ] 1 approved + 1 rejected approval history
- [ ] Mixed team/location values (e.g., Ops, Support / Pune, Mumbai)

Suggested status mix:
- [ ] PENDING x2
- [ ] ORDER_SENT x2
- [ ] DISPATCHED x1
- [ ] IN_TRANSIT x1
- [ ] DELIVERED x1
- [ ] COMPLETED x1

---

## 5) Quick smoke test commands

After deploy, run basic checks:

```bash
# Home page
curl -I https://computer-management-dashboard.vercel.app

# Shipments API (should return 401 without session)
curl -i https://computer-management-dashboard.vercel.app/api/shipments

# Approvals API (should return 401 without session)
curl -i https://computer-management-dashboard.vercel.app/api/approvals

# Audit logs API (should return 401 without session)
curl -i https://computer-management-dashboard.vercel.app/api/audit-logs
```

---

## 6) Sign-off template

- [ ] Functional test passed
- [ ] Role access control passed
- [ ] Approval workflow passed
- [ ] Audit log visible for all critical actions
- [ ] Live deployment verified

**Tester Name:** ____________  
**Date:** ____________  
**Environment:** Production / Staging  
**Result:** PASS / FAIL
