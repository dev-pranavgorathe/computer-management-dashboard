import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

const SHIPMENTS = [
  {refId:"SHP-001",podName:"ZP School Mendgaon",shippingAddress:"Jilha parishad prathamik shala, Mendgav Ta. Deulgaoraja Dist. Buldhana",state:"Maharashtra",pincode:"443106",contactPerson:"MAYUR GITE",mobileNumber:"7875165940",email:"gitemayur81@gmail.com",cpus:0,components:"7 x UPS",model:"Frontech",os:"N/A",payment:"Apni Pathshala",purpose:"Peripherals",orderDate:new Date("2026-01-07"),dispatchDate:new Date("2026-01-09"),deliveryDate:new Date("2026-01-16"),setupDate:new Date("2026-01-17"),qcIssues:"No",qcReport:"FT2564251202913,FT2564251202915,FT2564251202916,FT2564251203839,FT2564251203840,FT2564251203837,FT2564251203838",shippingCharge:3500.00,totalCost:22302.00,trackingId:"",serials:"",status:"DELIVERED",remarks:"Sarvesh Informed that instead of Zebronic, currently Frontech UPS are available"},
  {refId:"SHP-002",podName:"Vriksh Be The Change",shippingAddress:"VRIKSH BE THE CHANGE, Manpur Patwatoli, Near Pehani Park,P.O Buniyadganj Gaya, Bihar, 823003",state:"Bihar",pincode:"823003",contactPerson:"Chandrakant Pateshwari",mobileNumber:"9310377585",email:"chandrakantp9164@gmail.com",cpus:20,components:"20x CPU i3 Gen 7th REFURBISHED,20x Monitors NEW,20x Keyboards and Mouse NEW,20x Webcams NEW,20x Headphones NEW",model:"20 x CPU i3 Gen 7th",os:"Zorin",payment:"Apni Pathshala",purpose:"NEW_POD",orderDate:new Date("2026-01-09"),dispatchDate:new Date("2026-01-16"),deliveryDate:new Date("2026-01-21"),setupDate:new Date("2026-01-22"),qcIssues:"Yes",qcReport:"Vriksh Be The Change.pdf,Vriksh Be The Change- 2.pdf",shippingCharge:4000.00,totalCost:394120.00,trackingId:"",serials:"",status:"DELIVERED",remarks:"Order Placed by confirmation of Shailendra Sir"},
  {refId:"SHP-003",podName:"Intensive Intentional Learning",shippingAddress:"Gyenpothang House, Near Iris villa Below Enchey, Below Enchey Monastery, Chandmari ward 5, Gangtok East district, Sikkim  737103.",state:"Sikkim",pincode:"737103",contactPerson:"Rajshree Pradhan",mobileNumber:"8710066546",email:"rajshreeee114@gmail.com",cpus:6,components:"6x CPU i3 Gen 7th REFURBISHED,6x Monitors NEW,6x Keyboards and Mouse NEW,6x Webcams NEW,6x Headphones NEW",model:"6x CPU i3 Gen 7th",os:"Zorin",payment:"Apni Pathshala",purpose:"NEW_POD",orderDate:new Date("2026-01-09"),dispatchDate:new Date("2026-01-17"),deliveryDate:new Date("2026-01-27"),setupDate:new Date("2026-01-28"),qcIssues:"No",qcReport:"Intensive Intentional Learning.pdf",shippingCharge:3000.00,totalCost:120360.00,trackingId:"",serials:"",status:"DELIVERED",remarks:"-"},
  {refId:"SHP-004",podName:"MPS Veena Nagar",shippingAddress:"5WMV+39P, Guru Gobind Singh Marg, Veena Nagar Phase-II, Veena Nagar, Mulund West, Mumbai, Maharashtra 400080.",state:"Maharashtra",pincode:"400080",contactPerson:"Sai Prasad",mobileNumber:"9307129233",email:"saiprasadworkspace@gmail.com",cpus:6,components:"6x CPU i3 Gen 7th REFURBISHED,6x Monitors NEW,6x Keyboards and Mouse NEW,6x Webcams NEW,6x Headphones NEW",model:"6x CPU i3 Gen 7th",os:"Zorin",payment:"Apni Pathshala",purpose:"NEW_POD",orderDate:new Date("2026-01-09"),dispatchDate:new Date("2026-01-20"),deliveryDate:new Date("2026-01-20"),setupDate:new Date("2026-01-21"),qcIssues:"Yes",qcReport:"Veena Nagar QC.pdf",shippingCharge:1000.00,totalCost:118000.00,trackingId:"",serials:"",status:"DELIVERED",remarks:"No QC report shared by Scogo, VGA cable given to POD"},
  {refId:"SHP-005",podName:"Bhavika- Point Of Digital learning",shippingAddress:"Prithvi Raj, Krishak Bandhu Multi Cold Storage Pvt Ltd, Ward no 05, Village- Yadavpur, Via- Harshidhi, East Champaran, Bihar, 845422",state:"Bihar",pincode:"845422",contactPerson:"Prithvi Raj",mobileNumber:"8852999744",email:"prithvi.raj21-05@iimv.ac.in",cpus:10,components:"10x CPU i3 Gen 7th REFURBISHED,10x Monitors NEW,10x Keyboards and Mouse NEW,10x Webcams NEW,10x Headphones NEW",model:"10x CPU i3 Gen 7th",os:"Zorin",payment:"Apni Pathshala",purpose:"NEW_POD",orderDate:new Date("2026-01-10"),dispatchDate:new Date("2026-01-19"),deliveryDate:new Date("2026-01-30"),setupDate:new Date("2026-01-31"),qcIssues:"No",qcReport:"Bhavika- Point Of Digital learning.pdf",shippingCharge:3800.00,totalCost:199184.00,trackingId:"",serials:"",status:"DELIVERED",remarks:"-"},
]

