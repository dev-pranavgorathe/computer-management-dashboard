const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test user
  const hashedPassword = await bcrypt.hash('Test1234!', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@apnipathshala.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@apnipathshala.com',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
      isActive: true,
    },
  })
  
  console.log('✅ Created user:', user.email)

  // Create sample shipments
  const shipments = [
    {
      refId: 'SHP-001',
      podName: 'POD - Mumbai Central',
      shippingAddress: '123 Education Hub, Mumbai Central, Mumbai, Maharashtra 400008',
      contactPerson: 'Rajesh Kumar',
      mobileNumber: '+91 98765 43210',
      cpus: 5,
      components: '5 CPUs, 5 Monitors, 5 Keyboards, 5 Mice, 5 Webcams, 5 Headphones',
      serials: 'CPU001, CPU002, CPU003, CPU004, CPU005',
      trackingId: 'SCG-2024-001',
      qcReport: 'QC_SHP001_2024.pdf',
      signedQc: 'SignedQC_SHP001_2024.pdf',
      orderDate: new Date('2024-01-15'),
      dispatchDate: new Date('2024-01-18'),
      deliveryDate: new Date('2024-01-22'),
      status: 'COMPLETED',
      totalCost: 250000,
      notes: 'Initial deployment for Phase 1',
    },
    {
      refId: 'SHP-002',
      podName: 'POD - Delhi North',
      shippingAddress: '456 Learning Center, Rohini, Delhi 110085',
      contactPerson: 'Priya Sharma',
      mobileNumber: '+91 98765 43211',
      cpus: 10,
      components: '10 CPUs, 10 Monitors, 10 Keyboards, 10 Mice, 10 Webcams, 10 Headphones',
      serials: 'CPU006, CPU007, CPU008, CPU009, CPU010, CPU011, CPU012, CPU013, CPU014, CPU015',
      trackingId: 'SCG-2024-002',
      qcReport: 'QC_SHP002_2024.pdf',
      orderDate: new Date('2024-02-01'),
      dispatchDate: new Date('2024-02-05'),
      status: 'DELIVERED',
      totalCost: 500000,
      notes: 'Phase 2 deployment - awaiting signed QC',
    },
    {
      refId: 'SHP-003',
      podName: 'POD - Bangalore Tech',
      shippingAddress: '789 Tech Park, Electronic City, Bangalore 560100',
      contactPerson: 'Anand Patel',
      mobileNumber: '+91 98765 43212',
      cpus: 8,
      components: '8 CPUs, 8 Monitors, 8 Keyboards, 8 Mice, 8 Webcams, 8 Headphones',
      serials: null,
      trackingId: null,
      orderDate: new Date('2024-02-10'),
      status: 'IN_TRANSIT',
      totalCost: 400000,
      notes: 'Phase 2 - In transit',
    },
    {
      refId: 'SHP-004',
      podName: 'POD - Chennai South',
      shippingAddress: '321 Knowledge Hub, T. Nagar, Chennai 600017',
      contactPerson: 'Kavitha R',
      mobileNumber: '+91 98765 43213',
      cpus: 6,
      components: '6 CPUs, 6 Monitors, 6 Keyboards, 6 Mice, 6 Webcams, 6 Headphones',
      serials: null,
      trackingId: null,
      orderDate: new Date('2024-02-15'),
      status: 'ORDER_SENT',
      totalCost: 300000,
      notes: 'Order sent to vendor',
    },
    {
      refId: 'SHP-005',
      podName: 'POD - Pune City',
      shippingAddress: '555 Education Lane, Koregaon Park, Pune 411001',
      contactPerson: 'Suresh Mehta',
      mobileNumber: '+91 98765 43214',
      cpus: 4,
      components: '4 CPUs, 4 Monitors, 4 Keyboards, 4 Mice, 4 Webcams, 4 Headphones',
      serials: null,
      trackingId: null,
      orderDate: new Date('2024-02-20'),
      status: 'PENDING',
      totalCost: 200000,
      notes: 'Pending vendor confirmation',
    },
  ]

  for (const shipment of shipments) {
    const created = await prisma.shipment.create({
      data: {
        ...shipment,
        userId: user.id,
      },
    })
    console.log('✅ Created shipment:', created.refId)
  }

  // Create sample complaints
  const complaints = [
    {
      refId: 'CMP-001',
      ticket: 'TKT-0001',
      podName: 'POD - Mumbai Central',
      phase: 'Phase 1',
      deviceType: 'MONITOR',
      deviceSerial: 'MON001',
      issue: 'Monitor not displaying',
      description: 'The monitor screen is flickering and sometimes goes completely black. Issue started after 2 weeks of use.',
      contactPerson: 'Rajesh Kumar',
      mobileNumber: '+91 98765 43210',
      reportedDate: new Date('2024-02-01'),
      solvedDate: new Date('2024-02-05'),
      resolution: 'Replaced faulty HDMI cable and updated display drivers',
      remarks: 'Common issue with this monitor model',
      status: 'SOLVED',
      priority: 'HIGH',
    },
    {
      refId: 'CMP-002',
      ticket: 'TKT-0002',
      podName: 'POD - Delhi North',
      phase: 'Phase 2',
      deviceType: 'KEYBOARD',
      deviceSerial: 'KEY003',
      issue: 'Keys not responding',
      description: 'Multiple keys (A, S, D, F) are not responding on keyboard.',
      contactPerson: 'Priya Sharma',
      mobileNumber: '+91 98765 43211',
      reportedDate: new Date('2024-02-10'),
      resolution: null,
      remarks: null,
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
    },
    {
      refId: 'CMP-003',
      ticket: 'TKT-0003',
      podName: 'POD - Mumbai Central',
      phase: 'Phase 1',
      deviceType: 'CPU',
      deviceSerial: 'CPU002',
      issue: 'System running slow',
      description: 'Computer takes more than 5 minutes to boot and applications are very slow.',
      contactPerson: 'Amit Singh',
      mobileNumber: '+91 98765 43215',
      reportedDate: new Date('2024-02-15'),
      resolution: null,
      remarks: null,
      status: 'OPEN',
      priority: 'MEDIUM',
    },
    {
      refId: 'CMP-004',
      ticket: 'TKT-0004',
      podName: 'POD - Bangalore Tech',
      phase: 'Phase 2',
      deviceType: 'WEBCAM',
      deviceSerial: 'CAM008',
      issue: 'Webcam not detected',
      description: 'The webcam is not being detected by the system. Tried different USB ports.',
      contactPerson: 'Anand Patel',
      mobileNumber: '+91 98765 43212',
      reportedDate: new Date('2024-02-18'),
      resolution: null,
      remarks: null,
      status: 'OPEN',
      priority: 'LOW',
    },
  ]

  for (const complaint of complaints) {
    const created = await prisma.complaint.create({
      data: {
        ...complaint,
        userId: user.id,
      },
    })
    console.log('✅ Created complaint:', created.refId)
  }

  // Create sample repossessions
  const repossessions = [
    {
      refId: 'REP-001',
      ticket: 'TKT-5001',
      podName: 'POD - Mumbai Central',
      shippingAddress: '123 Education Hub, Mumbai Central, Mumbai, Maharashtra 400008',
      contactPerson: 'Rajesh Kumar',
      mobileNumber: '+91 98765 43210',
      components: '1 CPU, 1 Monitor, 1 Keyboard, 1 Mouse',
      serials: 'CPU001, MON001, KEY001, MOU001',
      notes: 'Equipment being moved to new location',
      status: 'COMPLETED',
    },
    {
      refId: 'REP-002',
      ticket: 'TKT-5002',
      podName: 'POD - Delhi North',
      shippingAddress: '456 Learning Center, Rohini, Delhi 110085',
      contactPerson: 'Priya Sharma',
      mobileNumber: '+91 98765 43211',
      components: '1 CPU, 1 Monitor',
      serials: null,
      notes: 'Faulty equipment collection pending',
      status: 'PENDING',
    },
  ]

  for (const repossession of repossessions) {
    const created = await prisma.repossession.create({
      data: {
        ...repossession,
        userId: user.id,
      },
    })
    console.log('✅ Created repossession:', created.refId)
  }

  // Create sample redeployments
  const redeployments = [
    {
      refId: 'RDP-001',
      podName: 'POD - Bangalore Tech',
      shippingAddress: '789 Tech Park, Electronic City, Bangalore 560100',
      contactPerson: 'Anand Patel',
      mobileNumber: '+91 98765 43212',
      sourcePod: 'POD - Mumbai Central',
      components: '1 CPU, 1 Monitor, 1 Keyboard, 1 Mouse',
      serials: 'CPU001, MON001, KEY001, MOU001',
      complaintTicket: 'TKT-0001',
      trackingId: 'RDP-2024-001',
      orderDate: new Date('2024-02-20'),
      status: 'IN_TRANSIT',
      notes: 'Redeploying from Mumbai to Bangalore',
    },
    {
      refId: 'RDP-002',
      podName: 'POD - Chennai South',
      shippingAddress: '321 Knowledge Hub, T. Nagar, Chennai 600017',
      contactPerson: 'Kavitha R',
      mobileNumber: '+91 98765 43213',
      sourcePod: 'POD - Delhi North',
      components: '1 CPU',
      serials: null,
      complaintTicket: null,
      trackingId: null,
      orderDate: new Date('2024-02-22'),
      status: 'PENDING',
      notes: 'Pending approval',
    },
  ]

  for (const redeployment of redeployments) {
    const created = await prisma.redeployment.create({
      data: {
        ...redeployment,
        userId: user.id,
      },
    })
    console.log('✅ Created redeployment:', created.refId)
  }

  console.log('\n🎉 Seeding completed!')
  console.log('\n📊 Summary:')
  console.log('  - 1 Admin user (admin@apnipathshala.com / Test1234!)')
  console.log('  - 5 Shipments (various statuses)')
  console.log('  - 4 Complaints (various statuses)')
  console.log('  - 2 Repossessions')
  console.log('  - 2 Redeployments')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
