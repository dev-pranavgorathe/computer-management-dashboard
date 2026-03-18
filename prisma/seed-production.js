const { PrismaClient, ShipmentStatus, ComplaintStatus, ComplaintPriority, ShipmentPurpose } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding PRODUCTION database...')
  console.log('Database URL:', process.env.DATABASE_URL?.substring(0, 50) + '...')

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@cmdportal.com' },
    update: {},
    create: {
      email: 'demo@cmdportal.com',
      name: 'Demo Admin',
      password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // demo123
      role: 'ADMIN',
    },
  })

  console.log('✅ Created demo user:', demoUser.email)

  // Create demo shipments
  const shipmentData = [
    {
      podName: 'Mumbai Head Office',
      shippingAddress: '123 Business Park, Andheri East, Mumbai 400069',
      state: 'Maharashtra',
      pincode: '400069',
      contactPerson: 'Rajesh Kumar',
      mobileNumber: '+919876543210',
      cpus: 10,
      components: '10 CPUs, 10 Monitors, 10 Keyboards, 10 Mice, 10 Webcams, 10 Headphones',
      serials: 'CPU-MUM-001 to CPU-MUM-010',
      trackingId: 'CMD123456789',
      purpose: ShipmentPurpose.NEW_POD,
      status: ShipmentStatus.COMPLETED,
      orderDate: new Date('2026-02-15'),
      deliveryDate: new Date('2026-02-20'),
      totalCost: 500000,
      userId: demoUser.id,
    },
    {
      podName: 'Delhi Regional Office',
      shippingAddress: '456 Tech Hub, Connaught Place, New Delhi 110001',
      state: 'Delhi',
      pincode: '110001',
      contactPerson: 'Priya Sharma',
      mobileNumber: '+919876543211',
      cpus: 8,
      components: '8 CPUs, 8 Monitors, 8 Keyboards, 8 Mice, 8 Webcams, 8 Headphones',
      serials: 'CPU-DEL-001 to CPU-DEL-008',
      trackingId: 'CMD123456790',
      purpose: ShipmentPurpose.NEW_POD,
      status: ShipmentStatus.DELIVERED,
      orderDate: new Date('2026-03-01'),
      deliveryDate: new Date('2026-03-05'),
      totalCost: 400000,
      userId: demoUser.id,
    },
    {
      podName: 'Bangalore Tech Center',
      shippingAddress: '789 IT Park, Electronic City, Bangalore 560100',
      state: 'Karnataka',
      pincode: '560100',
      contactPerson: 'Arun Nair',
      mobileNumber: '+919876543212',
      cpus: 15,
      components: '15 CPUs, 15 Monitors, 15 Keyboards, 15 Mice, 15 Webcams, 15 Headphones',
      serials: 'CPU-BLR-001 to CPU-BLR-015',
      trackingId: 'CMD123456791',
      purpose: ShipmentPurpose.NEW_POD,
      status: ShipmentStatus.SHIPPED,
      orderDate: new Date('2026-03-10'),
      dispatchDate: new Date('2026-03-12'),
      totalCost: 750000,
      userId: demoUser.id,
    },
    {
      podName: 'Chennai Branch Office',
      shippingAddress: '321 Business Center, T. Nagar, Chennai 600017',
      state: 'Tamil Nadu',
      pincode: '600017',
      contactPerson: 'Kavitha Menon',
      mobileNumber: '+919876543213',
      cpus: 6,
      components: '6 CPUs, 6 Monitors, 6 Keyboards, 6 Mice, 6 Webcams, 6 Headphones',
      serials: 'CPU-CHN-001 to CPU-CHN-006',
      trackingId: 'CMD123456792',
      purpose: ShipmentPurpose.REPLACEMENT,
      status: ShipmentStatus.PROCESSING,
      orderDate: new Date('2026-03-15'),
      totalCost: 300000,
      notes: 'Replacement for damaged units',
      userId: demoUser.id,
    },
    {
      podName: 'Pune Development Center',
      shippingAddress: '555 Software Park, Hinjewadi, Pune 411057',
      state: 'Maharashtra',
      pincode: '411057',
      contactPerson: 'Sneha Patil',
      mobileNumber: '+919876543214',
      cpus: 12,
      components: '12 CPUs, 12 Monitors, 12 Keyboards, 12 Mice, 12 Webcams, 12 Headphones',
      serials: 'CPU-PUN-001 to CPU-PUN-012',
      trackingId: 'CMD123456793',
      purpose: ShipmentPurpose.MANDEEP,
      status: ShipmentStatus.PENDING,
      orderDate: new Date('2026-03-18'),
      totalCost: 600000,
      notes: 'Priority delivery required',
      userId: demoUser.id,
    },
  ]

  console.log('📦 Creating demo shipments in production...')
  for (const data of shipmentData) {
    const shipment = await prisma.shipment.create({ data })
    console.log(`✅ Created: ${shipment.refId} - ${shipment.podName}`)
  }

  // Create demo complaints
  const complaintData = [
    {
      podName: 'Mumbai Head Office',
      issue: 'System not booting - Power supply failure',
      category: 'Hardware',
      priority: ComplaintPriority.HIGH,
      status: ComplaintStatus.OPEN,
      userId: demoUser.id,
    },
    {
      podName: 'Delhi Regional Office',
      issue: 'Monitor flickering issue on multiple systems',
      category: 'Hardware',
      priority: ComplaintPriority.MEDIUM,
      status: ComplaintStatus.IN_PROGRESS,
      resolution: 'Replaced faulty HDMI cables',
      userId: demoUser.id,
    },
    {
      podName: 'Bangalore Tech Center',
      issue: 'Network connectivity problems',
      category: 'Network',
      priority: ComplaintPriority.HIGH,
      status: ComplaintStatus.RESOLVED,
      resolution: 'Updated network drivers and replaced Ethernet cables',
      resolvedAt: new Date('2026-03-17'),
      userId: demoUser.id,
    },
    {
      podName: 'Chennai Branch Office',
      issue: 'Keyboard keys not responding',
      category: 'Hardware',
      priority: ComplaintPriority.LOW,
      status: ComplaintStatus.CLOSED,
      resolution: 'Cleaned keyboard and replaced worn-out keys',
      resolvedAt: new Date('2026-03-10'),
      userId: demoUser.id,
    },
  ]

  console.log('🎫 Creating demo complaints in production...')
  for (const data of complaintData) {
    const complaint = await prisma.complaint.create({ data })
    console.log(`✅ Created: ${complaint.refId} - ${complaint.issue.substring(0, 30)}...`)
  }

  console.log('\n🎉 Production seeding completed!')
  console.log('\n📊 Summary:')
  console.log(`  - Demo User: demo@cmdportal.com / demo123`)
  console.log(`  - Shipments: ${shipmentData.length}`)
  console.log(`  - Complaints: ${complaintData.length}`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
