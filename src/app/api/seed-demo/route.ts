import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'

// POST - Seed demo data (only for admins)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!currentUser || !['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get the demo user
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@cmdportal.com' }
    })

    if (!demoUser) {
      return NextResponse.json({ error: 'Demo user not found' }, { status: 400 })
    }

    // Clear existing data
    await prisma.approvalRequest.deleteMany()
    await prisma.redeployment.deleteMany()
    await prisma.repossession.deleteMany()
    await prisma.complaint.deleteMany()
    await prisma.shipment.deleteMany()

    // Create Shipments
    const shipments = await Promise.all([
      prisma.shipment.create({
        data: {
          refId: 'SHP-001',
          podName: 'POD Pune Central',
          shippingAddress: '123 MG Road, Pune, Maharashtra',
          state: 'Maharashtra',
          pincode: '411001',
          contactPerson: 'Rahul Sharma',
          mobileNumber: '+91 9876543210',
          email: 'rahul@podpune.com',
          userId: demoUser.id,
          cpus: 20,
          components: '20 x CPU i3 Gen 7th, 20 x Monitor 18.5", 20 x Keyboard, 20 x Mouse',
          serials: 'CPU001,CPU002,CPU003,CPU004,CPU005',
          trackingId: 'TRK123456789',
          qcReport: 'QC_2024_001.pdf',
          purpose: 'NEW_POD',
          model: '20 x CPU i3 Gen 7th',
          os: 'Zorin OS 16',
          payment: 'Apni Pathshala',
          qcIssues: 'No',
          shippingCharge: 5000.00,
          status: 'DELIVERED',
          orderDate: new Date('2024-01-15'),
          dispatchDate: new Date('2024-01-18'),
          deliveryDate: new Date('2024-01-22'),
        }
      }),
      prisma.shipment.create({
        data: {
          refId: 'SHP-002',
          podName: 'POD Mumbai West',
          shippingAddress: '456 Linking Road, Bandra, Mumbai',
          state: 'Maharashtra',
          pincode: '400050',
          contactPerson: 'Priya Patel',
          mobileNumber: '+91 9876543211',
          email: 'priya@podmumbai.com',
          userId: demoUser.id,
          cpus: 15,
          components: '15 x CPU i5 Gen 8th, 15 x Monitor 21.5", 15 x Keyboard, 15 x Mouse',
          serials: 'CPU021,CPU022,CPU023,CPU024,CPU025',
          trackingId: 'TRK123456790',
          qcReport: 'QC_2024_002.pdf',
          purpose: 'MANTHAN_POD',
          model: '15 x CPU i5 Gen 8th',
          os: 'Windows 11',
          payment: 'Manthan Foundation',
          qcIssues: 'No',
          shippingCharge: 4500.00,
          status: 'IN_TRANSIT',
          orderDate: new Date('2024-02-01'),
          dispatchDate: new Date('2024-02-05'),
        }
      }),
      prisma.shipment.create({
        data: {
          refId: 'SHP-003',
          podName: 'POD Delhi North',
          shippingAddress: '789 Connaught Place, New Delhi',
          state: 'Delhi',
          pincode: '110001',
          contactPerson: 'Amit Kumar',
          mobileNumber: '+91 9876543212',
          email: 'amit@poddelhi.com',
          userId: demoUser.id,
          cpus: 25,
          components: '25 x CPU i3 Gen 6th, 25 x Monitor 19", 25 x Keyboard, 25 x Mouse',
          serials: 'CPU036,CPU037,CPU038,CPU039,CPU040',
          trackingId: 'TRK123456791',
          qcReport: 'QC_2024_003.pdf',
          purpose: 'TEACH_TO_EARN',
          model: '25 x CPU i3 Gen 6th',
          os: 'Zorin OS 16',
          payment: 'Apni Pathshala',
          qcIssues: 'Yes',
          shippingCharge: 6500.00,
          status: 'ORDER_SENT',
          orderDate: new Date('2024-02-10'),
        }
      }),
    ])

    // Create Complaints
    const complaints = await Promise.all([
      prisma.complaint.create({
        data: {
          refId: 'CMP-001',
          ticket: 'TKT-2024-001',
          podName: 'POD Pune Central',
          phase: 'Phase 1',
          deviceType: 'CPU',
          deviceSerial: 'CPU001',
          issue: 'System not booting',
          description: 'When pressing power button, system shows no display and beeps continuously',
          contactPerson: 'Rahul Sharma',
          mobileNumber: '+91 9876543210',
          reportedDate: new Date('2024-02-01'),
          status: 'OPEN',
          priority: 'HIGH',
          mailSent: false,
          user: { connect: { id: demoUser.id } },
        }
      }),
      prisma.complaint.create({
        data: {
          refId: 'CMP-002',
          ticket: 'TKT-2024-002',
          podName: 'POD Mumbai West',
          phase: 'Phase 2',
          deviceType: 'MONITOR',
          deviceSerial: 'MON015',
          issue: 'Screen flickering',
          description: 'Monitor screen flickers after 30 minutes of continuous use',
          contactPerson: 'Priya Patel',
          mobileNumber: '+91 9876543211',
          reportedDate: new Date('2024-02-05'),
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
          mailSent: true,
          mailSentAt: new Date('2024-02-05'),
          user: { connect: { id: demoUser.id } },
        }
      }),
      prisma.complaint.create({
        data: {
          refId: 'CMP-003',
          ticket: 'TKT-2024-003',
          podName: 'POD Delhi North',
          phase: 'Phase 1',
          deviceType: 'KEYBOARD',
          deviceSerial: 'KB042',
          issue: 'Keys not responding',
          description: 'Multiple keys (A, S, D, F) stopped working suddenly',
          contactPerson: 'Amit Kumar',
          mobileNumber: '+91 9876543212',
          reportedDate: new Date('2024-01-28'),
          solvedDate: new Date('2024-02-03'),
          resolution: 'Keyboard replaced with new unit',
          resolutionMethod: 'Replaced (Under Warranty)',
          status: 'SOLVED',
          priority: 'LOW',
          mailSent: true,
          mailSentAt: new Date('2024-01-28'),
          user: { connect: { id: demoUser.id } },
        }
      }),
    ])

    // Create Repossessions
    const repossessions = await Promise.all([
      prisma.repossession.create({
        data: {
          refId: 'REP-001',
          ticket: 'RPT-2024-001',
          podName: 'POD Hyderabad Old',
          shippingAddress: '999 Banjara Hills, Hyderabad',
          contactPerson: 'Vikram Singh',
          mobileNumber: '+91 9876543215',
          components: '5 x CPU i3 Gen 5th, 5 x Monitor, 5 x Keyboard, 5 x Mouse',
          serials: 'CPU101,CPU102,CPU103,CPU104,CPU105',
          pc_sets: 5,
          cpus: 5,
          monitors: 5,
          keyboards: 5,
          mice: 5,
          status: 'RECEIVED',
          expectedDate: new Date('2024-01-25'),
          reshippedDate: new Date('2024-01-28'),
          notes: 'Equipment collected successfully, minor scratches on 2 monitors',
          mailSent: true,
          mailSentAt: new Date('2024-01-20'),
          user: { connect: { id: demoUser.id } },
        }
      }),
      prisma.repossession.create({
        data: {
          refId: 'REP-002',
          ticket: 'RPT-2024-002',
          podName: 'POD Kolkata East',
          shippingAddress: '111 Park Street, Kolkata',
          contactPerson: 'Debashish Roy',
          mobileNumber: '+91 9876543216',
          components: '8 x CPU i3 Gen 4th, 8 x Monitor, 8 x Keyboard, 8 x Mouse',
          serials: 'CPU106,CPU107,CPU108,CPU109,CPU110',
          pc_sets: 8,
          cpus: 8,
          monitors: 8,
          keyboards: 8,
          mice: 8,
          status: 'IN_PROCESS',
          expectedDate: new Date('2024-02-05'),
          notes: 'Collection completed, equipment in transit to warehouse',
          mailSent: true,
          mailSentAt: new Date('2024-02-01'),
          user: { connect: { id: demoUser.id } },
        }
      }),
    ])

    // Create Redeployments
    const redeployments = await Promise.all([
      prisma.redeployment.create({
        data: {
          refId: 'RDP-001',
          podName: 'POD Lucknow New',
          shippingAddress: '444 Hazratganj, Lucknow',
          contactPerson: 'Suresh Yadav',
          mobileNumber: '+91 9876543219',
          sourcePod: 'POD Hyderabad Old',
          components: '5 x CPU i3 Gen 5th, 5 x Monitor, 5 x Keyboard, 5 x Mouse',
          serials: 'CPU101,CPU102,CPU103,CPU104,CPU105',
          complaintTicket: 'TKT-2024-001',
          trackingId: 'RTRK123456',
          orderDate: new Date('2024-01-28'),
          dispatchDate: new Date('2024-01-30'),
          deliveryDate: new Date('2024-02-03'),
          status: 'DELIVERED',
          mailSent: true,
          mailSentAt: new Date('2024-01-28'),
          user: { connect: { id: demoUser.id } },
        }
      }),
      prisma.redeployment.create({
        data: {
          refId: 'RDP-002',
          podName: 'POD Chandigarh Tech',
          shippingAddress: '555 Sector 17, Chandigarh',
          contactPerson: 'Manpreet Kaur',
          mobileNumber: '+91 9876543220',
          sourcePod: 'POD Kolkata East',
          components: '8 x CPU i3 Gen 4th, 8 x Monitor, 8 x Keyboard, 8 x Mouse',
          serials: 'CPU106,CPU107,CPU108,CPU109,CPU110',
          complaintTicket: 'TKT-2024-003',
          trackingId: 'RTRK123457',
          orderDate: new Date('2024-02-05'),
          dispatchDate: new Date('2024-02-08'),
          status: 'IN_TRANSIT',
          mailSent: true,
          mailSentAt: new Date('2024-02-05'),
          user: { connect: { id: demoUser.id } },
        }
      }),
    ])

    return NextResponse.json({
      success: true,
      message: 'Demo data seeded successfully',
      stats: {
        shipments: shipments.length,
        complaints: complaints.length,
        repossessions: repossessions.length,
        redeployments: redeployments.length,
      }
    })
  } catch (error: any) {
    console.error('Failed to seed demo data:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