const COMPLAINTS = [
  {refId:"CMP-001",ticket:"145250310",podName:"Apni Pathshala Office",phase:"Other",deviceType:"CPU",deviceSerial:"",issue:"1 x CPU",description:"CPU not working",reportedDate:new Date("2026-01-05"),solvedDate:new Date("2026-01-29"),trackingId:"",resolution:"Replaced",resolutionMethod:"Replaced",status:"SOLVED",priority:"HIGH",contactPerson:"",mobileNumber:"",remarks:"",mailSent:true},
  {refId:"CMP-002",ticket:"145250312",podName:"Diya Foundation",phase:"2.2",deviceType:"KEYBOARD",deviceSerial:"",issue:"1 x Keyboard",description:"Keyboard not working",reportedDate:new Date("2026-01-06"),solvedDate:new Date("2026-01-16"),trackingId:"",resolution:"Replaced",resolutionMethod:"Replaced",status:"SOLVED",priority:"MEDIUM",contactPerson:"",mobileNumber:"",remarks:"",mailSent:true},
  {refId:"CMP-003",ticket:"145250314",podName:"Chachua Education Point",phase:"2.1",deviceType:"CPU",deviceSerial:"",issue:"1 x CPU (SSD), 1 x headphones, 1 x Webcam",description:"Multiple issues",reportedDate:new Date("2026-01-07"),solvedDate:new Date("2026-02-24"),trackingId:"35187144145",resolution:"Replaced",resolutionMethod:"Replaced",status:"SOLVED",priority:"HIGH",contactPerson:"",mobileNumber:"",remarks:"",mailSent:true},
]

const REPOSSESSIONS = [
  {refId:"REPO-001",ticket:"T--SP-2278-00038",podName:"UDGI",shippingAddress:"UDGI Pathshala Center, Kura Meerpur Post Chhajlet Teh Kanth Dist Moradabad Pin-code: 244501 UP",contactPerson:"",mobileNumber:"",components:"10 x PC Sets.",serials:"",pc_sets:10,cpus:0,monitors:0,keyboards:0,mice:0,webcams:0,headphones:0,laptops:0,thin_clients:0,printers:0,expectedDate:new Date("2025-07-14"),reshippedDate:new Date("2025-07-15"),status:"RECEIVED",notes:"UPDATED FROM SHEET - Test successful!",remarks:""},
  {refId:"REPO-002",ticket:"T--SP-2278-00037",podName:"ZP Karjat",shippingAddress:"Raigad zilla parishad upper primary school, zugrewadi at post-Borgaon, taluka-karjat Raigad Maharashtra - 410 101",contactPerson:"",mobileNumber:"",components:"10 x PC Sets.",serials:"",pc_sets:10,cpus:0,monitors:0,keyboards:0,mice:0,webcams:0,headphones:0,laptops:0,thin_clients:0,printers:0,expectedDate:new Date("2025-05-03"),reshippedDate:new Date("2025-05-20"),status:"RECEIVED",notes:"Packing of Components Done, 2 failed attempts, Repossession Complete",remarks:""},
]

