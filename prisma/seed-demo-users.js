const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const DEMO_PASSWORD = 'Demo@123'

const demoUsers = [
  { name: 'Demo Admin', email: 'demo.admin@cmd.local', role: 'ADMIN' },
  { name: 'Demo Manager', email: 'demo.manager@cmd.local', role: 'MANAGER' },
  { name: 'Demo Viewer', email: 'demo.viewer@cmd.local', role: 'VIEWER' },
  { name: 'Demo Operator', email: 'demo.user@cmd.local', role: 'USER' },
]

async function upsertUser(user, hashedPassword) {
  return prisma.user.upsert({
    where: { email: user.email },
    update: {
      name: user.name,
      role: user.role,
      isActive: true,
      isDeleted: false,
    },
    create: {
      name: user.name,
      email: user.email,
      password: hashedPassword,
      role: user.role,
      emailVerified: new Date(),
      isActive: true,
    },
  })
}

async function upsertShipment(data) {
  return prisma.shipment.upsert({
    where: { refId: data.refId },
    update: data,
    create: data,
  })
}

async function upsertApproval({ entityId, requesterId }) {
  const exists = await prisma.approvalRequest.findFirst({
    where: {
      entityType: 'Shipment',
      entityId,
      action: 'DELETE',
      status: 'PENDING',
    },
  })

  if (exists) return exists

  return prisma.approvalRequest.create({
    data: {
      entityType: 'Shipment',
      entityId,
      action: 'DELETE',
      status: 'PENDING',
      reason: 'Demo pending approval request',
      requesterId,
    },
  })
}

async function main() {
  console.log('🌱 Seeding demo users + test data...')
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10)

  const createdUsers = {}
  for (const u of demoUsers) {
    const user = await upsertUser(u, hashedPassword)
    createdUsers[u.role] = user
    console.log(`✅ User: ${user.email} (${user.role})`)
  }

  const now = new Date()
  const d = (daysBack) => {
    const x = new Date(now)
    x.setDate(x.getDate() - daysBack)
    return x
  }

  const shipments = [
    {
      refId: 'SHP-DEMO-001',
      podName: 'POD - Pune East',
      shippingAddress: 'Pune East Learning Center, Pune, Maharashtra',
      contactPerson: 'Aman Patil',
      mobileNumber: '9876543210',
      cpus: 8,
      components: '8 CPUs, 8 Monitors, 8 Keyboards, 8 Mice, 8 Webcams, 8 Headphones',
      orderDate: d(7),
      dispatchDate: d(5),
      deliveryDate: d(3),
      status: 'DELIVERED',
      totalCost: 420000,
      notes: 'Demo delivered shipment',
      userId: createdUsers.ADMIN.id,
      ownerId: createdUsers.MANAGER.id,
      team: 'Ops',
      location: 'Pune',
      approvalStatus: 'NOT_REQUIRED',
    },
    {
      refId: 'SHP-DEMO-002',
      podName: 'POD - Mumbai South',
      shippingAddress: 'Mumbai South Education Hub, Mumbai, Maharashtra',
      contactPerson: 'Neha Shah',
      mobileNumber: '9876543211',
      cpus: 5,
      components: '5 CPUs, 5 Monitors, 5 Keyboards, 5 Mice, 5 Webcams, 5 Headphones',
      orderDate: d(4),
      status: 'PENDING',
      totalCost: 250000,
      notes: 'Demo pending shipment',
      userId: createdUsers.USER.id,
      ownerId: createdUsers.USER.id,
      team: 'Support',
      location: 'Mumbai',
      approvalStatus: 'PENDING',
    },
    {
      refId: 'SHP-DEMO-003',
      podName: 'POD - Nashik North',
      shippingAddress: 'Nashik North Skill Center, Nashik, Maharashtra',
      contactPerson: 'Rahul More',
      mobileNumber: '9876543212',
      cpus: 6,
      components: '6 CPUs, 6 Monitors, 6 Keyboards, 6 Mice, 6 Webcams, 6 Headphones',
      orderDate: d(2),
      status: 'ORDER_SENT',
      totalCost: 300000,
      notes: 'Demo order sent',
      userId: createdUsers.MANAGER.id,
      ownerId: createdUsers.MANAGER.id,
      team: 'Ops',
      location: 'Nashik',
      approvalStatus: 'NOT_REQUIRED',
    },
  ]

  const seededShipments = []
  for (const s of shipments) {
    const shipment = await upsertShipment(s)
    seededShipments.push(shipment)
    console.log(`✅ Shipment: ${shipment.refId} (${shipment.status})`)
  }

  const pendingTarget = seededShipments.find((s) => s.refId === 'SHP-DEMO-002')
  if (pendingTarget) {
    await upsertApproval({ entityId: pendingTarget.id, requesterId: createdUsers.USER.id })
    console.log('✅ Pending approval request created for demo workflow')
  }

  console.log('\n🎉 Demo seed complete!')
  console.log('\nDemo credentials:')
  console.log('  demo.admin@cmd.local   / Demo@123')
  console.log('  demo.manager@cmd.local / Demo@123')
  console.log('  demo.viewer@cmd.local  / Demo@123')
  console.log('  demo.user@cmd.local    / Demo@123')
}

main()
  .catch((e) => {
    console.error('❌ Demo seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
