# 🚨 Quick Action Plan - Computer Management Dashboard

## ⚠️ CRITICAL: DO NOT DEPLOY TO PRODUCTION YET

Your dashboard has **3 critical blockers** that must be fixed first.

---

## 🔴 CRITICAL BLOCKERS (Fix Immediately)

### 1. Authentication System Using In-Memory Storage
**Location:** `src/app/api/auth/signup/route.ts`

**Problem:**
```typescript
const users: User[] = [] // ❌ In-memory storage
```

**Quick Fix:**
```typescript
// ❌ DELETE THIS:
const users: User[] = []

// ✅ ADD THIS:
import { prisma } from "@/lib/prisma"

// Replace findUserByEmail() with:
const existingUser = await prisma.user.findUnique({
  where: { email }
})

// Replace users.push(user) with:
const user = await prisma.user.create({
  data: { email, password: hashedPassword, name, role: "user" }
})
```

---

### 2. All Pages Using Mock Data
**Location:** All page components

**Quick Fix - Create API routes:**

**File:** `src/app/api/shipments/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const shipments = await prisma.shipment.findMany({
    orderBy: { orderDate: "desc" },
    include: { user: { select: { name: true, email: true } } }
  })

  return NextResponse.json({ data: shipments })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! }
  })

  const body = await request.json()
  const shipment = await prisma.shipment.create({
    data: { ...body, userId: user!.id }
  })

  return NextResponse.json({ data: shipment }, { status: 201 })
}
```

**Update frontend to use API:**
```typescript
// In shipments/page.tsx
const [shipments, setShipments] = useState([])

useEffect(() => {
  fetch('/api/shipments')
    .then(res => res.json())
    .then(data => setShipments(data.data))
}, [])
```

---

### 3. No CSRF Protection
**Quick Fix - Update `next.config.js`:**
```javascript
module.exports = {
  // ... existing config
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}
```

---

## 🟠 HIGH PRIORITY (Fix This Week)

### 4. Add Role-Based Access Control

**Update Prisma Schema:**
```prisma
model User {
  // ... existing fields
  role String @default("user")
}
```

**Create RBAC Helper - `src/lib/auth.ts`:**
```typescript
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { prisma } from "./prisma"

export async function requireRole(allowedRoles: string[]) {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user || !allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return null // Access granted
}
```

---

### 5. Improve Password Validation

```typescript
const signUpSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password too long") // bcrypt limit
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain number")
    .regex(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/, "Must contain special character"),
})
```

---

### 6. Add Comprehensive Validation

**Create `src/lib/validations.ts`:**
```typescript
import { z } from "zod"

export const shipmentSchema = z.object({
  podName: z.string().min(3).max(100),
  shippingAddress: z.string().min(10).max(500),
  contactPerson: z.string().min(2).max(100),
  mobileNumber: z.string().regex(/^\+?[1-9]\d{9,14}$/),
  peripherals: z.string(),
  orderDate: z.coerce.date(),
  dispatchDate: z.coerce.date().optional().nullable(),
  totalCost: z.number().positive().max(10000000),
  status: z.enum(["Processing", "In Transit", "Delivered", "Pending"]),
}).refine(data => {
  if (data.dispatchDate && data.orderDate) {
    return data.dispatchDate >= data.orderDate
  }
  return true
}, { message: "Dispatch must be after order", path: ["dispatchDate"] })
```

---

## 📋 TESTING CHECKLIST

After implementing fixes, test:

### Critical Tests
- [ ] Can create user account (persists after server restart)
- [ ] Can login with created account
- [ ] Can create shipment (saves to database)
- [ ] Can view shipments list (loads from database)
- [ ] Rate limiting works (try 6 signups in a row)
- [ ] Only admin/manager can create shipments

### Security Tests
- [ ] Cannot access API without authentication
- [ ] Cannot access admin functions as regular user
- [ ] Password requirements enforced
- [ ] CSRF headers present in responses

---

## 📊 PROGRESS TRACKER

### Week 1
- [ ] Fix authentication to use database
- [ ] Create shipments API route
- [ ] Update shipments page to use API
- [ ] Add CSRF headers
- [ ] Test basic CRUD operations

### Week 2
- [ ] Implement RBAC
- [ ] Improve password validation
- [ ] Add loading states
- [ ] Create complaints API route

### Week 3
- [ ] Add audit logging
- [ ] Implement pagination
- [ ] Add comprehensive validation
- [ ] Create repossessions API

---

## ✅ WHEN COMPLETE

You'll have:
- ✅ Persistent user authentication
- ✅ Database-backed data management
- ✅ Basic security measures (CSRF, RBAC)
- ✅ Proper validation and error handling

**Then you can safely deploy to production!**

---

*Quick Action Plan | Updated: March 8, 2026*