const REDEPLOYMENTS = [
  {refId:"REDEP-001",podName:"Uva Jagriti Sansthan",shippingAddress:"EcoLivelihoods & IT Foundation Address -  New Amar Plaza, Behind Police Station, Lal kothi, Kotputli, District - Kotputli-Behror,Rajasthan,303108",contactPerson:"",mobileNumber:"",complaintTicket:"",sourcePod:"Karjat & Haryana Lot",components:"04x CPU, 01x Monitor",serials:"MJ05K32K,PC017NNB,S4CM2265,S4CM7372,6CM334310Z",orderDate:new Date("2025-06-20"),dispatchDate:new Date("2025-06-25"),deliveryDate:new Date("2025-06-30"),trackingId:"51602358452",status:"COMPLETED"},
  {refId:"REDEP-002",podName:"Swami Vivekananda Medical Mission - SVMM Idukki",shippingAddress:"APJ Abdul Kalam Centre For Skill & Excellence, Vivekananda Road, Near New Private Bus Stand, Kattappana, Idukki district, Kerala, 685508",contactPerson:"",mobileNumber:"",complaintTicket:"",sourcePod:"Karjat & Haryana Lot",components:"03x CPU, 01x Monitor",serials:"622AD69PV72,622A55V2W72,7GI0O666204,2311039975",orderDate:new Date("2025-06-21"),dispatchDate:new Date("2025-06-25"),deliveryDate:new Date("2025-07-21"),trackingId:"51602358463",status:"COMPLETED"},
]

async function main() {
  console.log('🌱 Seeding dashboard data...\n')

  // Create demo user
  const hashedPassword = await hash('demo123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'demo@cmdportal.com' },
    update: {},
    create: {
      email: 'demo@cmdportal.com',
      name: 'Demo Admin',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })

  console.log('✅ User created/found:', user.email)

  // Clear existing data
  await prisma.redeployment.deleteMany()
  await prisma.repossession.deleteMany()
  await prisma.complaint.deleteMany()
  await prisma.shipment.deleteMany()

  console.log('✅ Cleared existing data')

  // Seed shipments
  for (const ship of SHIPMENTS) {
    await prisma.shipment.create({
      data: {
        ...ship,
        userId: user.id,
      }
    })
  }
  console.log(`✅ Created ${SHIPMENTS.length} shipments`)

  // Seed complaints
  for (const comp of COMPLAINTS) {
    await prisma.complaint.create({
      data: {
        ...comp,
        user: { connect: { id: user.id } },
      }
    })
  }
  console.log(`✅ Created ${COMPLAINTS.length} complaints`)

  // Seed repossessions
  for (const repo of REPOSSESSIONS) {
    await prisma.repossession.create({
      data: {
        ...repo,
        user: { connect: { id: user.id } },
      }
    })
  }
  console.log(`✅ Created ${REPOSSESSIONS.length} repossessions`)

  // Seed redeployments
  for (const redep of REDEPLOYMENTS) {
    await prisma.redeployment.create({
      data: {
        ...redep,
        user: { connect: { id: user.id } },
      }
    })
  }
  console.log(`✅ Created ${REDEPLOYMENTS.length} redeployments`)

  console.log('\n🎉 Dashboard data seeding complete!')
  console.log('📊 Summary:')
  console.log(`   - Shipments: ${SHIPMENTS.length}`)
  console.log(`   - Complaints: ${COMPLAINTS.length}`)
  console.log(`   - Repossessions: ${REPOSSESSIONS.length}`)
  console.log(`   - Redeployments: ${REDEPLOYMENTS.length}`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
