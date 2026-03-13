"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell } from "recharts";

/* ─── STYLES ─────────────────────────────────────────────────────────────────── */
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #f0f2f5; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: #f1f5f9; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  .tr:hover { background: #f8faff !important; }
  .tr:hover .del-btn { opacity: 1 !important; }
  .nav-btn:hover { background: rgba(255,255,255,0.07) !important; color: #fff !important; }
  .fade { animation: fi .15s ease; }
  @keyframes fi { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }
  .col-filter-btn:hover { background: #e5e7eb !important; }
  .insight-ta { font-family:'DM Sans',sans-serif; font-size:13px; line-height:1.7; color:#111827; border:1px solid #e5e7eb; border-radius:6px; padding:12px 14px; width:100%; resize:vertical; outline:none; background:#fff; }
  .insight-ta:focus { border-color:#1d4ed8; box-shadow:0 0 0 2px rgba(29,78,216,.08); }
  .insight-ta::placeholder { color:#9ca3af; }
  .del-btn { opacity: 0; transition: opacity .15s; }
  .status-step { transition: all .2s; }
  .action-row-btn:hover { background: #f3f4f6 !important; }
  input:focus, select:focus, textarea:focus { border-color: #1d4ed8 !important; box-shadow: 0 0 0 2px rgba(29,78,216,.08); outline: none; }
`;

/* ─── MOCK DATA (from Test_Sheet.xlsx) ──────────────────────────────────────── */

/* ─── DATA (from Test_Sheet.xlsx) ─────────────────────────────────────────── */
const SHIPMENT_PURPOSES = ["New POD","Peripherals","Teach to Earn","Manthan POD","PC Testing","Other"];

const INIT_SHIPMENTS = [
  {id:"SHP-001",pod:"ZP School Mendgaon",address:"Jilha parishad prathamik shala, Mendgav Ta. Deulgaoraja Dist. Buldhana",status:"Completed",contact:"MAYUR GITE",phone:"7875165940",cpus:0,components:"7 x UPS",model:"Frontech",state:"Maharashtra",email:"gitemayur81@gmail.com",os:"N/A",payment:"Apni Pathshala",purpose:"Peripherals",orderDate:"2026-01-07",dispatchDate:"2026-01-09",deliveryDate:"2026-01-16",remarks:"Sarvesh Informed that instead of Zebronic, currenlty Frontech UPS are available(08/01/2026)\nAsked him to Proceed with the one available(09/01/2026)",setupDate:"2026-01-17",qcIssues:"No",qcReport:"FT2564251202913,\nFT2564251202915,\nFT2564251202916,\nFT2564251203839,\nFT2564251203840,\nFT2564251203837,\nFT2564251203838",shippingCharge:"3500.0",totalCost:"22302.0",trackingId:"",serials:""},
  {id:"SHP-002",pod:"Vriksh Be The Change",address:"VRIKSH BE THE CHANGE, Manpur Patwatoli, Near Pehani Park,P.O Buniyadganj Gaya, Bihar, 823003",status:"Completed",contact:"Chandrakant Pateshwari",phone:"9310377585",cpus:20,components:"20x CPU i3 Gen 7th REFURBISHED \n\n20x Monitors NEW\n\n20x Keyboards and Mouse NEW\n\n20x Webcams NEW\n\n20x Headphones NEW",model:"20 x CPU i3 Gen 7th",state:"Maharashtra",email:"chandrakantp9164@gmail.com",os:"Zorin",payment:"Apni Pathshala",purpose:"New POD",orderDate:"2026-01-09",dispatchDate:"2026-01-16",deliveryDate:"2026-01-21",remarks:"Order Placed, by confirmation of Shailendra Sir(09/01/2025)\nNo QC report inside box, hence shared with POD team and asked for Signed QC(28/01/2026)\n\nReverse pick up of faulty parts is done\n\nReplacement components are shipped(10/02/2026)\n\nshipment delivered and all working(12/02/2026)",setupDate:"2026-01-22",qcIssues:"Yes",qcReport:"Vriksh Be The Change.pdf\nVriksh Be The Change- 2.pdf\n\nVriksh be the change1.pdf\nVriksh be the change2.pdf",shippingCharge:"4000.0",totalCost:"3,94,120",trackingId:"",serials:""},
  {id:"SHP-003",pod:"Intensive Intentional Learning",address:"Gyenpothang House, Near Iris villa Below Enchey, Below Enchey Monastery, Chandmari ward 5, Gangtok East district, Sikkim  737103.",status:"Completed",contact:"Rajshree Pradhan",phone:"8710066546",cpus:6,components:"6x CPU i3 Gen 7th REFURBISHED\n\n\n6x Monitors NEW\n\n\n6x Keyboards and Mouse NEW\n\n\n6x Webcams NEW\n\n\n6x Headphones NEW",model:"6x CPU i3 Gen 7th",state:"Maharashtra",email:"rajshreeee114@gmail.com",os:"Zorin",payment:"Apni Pathshala",purpose:"New POD",orderDate:"2026-01-09",dispatchDate:"2026-01-17",deliveryDate:"2026-01-27",remarks:"-",setupDate:"2026-01-28",qcIssues:"No",qcReport:"Intensive Intentional Learning.pdf",shippingCharge:"3000.0",totalCost:"1,20,360",trackingId:"",serials:""},
  {id:"SHP-004",pod:"MPS Veena Nagar",address:"5WMV+39P, Guru Gobind Singh Marg, Veena Nagar Phase-II, Veena Nagar, Mulund West, Mumbai, Maharashtra 400080.",status:"Completed",contact:"Sai Prasad",phone:"93071 29233",cpus:6,components:"6x CPU i3 Gen 7th REFURBISHED\n\n\n6x Monitors NEW\n\n\n6x Keyboards and Mouse NEW\n\n\n6x Webcams NEW\n\n\n6x Headphones NEW",model:"6x CPU i3 Gen 7th",state:"Maharashtra",email:"saiprasadworkspace@gmail.com",os:"Zorin",payment:"Apni Pathshala",purpose:"New POD",orderDate:"2026-01-09",dispatchDate:"2026-01-20",deliveryDate:"2026-01-20",remarks:"No QC report shared by Scogo(20/01/2026)\n\n1 x VGA not working(21/01/2026)\n\nVGA cable given to POD, all working now",setupDate:"2026-01-21",qcIssues:"Yes",qcReport:"Veena Nagar QC.pdf",shippingCharge:"1000.0",totalCost:"1,18,000",trackingId:"",serials:""},
  {id:"SHP-005",pod:"Bhavika- Point Of Digital learning",address:"Prithvi Raj, Krishak Bandhu Multi Cold Storage\nPvt Ltd, Ward no 05, Village- Yadavpur, Via- Harshidhi, East Champaran,\nBihar, 845422",status:"Completed",contact:"Prithvi Raj",phone:"885 299 9744",cpus:10,components:"10x CPU i3 Gen 7th REFURBISHED\n\n10x Monitors NEW\n\n10x Keyboards and Mouse NEW\n\n10x Webcams NEW\n\n10x Headphones NEW",model:"10x CPU i3 Gen 7th",state:"Maharashtra",email:"prithvi.raj21-05@iimv.ac.in",os:"Zorin",payment:"Apni Pathshala",purpose:"New POD",orderDate:"2026-01-10",dispatchDate:"2026-01-19",deliveryDate:"2026-01-30",remarks:"-",setupDate:"2026-01-31",qcIssues:"No",qcReport:"Bhavika- Point Of Digital learning.pdf\n\nBhavika- POD.pdf",shippingCharge:"3800.0",totalCost:"1,99,184",trackingId:"",serials:""},
  {id:"SHP-006",pod:"GUPS -bajrang colony pod",address:"Govt Upper Primary School,\nBajrang Colony,\nRam Nagar, Sodala,\nJaipur-302019 Rajasthan, India\n\nGmap Link:- +VQWG+P2F, Jaipur,\nRajasthan",status:"Completed",contact:"Mrs. SudhaBharadwaj",phone:"99289 84242",cpus:10,components:"10x CPU i3 Gen 7th REFURBISHED\n\n10x Monitors NEW\n\n10x Keyboards and Mouse NEW\n\n10x Webcams NEW\n\n10x Headphones NEW",model:"10x CPU i3 Gen 7th",state:"Maharashtra",email:"gups.ramnagar.bajrang.colony.comp@gmail.com",os:"Zorin",payment:"Apni Pathshala",purpose:"New POD",orderDate:"2026-01-10",dispatchDate:"2026-01-17",deliveryDate:"2026-01-20",remarks:"One screen has vertical line\n\nReverse pick up done of faulty parts\n\nMonitor replacement has been shipped(10/11/2026)",setupDate:"2026-01-20",qcIssues:"Yes",qcReport:"GUPS Bajrang Colony POD.pdf\n\nGUPS.pdf",shippingCharge:"2000.0",totalCost:"1,97,060",trackingId:"",serials:""},
  {id:"SHP-007",pod:"Teach to Earn - Pratiksha Patil",address:"101, I wing, Valmiki, Rushi Vihar Complex, Phase 1, Manvel Pada Road, Virar East 401305 Maharashtra, India",status:"Order Placed",contact:"Pratiksha Patil",phone:"8087386615",cpus:1,components:"1x CPU i3 Gen 7th REFURBISHED \n\n\n1x Monitor NEW\n\n\n1x Keyboard and Mouse NEW\n\n\n1x Webcam NEW\n\n\n1x Headphone NEW",model:"1x CPU i3 Gen 7th",state:"Maharashtra",email:"19patilpratiksha@gmail.com",os:"Zorin",payment:"Apni Pathshala",purpose:"Teach to Earn",orderDate:"2026-01-12",dispatchDate:"",deliveryDate:"",remarks:"Order cancelled by buyer confirm by sai",setupDate:"",qcIssues:"",qcReport:"",shippingCharge:"",totalCost:"",trackingId:"",serials:""},
  {id:"SHP-008",pod:"MPS Balaram Street",address:"XR7C+M4C, Balaram St, Grant Road East, Bharat Nagar, Grant Road, Mumbai, Maharashtra 400008",status:"Completed",contact:"Sai Prasad",phone:"93071 29233",cpus:10,components:"10x CPU i3 Gen 7th REFURBISHED\n\n10x Monitors NEW\n\n10x Keyboards and Mouse NEW\n\n10x Webcams NEW\n\n10x Headphones NEW",model:"10x CPU i3 Gen 7th",state:"Maharashtra",email:"saiprasadworkspace@gmail.com",os:"Zorin",payment:"Apni Pathshala",purpose:"New POD",orderDate:"2026-01-22",dispatchDate:"206-01-24",deliveryDate:"2026-01-24",remarks:"Issues in shipments informed via signed QC(31/01/2026)\nScogo assigned engineer and solved those issues(02/02/2026)",setupDate:"2026-01-28",qcIssues:"Yes",qcReport:"MPS Balaram Street.pdf\n\nBalaram MPS School QC.pdf",shippingCharge:"1700.0",totalCost:"2,49,806",trackingId:"",serials:""},
  {id:"SHP-009",pod:"Shashwat Urja Bioenergy Foundation",address:"S-30 Internal Road, MIDC, Bhosari, Pimpri-Chinchwad, Maharashtra 411026",status:"Completed",contact:"Srishti Deopa",phone:"7899405916",cpus:10,components:"10x CPU i3 Gen 7th REFURBISHED\n\n10x Monitors NEW\n\n10x Keyboards and Mouse NEW\n\n10x Webcams NEW\n\n10x Headphones NEW",model:"10x CPU i3 Gen 7th",state:"Maharashtra",email:"srishti@without.live",os:"Zorin",payment:"Apni Pathshala",purpose:"New POD",orderDate:"2026-01-28",dispatchDate:"2026-01-29",deliveryDate:"2026-02-02",remarks:"Order Placed, by confirmation of Shailendra Sir(28/01/2025)\nSigned QC shared with Scogo to verify and solve issues(03/02/2026)",setupDate:"2026-02-03",qcIssues:"Yes",qcReport:"Shashwat Urja Bioenergy Foundation.pdf\n\nShashwat Urja Bioenergy Foundation.pdf",shippingCharge:"2300.0",totalCost:"2,50,514",trackingId:"",serials:""},
  {id:"SHP-010",pod:"Z.P.Primary School,Pimpalgan Matha",address:"Z.P. Primary & Secondary School, Pimpalgaon Matha, Tal. Sangamner, Dist.\nAhmednagar (Ahilyanagar), Maharashtra, 422605",status:"Completed",contact:"Anil Dasharath Avhad",phone:"9420790417",cpus:10,components:"10x CPU i3 Gen 7th REFURBISHED\n\n10x Monitors NEW\n\n10x Keyboards and Mouse NEW\n\n10x Webcams NEW\n\n10x Headphones NEW",model:"10x CPU i3 Gen 7th",state:"Maharashtra",email:"anildada2174@gmail.com",os:"Zorin",payment:"Apni Pathshala",purpose:"New POD",orderDate:"2026-01-28",dispatchDate:"2026-01-29",deliveryDate:"2026-02-03",remarks:"Order Placed, by confirmation of Shailendra Sir(28/01/2025)",setupDate:"2026-02-06",qcIssues:"",qcReport:"Z.P Primary School.pdf\nZP Matha.pdf",shippingCharge:"3500.0",totalCost:"2,51,930",trackingId:"",serials:""},
  {id:"SHP-011",pod:"Manthan- S S N Public school",address:"shanti shiksha niketan ,Takha East Shahganj  Jaunpur.PIN 223101",status:"Completed",contact:"Santosh Kumar Asthana",phone:"9044882742",cpus:10,components:"10x CPU i3 Gen 7th REFURBISHED\n\n10x Monitors NEW\n\n10x Keyboards and Mouse NEW\n\n10x Webcams NEW\n\n10x Headphones NEW",model:"10x CPU i3 Gen 7th",state:"Maharashtra",email:"ssnpublicschool15@gmail.com",os:"Zorin",payment:"Apni Pathshala",purpose:"Manthan POD",orderDate:"2026-01-30",dispatchDate:"2026-01-31",deliveryDate:"2026-02-06",remarks:"-",setupDate:"",qcIssues:"",qcReport:"S S N Public school.pdf",shippingCharge:"3000.0",totalCost:"2,51,340",trackingId:"",serials:""},
  {id:"SHP-012",pod:"Health Care Foundation",address:"Health Care Foundation, Karunyatheeram Campus, Kattipara P.O, Kozhikode, Kerala- 673573",status:"Completed",contact:"Farsin Ahammed",phone:"9544522053",cpus:10,components:"10x CPU i3 Gen 7th REFURBISHED\n\n10x Monitors NEW\n\n10x Keyboards and Mouse NEW\n\n10x Webcams NEW\n\n10x Headphones NEW",model:"10x CPU i3 Gen 7th",state:"Maharashtra",email:"farsin.hcf@gmail.com",os:"Zorin",payment:"Apni Pathshala",purpose:"New POD",orderDate:"2026-02-05",dispatchDate:"2026-02-07",deliveryDate:"2026-02-17",remarks:"-",setupDate:"2026-02-18",qcIssues:"Yes",qcReport:"Health Care Foundation.pdf\nHCF QC.pdf",shippingCharge:"3000.0",totalCost:"2,51,340",trackingId:"",serials:""},
  {id:"SHP-013",pod:"Apni Pathshala Office",address:"C-Wing, 2nd Floor, NARAYAN CHANDRA TRUST, Moregoan Talav, Manvelpada Road, Nalasopara East, Maharashtra 401209",status:"Completed",contact:"Pranav Gorathe",phone:"8446248280",cpus:2,components:"2 x CPU i3 Gen 7th REFURBISHED",model:"2 x CPU i3 Gen 7th",state:"Maharashtra",email:"team@apnipathshala.org",os:"Windows",payment:"Pranav",purpose:"PC Testing",orderDate:"2026-02-06",dispatchDate:"2026-02-07",deliveryDate:"2026-02-09",remarks:"New Jaisa PCs For testing",setupDate:"",qcIssues:"",qcReport:"",shippingCharge:"",totalCost:"",trackingId:"",serials:""},
];

const INIT_COMPLAINTS = [
  {id:"CMP-001",pod:"Apni Pathshala Office",phase:"Other",org:"Scogo",issue:"1 x CPU",reported:"2026-01-05",solved:"2026-01-29",trackingId:"",ticket:"145250310",resolution:"Replaced",status:"Solved",contact:"",phone:"",description:"",remarks:"",attachments:""},
  {id:"CMP-002",pod:"Diya Foundation",phase:"2.2",org:"Scogo",issue:"1 x Keyboard",reported:"2026-01-06",solved:"2026-01-16",trackingId:"-",ticket:"145250312",resolution:"Replaced",status:"Solved",contact:"",phone:"",description:"",remarks:"",attachments:""},
  {id:"CMP-003",pod:"Chachua Education Point",phase:"2.1",org:"Scogo",issue:"1 x CPU (SSD )\n1 x  headphones\n1 x Webcam amount not yet reimbursed",reported:"2026-01-07",solved:"2026-02-24",trackingId:"35187144145\n\nDTDC tracking\nU39722821\n\nIndia Post \nJI624045100IN",ticket:"145250314",resolution:"Replaced",status:"Solved",contact:"",phone:"",description:"",remarks:"",attachments:""},
  {id:"CMP-004",pod:"LFP_Tardeo",phase:"2.O",org:"Scogo",issue:"1 x monitor",reported:"2026-01-09",solved:"2026-01-12",trackingId:"",ticket:"-",resolution:"Repossession Shipment",status:"Solved",contact:"",phone:"",description:"",remarks:"",attachments:""},
  {id:"CMP-005",pod:"Apni Pathshala Office",phase:"Other",org:"Scogo",issue:"Issue 1: 1 x  Headphone \n\n- Issue 2: 1 x Adapter\n\n- Issue 3: 2 x CPU",reported:"2026-01-22",solved:"2026-02-09",trackingId:"-",ticket:"145250321",resolution:"Replaced",status:"Solved",contact:"",phone:"",description:"",remarks:"",attachments:""},
  {id:"CMP-006",pod:"SOF Attigupe Bangalore",phase:"2.O",org:"Scogo",issue:"1 X CPU problem",reported:"2025-12-23",solved:"",trackingId:"-",ticket:"145250322",resolution:"",status:"In Progress",contact:"",phone:"",description:"",remarks:"",attachments:""},
  {id:"CMP-007",pod:"Atulya Digital Shiksha",phase:"2.1",org:"Scogo",issue:"1 X CPU problem\nMJ05T4H7",reported:"2026-01-23",solved:"",trackingId:"",ticket:"145250323",resolution:"Not resolved",status:"Deleted",contact:"",phone:"",description:"",remarks:"",attachments:""},
  {id:"CMP-008",pod:"Aman Foundation",phase:"2.O",org:"Selligion",issue:"-",reported:"2026-01-23",solved:"",trackingId:"",ticket:"145250324",resolution:"Not resolved",status:"Deleted",contact:"",phone:"",description:"",remarks:"",attachments:""},
  {id:"CMP-009",pod:"GUPS Bajrang Colony",phase:"2.2",org:"Scogo",issue:"1 x Keyboard",reported:"2026-01-31",solved:"2026-02-12",trackingId:"58927266344.0",ticket:"145250356",resolution:"Replaced",status:"Solved",contact:"",phone:"",description:"",remarks:"",attachments:""},
  {id:"CMP-010",pod:"Atulya Digital Shiksha",phase:"2.1",org:"Scogo",issue:"1 X CPU problem\nMJ05T4H7",reported:"2026-01-23",solved:"2026-02-21",trackingId:"18019056860\n\n35187143670",ticket:"145250359",resolution:"Replaced",status:"Solved",contact:"",phone:"",description:"",remarks:"",attachments:""},
  {id:"CMP-011",pod:"Shashwat Urja Bioenergy Foundation",phase:"2.2",org:"Scogo",issue:"4 x CPUs (No signal issue)\n2 x CPUs (CMOS errors)",reported:"2026-02-05",solved:"2026-02-17",trackingId:"35187140726.0",ticket:"145250357",resolution:"Repaired",status:"Solved",contact:"",phone:"",description:"",remarks:"",attachments:""},
  {id:"CMP-012",pod:"Aman Foundation",phase:"2.O",org:"Selligion",issue:"5 X CPU \n5 X Monitor",reported:"2026-02-06",solved:"",trackingId:"",ticket:"145250360",resolution:"",status:"In Progress",contact:"",phone:"",description:"",remarks:"",attachments:""},
  {id:"CMP-013",pod:"Vriksh Be The Change",phase:"2.2",org:"Scogo",issue:"1 x Monitor",reported:"2026-02-07",solved:"2026-02-23",trackingId:"58927265924.0",ticket:"145250361",resolution:"Replaced",status:"Solved",contact:"",phone:"",description:"",remarks:"",attachments:""},
  {id:"CMP-014",pod:"WTL Foundation School",phase:"2.O",org:"Selligion",issue:"1 X Adapter",reported:"2026-02-07",solved:"2026-02-16",trackingId:"35187140612.0",ticket:"145250362",resolution:"Replaced(charged)",status:"Solved",contact:"",phone:"",description:"",remarks:"",attachments:""},
  {id:"CMP-015",pod:"Z.P Primary School",phase:"2.2",org:"Scogo",issue:"5 x CPU \n1x Adapter",reported:"2026-02-13",solved:"2026-02-16",trackingId:"",ticket:"145250372",resolution:"Repaired",status:"Solved",contact:"",phone:"",description:"",remarks:"",attachments:""},
  {id:"CMP-016",pod:"Life skills Foundation",phase:"2.2",org:"Scogo",issue:"1 x Monitor",reported:"2025-02-18",solved:"2025-02-18",trackingId:"",ticket:"145250375",resolution:"Repaired",status:"Solved",contact:"",phone:"",description:"",remarks:"",attachments:""},
  {id:"CMP-017",pod:"LFP Tardeo",phase:"2.O",org:"Selligion",issue:"1 x CPU Praho",reported:"2026-02-16",solved:"2026-02-18",trackingId:"-",ticket:"-",resolution:"Replaced",status:"Solved",contact:"",phone:"",description:"",remarks:"",attachments:""},
  {id:"CMP-018",pod:"Health Care Foundation",phase:"2.2",org:"Scogo",issue:"4 x CPUs Physical Condition issue\n6 x CPUs, OS not installed \n1 x Webcam not working",reported:"2026-02-19",solved:"",trackingId:"35187140203.0",ticket:"145250376",resolution:"Repaired",status:"In Progress",contact:"",phone:"",description:"",remarks:"",attachments:""},
  {id:"CMP-019",pod:"MPS Balaram Street",phase:"2.2",org:"Scogo",issue:"5 X CPU",reported:"2026-02-21",solved:"2026-02-27",trackingId:"",ticket:"145250379",resolution:"Replaced",status:"Solved",contact:"",phone:"",description:"",remarks:"",attachments:""},
  {id:"CMP-020",pod:"Vriksh Be The Change",phase:"2.2",org:"Scogo",issue:"1 x Keyboard\n1 x Monitor\n1 x Monitor",reported:"2026-02-22",solved:"",trackingId:"51715680450.0",ticket:"145250380",resolution:"",status:"In Progress",contact:"",phone:"",description:"",remarks:"",attachments:""},
  {id:"CMP-021",pod:"AP office",phase:"Other",org:"Selligion",issue:"1 x PC (HP)\n1 x PC(Praho)",reported:"2026-02-23",solved:"2026-02-23",trackingId:"-",ticket:"-",resolution:"Repaired",status:"Solved",contact:"",phone:"",description:"",remarks:"",attachments:""},
  {id:"CMP-022",pod:"NCT Learn from peers",phase:"2.O",org:"Selligion",issue:"10 x mouse (additional request)",reported:"2026-02-24",solved:"2026-02-25",trackingId:"-",ticket:"-",resolution:"Other",status:"Solved",contact:"",phone:"",description:"",remarks:"",attachments:""},
  {id:"CMP-023",pod:"Apni Pathshala Office",phase:"Other",org:"Scogo",issue:"Issue 1: 1 x  Monitor\n\n- Issue 2: 1 x Adapter\n\n- Issue 3: 2 x wifi router",reported:"2026-02-25",solved:"",trackingId:"-",ticket:"",resolution:"",status:"In Progress",contact:"",phone:"",description:"",remarks:"",attachments:""},
  {id:"CMP-024",pod:"GUPS Bajrang Colony",phase:"2.2",org:"Scogo",issue:"1 x Power Cable",reported:"2026-02-27",solved:"",trackingId:"",ticket:"145250386",resolution:"",status:"In Progress",contact:"",phone:"",description:"",remarks:"",attachments:""},
];

const INIT_REPOSSESSIONS = [
  {id:"REPO-001",pod:"UDGI",address:"UDGI Pathshala Center, Kura Meerpur Post Chhajlet Teh Kanth Dist Moradabad Pin-code: 244501 UP",status:"Received",components:"10 x PC Sets.",pc_sets:10,cpus:0,monitors:0,laptops:0,mice:0,keyboards:0,webcams:0,headphones:0,thin_clients:0,printers:0,expectedDate:"2025-07-14",reshipDate:"2025-07-15",ticket:"T--SP-2278-00038",remarks:"UPDATED FROM SHEET - Test successful!",createdDate:"",contact:"",phone:"",serials:"",notes:""},
  {id:"REPO-002",pod:"ZP Karjat",address:"Raigad zilla parishad upper primary school, zugrewadi at post-Borgaon, taluka-karjat Raigad Maharashtra - 410 101",status:"Received",components:"10 x PC Sets.",pc_sets:10,cpus:0,monitors:0,laptops:0,mice:0,keyboards:0,webcams:0,headphones:0,thin_clients:0,printers:0,expectedDate:"2025-05-03",reshipDate:"2025-05-20",ticket:"T--SP-2278-00037",remarks:"Packing of Components Done (26/04/2025)\n2 failed attempts.\nRepossession Complete. (20/05/2025)",createdDate:"",contact:"",phone:"",serials:"",notes:""},
  {id:"REPO-003",pod:"Haryana Public School",address:"Samrath Computer Skill Training Center Kilaj. Near Z.P School Shivnery Nagar Kilaj",status:"Received",components:"10 x PC Sets.",pc_sets:10,cpus:0,monitors:0,laptops:0,mice:0,keyboards:0,webcams:0,headphones:0,thin_clients:0,printers:0,expectedDate:"2025-05-15",reshipDate:"2025-05-15",ticket:"T--SP-2278-00041",remarks:"Packing and Shipment will be executed (04/05/2025)\n2 failed attempts.\nPackage in Transit (15/05/2025)\nCompleted (22/05/2025)",createdDate:"",contact:"",phone:"",serials:"",notes:""},
  {id:"REPO-004",pod:"SRIJAN EK SOACH",address:"Vill & P .O - Amrikhowa, Dist- Barpeta (Assam), PIN - 781307",status:"Received",components:"10 x PC Sets.",pc_sets:10,cpus:0,monitors:0,laptops:0,mice:0,keyboards:0,webcams:0,headphones:0,thin_clients:0,printers:0,expectedDate:"2025-08-10",reshipDate:"2025-08-21",ticket:"145250133",remarks:"Internal Ticket Genereated & Field Engineer Assigned for Pickup.(15/07/2025)\nWaiting for Quotation (18/07/2025)\nMaterial Packing Completed & now waiting for Shipment to proceed. (05/08/2025)",createdDate:"",contact:"",phone:"",serials:"",notes:""},
  {id:"REPO-005",pod:"CSC Patel Nagar",address:"Prem Nagar Rd, Block B, Baljit Nagar, Patel Nagar, Delhi, 110008",status:"Received",components:"10 X PC Sets.",pc_sets:10,cpus:0,monitors:0,laptops:0,mice:0,keyboards:0,webcams:0,headphones:0,thin_clients:0,printers:0,expectedDate:"2025-08-25",reshipDate:"2025-08-26",ticket:"145250153",remarks:"POD has requested that the pickup be done after August 15th. (05/08/2025)\nMaterial Packaging Completed on (18/08/2025)\nReceived Package (26/08/2025)",createdDate:"",contact:"",phone:"",serials:"",notes:""},
  {id:"REPO-006",pod:"BANDHUTVA FOUNDATION",address:"Bahujan Hitay Vidhyarthi  Vastigruh  Bhimnagar, Savangi meghe ,  Deoli road , Wardha, Maharashtra, 442001",status:"Received",components:"10 X PC Sets.",pc_sets:10,cpus:0,monitors:0,laptops:0,mice:0,keyboards:0,webcams:0,headphones:0,thin_clients:0,printers:0,expectedDate:"2025-08-28",reshipDate:"2025-09-01",ticket:"145250166",remarks:"Material Packaging & Shipment Completed by Engineer, Quotation Received and approved over email. (27/08/2025).\nMaterial Delivered to SCOGO. (01/09/2025)",createdDate:"",contact:"",phone:"",serials:"",notes:""},
  {id:"REPO-007",pod:"Aspirant Education Sansthan",address:"Aspirant Education Sansthan, Bhupalsagar, Near Kapasan, District: Chittorgarh, Rajasthan, 312204",status:"In Process",components:"10 X PC Sets.",pc_sets:10,cpus:0,monitors:0,laptops:0,mice:0,keyboards:0,webcams:0,headphones:0,thin_clients:0,printers:0,expectedDate:"2025-10-07",reshipDate:"",ticket:"145250167\n145250213",remarks:"Location is T3, and it will take time to find an Engineer.\nPOC is not picking up Mayur's / Shailendra's calls. They have asked the Engineer to visit on 5th Sept. (30/08/2025)\nPODs POC is not answering SCOGO/ APs calls (13/09/2025)\nAp and the POD decided on a finalized date of 7th October. (01/10/2025).\nPOD and AP have decided on a date of 16/10/2025. (14/10/2025).\nPickup Failed, Chittiz Kumar is in the Hospital. (24/10/2025).\nShailendra will confirm the pickup date with Chittiz Kumar. (24/10/2025)\nAP paid for the Repossession, but POD failed to hand over the PCs. The Same Engineer will be assigned for a future Repossession, as he had purchased the packaging materials. (24/10/2025).",createdDate:"",contact:"",phone:"",serials:"",notes:""},
  {id:"REPO-008",pod:"Inventurus Knowledge Solutions Ltd",address:"M/s. NSL Pvt. Ltd. (SEZ)Block-1,\n11th Floor, IDA Uppal,\nRangareddy District, HYDERABAD-500039\nTelangana INDIA",status:"Received",components:"213 x Monitor",pc_sets:0,cpus:0,monitors:213,laptops:0,mice:0,keyboards:0,webcams:0,headphones:0,thin_clients:0,printers:0,expectedDate:"TBA",reshipDate:"",ticket:"145250169",remarks:"All Component testing done , updated in sheet, waiting for paper work and scan\nReminder to lalesh on saturday for 3-10-2025 (30-10-2025)\n161 x Monitors",createdDate:"",contact:"",phone:"",serials:"",notes:""},
  {id:"REPO-009",pod:"Inventurus Knowledge Solutions Ltd",address:"Inventurus Knowledge Solutions Ltd\nBuild. no.5, 2th Floor Unit no. 203/204,  Mindspace Business Park (SEZ),\nThane Belapur Road, Airoli, Navi Mumbai- 400708.",status:"Received",components:"44 x Laptops\n342 x Monitors\n1 x Printer\n8 x Thin Clients",pc_sets:0,cpus:0,monitors:342,laptops:44,mice:0,keyboards:0,webcams:0,headphones:0,thin_clients:8,printers:1,expectedDate:"TBA",reshipDate:"",ticket:"145250175",remarks:"All Component testing done , updated in sheet, waiting for paper work and scan\n\n24 x Laptops\n258 x Monitors",createdDate:"",contact:"",phone:"",serials:"",notes:""},
  {id:"REPO-010",pod:"Prabha Shri Sainik High School",address:"Survey no. 151, Shri Gokul Samajik Sansthan Chawl, Rajewali Road, Bhidapadha Vasai east  Talukha Vasai.- 401208",status:"Received",components:"10 x Monitors\n08 x CPUs\n10 x Mouse\n08 x Keyboards",pc_sets:0,cpus:8,monitors:10,laptops:0,mice:0,keyboards:0,webcams:0,headphones:0,thin_clients:0,printers:0,expectedDate:"2026-01-01",reshipDate:"2026-01-09",ticket:"145250309",remarks:"engineer visited the site and pick the assets(9/1/2026)\nDelay in confirmation from Scogo as mayur on customer visit and Sarvesh on leave(14/01/2026)",createdDate:"",contact:"",phone:"",serials:"",notes:""},
  {id:"REPO-011",pod:"Tech Veer Marol",address:"Marol Maroshi Police Training School,\n Marol Maroshi Rd, Mumbai, \nMaharashtra 400059",status:"Received",components:"10 x PCs Set",pc_sets:10,cpus:0,monitors:0,laptops:0,mice:0,keyboards:0,webcams:0,headphones:0,thin_clients:0,printers:0,expectedDate:"2026-01-03",reshipDate:"2026-01-19",ticket:"145250306",remarks:"on hold, for confirmation and documents(03/01/2026)\nWill proceed on 12/01/2026 (10/01/2026)\nPickup completed(19/01/2026)",createdDate:"",contact:"",phone:"",serials:"",notes:""},
  {id:"REPO-012",pod:"Inventurus Knowledge Solutions Ltd",address:"M/s. NSL Pvt. Ltd. (SEZ)Block-1,\n11th Floor, IDA Uppal,\nRangareddy District, HYDERABAD-500039\nTelangana INDIA",status:"Informed",components:"268 x Monitor",pc_sets:0,cpus:0,monitors:268,laptops:0,mice:0,keyboards:0,webcams:0,headphones:0,thin_clients:0,printers:0,expectedDate:"2026-02-14",reshipDate:"",ticket:"145250373",remarks:"",createdDate:"",contact:"",phone:"",serials:"",notes:""},
  {id:"REPO-013",pod:"Tech Veer Marol",address:"Marol Police Camp Customs Colony, \nMarol, Andheri East, Mumbai, \nMaharashtra 400059",status:"Received",components:"10 Monitors\n10 Keyboards\n10 Mice\n10 Webcams\n9 Headphones",pc_sets:0,cpus:0,monitors:10,laptops:0,mice:0,keyboards:0,webcams:0,headphones:0,thin_clients:0,printers:0,expectedDate:"2026-02-26",reshipDate:"2026-02-26",ticket:"145250382",remarks:"",createdDate:"",contact:"",phone:"",serials:"",notes:""},
  {id:"REPO-014",pod:"Tech Veer Naigaon",address:"9, Parel Bhoiwada St, Police Colony, \nNaigaon, Mumbai,\n Maharashtra. 400014",status:"Received",components:"10 Monitors\n10 Keyboards\n10 Mice\n9 Webcams\n10 Headphones",pc_sets:0,cpus:0,monitors:10,laptops:0,mice:0,keyboards:0,webcams:0,headphones:0,thin_clients:0,printers:0,expectedDate:"2026-02-24",reshipDate:"2026-02-24",ticket:"145250381",remarks:"",createdDate:"",contact:"",phone:"",serials:"",notes:""},
  {id:"REPO-015",pod:"MPS Natwer Parekh",address:"3W88+97Q, Natvar Parekh Compound, \nShivaji Nagar, Mumbai, \nMaharashtra 400043",status:"Informed",components:"",pc_sets:0,cpus:0,monitors:0,laptops:0,mice:0,keyboards:0,webcams:0,headphones:0,thin_clients:0,printers:0,expectedDate:"2026-02-28",reshipDate:"",ticket:"145250388",remarks:"",createdDate:"",contact:"",phone:"",serials:"",notes:""},
];

const INIT_REDEPLOYMENTS = [
  {id:"REDEP-001",pod:"Uva Jagriti Sansthan",complaintTicket:"",address:"EcoLivelihoods & IT Foundation Address -  New Amar Plaza, Behind Police Station, Lal kothi, Kotputli, District - Kotputli-Behror,Rajasthan,303108",status:"Completed",components:"04x CPU\n\n01x Monitor",serials:"MJ05K32K\nPC017NNB\nS4CM2265\nS4CM7372\n\n6CM334310Z",source:"Karjat & Haryana Lot",orderDate:"2025-06-20",dispatchDate:"2025-06-25",trackingId:"51602358452",deliveryDate:"2025-06-30",contact:"",phone:""},
  {id:"REDEP-002",pod:"Swami Vivekananda Medical Mission - SVMM Idukki",complaintTicket:"",address:"APJ Abdul Kalam Centre For Skill & Excellence, Vivekananda Road, Near New Private Bus Stand, Kattappana, Idukki district, Kerala, 685508",status:"Completed",components:"03x CPU \n\n01x Monitor",serials:"622AD69PV72\n622A55V2W72\n7GI0O666204\n\n2311039975",source:"Karjat & Haryana Lot",orderDate:"2025-06-21",dispatchDate:"2025-06-25",trackingId:"51602358463",deliveryDate:"2025-07-21",contact:"",phone:""},
  {id:"REDEP-003",pod:"ATMA Foundation",complaintTicket:"",address:"ATMA Foundation, Surya Gardens, Paliyam Road, Thrissur Kerala 680001 India",status:"Completed",components:"01x CPU \n\n01x DVI to VGA",serials:"630A1FWY5J2",source:"Karjat & Haryana Lot",orderDate:"2025-07-16",dispatchDate:"2025-07-17",trackingId:"34482871684",deliveryDate:"2025-07-22",contact:"",phone:""},
  {id:"REDEP-004",pod:"Yusuf Meherally Centre (YMC)",complaintTicket:"",address:"Vallabh Vidhyalaya Mundra, Near Hotel Fern, Adani Port Road, Zero Point, Mundra, Kutch, Gujarat 370405",status:"Completed",components:"06 x CPU Dell With Power Adapters.\n\n06 x DVI to VGA Converters.\n\n06 x VGA Cables.",serials:"623AJTZB6J2\n630A5RRT7K2\n621A795JCF2\n622AGG1JV72\n620ADT7P5J2",source:"Karjat, Haryana & UDGI Lot",orderDate:"2025-08-14",dispatchDate:"2025-08-26",trackingId:"51637781635\n34482867764",deliveryDate:"2025-08-30",contact:"",phone:""},
  {id:"REDEP-005",pod:"ZP Devrukh no.1",complaintTicket:"",address:"Zeeilla Parishad Kendrashada, Devrukh No.1 Taluka Sangameshwar, District Ratnagiri, Maharashtra, 415804",status:"Completed",components:"03 x CPU Dell with Power Adapters\n\n07 x Monitors with Power & VGA Cables.\n\n03 x Headphones.",serials:"622ADPCXV72\n622A1DMHV72\n622AFJN5W72\n\n2311038205\n2311039971\n2311038204\n2311038202\n2408000264\n2311038203\nCE00090823MON001200020",source:"Karjat, Haryana & UDGI Lot",orderDate:"2025-08-20",dispatchDate:"2025-08-26",trackingId:"51637781624",deliveryDate:"2025-05-09",contact:"",phone:""},
  {id:"REDEP-006",pod:"Gramin Shiksha Kendra Samiti",complaintTicket:"",address:"Gramin Shiksha Kendra Samiti, H1 Rajnagar colony, Sawai Madhopur, Rajasthan, 322001.",status:"Completed",components:"01x Monitor with VGA Cable\n\n03x Keyboard. \n\n03x Mouse.\n\n03x Headphones",serials:"2408004813\n\nNo Serial Number\nNo Serial Number\nNo Serial Number",source:"UDGI Lot",orderDate:"2025-09-11",dispatchDate:"2025-09-13",trackingId:"51637781963",deliveryDate:"2025-09-22",contact:"",phone:""},
  {id:"REDEP-007",pod:"LFP Tardeo - Teach to Earn (Durgesh)",complaintTicket:"",address:"Ashish Building, 5th Floor, Tardeo End of Bombay C Bridge, Tardeo, Mumbai, Maharashtra 400034",status:"Completed",components:"01 x Monitor with Power cable \n\n01 x VGA CABLE",serials:"No Serial",source:"N/A",orderDate:"2025-10-07",dispatchDate:"2025-10-09",trackingId:"Wefast",deliveryDate:"2025-09-10",contact:"",phone:""},
  {id:"REDEP-008",pod:"Digital Saathi Foundation",complaintTicket:"145250195",address:"Bus Stand, Kone,  Sonbhadra UP-231226",status:"Completed",components:"5 x CPU Dell",serials:"623A3CVY6J2\n74UDO900014\n623A13716J2\n630AD1QYBF2\n7HA0O666292 - repaired",source:"-",orderDate:"2025-10-31",dispatchDate:"2025-11-10",trackingId:"34482865841\n\n26697510004782\nDelhivery AWB",deliveryDate:"2025-12-13",contact:"",phone:""},
  {id:"REDEP-009",pod:"Inspire Learning Centre",complaintTicket:"145250234",address:"Inspire Learning Centre, 155/9, Ground Floor, Opposite Sunder Mega Mart,Kishangarh, Near Ambiance Tower Car Market, Vasant Kunj, New Delhi-110070",status:"Completed",components:"2 x Monitors \n\n4 x Keyboards\n\n5 x Mouse\n\n4 x Headphones",serials:"CE00090823MON001200860\nCE00090823MON001201159",source:"Karjat & Haryana Lot",orderDate:"2025-10-31",dispatchDate:"2025-11-06",trackingId:"51637782210",deliveryDate:"2025-12-11",contact:"",phone:""},
  {id:"REDEP-010",pod:"Apni Pathshala Office",complaintTicket:"N/A",address:"C-Wing, 2nd Floor, NARAYAN CHANDRA TRUST, Moregoan Talav, Manvelpada Road, Nalasopara East, Maharashtra 401209",status:"Completed",components:"2 x Laptop",serials:"PC1768YH\nPC1768Y2",source:"IKS Mumbai",orderDate:"2025-11-12",dispatchDate:"2025-11-12",trackingId:"We fast",deliveryDate:"2025-11-12",contact:"",phone:""},
  {id:"REDEP-011",pod:"Pyar ki Dor Foundation",complaintTicket:"145250224",address:"Amaar Lab, Deogaon, Rajpur, Brajrajnagar, Jharsuguda, Odisha, Pin-code: 768216",status:"Completed",components:"4 x Monitors\n\n1 x Keyboard\n\n1 x Mouse\n\n2 x Adapters {lenovo pc}",serials:"60B8AAR6NPV9026MKG\n60B8AAR6NPV9008VBV\n60B8AAR6NPV9026P0A\n60B8AAR6NPV9026NZZ",source:"Bandhutva Foundation",orderDate:"2025-12-03",dispatchDate:"2025-12-06",trackingId:"51637782405",deliveryDate:"2025-12-12",contact:"",phone:""},
  {id:"REDEP-012",pod:"Makerbox Foundation",complaintTicket:"145250260",address:"J-129 2nd Floor Saurabh Vihar, Jaitpur Badarpur New Delhi 110044",status:"Completed",components:"2 x CPU\n\n2 x Keyboard\n\n4 x Mouse",serials:"PRAHO2-0823-0000923\nPRAHO2-0823-0000956",source:"N/A",orderDate:"2025-12-03",dispatchDate:"2025-12-08",trackingId:"34482864301",deliveryDate:"2025-12-09",contact:"",phone:""},
  {id:"REDEP-013",pod:"Prabha Shri Sainik High School",complaintTicket:"N/A",address:"Survey no. 151, Shri Gokul Samajik Sansthan Chawl, Rajewali Road, Bhidapadha Vasai east  Talukha Vasai.- 401208",status:"Completed",components:"5 x CPUs\n\n5 x Monitors\n\n5 x Mouse\n\n5 x Keyboards",serials:"-",source:"IKS Mumbai",orderDate:"2025-12-09",dispatchDate:"2025-12-13",trackingId:"Borzo\nhttps://borzodelivery.com/in/track/PGDLPY16LXZHIN",deliveryDate:"2025-12-13",contact:"",phone:""},
  {id:"REDEP-014",pod:"LIFI Kirari POD",complaintTicket:"145250258",address:"Plot no 16 block A, Prem Nagar suleman Nagar Kirari new Delhi 110086, Near dukhi ram samose vala.",status:"Completed",components:"4 x Monitors\n\n4 x Keyboards\n\n7 x Mouse\n\n1 x Dell Adapter",serials:"CE00090823MON001201158\nCE00090823MON001200016\nCE00090823MON001200018\nCE00090823MON001201157",source:"Karjat & Haryana Lot",orderDate:"2025-12-18",dispatchDate:"2025-12-19",trackingId:"51637782464",deliveryDate:"2025-12-23",contact:"",phone:""},
  {id:"REDEP-015",pod:"Apni Pathshala Office",complaintTicket:"N/A",address:"C-Wing, 2nd Floor, NARAYAN CHANDRA TRUST, Moregoan Talav, Manvelpada Road, Nalasopara East, Maharashtra 401209",status:"Completed",components:"8 x Laptop",serials:"R90VRK9Q, R90VRK9Z\nR90P7Y7A, MP1C8ZGD\nMP1C9152, PC1768X5\nMP1C8XZG, PC175YP8",source:"IKS Mumbai",orderDate:"2025-12-19",dispatchDate:"2025-12-27",trackingId:"https://borzodelivery.com/in/track/PG54H1RMGT66IN",deliveryDate:"2025-12-27",contact:"",phone:""},
  {id:"REDEP-016",pod:"Apni Pathshala Office",complaintTicket:"N/A",address:"C-Wing, 2nd Floor, NARAYAN CHANDRA TRUST, Moregoan Talav, Manvelpada Road, Nalasopara East, Maharashtra 401209",status:"Completed",components:"2 x Monitors\n\n2 x VGA & Power Cables\n\n2 x VGA Connector",serials:"",source:"IKS Mumbai",orderDate:"2025-12-20",dispatchDate:"2025-12-26",trackingId:"https://borzodelivery.com/in/track/PGARX95RXCHYIN",deliveryDate:"2025-12-26",contact:"",phone:""},
  {id:"REDEP-017",pod:"ZP Mendgaon",complaintTicket:"145250302",address:"Jilha Parishad Marathi Prathamik shala, mendgaon Ta. Deulgaonraja Dist.Buldhana 443204",status:"Completed",components:"3 x Monitors",serials:"CN0779TPFCC0078QCAHIA01\nCN0DFDMY72872647AYHUA00\nCN0779TPFCC00789C14IA01",source:"IKS Mumbai",orderDate:"2026-01-06",dispatchDate:"2026-01-10",trackingId:"51637782652",deliveryDate:"2026-01-16",contact:"",phone:""},
  {id:"REDEP-018",pod:"LFP Tardeo",complaintTicket:"N/A",address:"Ashish Building, 5th Floor, Tardeo End of Bombay C Bridge,\n Tardeo, Mumbai, Maharashtra 400034",status:"Completed",components:"10 x Monitors",serials:"CN0779TPFCC0078PDDEIA01\nCN0DFDMY7287263BA5FUA00\nCN0779TPFCC0078PAP4IA01\nCN0DFDMY72872647AYCUA00\nCN0DFDMY7287263BCA8UA00\nCN0779TPFCC0078PAE4IA01\nCN0DFDMY7287263BCDDUA00\nCN0779TPFCC0078PAD0IA01\nCN0DFDMY72872647AL4UA00\nCN0DFDMY7287263BA6MUA00",source:"IKS Mumbai",orderDate:"2026-01-12",dispatchDate:"2026-01-23",trackingId:"Porter",deliveryDate:"2026-01-24",contact:"",phone:""},
  {id:"REDEP-019",pod:"Uva Jagriti Sansthan 1",complaintTicket:"145250267",address:"C/O GOKUL CHAND SAINI, INFRONT OF PANCHAYAT, \nSAMITI, BANSUR, Alwar, Rajasthan, 301402",status:"Completed",components:"5 x CPU's",serials:"S4CP7189\nS4EZ3999\nS4GQ6293\nPC0Q3K1Z\nPC156KGD",source:"BANDHUTVA FOUNDATION",orderDate:"2026-01-12",dispatchDate:"2026-01-24",trackingId:"58927266834\n\n17980177482",deliveryDate:"2026-02-16",contact:"",phone:""},
  {id:"REDEP-020",pod:"Apni Pathshala Office",complaintTicket:"N/A",address:"C-Wing, 2nd Floor, NARAYAN CHANDRA TRUST, Moregoan Talav, Manvelpada Road, Nalasopara East, Maharashtra 401209",status:"Completed",components:"14x Laptop",serials:"",source:"IKS Mumbai",orderDate:"2026-01-20",dispatchDate:"2026-01-29",trackingId:"We Fast",deliveryDate:"2026-01-29",contact:"",phone:""},
  {id:"REDEP-021",pod:"Digital Saathi Foundation",complaintTicket:"145250195",address:"Bus Stand, Kone,  Sonbhadra UP-231226",status:"Completed",components:"4 x CPU's",serials:"PG01ZR6N\nMJ075DXQ\nS4GN0536\nMJ07EK2V",source:"BANDHUTVA FOUNDATION",orderDate:"2026-01-22",dispatchDate:"2026-01-24",trackingId:"51637782836",deliveryDate:"2026-02-06",contact:"",phone:""},
  {id:"REDEP-022",pod:"Christian Grammar School",complaintTicket:"145250210",address:"Christian Grammar School, Thingkham Square, Tamenglong District, Manipur\n  PIN - 795141",status:"Completed",components:"3 x CPU",serials:"MJ05TXQV\nPC17V6NG\nS4FT3411",source:"SRI JAN EK SOACH",orderDate:"2026-01-22",dispatchDate:"2026-01-24",trackingId:"Delhivery\n46455610050805",deliveryDate:"2026-02-02",contact:"",phone:""},
  {id:"REDEP-023",pod:"WTL Foundation",complaintTicket:"145250362",address:"H7/17, Gate no 2, Phase 6, Ayanagar, Delhi - 110047",status:"Completed",components:"1 x Adapter",serials:"-",source:"-",orderDate:"2026-02-14",dispatchDate:"2026-02-14",trackingId:"35187140612",deliveryDate:"2026-02-16",contact:"",phone:""},
  {id:"REDEP-024",pod:"NCT LFP",complaintTicket:"N/A",address:"C-Wing, 2nd Floor, NARAYAN CHANDRA TRUST, Moregoan Talav, Manvelpada Road, Nalasopara East, Maharashtra 401209",status:"Completed",components:"30 x Monitors",serials:"",source:"IKS Mumbai",orderDate:"2026-02-23",dispatchDate:"",trackingId:"we Fast",deliveryDate:"2026-02-24",contact:"",phone:""},
];
const TMPL = {
  shipment: {
    subject: "Shipment Order – {{pod_name}}",
    body: `Dear Vendor (Scogo),

Please process the following equipment shipment order.

Shipment Details:
  POD Name:       {{pod_name}}
  POD Address:    {{pod_address}}
  Contact Person: {{contact_person}}
  Contact Number: {{contact_number}}
  Components:     {{components}}
  No. of CPUs:    {{cpus}}
  Order Date:     {{order_date}}
  Serial Numbers: {{serial_numbers}}

Please confirm receipt and expected dispatch date.

Regards,
Computer Management Department`
  },
  complaint: {
    subject: "Complaint Acknowledgment – {{ticket_number}}",
    body: `Dear {{contact_name}},

We have received your complaint and our technical team is actively investigating.

Complaint Details:
  POD Name:      {{pod_name}}
  Device Issue:  {{device_issue}}
  Device Serial: {{device_serial}}
  Ticket Number: {{ticket_number}}
  Date Reported: {{reported_date}}
  Description:   {{description}}

Our target resolution time is 3–5 working days.

Regards,
Computer Management Department`
  },
  repossession: {
    subject: "Equipment Repossession Notice – {{pod_name}}",
    body: `Dear {{contact_person}},

This is formal notice that a scheduled repossession of equipment has been arranged.

Details:
  POD Name:         {{pod_name}}
  POD Address:      {{pod_address}}
  Components:       {{components}}
  Serial Numbers:   {{serial_numbers}}
  Collection Date:  {{scheduled_date}}
  Reference Ticket: {{ticket_number}}

Please ensure all items are ready for pickup on the scheduled date.

Regards,
Computer Management Department`
  },
  redeployment: {
    subject: "Equipment Redeployment Notification – {{pod_name}}",
    body: `Dear {{contact_person}},

Equipment has been reallocated and will be dispatched to your location.

Details:
  Destination POD:   {{pod_name}}
  POD Address:       {{pod_address}}
  Source POD:        {{source_pod}}
  Components:        {{components}}
  Serial Numbers:    {{serial_numbers}}
  Linked Ticket:     {{complaint_ticket}}
  Expected Delivery: {{delivery_date}}
  Tracking ID:       {{tracking_id}}

Regards,
Computer Management Department`
  }
};

/* ─── THEME ──────────────────────────────────────────────────────────────────── */
const T = {
  sidebar:"#0f172a", sidebarActive:"#1e3a5f",
  bg:"#f0f2f5", card:"#ffffff", border:"#e2e8f0", borderLight:"#f1f5f9",
  text:"#0f172a", textMid:"#64748b", textLight:"#94a3b8",
  blue:"#1d4ed8", blueLight:"#eff6ff", blueMid:"#bfdbfe",
  green:"#15803d", greenLight:"#f0fdf4",
  red:"#dc2626",   redLight:"#fef2f2",
  amber:"#b45309", amberLight:"#fffbeb",
  grayLight:"#f8fafc",
  indigo:"#4f46e5", indigoLight:"#eef2ff",
  cyan:"#0891b2", cyanLight:"#ecfeff",
  violet:"#7c3aed", violetLight:"#f5f3ff",
};

const STATUS_COLORS = {"Pending":           { bg:"#f8fafc", color:"#64748b", dot:"#94a3b8" },"Order Placed":      { bg:"#eef2ff", color:"#4f46e5", dot:"#6366f1" },"Order Sent":        { bg:"#eef2ff", color:"#4f46e5", dot:"#6366f1" },"Dispatched":        { bg:"#fffbeb", color:"#92400e", dot:"#d97706" },"In Transit":        { bg:"#eff6ff", color:"#1d4ed8", dot:"#3b82f6" },"Delivered":         { bg:"#dbeafe", color:"#1e40af", dot:"#3b82f6" },"Completed":         { bg:"#f0fdf4", color:"#15803d", dot:"#22c55e" },"Awaiting Dispatch": { bg:"#fffbeb", color:"#b45309", dot:"#f59e0b" },"Collected":         { bg:"#fefce8", color:"#a16207", dot:"#ca8a04" },"Solved":            { bg:"#f0fdf4", color:"#15803d", dot:"#22c55e" },"Open":              { bg:"#fef2f2", color:"#dc2626", dot:"#ef4444" },"In Progress":       { bg:"#eff6ff", color:"#1d4ed8", dot:"#3b82f6" },"In Process":        { bg:"#eff6ff", color:"#1d4ed8", dot:"#3b82f6" },"Informed":          { bg:"#fdf4ff", color:"#7e22ce", dot:"#a855f7" },"Received":          { bg:"#f0fdf4", color:"#166534", dot:"#16a34a" },
};

// Shipment statuses — "Completed" is the final locked status
// Status is ONLY changed via dropdown — never auto-changed by edit actions
const SHIPMENT_STATUSES = ["Pending","Order Placed","Dispatched","Delivered","Completed"];
const REPOSSESSION_STATUSES = ["Pending","Informed","In Process","Received","Completed"];
const REDEPLOYMENT_STATUSES = ["Pending","Order Sent","In Transit","Delivered","Completed"];
const COMPLAINT_STATUSES_FLOW = ["In Progress","Solved"];

/* ─── ATOMS ──────────────────────────────────────────────────────────────────── */
const Badge = ({ s }) => {
  const st = STATUS_COLORS[s] || { bg:T.grayLight, color:T.textMid, dot:T.textLight };
  return (
    <span style={{ background:st.bg, color:st.color, border:`1px solid ${st.dot}44`, borderRadius:5, padding:"2px 9px", fontSize:11, fontWeight:500, display:"inline-flex", alignItems:"center", gap:5, whiteSpace:"nowrap" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:st.dot, flexShrink:0 }}/>{s}
    </span>
  );
};

const Btn = ({ children, onClick, variant="primary", sm, disabled }) => {
  const V = {
    primary:   { bg:T.blue,     color:"#fff",      border:T.blue },
    secondary: { bg:"#fff",     color:T.text,      border:T.border },
    ghost:     { bg:"transparent", color:T.textMid, border:"transparent" },
    success:   { bg:"#15803d",  color:"#fff",      border:"#15803d" },
    danger:    { bg:T.redLight, color:T.red,       border:"#fca5a566" },
  };
  const v = V[variant] || V.primary;
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ background:v.bg, color:v.color, border:`1px solid ${v.border}`, borderRadius:6, padding:sm?"5px 11px":"7px 15px", fontSize:sm?11:13, fontWeight:500, cursor:disabled?"not-allowed":"pointer", display:"inline-flex", alignItems:"center", gap:6, fontFamily:"inherit", whiteSpace:"nowrap", opacity:disabled?.4:1, transition:"opacity .12s" }}
      onMouseOver={e=>{ if(!disabled) e.currentTarget.style.opacity=".82"; }}
      onMouseOut={e=>{ e.currentTarget.style.opacity=disabled?"0.4":"1"; }}>
      {children}
    </button>
  );
};

const IconBtn = ({ onClick, title, danger, icon }) => (
  <button onClick={onClick} title={title} className="del-btn"
    style={{ background:"none", border:`1px solid ${danger?"#fca5a566":T.border}`, borderRadius:5, padding:"3px 7px", cursor:"pointer", color:danger?T.red:T.textMid, display:"inline-flex", alignItems:"center", transition:"all .12s" }}
    onMouseOver={e=>{ e.currentTarget.style.background=danger?T.redLight:T.grayLight; e.currentTarget.style.opacity="1"; }}
    onMouseOut={e=>{ e.currentTarget.style.background="none"; }}>
    {icon || (danger ? <TrashIco/> : <EyeIco/>)}
  </button>
);

const Lbl = ({ c }) => <div style={{ fontSize:10, fontWeight:600, letterSpacing:".07em", color:T.textLight, textTransform:"uppercase", marginBottom:4 }}>{c}</div>;
const Val = ({ c }) => <div style={{ fontSize:13, color:T.text }}>{c || <span style={{ color:T.textLight }}>—</span>}</div>;
const DR  = ({ l, v }) => <div style={{ marginBottom:12 }}><Lbl c={l}/><Val c={v}/></div>;
const Hr  = () => <div style={{ borderTop:`1px solid ${T.border}`, margin:"14px 0" }}/>;

const TxtInput = ({ label, type="text", value, onChange, placeholder, span2, rows, hint }) => (
  <div style={{ gridColumn:span2?"span 2":undefined, display:"flex", flexDirection:"column", gap:4 }}>
    <label style={{ fontSize:11, fontWeight:600, color:T.textMid, letterSpacing:".05em", textTransform:"uppercase" }}>{label}</label>
    {rows
      ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
          style={{ border:`1px solid ${T.border}`, borderRadius:6, padding:"8px 11px", fontSize:13, color:T.text, fontFamily:"inherit", outline:"none", resize:"vertical", transition:"border-color .15s, box-shadow .15s" }}/>
      : <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          style={{ border:`1px solid ${T.border}`, borderRadius:6, padding:"8px 11px", fontSize:13, color:T.text, fontFamily:"inherit", outline:"none", transition:"border-color .15s, box-shadow .15s" }}/>}
    {hint && <span style={{ fontSize:11, color:T.textLight }}>{hint}</span>}
  </div>
);

const Sel = ({ value, onChange, options, sx }) => (
  <select value={value} onChange={onChange}
    style={{ border:`1px solid ${T.border}`, borderRadius:6, padding:"7px 11px", fontSize:13, color:T.textMid, fontFamily:"inherit", outline:"none", background:"#fff", cursor:"pointer", transition:"border-color .15s, box-shadow .15s", ...sx }}>
    {options.map(o => <option key={o}>{o}</option>)}
  </select>
);

/* ─── CONFIRM DELETE DIALOG ──────────────────────────────────────────────────── */
const ConfirmDelete = ({ label, onConfirm, onCancel }) => (
  <div style={{ position:"fixed", inset:0, zIndex:1100, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
    <div onClick={onCancel} style={{ position:"absolute", inset:0, background:"rgba(15,23,42,.5)", backdropFilter:"blur(3px)" }}/>
    <div className="fade" style={{ position:"relative", background:"#fff", borderRadius:12, width:380, padding:24, boxShadow:"0 20px 50px rgba(0,0,0,.2)", border:`1px solid ${T.border}` }}>
      <div style={{ width:40, height:40, borderRadius:"50%", background:T.redLight, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
        <TrashIco size={18} color={T.red}/>
      </div>
      <div style={{ textAlign:"center", marginBottom:18 }}>
        <div style={{ fontSize:15, fontWeight:600, color:T.text, marginBottom:6 }}>Delete Entry</div>
        <div style={{ fontSize:13, color:T.textMid, lineHeight:1.5 }}>Are you sure you want to delete <strong>{label}</strong>? This action cannot be undone.</div>
      </div>
      <div style={{ display:"flex", gap:9, justifyContent:"center" }}>
        <Btn variant="danger" onClick={onConfirm}>Delete</Btn>
        <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
      </div>
    </div>
  </div>
);

/* ─── MODAL ──────────────────────────────────────────────────────────────────── */
const Modal = ({ title, onClose, children, wide, extraWide }) => (
  <div style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
    <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(15,23,42,.45)", backdropFilter:"blur(3px)" }}/>
    <div className="fade" style={{ position:"relative", background:T.card, borderRadius:12, width:"100%", maxWidth:extraWide?900:wide?740:540, maxHeight:"92vh", overflowY:"auto", boxShadow:"0 25px 60px rgba(0,0,0,.18)", border:`1px solid ${T.border}` }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 22px", borderBottom:`1px solid ${T.border}`, position:"sticky", top:0, background:T.card, zIndex:1 }}>
        <span style={{ fontSize:14, fontWeight:600, color:T.text }}>{title}</span>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:T.textLight, fontSize:20, lineHeight:1, padding:"0 4px" }}>×</button>
      </div>
      <div style={{ padding:22 }}>{children}</div>
    </div>
  </div>
);

/* ─── EMAIL PREVIEW MODAL ────────────────────────────────────────────────────── */
const fillTpl = (str, vars) => {
  let s = str;
  Object.entries(vars).forEach(([k,v]) => { s = s.replaceAll(`{{${k}}}`, v||`[${k}]`); });
  return s;
};

const EmailPrevModal = ({ tplKey, vars, onClose, onSend }) => {
  const t = TMPL[tplKey];
  return (
    <Modal title="Email Preview" onClose={onClose} wide>
      <div style={{ padding:"9px 12px", background:T.blueLight, border:`1px solid ${T.blueMid}`, borderRadius:6, marginBottom:12, fontSize:13, color:T.text }}>
        <span style={{ fontWeight:600, color:T.blue, marginRight:8 }}>To:</span> Vendor (Scogo) — {vars.contact_person || "Contact"}
      </div>
      <Lbl c="Subject"/>
      <div style={{ background:T.grayLight, border:`1px solid ${T.border}`, borderRadius:6, padding:"9px 12px", fontSize:13, color:T.text, fontWeight:500, marginBottom:12 }}>
        {fillTpl(t.subject, vars)}
      </div>
      <Lbl c="Body"/>
      <pre style={{ background:T.grayLight, border:`1px solid ${T.border}`, borderRadius:6, padding:14, fontSize:12, color:T.textMid, fontFamily:"'DM Mono',monospace", whiteSpace:"pre-wrap", lineHeight:1.75, maxHeight:340, overflowY:"auto" }}>
        {fillTpl(t.body, vars)}
      </pre>
      <div style={{ display:"flex", gap:8, marginTop:16 }}>
        {onSend && (
          <Btn variant="success" onClick={onSend}>
            <SendIco/> Send Mail to Vendor
          </Btn>
        )}
        <Btn variant="secondary" onClick={onClose}>Close</Btn>
      </div>
    </Modal>
  );
};

/* ─── COLUMN FILTER DROPDOWN ─────────────────────────────────────────────────── */
const ColFilterDrop = ({ options, value, onChange, onClose }) => {
  const ref = useRef();
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  return (
    <div ref={ref} style={{ position:"absolute", top:"100%", left:0, zIndex:300, background:"#fff", border:`1px solid ${T.border}`, borderRadius:7, boxShadow:"0 6px 24px rgba(0,0,0,.12)", minWidth:160, overflow:"hidden", marginTop:2 }}>
      {options.map(o => (
        <div key={o} onClick={() => { onChange(o); onClose(); }}
          style={{ padding:"8px 14px", fontSize:13, color:value===o?T.blue:T.text, background:value===o?T.blueLight:"transparent", cursor:"pointer", fontWeight:value===o?500:400 }}
          onMouseOver={e=>{ if(value!==o) e.currentTarget.style.background=T.grayLight; }}
          onMouseOut={e=>{ if(value!==o) e.currentTarget.style.background="transparent"; }}>
          {o}
        </div>
      ))}
    </div>
  );
};

/* ─── FILTERABLE TABLE ───────────────────────────────────────────────────────── */
const FiltTable = ({ cols, data, renderRow }) => {
  const [q, setQ]       = useState("");
  const [sort, setSort] = useState({ k:null, d:1 });
  const [cFilt, setCF]  = useState({});
  const [openDD, setDD] = useState(null);

  const colOpts = useMemo(() => {
    const o = {};
    cols.forEach(c => { if (c.filterable) o[c.k] = ["All", ...new Set(data.map(r => String(r[c.k]||"")).filter(Boolean))]; });
    return o;
  }, [cols, data]);

  const filtered = useMemo(() => {
    let d = data;
    if (q) { const lq = q.toLowerCase(); d = d.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(lq))); }
    Object.entries(cFilt).forEach(([k,v]) => { if (v && v !== "All") d = d.filter(r => String(r[k]) === v); });
    if (sort.k) d = [...d].sort((a,b) => String(a[sort.k]||"").localeCompare(String(b[sort.k]||"")) * sort.d);
    return d;
  }, [data, q, cFilt, sort]);

  const activeFiltCount = Object.values(cFilt).filter(v => v && v !== "All").length;

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:11 }}>
        <div style={{ position:"relative", display:"inline-flex", alignItems:"center" }}>
          <svg style={{ position:"absolute", left:9, color:T.textLight, pointerEvents:"none" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…"
            style={{ border:`1px solid ${T.border}`, borderRadius:6, padding:"7px 11px 7px 30px", fontSize:13, color:T.text, fontFamily:"inherit", outline:"none", width:220, transition:"border-color .15s, box-shadow .15s" }}/>
        </div>
        {activeFiltCount > 0 && (
          <button onClick={() => setCF({})}
            style={{ fontSize:11, color:T.red, border:`1px solid #fca5a566`, borderRadius:5, padding:"4px 10px", background:T.redLight, cursor:"pointer", fontFamily:"inherit", fontWeight:500 }}>
            ✕ Clear {activeFiltCount} filter{activeFiltCount>1?"s":""}
          </button>
        )}
      </div>
      <div style={{ border:`1px solid ${T.border}`, borderRadius:10, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background:T.grayLight, borderBottom:`1px solid ${T.border}` }}>
                {cols.map(c => {
                  const hasF = cFilt[c.k] && cFilt[c.k] !== "All";
                  return (
                    <th key={c.k} style={{ textAlign:"left", padding:"10px 13px", fontWeight:600, fontSize:11, color:hasF?T.blue:T.textMid, letterSpacing:".06em", textTransform:"uppercase", whiteSpace:"nowrap", userSelect:"none", position:"relative" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                        <span onClick={() => setSort(s => s.k===c.k ? {k:c.k,d:s.d*-1} : {k:c.k,d:1})} style={{ cursor:"pointer", display:"flex", alignItems:"center", gap:3 }}>
                          {c.l}{sort.k===c.k && <span style={{ color:T.blue }}>{sort.d===1?"↑":"↓"}</span>}
                        </span>
                        {c.filterable && (
                          <span className="col-filter-btn"
                            onClick={() => setDD(openDD===c.k ? null : c.k)}
                            style={{ marginLeft:2, cursor:"pointer", borderRadius:3, padding:"1px 4px", background:hasF?T.blueMid:"transparent", display:"inline-flex", alignItems:"center" }}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={hasF?T.blue:"currentColor"} strokeWidth="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                          </span>
                        )}
                      </div>
                      {c.filterable && openDD===c.k && (
                        <ColFilterDrop options={colOpts[c.k]||["All"]} value={cFilt[c.k]||"All"}
                          onChange={v => setCF(p => ({...p,[c.k]:v}))}
                          onClose={() => setDD(null)}/>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={cols.length} style={{ textAlign:"center", padding:32, color:T.textLight, fontSize:13 }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={T.textLight} strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                      No records found
                    </div>
                  </td></tr>
                : filtered.map((r,i) => (
                    <tr key={r.id||i} className="tr" style={{ borderBottom:i<filtered.length-1?`1px solid ${T.borderLight}`:"none", background:"#fff" }}>
                      {renderRow(r)}
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ marginTop:7, fontSize:11, color:T.textLight }}>{filtered.length} record{filtered.length!==1?"s":""}</div>
    </div>
  );
};

const TD = ({ c, bold, mono, onClick }) => (
  <td onClick={onClick} style={{ padding:"11px 13px", color:bold?T.text:T.textMid, fontWeight:bold?500:400, whiteSpace:"nowrap", fontFamily:mono?"'DM Mono',monospace":undefined, cursor:onClick?"pointer":undefined }}>
    {c ?? <span style={{ color:T.textLight }}>—</span>}
  </td>
);

/* ─── STATUS PIPELINE COMPONENT ─────────────────────────────────────────────── */
const StatusPipeline = ({ statuses, currentStatus, onUpdateStatus, entryId, isCompleted }) => {
  const statusIdx = statuses.indexOf(currentStatus);
  return (
    <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"18px 24px", marginBottom:16 }}>
      <div style={{ fontSize:12, fontWeight:600, color:T.textMid, textTransform:"uppercase", letterSpacing:".06em", marginBottom:14 }}>Status Pipeline</div>
      <div style={{ display:"flex", alignItems:"center" }}>
        {statuses.map((s, i) => {
          const done    = i < statusIdx;
          const current = i === statusIdx;
          const upcoming = i > statusIdx;
          const dot_c   = done?"#22c55e":current?T.blue:"#d1d5db";
          const line_c  = i < statusIdx ? "#22c55e" : "#e5e7eb";
          return (
            <div key={s} style={{ display:"flex", alignItems:"center", flex: i<statuses.length-1 ? 1 : 0 }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                <div onClick={() => { if(!upcoming && !isCompleted) onUpdateStatus(entryId, s); }}
                  style={{ width:28, height:28, borderRadius:"50%", background:done?"#22c55e":current?T.blue:"#f1f5f9", border:`2px solid ${dot_c}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:(upcoming||isCompleted)?"default":"pointer", transition:"all .2s" }}>
                  {done
                    ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    : current
                    ? <span style={{ width:8, height:8, borderRadius:"50%", background:"#fff" }}/>
                    : <span style={{ width:6, height:6, borderRadius:"50%", background:"#9ca3af" }}/>
                  }
                </div>
                <span style={{ fontSize:10, fontWeight: current?600:400, color:done?"#15803d":current?T.blue:"#9ca3af", whiteSpace:"nowrap", maxWidth:80, textAlign:"center", lineHeight:1.3 }}>{s}</span>
              </div>
              {i < statuses.length - 1 && (
                <div style={{ flex:1, height:2, background:line_c, margin:"0 4px", marginBottom:14, transition:"background .3s" }}/>
              )}
            </div>
          );
        })}
      </div>
      {!isCompleted && (
        <div style={{ marginTop:12, fontSize:12, color:T.textLight }}>
          Next: <strong style={{ color:T.blue }}>{statuses[statusIdx+1] || "—"}</strong>
          {statusIdx < statuses.length - 1 && (
            <button onClick={() => onUpdateStatus(entryId, statuses[statusIdx+1])}
              style={{ marginLeft:12, background:T.blue, color:"#fff", border:"none", borderRadius:5, padding:"3px 12px", fontSize:11, cursor:"pointer", fontFamily:"inherit", fontWeight:500 }}>
              Advance →
            </button>
          )}
        </div>
      )}
      {isCompleted && <div style={{ marginTop:10, fontSize:12, color:T.green, fontWeight:500 }}>✓ This entry is completed and locked.</div>}
    </div>
  );
};

/* ─── EDIT MODAL WRAPPER ─────────────────────────────────────────────────────── */
const EditModal = ({ title, onClose, onSave, children }) => (
  <Modal title={title} onClose={onClose} wide>
    {children}
    <div style={{ display:"flex", gap:9, marginTop:18, paddingTop:16, borderTop:`1px solid ${T.border}` }}>
      <Btn onClick={onSave}><CheckIco/> Save Changes</Btn>
      <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
    </div>
  </Modal>
);

/* ─── SHIPMENT DETAIL VIEW ───────────────────────────────────────────────────── */
const ShipmentDetail = ({ ship, onBack, onDelete, onSendMail, onEdit }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [confirmDel, setConfirmDel]   = useState(false);
  const [editM, setEditM]             = useState(false);
  const [editForm, setEditForm]       = useState({ ...ship });

  // Keep editForm in sync when ship prop updates (e.g. after save)
  useEffect(() => { setEditForm({ ...ship }); }, [ship]);

  const EF = k => e => setEditForm(p=>({...p,[k]:e.target.value}));
  const autoComp = n => { const x=parseInt(n); return isNaN(x)||x<=0?"":x+" Monitor, "+x+" Keyboard, "+x+" Mouse, "+x+" Webcam, "+x+" Headphones"; };

  const isCompleted = ship.status === "Completed";

  // Email vars always use latest saved ship data (not editForm — editForm is for the edit modal only)
  const emailVars = {
    pod_name: ship.pod, contact_person: ship.contact, contact_number: ship.phone,
    pod_address: ship.address, components: ship.components, cpus: String(ship.cpus),
    order_date: ship.orderDate, serial_numbers: ship.serials || "TBD", tracking_id: ship.trackingId || "TBD",
  };

  // Save: only update fields, NEVER touch status — status lives in the dropdown inside edit modal
  const handleSave = () => {
    onEdit(ship.id, editForm);  // editForm includes status (from dropdown), other fields untouched unless user changed them
    setEditM(false);
  };

  const statusIdx = SHIPMENT_STATUSES.indexOf(ship.status);

  return (
    <div className="fade">
      {/* Back bar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
        <button onClick={onBack}
          style={{ display:"flex", alignItems:"center", gap:7, background:"none", border:"none", cursor:"pointer", color:T.textMid, fontSize:13, fontFamily:"inherit", padding:"6px 0" }}
          onMouseOver={e=>e.currentTarget.style.color=T.text} onMouseOut={e=>e.currentTarget.style.color=T.textMid}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to Shipments
        </button>
        <div style={{ display:"flex", gap:9 }}>
          {!isCompleted && <Btn variant="secondary" onClick={()=>setEditM(true)}><EditIco/> Edit Details</Btn>}
          {/* Preview Mail only available for Pending — once order sent, mail workflow is complete */}
          {ship.status === "Pending" && <Btn onClick={() => setShowPreview(true)}><EyeIco/> Preview Mail</Btn>}
          <Btn variant="danger" onClick={() => setConfirmDel(true)}><TrashIco/> Delete</Btn>
        </div>
      </div>

      {/* Status pipeline — VISUAL ONLY, does not control status */}
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"18px 24px", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <div style={{ fontSize:12, fontWeight:600, color:T.textMid, textTransform:"uppercase", letterSpacing:".06em" }}>Shipment Progress</div>
          <div style={{ fontSize:11, color:T.textLight, background:T.grayLight, border:`1px solid ${T.border}`, borderRadius:5, padding:"3px 10px" }}>
            Status is changed via <strong style={{ color:T.blue }}>Edit Details → Status dropdown</strong>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center" }}>
          {SHIPMENT_STATUSES.map((s, i) => {
            const done    = i < statusIdx;
            const current = i === statusIdx;
            const dot_c   = done?"#22c55e":current?T.blue:"#d1d5db";
            const line_c  = i < statusIdx ? "#22c55e" : "#e5e7eb";
            return (
              <div key={s} style={{ display:"flex", alignItems:"center", flex: i<SHIPMENT_STATUSES.length-1 ? 1 : 0 }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                  <div style={{ width:28, height:28, borderRadius:"50%", background:done?"#22c55e":current?T.blue:"#f1f5f9", border:`2px solid ${dot_c}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {done
                      ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      : current
                      ? <span style={{ width:8, height:8, borderRadius:"50%", background:"#fff" }}/>
                      : <span style={{ width:6, height:6, borderRadius:"50%", background:"#9ca3af" }}/>
                    }
                  </div>
                  <span style={{ fontSize:10, fontWeight: current?600:400, color:done?"#15803d":current?T.blue:"#9ca3af", whiteSpace:"nowrap", maxWidth:80, textAlign:"center", lineHeight:1.3 }}>{s}</span>
                </div>
                {i < SHIPMENT_STATUSES.length - 1 && (
                  <div style={{ flex:1, height:2, background:line_c, margin:"0 4px", marginBottom:14 }}/>
                )}
              </div>
            );
          })}
        </div>
        {isCompleted && <div style={{ marginTop:10, fontSize:12, color:T.green, fontWeight:500 }}>✓ This shipment is completed and locked.</div>}
      </div>

      {/* Detail card */}
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"20px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:T.text }}>{ship.pod}</div>
            <div style={{ fontSize:12, color:T.textMid, marginTop:2, fontFamily:"'DM Mono',monospace" }}>{ship.id}</div>
          </div>
          <Badge s={ship.status}/>
        </div>
        <Hr/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 36px" }}>
          <DR l="Contact Person"  v={ship.contact}/>
          <DR l="Contact Number"  v={ship.phone}/>
          <DR l="POD Address"     v={ship.address}/>
          <DR l="State / Region"  v={ship.state}/>
          <DR l="Purpose"         v={ship.purpose ? <span style={{ background:"#eef2ff", border:"1px solid #c7d2fe", borderRadius:4, padding:"2px 8px", fontSize:12, color:"#4f46e5", fontWeight:500 }}>{ship.purpose}</span> : null}/>
          <DR l="Order Date"      v={ship.orderDate}/>
          <DR l="Dispatch Date"   v={ship.dispatchDate}/>
          <DR l="Delivery Date"   v={ship.deliveryDate}/>
          <DR l="CPUs"            v={ship.cpus}/>
          <DR l="Tracking ID"     v={ship.trackingId ? <span style={{ fontFamily:"'DM Mono',monospace", color:T.blue }}>{ship.trackingId}</span> : null}/>
        </div>
        <Hr/>
        <DR l="Components" v={ship.components}/>
        <DR l="Serial Numbers" v={ship.serials ? <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12 }}>{ship.serials}</span> : null}/>
        <Hr/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 36px" }}>
          <DR l="QC Report"        v={ship.qcReport ? <a href="#" style={{ color:T.blue, fontSize:13 }}>📄 {ship.qcReport}</a> : null}/>
          <DR l="Signed QC Report" v={ship.signedQc ? <a href="#" style={{ color:T.blue, fontSize:13 }}>📄 {ship.signedQc}</a> : null}/>
        </div>

        {/* Info bar — shown for Pending entries awaiting vendor mail */}
        {ship.status === "Pending" && (
          <div style={{ marginTop:16, padding:"12px 16px", background:T.blueLight, borderRadius:8, border:`1px solid ${T.blueMid}`, fontSize:12, color:T.blue }}>
            ℹ️ This shipment is <strong>Pending</strong>. Use <strong>Edit Details</strong> to update fields, then <strong>Preview Mail</strong> to send the vendor order email. Once sent, status will move to <em>Order Placed</em> and the mail option will be removed.
          </div>
        )}
      </div>

      {/* Edit Modal — status dropdown is here; editing fields does NOT auto-change status */}
      {editM && (
        <EditModal title={`Edit Shipment — ${ship.id}`} onClose={()=>{setEditM(false);setEditForm({...ship});}} onSave={handleSave}>
          <div style={{ padding:"10px 14px", background:T.amberLight, border:`1px solid #fde68a`, borderRadius:7, marginBottom:16, fontSize:12, color:T.amber }}>
            ✏️ Editing details does <strong>not</strong> change status automatically. Use the Status dropdown below to update status manually.
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <TxtInput label="POD Name"        value={editForm.pod}          onChange={EF("pod")}         placeholder="e.g. Alpha POD"/>
            <TxtInput label="Contact Person"  value={editForm.contact}      onChange={EF("contact")}     placeholder="Full name"/>
            <TxtInput label="POD Address"     value={editForm.address}      onChange={EF("address")}     placeholder="Full address" span2/>
            <TxtInput label="Contact Number"  value={editForm.phone}        onChange={EF("phone")}       placeholder="+233..."/>
            <TxtInput label="State / Region"  value={editForm.state||""}    onChange={EF("state")}       placeholder="e.g. Greater Accra"/>
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.textMid, letterSpacing:".05em", textTransform:"uppercase" }}>Purpose</label>
              <Sel value={editForm.purpose||"New POD"} onChange={EF("purpose")} options={SHIPMENT_PURPOSES}/>
            </div>
            <TxtInput label="Order Date"      type="date" value={editForm.orderDate||""} onChange={EF("orderDate")}/>
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.textMid, letterSpacing:".05em", textTransform:"uppercase" }}>Number of CPUs</label>
              <input type="number" min="0" value={editForm.cpus}
                onChange={e=>setEditForm(p=>({...p,cpus:e.target.value,components:autoComp(e.target.value)}))}
                style={{ border:`1px solid ${T.border}`, borderRadius:6, padding:"8px 11px", fontSize:13, color:T.text, fontFamily:"inherit", outline:"none" }}/>
            </div>
            <TxtInput label="Components"      value={editForm.components||""}   onChange={EF("components")}  placeholder="Components list" span2/>
            <TxtInput label="Tracking ID"     value={editForm.trackingId||""}   onChange={EF("trackingId")}  placeholder="TRK-XXXX"/>
            <TxtInput label="Dispatch Date"   type="date" value={editForm.dispatchDate||""} onChange={EF("dispatchDate")}/>
            <TxtInput label="Delivery Date"   type="date" value={editForm.deliveryDate||""} onChange={EF("deliveryDate")}/>
            <TxtInput label="Serial Numbers"  value={editForm.serials||""}  onChange={EF("serials")}     placeholder="e.g. MON-001, KB-001…" span2/>
            <TxtInput label="QC Report"       value={editForm.qcReport||""} onChange={EF("qcReport")}    placeholder="Filename or reference"/>
            <TxtInput label="Signed QC Report" value={editForm.signedQc||""} onChange={EF("signedQc")}   placeholder="Filename or reference" hint="Required to mark as Completed"/>
            {/* Status dropdown — the ONLY way to change status */}
            <div style={{ display:"flex", flexDirection:"column", gap:4, gridColumn:"span 2", borderTop:`1px solid ${T.border}`, paddingTop:14, marginTop:4 }}>
              <label style={{ fontSize:11, fontWeight:700, color:T.blue, letterSpacing:".05em", textTransform:"uppercase" }}>Status — select to update manually</label>
              <Sel value={editForm.status||"Pending"} onChange={EF("status")} options={SHIPMENT_STATUSES}
                sx={{ border:`1px solid ${T.blue}`, background:T.blueLight, color:T.blue, fontWeight:600 }}/>
              <span style={{ fontSize:11, color:T.textLight }}>Current status: <strong>{ship.status}</strong> — changing this and saving will update the status.</span>
            </div>
          </div>
        </EditModal>
      )}

      {showPreview && (
        <EmailPrevModal tplKey="shipment" vars={emailVars}
          onClose={() => setShowPreview(false)}
          onSend={() => { onSendMail(ship.id); setShowPreview(false); }}
        />
      )}

      {confirmDel && (
        <ConfirmDelete label={`${ship.pod} (${ship.id})`}
          onConfirm={() => { onDelete(ship.id); onBack(); }}
          onCancel={() => setConfirmDel(false)}/>
      )}
    </div>
  );
};

/* ─── OVERVIEW ───────────────────────────────────────────────────────────────── */
const Overview = ({ shipments, complaints, repos, redeps }) => {
  // ── Filters ───────────────────────────────────────────────────────────────
  const [filterRange,  setFR]    = useState("all");        // all | week | month | custom
  const [filterFrom,   setFrom]  = useState("");
  const [filterTo,     setTo]    = useState("");
  const [appliedFrom,  setAF]    = useState("");
  const [appliedTo,    setAT]    = useState("");
  const [searchPOD,    setSearch]= useState("");
  const [filterState,  setFState]= useState("All");
  const [filterStatus, setFStat] = useState("All");
  const [pcBreakdown,  setPCB]   = useState(false);
  const [shipBreakdown,setSHB]   = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [actTypeFilter,setActTypeFilter]= useState(null);   // null = all
  const [mapHovered,   setMapHovered]   = useState(null);

  // ── Date range helper ─────────────────────────────────────────────────────
  const getDateBounds = () => {
    const now = new Date();
    if (filterRange === "week") {
      const day = now.getDay();
      const mon = new Date(now); mon.setDate(now.getDate() - day + 1);
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
      const fmt = d => d.toISOString().split("T")[0];
      return { from: fmt(mon), to: fmt(sun) };
    }
    if (filterRange === "month") {
      const yr = now.getFullYear(), mo = String(now.getMonth()+1).padStart(2,"0");
      return { from:`${yr}-${mo}-01`, to:`${yr}-${mo}-31` };
    }
    if (filterRange === "custom") return { from:appliedFrom, to:appliedTo };
    return { from:"", to:"" };
  };
  const { from:df, to:dt } = getDateBounds();

  const inRange = (dateStr) => {
    if (!df && !dt) return true;
    if (!dateStr) return false;
    return dateStr >= df && dateStr <= dt;
  };

  // ── Filtered datasets ─────────────────────────────────────────────────────
  const fShips = useMemo(() => shipments.filter(s => {
    if (!inRange(s.orderDate)) return false;
    if (searchPOD && !s.pod.toLowerCase().includes(searchPOD.toLowerCase())) return false;
    if (filterState !== "All" && s.state !== filterState) return false;
    if (filterStatus !== "All" && s.status !== filterStatus) return false;
    return true;
  }), [shipments, df, dt, searchPOD, filterState, filterStatus]);

  const fComps = useMemo(() => complaints.filter(c => {
    if (!inRange(c.reported)) return false;
    if (searchPOD && !c.pod.toLowerCase().includes(searchPOD.toLowerCase())) return false;
    if (filterStatus !== "All" && c.status !== filterStatus) return false;
    return true;
  }), [complaints, df, dt, searchPOD, filterStatus]);

  const fRepos = useMemo(() => repos.filter(r => {
    // Only reshipDate (actual shipment date) is used for operational filtering.
    // expectedDate is informational only and must NOT be used in calculations.
    if (!inRange(r.reshipDate||"")) return false;
    if (searchPOD && !r.pod.toLowerCase().includes(searchPOD.toLowerCase())) return false;
    if (filterStatus !== "All" && r.status !== filterStatus) return false;
    return true;
  }), [repos, df, dt, searchPOD, filterStatus]);

  const fRedeps = useMemo(() => redeps.filter(r => {
    if (!inRange(r.orderDate)) return false;
    if (searchPOD && !r.pod.toLowerCase().includes(searchPOD.toLowerCase())) return false;
    if (filterStatus !== "All" && r.status !== filterStatus) return false;
    return true;
  }), [redeps, df, dt, searchPOD, filterStatus]);

  // ── KPI calculations ──────────────────────────────────────────────────────
  const completedShips  = fShips.filter(s => s.status==="Completed");
  const deployedPCs     = completedShips.reduce((a,s)=>a+Number(s.cpus||0),0);
  const activePODs      = [...new Set(fShips.filter(s=>s.purpose==="New POD"||s.purpose==="Manthan POD").map(s=>s.pod))].length;
  const totalShips      = fShips.length;
  const raised          = fComps.length;
  const solved          = fComps.filter(c=>c.status==="Solved").length;
  const open            = fComps.filter(c=>c.status==="In Progress").length;  // "In Progress" is active status
  const inProgress      = fComps.filter(c=>c.status==="In Progress").length;
  const resolutionRate  = raised>0 ? Math.round(solved/raised*100) : 0;
  const repoDone        = fRepos.filter(r=>r.status==="Received"||r.status==="Completed").length;
  const repoPODs        = [...new Set(fRepos.filter(r=>r.status==="Received"||r.status==="Completed").map(r=>r.pod))].length;
  const totalRedeps     = fRedeps.length;
  const solvedViaRedep  = fRedeps.filter(r=>r.status==="Completed" && r.complaintTicket && r.complaintTicket.trim()!=="" && r.complaintTicket.trim().toLowerCase()!=="n/a").length;

  // ── Purpose breakdown for PC deployed modal ───────────────────────────────
  const purposeBreakdown = useMemo(() => {
    const map = {};
    completedShips.forEach(s => {
      const p = s.purpose || "Other";
      if (!map[p]) map[p] = { count:0, cpus:0 };
      map[p].count++;
      map[p].cpus += Number(s.cpus||0);
    });
    return Object.entries(map).map(([purpose, d]) => ({ purpose, ...d })).sort((a,b)=>b.cpus-a.cpus);
  }, [completedShips]);

  // ── Status breakdown for shipments modal ──────────────────────────────────
  const shipStatusBreak = useMemo(() => {
    const map = {};
    fShips.forEach(s => { map[s.status] = (map[s.status]||0)+1; });
    return SHIPMENT_STATUSES.map(st => ({ status:st, count:map[st]||0 }));
  }, [fShips]);

  // ── Chart data ────────────────────────────────────────────────────────────
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const shipTrend = useMemo(() => {
    const map = {};
    fShips.forEach(s => {
      if (!s.orderDate) return;
      const m = monthNames[parseInt(s.orderDate.split("-")[1])-1];
      map[m] = (map[m]||0)+1;
    });
    return monthNames.filter(m=>map[m]).map(m=>({ period:m, shipments:map[m] }));
  }, [fShips]);

  const complaintTrend = useMemo(() => {
    const map = {};
    fComps.forEach(c => {
      if (!c.reported) return;
      const m = monthNames[parseInt(c.reported.split("-")[1])-1];
      if (!map[m]) map[m] = { period:m, raised:0, solved:0, open:0 };
      map[m].raised++;
      if (c.status==="Solved")      map[m].solved++;
      if (c.status==="In Progress") map[m].open++;
    });
    return monthNames.filter(m=>map[m]).map(m=>map[m]);
  }, [fComps]);

  const donutData = [
    { name:"Solved",      value:solved,     fill:"#22c55e" },
    { name:"In Progress", value:inProgress, fill:T.blue },
  ].filter(d=>d.value>0);

  // ── Deployment reach by state ──────────────────────────────────────────────
  const stateReach = useMemo(() => {
    const map = {};
    completedShips.forEach(s => {
      const st = s.state || "Unknown";
      if (!map[st]) map[st] = { state:st, cpus:0, pods:new Set() };
      map[st].cpus += Number(s.cpus||0);
      map[st].pods.add(s.pod);
    });
    return Object.values(map).map(d=>({ state:d.state, cpus:d.cpus, pods:d.pods.size })).sort((a,b)=>b.cpus-a.cpus);
  }, [completedShips]);

  const allStates = [...new Set(shipments.map(s=>s.state).filter(Boolean))];

  // ── Recent activities ─────────────────────────────────────────────────────
  const recentActivity = useMemo(() => {
    const acts = [];
    fShips.forEach(s => {
      if (s.status==="Completed")   acts.push({ ts:s.deliveryDate||s.orderDate, label:`Shipment completed — ${s.pod}`, sub:`${s.cpus} PCs · ${s.id}`, type:"ship_done", color:T.green });
      else if (s.status==="Pending"||s.status==="Order Placed") acts.push({ ts:s.orderDate, label:`Shipment placed — ${s.pod}`, sub:`${s.cpus} PCs · ${s.purpose||""}`, type:"ship_new", color:T.blue });
    });
    fComps.forEach(c => {
      if (c.status==="Solved") acts.push({ ts:c.solved||c.reported, label:`Complaint solved — ${c.pod}`, sub:`${c.issue?.slice(0,40)||c.org} · ${c.ticket}`, type:"comp_solved", color:T.green });
    });
    fRepos.forEach(r => {
      if (r.status==="Received"||r.status==="Completed") acts.push({ ts:r.reshipDate, label:`Repossession received — ${r.pod}`, sub:`${r.ticket}`, type:"repo_done", color:"#7c3aed" });
    });
    fRedeps.forEach(r => {
      if (r.status==="Completed") acts.push({ ts:r.deliveryDate||r.orderDate, label:`Redeployment completed — ${r.pod}`, sub:`From ${r.source} · ${r.complaintTicket||""}`, type:"redep_done", color:"#0891b2" });
      else if (r.status==="Pending"||r.status==="Order Sent") acts.push({ ts:r.orderDate, label:`Redeployment placed — ${r.pod}`, sub:`From ${r.source}`, type:"redep_new", color:T.indigo });
    });
    return acts.filter(a=>a.ts).sort((a,b)=>b.ts.localeCompare(a.ts)).slice(0,10);
  }, [fShips, fComps, fRepos, fRedeps]);

  // ── Activity type icons ────────────────────────────────────────────────────
  const ActivityIcon = ({ type, color }) => {
    const icons = {
      ship_done:  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
      ship_new:   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8"/></svg>,
      comp_solved:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
      repo_done:  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>,
      redep_done: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>,
      redep_new:  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><path d="M8 7h12m0 0l-4-4m4 4l-4 4"/></svg>,
    };
    return <div style={{ width:26, height:26, borderRadius:"50%", background:`${color}18`, border:`1px solid ${color}44`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{icons[type]}</div>;
  };

  // ── UI Helpers ────────────────────────────────────────────────────────────
  const OCard = ({ children, style={} }) => (
    <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12,
      boxShadow:"0 1px 3px rgba(15,23,42,.06), 0 4px 12px rgba(15,23,42,.04)",
      overflow:"hidden", ...style }}>
      {children}
    </div>
  );

  const KPICard = ({ label, value, sub, accent, icon, clickable, onClick }) => {
    const pal = {
      blue:   { bg:"#eff6ff", text:"#1d4ed8", bar:"#3b82f6", bd:"#bfdbfe" },
      indigo: { bg:"#eef2ff", text:"#4338ca", bar:"#6366f1", bd:"#c7d2fe" },
      green:  { bg:"#f0fdf4", text:"#15803d", bar:"#22c55e", bd:"#bbf7d0" },
      red:    { bg:"#fef2f2", text:"#dc2626", bar:"#ef4444", bd:"#fecaca" },
      violet: { bg:"#f5f3ff", text:"#6d28d9", bar:"#8b5cf6", bd:"#ddd6fe" },
      cyan:   { bg:"#ecfeff", text:"#0e7490", bar:"#06b6d4", bd:"#a5f3fc" },
      amber:  { bg:"#fffbeb", text:"#b45309", bar:"#f59e0b", bd:"#fde68a" },
    };
    const p = pal[accent] || pal.blue;
    return (
      <div onClick={clickable?onClick:undefined}
        style={{ background:"#fff", border:`1px solid ${T.border}`, borderRadius:12,
          padding:"22px 22px 20px", cursor:clickable?"pointer":"default",
          boxShadow:"0 1px 3px rgba(15,23,42,.05)", transition:"all .18s",
          position:"relative", overflow:"hidden" }}
        onMouseOver={e=>{ e.currentTarget.style.boxShadow="0 8px 24px rgba(15,23,42,.1)"; e.currentTarget.style.transform="translateY(-2px)"; }}
        onMouseOut={e=>{  e.currentTarget.style.boxShadow="0 1px 3px rgba(15,23,42,.05)"; e.currentTarget.style.transform="translateY(0)"; }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${p.bar}, ${p.bar}aa)` }}/>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14 }}>
          <span style={{ fontSize:10.5, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".08em", lineHeight:1.5, paddingRight:8 }}>{label}</span>
          <div style={{ width:34, height:34, borderRadius:9, background:p.bg, border:`1px solid ${p.bd}`,
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={p.text} strokeWidth="1.8">{icon}</svg>
          </div>
        </div>
        <div style={{ fontSize:32, fontWeight:800, color:p.text, fontVariantNumeric:"tabular-nums", lineHeight:1, letterSpacing:"-.03em" }}>{value}</div>
        {sub && <div style={{ fontSize:11, color:"#94a3b8", marginTop:7, lineHeight:1.5 }}>{sub}</div>}
        {clickable && (
          <div style={{ marginTop:12, display:"inline-flex", alignItems:"center", gap:5, fontSize:11,
            color:p.text, fontWeight:600, background:p.bg, border:`1px solid ${p.bd}`, borderRadius:6, padding:"4px 10px" }}>
            View breakdown
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        )}
      </div>
    );
  };

  const RowHeader = ({ title, sub, accent="#3b82f6" }) => (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
      <div style={{ width:4, height:20, borderRadius:2, background:accent }}/>
      <div>
        <div style={{ fontSize:13, fontWeight:700, color:T.text, letterSpacing:"-.01em" }}>{title}</div>
        {sub && <div style={{ fontSize:11, color:"#94a3b8", marginTop:1 }}>{sub}</div>}
      </div>
    </div>
  );

  const ChartCard = ({ title, sub, badge, badgeColor, children, style={} }) => (
    <OCard style={{ padding:"22px 22px 18px", ...style }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:4 }}>
        <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{title}</div>
        {badge && <span style={{ fontSize:9.5, fontWeight:700, background:badgeColor?.bg||"#eff6ff",
          color:badgeColor?.text||"#1d4ed8", border:`1px solid ${badgeColor?.bd||"#bfdbfe"}`,
          borderRadius:4, padding:"2px 7px", letterSpacing:".04em" }}>{badge}</span>}
      </div>
      <div style={{ fontSize:11, color:"#94a3b8", marginBottom:16 }}>{sub}</div>
      {children}
    </OCard>
  );

  const EmptyChart = ({ msg, h=200 }) => (
    <div style={{ height:h, display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", gap:8, color:"#cbd5e1" }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
      </svg>
      <span style={{ fontSize:12 }}>{msg}</span>
    </div>
  );

  // KPI icons
  const ICO = {
    monitor:<><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></>,
    pods:   <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    ship:   <><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3M9 21H5a2 2 0 01-2-2v-4M13 13h8m0 0l-4-4m4 4l-4 4"/></>,
    alert:  <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
    check:  <><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
    rate:   <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
    repo:   <><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></>,
    redep:  <><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></>,
    solved: <><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></>,
  };

  // Map: region positions for bubble map
  const REGION_POS = [
    { state:"Northern",      cx:200, cy:80  }, { state:"Upper East",    cx:268, cy:48  },
    { state:"Upper West",    cx:132, cy:52  }, { state:"Savannah",      cx:168, cy:118 },
    { state:"North East",    cx:248, cy:98  }, { state:"Brong-Ahafo",   cx:140, cy:168 },
    { state:"Ashanti",       cx:188, cy:212 }, { state:"Eastern",       cx:258, cy:222 },
    { state:"Volta",         cx:316, cy:198 }, { state:"Greater Accra", cx:272, cy:284 },
    { state:"Central",       cx:182, cy:288 }, { state:"Western",       cx:112, cy:272 },
    { state:"Oti",           cx:300, cy:148 }, { state:"Bono East",     cx:228, cy:152 },
  ];
  const MAP_COLORS = ["#3b82f6","#6366f1","#0891b2","#8b5cf6","#15803d","#d97706","#ec4899","#14b8a6"];

  const placedNodes = stateReach.map((sr, i) => {
    const pos = REGION_POS.find(g=>g.state===sr.state) || { cx:70+(i%5)*68, cy:72+Math.floor(i/5)*72 };
    return { ...sr, ...pos, color: MAP_COLORS[i % MAP_COLORS.length] };
  });

  // ── Donut chart data for complaint overview ───────────────────────────
  const complaintDonut = [
    { name:"Solved",      value:solved,     fill:"#22c55e" },
    { name:"In Progress", value:inProgress, fill:"#3b82f6" },
  ].filter(d=>d.value>0);

  // ── Resolution rate arc helper ────────────────────────────────────────
  const rateArc = (() => {
    const r=38, cx=50, cy=52;
    const angle = (resolutionRate/100)*Math.PI*1.5 - Math.PI*0.75;
    const x = cx + r*Math.cos(angle-Math.PI*0.75);
    const y = cy + r*Math.sin(angle-Math.PI*0.75);
    const large = resolutionRate>50?1:0;
    return { r, cx, cy, endX:x, endY:y, large };
  })();

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20, paddingBottom:12 }}>

      {/* ══ PAGE HEADER ══════════════════════════════════════════════════════ */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        paddingBottom:16, borderBottom:"1px solid #f1f5f9" }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:800, color:"#0f172a", letterSpacing:"-.04em", margin:0 }}>Overview</h2>
          <p style={{ fontSize:12.5, color:"#94a3b8", marginTop:4, margin:"4px 0 0", fontWeight:400 }}>
            Computer Management Department — Operational Summary
          </p>
        </div>
        <button onClick={()=>setActivityOpen(true)}
          style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 20px", borderRadius:9,
            border:"1.5px solid #e2e8f0", background:"#fff", color:"#475569", cursor:"pointer",
            fontFamily:"inherit", fontSize:12.5, fontWeight:600, letterSpacing:"-.01em",
            boxShadow:"0 1px 3px rgba(15,23,42,.07)", transition:"all .18s" }}
          onMouseOver={e=>{ Object.assign(e.currentTarget.style,{ background:"#eff6ff", borderColor:"#3b82f6", color:"#1d4ed8", boxShadow:"0 4px 14px rgba(59,130,246,.2)" }); }}
          onMouseOut={e=>{  Object.assign(e.currentTarget.style,{ background:"#fff",    borderColor:"#e2e8f0", color:"#475569", boxShadow:"0 1px 3px rgba(15,23,42,.07)" }); }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
          View Recent Activities
        </button>
      </div>

      {/* ══ ROW 1 — DEPLOYMENT OVERVIEW ══════════════════════════════════════ */}
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <div style={{ width:3.5, height:18, borderRadius:2, background:"linear-gradient(180deg,#3b82f6,#6366f1)" }}/>
          <span style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".1em" }}>Deployment Overview</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
          <KPICard label="Total Deployed PCs" value={deployedPCs} accent="blue" icon={ICO.monitor}
            sub={`${completedShips.length} completed shipment${completedShips.length!==1?"s":""} · Completed only`}
            clickable onClick={()=>setPCB(true)}/>
          <KPICard label="Active PODs" value={activePODs} accent="indigo" icon={ICO.pods}
            sub="New POD + Manthan POD shipments in selected period"/>
          <KPICard label="Total Shipments" value={totalShips} accent="blue" icon={ICO.ship}
            sub="All shipment records in selected period"
            clickable onClick={()=>setSHB(true)}/>
        </div>
      </div>

      {/* ══ ROW 2 — COMPLAINT PERFORMANCE ════════════════════════════════════ */}
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <div style={{ width:3.5, height:18, borderRadius:2, background:"linear-gradient(180deg,#ef4444,#f97316)" }}/>
          <span style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".1em" }}>Complaint Performance</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
          <KPICard label="Complaints Raised" value={raised} accent="red" icon={ICO.alert}
            sub="Total tickets reported in selected period"/>
          <KPICard label="Complaints Solved" value={solved} accent="green" icon={ICO.check}
            sub="Fully resolved tickets in selected period"/>
          {/* Resolution Rate — bespoke arc card */}
          <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:12,
            padding:"22px 22px 18px", boxShadow:"0 1px 3px rgba(15,23,42,.05)",
            position:"relative", overflow:"hidden", transition:"box-shadow .18s,transform .18s" }}
            onMouseOver={e=>{ Object.assign(e.currentTarget.style,{ boxShadow:"0 8px 28px rgba(15,23,42,.1)", transform:"translateY(-2px)" }); }}
            onMouseOut={e=>{  Object.assign(e.currentTarget.style,{ boxShadow:"0 1px 3px rgba(15,23,42,.05)", transform:"translateY(0)" }); }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:3,
              background:resolutionRate>=80?"linear-gradient(90deg,#16a34a,#22c55e)":resolutionRate>=50?"linear-gradient(90deg,#d97706,#f59e0b)":"linear-gradient(90deg,#dc2626,#ef4444)" }}/>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
              <span style={{ fontSize:10.5, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".08em" }}>Resolution Rate</span>
              <div style={{ width:34, height:34, borderRadius:9, background:"#fffbeb", border:"1px solid #fde68a",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="1.8">{ICO.rate}</svg>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:18 }}>
              {/* Gauge arc SVG */}
              <svg width="100" height="62" viewBox="0 0 100 62" style={{ flexShrink:0, overflow:"visible" }}>
                {/* Track arc — 270° gauge from -135° to +135° */}
                <path d={`M${11} ${51} A 38 38 0 1 1 ${89} ${51}`}
                  fill="none" stroke="#f1f5f9" strokeWidth="9" strokeLinecap="round"/>
                {resolutionRate > 0 && (() => {
                  const r=38, cx=50, cy=51;
                  const startAngle = Math.PI * (1 + 0.25);          // 225°
                  const sweep      = (resolutionRate/100)*(Math.PI*1.5);
                  const endAngle   = startAngle + sweep;
                  const x1 = cx + r*Math.cos(startAngle);
                  const y1 = cy + r*Math.sin(startAngle);
                  const x2 = cx + r*Math.cos(endAngle);
                  const y2 = cy + r*Math.sin(endAngle);
                  const lg = sweep > Math.PI ? 1 : 0;
                  const col = resolutionRate>=80?"#22c55e":resolutionRate>=50?"#f59e0b":"#ef4444";
                  return (
                    <path d={`M${x1} ${y1} A ${r} ${r} 0 ${lg} 1 ${x2} ${y2}`}
                      fill="none" stroke={col} strokeWidth="9" strokeLinecap="round"/>
                  );
                })()}
                <text x="50" y="56" textAnchor="middle" fontSize="13" fontWeight="800"
                  fontFamily="inherit"
                  fill={resolutionRate>=80?"#15803d":resolutionRate>=50?"#b45309":"#dc2626"}>
                  {resolutionRate}%
                </text>
              </svg>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11.5, color:"#334155", fontWeight:600, lineHeight:1.5 }}>
                  {solved} of {raised}<br/>
                  <span style={{ fontSize:10.5, fontWeight:400, color:"#94a3b8" }}>tickets resolved</span>
                </div>
                <div style={{ marginTop:10, fontSize:10.5, color:resolutionRate>=80?"#15803d":resolutionRate>=50?"#b45309":"#dc2626",
                  background:resolutionRate>=80?"#f0fdf4":resolutionRate>=50?"#fffbeb":"#fef2f2",
                  border:`1px solid ${resolutionRate>=80?"#bbf7d0":resolutionRate>=50?"#fde68a":"#fecaca"}`,
                  borderRadius:5, padding:"3px 9px", display:"inline-block", fontWeight:600 }}>
                  {resolutionRate>=80?"Healthy":resolutionRate>=50?"Moderate":"Needs attention"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ ROW 3 — RECOVERY & REUSE ══════════════════════════════════════════ */}
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <div style={{ width:3.5, height:18, borderRadius:2, background:"linear-gradient(180deg,#8b5cf6,#06b6d4)" }}/>
          <span style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".1em" }}>Recovery & Reuse</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
          <KPICard label="Repossession" value={repoDone} accent="violet" icon={ICO.repo}
            sub={`${repoPODs} POD${repoPODs!==1?"s":""} involved · completed only`}/>
          <KPICard label="Redeployment" value={totalRedeps} accent="cyan" icon={ICO.redep}
            sub="Total redeployment orders placed"/>
          <KPICard label="Solved via Redeployment" value={solvedViaRedep} accent="green" icon={ICO.solved}
            sub="Complaints resolved through redeployment"/>
        </div>
      </div>

      {/* ══ CHARTS + FILTER  ════════════════════════════════════════════════ */}
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <div style={{ width:3.5, height:18, borderRadius:2, background:"linear-gradient(180deg,#3b82f6,#8b5cf6)" }}/>
          <span style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".1em" }}>Trends & Distribution</span>
        </div>

        {/* Charts row + filter side panel */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 260px", gap:14, alignItems:"start", marginBottom:14 }}>

          {/* ── Chart 1: Shipment Trend ──────────────────────────────────── */}
          <OCard style={{ padding:"20px 22px 18px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>Shipment Trend</div>
              <span style={{ fontSize:9.5, fontWeight:700, background:"#eff6ff", color:"#1d4ed8",
                border:"1px solid #bfdbfe", borderRadius:4, padding:"2px 8px", letterSpacing:".03em" }}>LINE</span>
            </div>
            <div style={{ fontSize:11, color:"#94a3b8", marginBottom:16 }}>Shipments placed over time by month</div>
            {shipTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={shipTrend} margin={{ top:6, right:8, bottom:0, left:-14 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#f8fafc" vertical={false}/>
                  <XAxis dataKey="period" tick={{ fill:"#94a3b8", fontSize:10.5 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill:"#94a3b8", fontSize:10.5 }} axisLine={false} tickLine={false} allowDecimals={false} width={28}/>
                  <Tooltip contentStyle={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:9,
                    fontSize:12, boxShadow:"0 8px 24px rgba(15,23,42,.12)", padding:"8px 14px" }}
                    cursor={{ stroke:"#3b82f6", strokeWidth:1.5, strokeDasharray:"5 4" }}/>
                  <Line type="monotone" dataKey="shipments" stroke="#3b82f6" strokeWidth={2.5} name="Shipments"
                    dot={{ r:4, fill:"#fff", stroke:"#3b82f6", strokeWidth:2.5 }}
                    activeDot={{ r:7, fill:"#3b82f6", stroke:"#fff", strokeWidth:2.5 }}/>
                </LineChart>
              </ResponsiveContainer>
            ) : <EmptyChart msg="No shipment data in this period"/>}
          </OCard>

          {/* ── Chart 2: Complaint Trend ─────────────────────────────────── */}
          <OCard style={{ padding:"20px 22px 18px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>Complaint Trend</div>
              <span style={{ fontSize:9.5, fontWeight:700, background:"#fef2f2", color:"#dc2626",
                border:"1px solid #fecaca", borderRadius:4, padding:"2px 8px", letterSpacing:".03em" }}>LINE</span>
            </div>
            <div style={{ fontSize:11, color:"#94a3b8", marginBottom:16 }}>Raised vs. solved complaints by month</div>
            {complaintTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={complaintTrend} margin={{ top:6, right:8, bottom:0, left:-14 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#f8fafc" vertical={false}/>
                  <XAxis dataKey="period" tick={{ fill:"#94a3b8", fontSize:10.5 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill:"#94a3b8", fontSize:10.5 }} axisLine={false} tickLine={false} allowDecimals={false} width={28}/>
                  <Tooltip contentStyle={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:9,
                    fontSize:12, boxShadow:"0 8px 24px rgba(15,23,42,.12)", padding:"8px 14px" }}
                    cursor={{ stroke:"#94a3b8", strokeWidth:1.5, strokeDasharray:"5 4" }}/>
                  <Legend wrapperStyle={{ fontSize:11, paddingTop:10 }} iconType="circle" iconSize={7}/>
                  <Line type="monotone" dataKey="raised" stroke="#ef4444" strokeWidth={2.5} name="Raised"
                    dot={{ r:4, fill:"#fff", stroke:"#ef4444", strokeWidth:2.5 }}
                    activeDot={{ r:7, fill:"#ef4444", stroke:"#fff", strokeWidth:2.5 }}/>
                  <Line type="monotone" dataKey="solved" stroke="#22c55e" strokeWidth={2.5} name="Solved"
                    strokeDasharray="6 3"
                    dot={{ r:4, fill:"#fff", stroke:"#22c55e", strokeWidth:2.5 }}
                    activeDot={{ r:7, fill:"#22c55e", stroke:"#fff", strokeWidth:2.5 }}/>
                </LineChart>
              </ResponsiveContainer>
            ) : <EmptyChart msg="No complaint data in this period"/>}
          </OCard>

          {/* ── Filter Control Card ──────────────────────────────────────── */}
          <OCard style={{ padding:"18px 17px 16px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:16,
              paddingBottom:13, borderBottom:"1px solid #f8fafc" }}>
              <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#eff6ff,#eef2ff)",
                border:"1px solid #bfdbfe", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:"#0f172a", letterSpacing:"-.01em" }}>Filters</div>
                <div style={{ fontSize:10, color:"#94a3b8", marginTop:1 }}>Refine dashboard data</div>
              </div>
              {(filterRange!=="all"||searchPOD||filterState!=="All") && (
                <button onClick={()=>{ setFR("all"); setSearch(""); setFState("All"); }}
                  style={{ marginLeft:"auto", fontSize:10, color:"#dc2626", background:"#fef2f2",
                    border:"1px solid #fecaca", borderRadius:5, padding:"3px 8px",
                    cursor:"pointer", fontFamily:"inherit", fontWeight:700 }}>
                  ✕ Reset
                </button>
              )}
            </div>

            {/* Date Range */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:9.5, fontWeight:700, color:"#cbd5e1", textTransform:"uppercase",
                letterSpacing:".1em", marginBottom:7 }}>Date Range</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
                {[["all","All Time"],["week","This Week"],["month","This Month"],["custom","Custom"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setFR(v)}
                    style={{ padding:"7px 4px", borderRadius:7, fontSize:10.5,
                      fontWeight:filterRange===v?700:500, cursor:"pointer", fontFamily:"inherit",
                      textAlign:"center", transition:"all .13s", lineHeight:1.3,
                      border:filterRange===v?"1.5px solid #3b82f6":"1px solid #f1f5f9",
                      background:filterRange===v?"#3b82f6":"#f8fafc",
                      color:filterRange===v?"#fff":"#64748b" }}>
                    {l}
                  </button>
                ))}
              </div>
              {filterRange==="custom" && (
                <div style={{ marginTop:9, display:"flex", flexDirection:"column", gap:6 }}>
                  <input type="date" value={filterFrom} onChange={e=>setFrom(e.target.value)}
                    style={{ border:"1px solid #f1f5f9", borderRadius:7, padding:"7px 10px",
                      fontSize:11, fontFamily:"inherit", outline:"none", width:"100%",
                      boxSizing:"border-box", color:"#334155", background:"#f8fafc" }}/>
                  <input type="date" value={filterTo} onChange={e=>setTo(e.target.value)}
                    style={{ border:"1px solid #f1f5f9", borderRadius:7, padding:"7px 10px",
                      fontSize:11, fontFamily:"inherit", outline:"none", width:"100%",
                      boxSizing:"border-box", color:"#334155", background:"#f8fafc" }}/>
                  <button onClick={()=>{ setAF(filterFrom); setAT(filterTo); }}
                    style={{ padding:"8px", borderRadius:7, fontSize:11.5, fontWeight:700,
                      cursor:"pointer", fontFamily:"inherit", background:"#3b82f6",
                      color:"#fff", border:"none" }}>
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* POD Search */}
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:9.5, fontWeight:700, color:"#cbd5e1", textTransform:"uppercase",
                letterSpacing:".1em", marginBottom:7 }}>Search POD</div>
              <div style={{ position:"relative" }}>
                <svg style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}
                  width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.3">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <input value={searchPOD} onChange={e=>setSearch(e.target.value)} placeholder="e.g. Alpha POD"
                  style={{ border:"1px solid #f1f5f9", borderRadius:7, padding:"7px 9px 7px 27px",
                    fontSize:11, color:"#334155", fontFamily:"inherit", outline:"none",
                    width:"100%", boxSizing:"border-box", background:"#f8fafc" }}/>
              </div>
            </div>

            {/* State / Region — only shown when regions exist */}
            {allStates.length > 0 && (
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:9.5, fontWeight:700, color:"#cbd5e1", textTransform:"uppercase",
                  letterSpacing:".1em", marginBottom:7 }}>Region</div>
                <select value={filterState} onChange={e=>setFState(e.target.value)}
                  style={{ border:"1px solid #f1f5f9", borderRadius:7, padding:"7px 10px",
                    fontSize:11, fontFamily:"inherit", outline:"none", width:"100%",
                    background:"#f8fafc", cursor:"pointer", color:"#334155" }}>
                  {["All",...allStates].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            )}

            {/* Live summary pill */}
            <div style={{ background:"linear-gradient(135deg,#eff6ff,#f0fdf4)", border:"1px solid #e2e8f0",
              borderRadius:9, padding:"10px 13px" }}>
              <div style={{ fontSize:10, color:"#64748b", fontWeight:500, marginBottom:3 }}>Filtered results</div>
              <div style={{ fontSize:11.5, fontWeight:700, color:"#1e293b" }}>
                {fShips.length} shipments · {fComps.length} complaints
              </div>
              <div style={{ fontSize:10, color:"#94a3b8", marginTop:3 }}>
                {fRepos.length} repos · {fRedeps.length} redeploys
              </div>
            </div>
          </OCard>
        </div>

        {/* ── Map: full width, directly below charts ───────────────────────── */}
        <OCard style={{ padding:"20px 22px 18px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>Deployment Map</div>
            <span style={{ fontSize:9.5, fontWeight:700, background:"#f5f3ff", color:"#6d28d9",
                border:"1px solid #ddd6fe", borderRadius:4, padding:"2px 8px", letterSpacing:".03em" }}>GEO BUBBLES</span>
            </div>
            <div style={{ fontSize:11, color:"#94a3b8", marginBottom:14 }}>Hover a region bubble to see PC count and POD details</div>
            {placedNodes.length > 0 ? (
              <>
                <svg viewBox="0 0 480 320" width="100%"
                  style={{ display:"block", borderRadius:10, overflow:"visible" }}>
                  <defs>
                    <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
                      <circle cx="12" cy="12" r="1" fill="#e2e8f0"/>
                    </pattern>
                    {placedNodes.map((n,i)=>(
                      <radialGradient key={n.state} id={`rg${i}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={n.color} stopOpacity=".35"/>
                        <stop offset="100%" stopColor={n.color} stopOpacity=".05"/>
                      </radialGradient>
                    ))}
                    <filter id="mapShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,.12)"/>
                    </filter>
                  </defs>
                  <rect width="480" height="320" fill="#f8fafc" rx="10"/>
                  <rect width="480" height="320" fill="url(#dots)" rx="10"/>
                  <polygon
                    points="132,42 156,30 212,26 268,30 316,40 340,72 344,110 332,148 316,182 308,222 280,266 264,298 240,308 216,298 192,272 168,240 148,208 132,170 120,134 118,96 124,62"
                    fill="#f0f9ff" stroke="#bfdbfe" strokeWidth="1.5" opacity=".7"/>
                  {placedNodes.map((a,i) => placedNodes.slice(i+1).map((b,j) => {
                    const d = Math.hypot(a.cx-b.cx, a.cy-b.cy);
                    if (d > 130) return null;
                    return <line key={`${i}-${j}`} x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy}
                      stroke="#dde4f0" strokeWidth="1.2" opacity=".9" strokeDasharray="4 3"/>;
                  }))}
                  {placedNodes.map((n,i) => {
                    const maxC = placedNodes[0]?.cpus || 1;
                    const pct  = n.cpus / maxC;
                    const r    = 16 + pct * 28;
                    const hov  = mapHovered === n.state;
                    return (
                      <g key={n.state} style={{ cursor:"pointer" }}
                        onMouseEnter={()=>setMapHovered(n.state)}
                        onMouseLeave={()=>setMapHovered(null)}
                        filter={hov?"url(#mapShadow)":""}>
                        {hov && <circle cx={n.cx} cy={n.cy} r={r+12}
                          fill="none" stroke={n.color} strokeWidth="1.5" opacity=".3" strokeDasharray="6 4"/>}
                        <circle cx={n.cx} cy={n.cy} r={r+4} fill={n.color} opacity={hov?.12:.06}/>
                        <circle cx={n.cx} cy={n.cy} r={r} fill={`url(#rg${i})`}
                          stroke={n.color} strokeWidth={hov?2.5:1.5}/>
                        <text x={n.cx} y={n.cy+(pct>0.5?-4:-2)} textAnchor="middle" dominantBaseline="middle"
                          fontSize={pct>0.5?13:10.5} fontWeight="800" fill={n.color} fontFamily="inherit">
                          {n.cpus}
                        </text>
                        <text x={n.cx} y={n.cy+(pct>0.5?10:9)} textAnchor="middle" dominantBaseline="middle"
                          fontSize="7" fill={n.color} fontFamily="inherit" opacity=".7">PCs</text>
                      </g>
                    );
                  })}
                  {mapHovered && (() => {
                    const n = placedNodes.find(p=>p.state===mapHovered);
                    if (!n) return null;
                    const bw=148, bh=68;
                    const tx = n.cx > 300 ? n.cx - bw - 14 : n.cx + 20;
                    const ty = n.cy > 250 ? n.cy - bh - 8  : n.cy - 10;
                    return (
                      <g>
                        <rect x={tx+2} y={ty+2} width={bw} height={bh} rx="8" fill="rgba(15,23,42,.15)"/>
                        <rect x={tx} y={ty} width={bw} height={bh} rx="8" fill="#0f172a"/>
                        <rect x={tx} y={ty} width="4" height={bh} rx="2" fill={n.color}/>
                        <text x={tx+16} y={ty+19} fontSize="12" fontWeight="800" fill="#f1f5f9" fontFamily="inherit">{n.state}</text>
                        <text x={tx+16} y={ty+36} fontSize="10.5" fill="#94a3b8" fontFamily="inherit">{n.cpus} PCs deployed</text>
                        <text x={tx+16} y={ty+51} fontSize="10.5" fill="#94a3b8" fontFamily="inherit">{n.pods} active POD{n.pods!==1?"s":""}</text>
                      </g>
                    );
                  })()}
                </svg>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:12,
                  paddingTop:11, borderTop:"1px solid #f8fafc" }}>
                  {placedNodes.map(n=>(
                    <div key={n.state}
                      onMouseEnter={()=>setMapHovered(n.state)}
                      onMouseLeave={()=>setMapHovered(null)}
                      style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11,
                        cursor:"pointer", padding:"3px 10px 3px 7px",
                        borderRadius:20, border:`1px solid ${n.color}33`,
                        background:mapHovered===n.state?`${n.color}18`:"#f8fafc",
                        transition:"background .15s" }}>
                      <span style={{ width:7, height:7, borderRadius:"50%", background:n.color, flexShrink:0 }}/>
                      <span style={{ color:"#475569", fontWeight:500 }}>{n.state}</span>
                      <span style={{ fontWeight:700, color:n.color }}>{n.cpus}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:10, padding:"8px 13px", background:"#eff6ff",
                  border:"1px solid #bfdbfe", borderRadius:8,
                  display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:10.5, color:"#1d4ed8", fontWeight:600 }}>
                    📍 {placedNodes.length} region{placedNodes.length!==1?"s":""} reached
                  </span>
                  <span style={{ fontSize:12, fontWeight:800, color:"#1d4ed8", fontVariantNumeric:"tabular-nums" }}>
                    {deployedPCs} PCs
                  </span>
                </div>
              </>
            ) : <EmptyChart msg="No completed deployments in this period" h={260}/>}
        </OCard>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════════════════════ */}

      {activityOpen && (
        <Modal title="Recent Activities" onClose={()=>{ setActivityOpen(false); setActTypeFilter(null); }} wide>
          {/* ── Filter toggle buttons ─────────────────────────────────────── */}
          <div style={{ display:"flex", gap:7, marginBottom:16, flexWrap:"wrap" }}>
            {[
              { types:["ship_done"],               color:"#22c55e", label:"Shipment Completed" },
              { types:["ship_new"],                 color:"#3b82f6", label:"Order Placed"       },
              { types:["comp_solved"],              color:"#22c55e", label:"Complaint Solved"   },
              { types:["repo_done"],                color:"#8b5cf6", label:"Repossession"       },
              { types:["redep_done","redep_new"],   color:"#0891b2", label:"Redeployment"       },
            ].map(({ types, color, label }) => {
              const isActive = actTypeFilter === label;
              return (
                <button key={label}
                  onClick={() => setActTypeFilter(isActive ? null : label)}
                  style={{
                    display:"inline-flex", alignItems:"center", gap:5, fontSize:10.5,
                    background: isActive ? `${color}22` : `${color}14`,
                    border:`1.5px solid ${isActive ? color : color+"44"}`,
                    borderRadius:5, padding:"3px 10px",
                    color: isActive ? color : "#475569",
                    fontWeight: isActive ? 700 : 500,
                    cursor:"pointer", outline:"none",
                    boxShadow: isActive ? `0 0 0 2px ${color}22` : "none",
                    transition:"all .15s",
                  }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:color, flexShrink:0 }}/>
                  {label}
                  {isActive && (
                    <span style={{ marginLeft:2, fontSize:10, opacity:.7 }}>✕</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Activity list (filtered) ──────────────────────────────────── */}
          {(() => {
            const TYPE_MAP = {
              "Shipment Completed": ["ship_done"],
              "Order Placed":       ["ship_new"],
              "Complaint Solved":   ["comp_solved"],
              "Repossession":       ["repo_done"],
              "Redeployment":       ["redep_done","redep_new"],
            };
            const visible = actTypeFilter
              ? recentActivity.filter(a => (TYPE_MAP[actTypeFilter]||[]).includes(a.type))
              : recentActivity;
            return visible.length > 0 ? (
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {visible.map((a,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px",
                    borderRadius:8, background:i%2===0?"#f8fafc":"#fff", border:"1px solid #f1f5f9" }}>
                    <div style={{ width:34, height:34, borderRadius:9, background:`${a.color}14`,
                      border:`1px solid ${a.color}33`, display:"flex", alignItems:"center",
                      justifyContent:"center", flexShrink:0 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={a.color} strokeWidth="2.3">
                        {a.type==="ship_done"||a.type==="comp_solved"
                          ? <polyline points="20 6 9 17 4 12"/>
                          : a.type==="ship_new"
                            ? <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8"/>
                            : a.type==="repo_done"
                              ? <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                              : <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                        }
                      </svg>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:"#1e293b" }}>{a.label}</div>
                      <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>{a.sub}</div>
                    </div>
                    <div style={{ fontSize:10.5, color:"#94a3b8", fontFamily:"'DM Mono',monospace",
                      background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:5,
                      padding:"3px 9px", flexShrink:0 }}>{a.ts}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign:"center", padding:"40px 0", color:"#cbd5e1" }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"
                  style={{ marginBottom:10, opacity:.5 }}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <div style={{ fontSize:13, color:"#94a3b8" }}>
                  {actTypeFilter ? `No "${actTypeFilter}" activity in this period` : "No recent activity in this period"}
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* PC Breakdown Modal */}
      {pcBreakdown && (
        <Modal title={`PCs Deployed — By Purpose (${deployedPCs} total)`} onClose={()=>setPCB(false)} wide>
          <div style={{ padding:"10px 14px", background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:7, marginBottom:16, fontSize:12, color:"#1d4ed8" }}>
            ℹ️ Only <strong>Completed</strong> shipments are counted. Each purpose shows shipment count and total CPUs delivered.
          </div>
          {purposeBreakdown.length > 0 ? purposeBreakdown.map(({ purpose, count, cpus }) => {
            const pct = deployedPCs > 0 ? Math.round(cpus/deployedPCs*100) : 0;
            const cols = { "New POD":"#3b82f6","Apna PC":"#6366f1","Teach to Earn":"#0891b2","Replacement":"#f59e0b","Expansion":"#22c55e","Other":"#94a3b8" };
            const col = cols[purpose] || "#3b82f6";
            return (
              <div key={purpose} style={{ marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ width:10, height:10, borderRadius:"50%", background:col }}/>
                    <span style={{ fontSize:13.5, fontWeight:600, color:"#1e293b" }}>{purpose}</span>
                    <span style={{ fontSize:11, color:"#94a3b8", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:4, padding:"1px 8px" }}>{count} shipment{count!==1?"s":""}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:11, color:"#94a3b8" }}>{pct}%</span>
                    <span style={{ fontSize:18, fontWeight:800, color:col, fontVariantNumeric:"tabular-nums" }}>{cpus} <span style={{ fontSize:12, fontWeight:400, color:"#94a3b8" }}>PCs</span></span>
                  </div>
                </div>
                <div style={{ height:7, background:"#f1f5f9", borderRadius:4, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:col, borderRadius:4, transition:"width .6s ease" }}/>
                </div>
              </div>
            );
          }) : <div style={{ textAlign:"center", padding:"24px 0", color:"#94a3b8" }}>No completed shipments in current filter.</div>}
          <Hr/>
          <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 4px" }}>
            <span style={{ fontWeight:700, fontSize:14, color:"#1e293b" }}>Total PCs Deployed</span>
            <span style={{ fontWeight:800, fontSize:18, color:"#1d4ed8" }}>{deployedPCs}</span>
          </div>
        </Modal>
      )}

      {/* Shipment Status Breakdown Modal */}
      {shipBreakdown && (
        <Modal title={`Shipments Breakdown (${totalShips} total)`} onClose={()=>setSHB(false)}>
          {shipStatusBreak.map(({ status, count }) => {
            const sc = STATUS_COLORS[status] || { bg:T.grayLight, color:T.textMid, dot:T.textLight };
            return (
              <div key={status} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"12px 16px", borderRadius:8, border:"1px solid #f1f5f9", marginBottom:7, background:sc.bg }}>
                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                  <span style={{ width:8, height:8, borderRadius:"50%", background:sc.dot }}/>
                  <span style={{ fontSize:13, fontWeight:600, color:sc.color }}>{status}</span>
                </div>
                <span style={{ fontSize:20, fontWeight:800, color:sc.color, fontVariantNumeric:"tabular-nums" }}>{count}</span>
              </div>
            );
          })}
          <Hr/>
          <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 16px", borderRadius:7, background:"#f8fafc" }}>
            <span style={{ fontWeight:700, fontSize:13, color:"#1e293b" }}>Total</span>
            <span style={{ fontWeight:800, fontSize:14, color:"#1e293b" }}>{totalShips}</span>
          </div>
        </Modal>
      )}

    </div>
  );
};

/* ─── SHIPMENTS ──────────────────────────────────────────────────────────────── */
const Shipments = ({ shipments, setShipments }) => {
  const [view, setView]    = useState("list");
  const [selShip, setSel]  = useState(null);
  const [newM, setNew]     = useState(false);
  const [sfilt, setSfilt]  = useState("All");
  const [confirmDel, setCD]= useState(null);
  const [toast, setToast]  = useState(null);

  const emptyForm = { pod:"", address:"", contact:"", phone:"", cpus:"", components:"", orderDate:new Date().toISOString().split("T")[0], serials:"", qcReport:"", signedQc:"", purpose:"New POD", state:"" };
  const [form, setForm] = useState(emptyForm);
  const F = k => e => setForm(p=>({...p,[k]:e.target.value}));
  const autoComp = n => { const x=parseInt(n); return isNaN(x)||x<=0?"":x+" Monitor, "+x+" Keyboard, "+x+" Mouse, "+x+" Webcam, "+x+" Headphones"; };

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(null), 3200); };

  const handleAddEntry = () => {
    if (!form.pod || !form.contact) return alert("POD Name and Contact Person are required.");
    const entry = {
      id: "SHP-" + String(shipments.length+1).padStart(3,"0"),
      pod:form.pod, address:form.address, contact:form.contact, phone:form.phone,
      cpus:Number(form.cpus)||0, components:form.components,
      orderDate:form.orderDate, dispatchDate:"", deliveryDate:"",
      status:"Pending", trackingId:"", serials:form.serials||"",
      qcReport:form.qcReport||"", signedQc:form.signedQc||"",
      purpose:form.purpose||"New POD", state:form.state||"",
    };
    setShipments(p=>[entry,...p]);
    setNew(false); setForm(emptyForm);
    showToast(`Shipment for ${entry.pod} added as "Pending". Open it to preview and send the order email.`);
  };

  const handleUpdateStatus = (id, newStatus) => {
    setShipments(p => p.map(s => s.id===id ? {...s, status:newStatus} : s));
    if (selShip?.id === id) setSel(prev => ({...prev, status:newStatus}));
    showToast(`Status updated to "${newStatus}".`);
  };

  const handleEdit = (id, updatedData) => {
    setShipments(p => p.map(s => s.id===id ? {...s,...updatedData} : s));
    if (selShip?.id === id) setSel(prev => ({...prev,...updatedData}));
    showToast("Shipment details updated.");
  };

  const handleSendMail = (id) => {
    // When mail is sent, update status to "Order Placed" — only if currently Pending
    setShipments(p => p.map(s => s.id===id && s.status==="Pending" ? {...s, status:"Order Placed"} : s));
    if (selShip?.id === id) setSel(prev => ({...prev, status:"Order Placed"}));
    showToast("Email sent to vendor. Status updated to Order Placed.");
  };

  const handleDelete = (id) => {
    setShipments(p => p.filter(s => s.id!==id));
    showToast("Shipment deleted.");
  };

  const openDetail = (ship) => { setSel(ship); setView("detail"); };
  const displayData = sfilt==="All" ? shipments : shipments.filter(s=>s.status===sfilt);
  const currentSelShip = selShip ? shipments.find(s=>s.id===selShip.id)||selShip : null;

  const cols = [
    { k:"pod",          l:"POD Name",     filterable:false },
    { k:"contact",      l:"Contact",      filterable:false },
    { k:"cpus",         l:"CPUs",         filterable:false },
    { k:"orderDate",    l:"Order Date",   filterable:false },
    { k:"dispatchDate", l:"Dispatch",     filterable:false },
    { k:"deliveryDate", l:"Delivery",     filterable:false },
    { k:"status",       l:"Status",       filterable:true  },
    { k:"_actions",     l:"",             filterable:false },
  ];

  if (view === "detail" && currentSelShip) {
    return (
      <ShipmentDetail
        ship={currentSelShip}
        onBack={() => { setView("list"); setSel(null); }}
        onDelete={(id) => { handleDelete(id); setView("list"); setSel(null); }}
        onSendMail={handleSendMail}
        onEdit={handleEdit}
      />
    );
  }

  return (
    <div>
      {toast && (
        <div style={{ marginBottom:12, padding:"10px 16px", background:T.greenLight, border:"1px solid #bbf7d0", borderRadius:7, fontSize:13, color:T.green, fontWeight:500 }}>
          ✓ {toast}
        </div>
      )}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:18 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:T.text }}>Shipments</h2>
          <p style={{ fontSize:13, color:T.textMid, marginTop:2 }}>Click a row to view details, preview mail, and manage status</p>
        </div>
        <div style={{ display:"flex", gap:9, alignItems:"center" }}>
          <Sel value={sfilt} onChange={e=>setSfilt(e.target.value)} options={["All",...SHIPMENT_STATUSES]}/>
          <Btn onClick={()=>setNew(true)}><PlusIco/> New Shipment Order</Btn>
        </div>
      </div>

      {/* ── Module stat cards ──────────────────────────────────────────────── */}
      {(() => {
        const total     = shipments.length;
        const uniquePODs = [...new Set(shipments.filter(s=>s.purpose==="New POD"||s.purpose==="Manthan POD").map(s=>s.pod))].length;
        // Status breakdown
        const stCounts = {};
        shipments.forEach(s=>{ stCounts[s.status]=(stCounts[s.status]||0)+1; });
        // Purpose breakdown
        const purCounts = {};
        shipments.forEach(s=>{ const k=s.purpose||"Other"; purCounts[k]=(purCounts[k]||0)+1; });
        const purColors = {"New POD":"#3b82f6","Peripherals":"#8b5cf6","Teach to Earn":"#0891b2","Manthan POD":"#f59e0b","PC Testing":"#22c55e","Other":"#94a3b8"};
        const stColors = {"Completed":"#22c55e","Order Placed":"#6366f1","Dispatched":"#d97706","Delivered":"#1d4ed8","Pending":"#94a3b8"};
        return (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:18 }}>
            {/* Card 1: Total Shipments + purpose breakdown */}
            <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:10, padding:"16px 18px", boxShadow:"0 1px 3px rgba(15,23,42,.05)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                <div style={{ width:38, height:38, borderRadius:9, background:"#eff6ff", border:"1px solid #bfdbfe", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
                </div>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".08em" }}>Total Shipments</div>
                  <div style={{ fontSize:26, fontWeight:800, color:"#3b82f6", lineHeight:1.1 }}>{total}</div>
                </div>
              </div>
              <div style={{ borderTop:"1px solid #f1f5f9", paddingTop:8 }}>
                <div style={{ fontSize:9.5, fontWeight:700, color:"#cbd5e1", textTransform:"uppercase", letterSpacing:".08em", marginBottom:5 }}>By Purpose</div>
                {Object.entries(purCounts).map(([k,v])=>(
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
                    <span style={{ fontSize:11, color:"#64748b", display:"flex", alignItems:"center", gap:5 }}>
                      <span style={{ width:6, height:6, borderRadius:"50%", background:purColors[k]||"#94a3b8", flexShrink:0 }}/>{k}
                    </span>
                    <span style={{ fontSize:11, fontWeight:700, color:purColors[k]||"#94a3b8" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Card 2: Total PODs */}
            <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:10, padding:"16px 18px", boxShadow:"0 1px 3px rgba(15,23,42,.05)", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:38, height:38, borderRadius:9, background:"#f5f3ff", border:"1px solid #ddd6fe", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".08em", marginBottom:3 }}>Active PODs</div>
                <div style={{ fontSize:26, fontWeight:800, color:"#7c3aed", lineHeight:1.1 }}>{uniquePODs}</div>
                <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>New POD + Manthan POD only</div>
              </div>
            </div>
            {/* Card 3: Status breakdown */}
            <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:10, padding:"16px 18px", boxShadow:"0 1px 3px rgba(15,23,42,.05)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <div style={{ width:38, height:38, borderRadius:9, background:"#f0fdf4", border:"1px solid #bbf7d0", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </div>
                <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".08em" }}>Shipment Status</div>
              </div>
              <div style={{ borderTop:"1px solid #f1f5f9", paddingTop:8 }}>
                {["Completed","Order Placed","Dispatched","Delivered","Pending"].map(s=>stCounts[s]?(
                  <div key={s} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
                    <span style={{ fontSize:11, color:"#64748b", display:"flex", alignItems:"center", gap:5 }}>
                      <span style={{ width:6, height:6, borderRadius:"50%", background:stColors[s]||"#94a3b8", flexShrink:0 }}/>{s}
                    </span>
                    <span style={{ fontSize:11, fontWeight:700, color:stColors[s]||"#94a3b8" }}>{stCounts[s]}</span>
                  </div>
                ):null)}
              </div>
            </div>
          </div>
        );
      })()}

      <FiltTable cols={cols} data={displayData} renderRow={r=><>
        <td style={{ padding:"11px 13px", fontWeight:500, color:T.text, cursor:"pointer" }} onClick={()=>openDetail(r)}>{r.pod}</td>
        <TD c={r.contact}/>
        <TD c={r.cpus} mono/>
        <TD c={r.orderDate}/><TD c={r.dispatchDate}/><TD c={r.deliveryDate}/>
        <td style={{ padding:"11px 13px" }}><Badge s={r.status}/></td>
        <td style={{ padding:"11px 13px" }}>
          <div style={{ display:"flex", gap:6 }}>
            <IconBtn onClick={()=>openDetail(r)} title="View details"/>
            <IconBtn danger onClick={e=>{e.stopPropagation();setCD(r);}} title="Delete"/>
          </div>
        </td>
      </>}/>

      {/* New Shipment Modal */}
      {newM && (
        <Modal title="New Shipment Order" onClose={()=>{setNew(false);setForm(emptyForm);}} wide>
          <div style={{ padding:"10px 14px", background:T.blueLight, border:`1px solid ${T.blueMid}`, borderRadius:7, marginBottom:16, fontSize:12, color:T.blue }}>
            <strong>Step 1 of the workflow:</strong> Fill details and click "Add Entry" to save with status <em>Pending</em>. Open the saved row to preview and send the order email.
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <TxtInput label="POD Name *"        value={form.pod}     onChange={F("pod")}     placeholder="e.g. Alpha POD"/>
            <TxtInput label="Contact Person *"  value={form.contact} onChange={F("contact")} placeholder="Full name"/>
            <TxtInput label="POD Address"       value={form.address} onChange={F("address")} placeholder="Full address" span2/>
            <TxtInput label="Contact Number"    value={form.phone}   onChange={F("phone")}   placeholder="+233..."/>
            <TxtInput label="State / Region"    value={form.state||""} onChange={F("state")} placeholder="e.g. Greater Accra"/>
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.textMid, letterSpacing:".05em", textTransform:"uppercase" }}>Purpose *</label>
              <Sel value={form.purpose||"New POD"} onChange={F("purpose")} options={SHIPMENT_PURPOSES}/>
            </div>
            <TxtInput label="Order Date"        type="date" value={form.orderDate} onChange={F("orderDate")}/>
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.textMid, letterSpacing:".05em", textTransform:"uppercase" }}>Number of CPUs</label>
              <input type="number" min="0" value={form.cpus}
                onChange={e=>setForm(p=>({...p,cpus:e.target.value,components:autoComp(e.target.value)}))}
                placeholder="0" style={{ border:`1px solid ${T.border}`, borderRadius:6, padding:"8px 11px", fontSize:13, color:T.text, fontFamily:"inherit", outline:"none" }}/>
            </div>
            <div style={{ gridColumn:"span 2", display:"flex", flexDirection:"column", gap:4 }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.textMid, letterSpacing:".05em", textTransform:"uppercase" }}>Components</label>
              <input value={form.components} onChange={F("components")} placeholder="Auto-populated from CPU count"
                style={{ border:`1px solid ${T.border}`, borderRadius:6, padding:"8px 11px", fontSize:13, color:T.text, fontFamily:"inherit", outline:"none", background:form.cpus?T.blueLight:"#fff" }}/>
              {form.cpus&&<span style={{ fontSize:11, color:T.blue }}>Auto-populated from {form.cpus} CPUs — edit if needed.</span>}
            </div>
            <TxtInput label="Serial Numbers" value={form.serials||""} onChange={F("serials")} placeholder="e.g. MON-001, KB-001…" span2 hint="Can be filled later after vendor confirmation"/>
            {[["QC Report (from vendor)","qcReport","Add when received from vendor via mail"],["Signed QC Report","signedQc","Required for Completed status"]].map(([l,k,h])=>(
              <div key={k} style={{ display:"flex", flexDirection:"column", gap:4 }}>
                <label style={{ fontSize:11, fontWeight:600, color:T.textMid, letterSpacing:".05em", textTransform:"uppercase" }}>{l}</label>
                <input value={form[k]||""} onChange={F(k)} placeholder="Filename or reference"
                  style={{ border:`1px solid ${T.border}`, borderRadius:6, padding:"8px 11px", fontSize:13, color:T.text, fontFamily:"inherit", outline:"none" }}/>
                <span style={{ fontSize:11, color:T.textLight }}>{h}</span>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:9, marginTop:18 }}>
            <Btn onClick={handleAddEntry}><CheckIco/> Add Entry</Btn>
            <Btn variant="ghost" onClick={()=>{setNew(false);setForm(emptyForm);}}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {confirmDel && (
        <ConfirmDelete label={`${confirmDel.pod} (${confirmDel.id})`}
          onConfirm={()=>{ handleDelete(confirmDel.id); setCD(null); }}
          onCancel={()=>setCD(null)}/>
      )}
    </div>
  );
};

/* ─── COMPLAINTS ─────────────────────────────────────────────────────────────── */
const Complaints = ({ complaints, setComplaints }) => {
  const [newM, setNew]      = useState(false);
  const [det, setDet]       = useState(null);
  const [editM, setEditM]   = useState(null);
  const [sfilt, setSfilt]   = useState("All");
  const [confirmDel, setCD] = useState(null);
  const [toast, setToast]   = useState(null);
  const [form, setForm]     = useState({ pod:"", contactName:"", phone:"", device:"", deviceSerial:"", description:"", attachments:"", remarks:"" });
  const [editForm, setEF]   = useState({});
  const F  = k => e => setForm(p=>({...p,[k]:e.target.value}));
  const EF = k => e => setEF(p=>({...p,[k]:e.target.value}));

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(null), 3000); };

  const data = useMemo(()=> sfilt==="All" ? complaints : complaints.filter(c=>c.status===sfilt), [complaints,sfilt]);

  const handleAdd = () => {
    if (!form.pod) return alert("POD Name is required.");
    const entry = {
      id:"CMP-"+String(complaints.length+1).padStart(3,"0"),
      pod:form.pod, phase:"",   // phase left blank — can be filled via edit
      issue:`1 x ${form.device} — ${form.description.slice(0,35)}`,
      device:form.device,
      deviceSerial:form.deviceSerial,
      ticket:"TKT-"+(3000+complaints.length+1),
      reported:new Date().toISOString().split("T")[0], solved:"",
      resolution:"", status:"In Progress",
      contact:form.contactName, phone:form.phone,
      description:form.description, remarks:form.remarks,
      attachments:form.attachments,
    };
    setComplaints(p=>[entry,...p]);
    setNew(false);
    setForm({ pod:"", contactName:"", phone:"", device:"", deviceSerial:"", description:"", attachments:"", remarks:"" });
    showToast(`Complaint ${entry.ticket} raised for ${entry.pod}.`);
  };

  const handleEditSave = () => {
    setComplaints(p => p.map(c => c.id===editForm.id ? {...c,...editForm} : c));
    setEditM(null);
    showToast("Complaint updated.");
  };

  const handleDelete = id => { setComplaints(p=>p.filter(c=>c.id!==id)); setCD(null); if(det?.id===id) setDet(null); };

  const openEdit = (entry) => { setEF({...entry}); setEditM(entry); };

  const isCompleted = (c) => c.status === "Solved";

  const cols = [
    { k:"pod",      l:"POD Name",    filterable:false },
    { k:"phase",    l:"POD Phase",   filterable:true  },
    { k:"issue",    l:"Issue",       filterable:false },
    { k:"reported", l:"Report Date", filterable:false },
    { k:"solved",   l:"Solved Date", filterable:false },
    { k:"status",   l:"Status",      filterable:true  },
    { k:"_actions", l:"",            filterable:false },
  ];

  const ComplaintDetailView = ({ c, onClose }) => {
    const [showPreview, setShowPreview] = useState(false);
    const statusIdx = COMPLAINT_STATUSES_FLOW.indexOf(c.status);
    const emailVars = {
      pod_name:c.pod, contact_name:c.contact, pod_phase:c.phase||"",
      device_issue:c.issue, device_serial:c.deviceSerial||"N/A",
      ticket_number:c.ticket, reported_date:c.reported, description:c.description,
    };
    return (
      <Modal title={`Complaint — ${c.ticket}`} onClose={onClose} wide>
        {/* Status pipeline for complaints */}
        <div style={{ background:T.grayLight, border:`1px solid ${T.border}`, borderRadius:8, padding:"14px 18px", marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:600, color:T.textMid, textTransform:"uppercase", letterSpacing:".06em", marginBottom:12 }}>Complaint Progress</div>
          <div style={{ display:"flex", alignItems:"center" }}>
            {COMPLAINT_STATUSES_FLOW.map((s,i) => {
              const done = i < statusIdx, current = i===statusIdx;
              return (
                <div key={s} style={{ display:"flex", alignItems:"center", flex:i<COMPLAINT_STATUSES_FLOW.length-1?1:0 }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                    <div style={{ width:24, height:24, borderRadius:"50%", background:done?"#22c55e":current?T.blue:"#f1f5f9", border:`2px solid ${done?"#22c55e":current?T.blue:"#d1d5db"}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {done ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            : <span style={{ width:6, height:6, borderRadius:"50%", background:current?"#fff":"#9ca3af" }}/>}
                    </div>
                    <span style={{ fontSize:10, fontWeight:current?600:400, color:done?"#15803d":current?T.blue:"#9ca3af", whiteSpace:"nowrap" }}>{s}</span>
                  </div>
                  {i<COMPLAINT_STATUSES_FLOW.length-1 && <div style={{ flex:1, height:2, background:i<statusIdx?"#22c55e":"#e5e7eb", margin:"0 4px", marginBottom:14 }}/>}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 28px" }}>
          <DR l="POD Name" v={c.pod}/>
          <DR l="POD Phase" v={c.phase || <span style={{ color:T.textLight, fontStyle:"italic" }}>Not set — update via Edit</span>}/>
          <DR l="Contact Name" v={c.contact}/><DR l="Contact Number" v={c.phone}/>
          <DR l="Ticket Number" v={<span style={{ fontFamily:"'DM Mono',monospace", color:T.blue }}>{c.ticket}</span>}/>
          <DR l="Status" v={<Badge s={c.status}/>}/>
          <DR l="Reported Date" v={c.reported}/><DR l="Solved Date" v={c.solved}/>
          <DR l="Device / Issue" v={<span style={{ fontSize:12, color:"#4f46e5", fontWeight:500 }}>{c.issue?.slice(0,80)||"—"}</span>}/>
          <DR l="Device Serial No." v={c.deviceSerial ? <span style={{ fontFamily:"'DM Mono',monospace", color:T.blue }}>{c.deviceSerial}</span> : null}/>
        </div>
        <Hr/>
        <DR l="Issue" v={<span style={{ fontWeight:500 }}>{c.issue}</span>}/>
        <DR l="Description" v={c.description}/>
        {c.resolution&&<DR l="Resolution" v={c.resolution}/>}
        {c.remarks&&<DR l="Remarks" v={c.remarks}/>}
        {c.attachments && <DR l="Attachments" v={<a href="#" style={{ color:T.blue, fontSize:13 }}>📎 {c.attachments}</a>}/>}
        <Hr/>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {!isCompleted(c) && <Btn sm onClick={()=>{ onClose(); openEdit(c); }}><EditIco/> Edit Entry</Btn>}
          {/* Preview Mail only available while complaint is active (not yet Solved) */}
          {!isCompleted(c) && <Btn sm variant="secondary" onClick={()=>setShowPreview(true)}><EyeIco/> Preview Mail</Btn>}
          <Btn variant="danger" sm onClick={()=>{ setCD(c); onClose(); }}><TrashIco/> Delete</Btn>
        </div>
        {showPreview && (
          <EmailPrevModal tplKey="complaint" vars={emailVars} onClose={()=>setShowPreview(false)}
            onSend={!isCompleted(c) ? () => {
              // Sending mail advances to In Progress if currently Open
              if (c.status === "In Progress") {
                setComplaints(p => p.map(x => x.id===c.id ? {...x, status:"In Progress"} : x));
                showToast("Complaint acknowledgment sent. Status updated to In Progress.");
              } else {
                showToast("Complaint acknowledgment mail sent.");
              }
              setShowPreview(false);
            } : undefined}
          />
        )}
      </Modal>
    );
  };

  return (
    <div>
      {toast && (
        <div style={{ marginBottom:12, padding:"10px 16px", background:T.greenLight, border:"1px solid #bbf7d0", borderRadius:7, fontSize:13, color:T.green, fontWeight:500 }}>
          ✓ {toast}
        </div>
      )}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:18 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:T.text }}>Complaints</h2>
          <p style={{ fontSize:13, color:T.textMid, marginTop:2 }}>Device issue tracking and resolution</p>
        </div>
        <div style={{ display:"flex", gap:9, alignItems:"center" }}>
          <Sel value={sfilt} onChange={e=>setSfilt(e.target.value)} options={["All","In Progress","Solved","Deleted"]}/>
          <Btn onClick={()=>setNew(true)}><PlusIco/> Raise Complaint</Btn>
        </div>
      </div>

      {/* ── Module stat cards ──────────────────────────────────────────────── */}
      {(() => {
        const active = complaints.filter(c=>c.status!=="Deleted");
        const total      = active.length;
        const inProgress = active.filter(c=>c.status==="In Progress").length;
        const solved     = active.filter(c=>c.status==="Solved").length;
        const cards = [
          { label:"Total Complaints",    value:total,      color:"#64748b", bg:"#f8fafc", bd:"#e2e8f0",
            icon:<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></> },
          { label:"In Progress",         value:inProgress, color:"#3b82f6", bg:"#eff6ff", bd:"#bfdbfe",
            icon:<><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></> },
          { label:"Solved Complaints",   value:solved,     color:"#22c55e", bg:"#f0fdf4", bd:"#bbf7d0",
            icon:<><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></> },
        ];
        return (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:18 }}>
            {cards.map(c=>(
              <div key={c.label} style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:10,
                padding:"16px 18px", boxShadow:"0 1px 3px rgba(15,23,42,.05)", display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:38, height:38, borderRadius:9, background:c.bg, border:`1px solid ${c.bd}`,
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.color} strokeWidth="1.8">{c.icon}</svg>
                </div>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".08em", marginBottom:3 }}>{c.label}</div>
                  <div style={{ fontSize:24, fontWeight:800, color:c.color, fontVariantNumeric:"tabular-nums", lineHeight:1 }}>{c.value}</div>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      <FiltTable cols={cols} data={data} renderRow={r=><>
        <td style={{ padding:"11px 13px", fontWeight:500, color:T.text, cursor:"pointer" }} onClick={()=>setDet(r)}>{r.pod}</td>
        <TD c={<span style={{ fontSize:11, background:"#eef2ff", border:"1px solid #c7d2fe", borderRadius:4, padding:"2px 7px", color:"#4f46e5" }}>{r.phase||"—"}</span>}/>
        <TD c={<span style={{ maxWidth:200, display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={r.issue}>{r.issue?.replace(/\n/g," ")||"—"}</span>}/>
        <TD c={r.reported}/>
        <TD c={r.solved ? <span style={{ color:T.green, fontWeight:500 }}>{r.solved}</span> : <span style={{ color:T.textLight }}>—</span>}/>
        <td style={{ padding:"11px 13px" }}><Badge s={r.status}/></td>
        <td style={{ padding:"11px 13px" }}>
          <div style={{ display:"flex", gap:6 }}>
            <IconBtn onClick={()=>setDet(r)} title="View details"/>
            {!isCompleted(r) && <IconBtn onClick={e=>{e.stopPropagation();openEdit(r);}} title="Edit" icon={<EditIco/>}/>}
            <IconBtn danger onClick={e=>{e.stopPropagation();setCD(r);}} title="Delete"/>
          </div>
        </td>
      </>}/>

      {det && <ComplaintDetailView c={det} onClose={()=>setDet(null)}/>}

      {/* Edit Complaint Modal */}
      {editM && (
        <EditModal title={`Edit Complaint — ${editM.ticket}`} onClose={()=>setEditM(null)} onSave={handleEditSave}>
          <div style={{ padding:"10px 14px", background:T.amberLight, border:`1px solid #fde68a`, borderRadius:7, marginBottom:16, fontSize:12, color:T.amber }}>
            ✏️ Update complaint details. POD Phase and status can be updated here.
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <TxtInput label="POD Name"      value={editForm.pod||""}          onChange={EF("pod")}         placeholder="e.g. Alpha POD"/>
            <TxtInput label="POD Phase"     value={editForm.phase||""}        onChange={EF("phase")}       placeholder="e.g. Phase 1" hint="Update once complaint is raised"/>
            <TxtInput label="Contact Name"  value={editForm.contact||""}      onChange={EF("contact")}     placeholder="Full name"/>
            <TxtInput label="Contact Number" value={editForm.phone||""}       onChange={EF("phone")}       placeholder="+233..."/>
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.textMid, letterSpacing:".05em", textTransform:"uppercase" }}>Status</label>
              <Sel value={editForm.status||"In Progress"} onChange={EF("status")} options={["In Progress","Solved","Deleted"]}/>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.textMid, letterSpacing:".05em", textTransform:"uppercase" }}>Device Type</label>
              <Sel value={editForm.device||""} onChange={EF("device")} options={["Monitor","CPU","Keyboard","Mouse","Webcam","Headphones","PSU","Network Adapter","Other"]}/>
            </div>
            <TxtInput label="Device Serial No." value={editForm.deviceSerial||""} onChange={EF("deviceSerial")} placeholder="e.g. MON-A03"/>
            <TxtInput label="Solved Date" type="date" value={editForm.solved||""} onChange={EF("solved")} hint="Fill when resolved"/>
            <TxtInput label="Description"  value={editForm.description||""} onChange={EF("description")} placeholder="Describe the issue…" rows={2} span2/>
            <TxtInput label="Resolution"   value={editForm.resolution||""} onChange={EF("resolution")} placeholder="What was done to resolve…" rows={2} span2/>
            <TxtInput label="Remarks"      value={editForm.remarks||""}    onChange={EF("remarks")}     placeholder="Additional remarks…" rows={2} span2/>
            <TxtInput label="Attachments"  value={editForm.attachments||""} onChange={EF("attachments")} placeholder="e.g. photo.jpg, report.pdf" span2 hint="Comma-separated filenames"/>
          </div>
        </EditModal>
      )}

      {/* New Complaint Modal — no phase, no pod phase requirement */}
      {newM && (
        <Modal title="Raise New Complaint" onClose={()=>setNew(false)} wide>
          <div style={{ padding:"10px 14px", background:T.blueLight, border:`1px solid ${T.blueMid}`, borderRadius:7, marginBottom:16, fontSize:12, color:T.blue }}>
            ℹ️ <strong>POD Phase</strong> does not need to be filled now — you can update it later via Edit Entry.
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <TxtInput label="POD Name *"     value={form.pod}         onChange={F("pod")}         placeholder="e.g. Alpha POD"/>
            <TxtInput label="Contact Name"   value={form.contactName} onChange={F("contactName")} placeholder="Full name"/>
            <TxtInput label="Contact Number" value={form.phone}       onChange={F("phone")}       placeholder="+233..."/>
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.textMid, letterSpacing:".05em", textTransform:"uppercase" }}>Device Type *</label>
              <Sel value={form.device} onChange={F("device")} options={["","Monitor","CPU","Keyboard","Mouse","Webcam","Headphones","PSU","Network Adapter","Other"]}/>
            </div>
            <TxtInput label="Device Serial No." value={form.deviceSerial} onChange={F("deviceSerial")} placeholder="e.g. MON-A03" hint="Serial number of faulty device"/>
            <TxtInput label="Attachments"    value={form.attachments}  onChange={F("attachments")} placeholder="e.g. photo.jpg, video.mp4" hint="Comma-separated filenames"/>
            <TxtInput label="Description *"  value={form.description}  onChange={F("description")} placeholder="Describe the issue in detail…" rows={3} span2/>
            <TxtInput label="Remarks"        value={form.remarks}      onChange={F("remarks")}     placeholder="Additional notes…" rows={2} span2/>
          </div>
          <div style={{ display:"flex", gap:9, marginTop:18 }}>
            <Btn onClick={handleAdd}>Submit Complaint</Btn>
            <Btn variant="ghost" onClick={()=>setNew(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {confirmDel && (
        <ConfirmDelete label={`${confirmDel.pod} — ${confirmDel.ticket}`}
          onConfirm={()=>handleDelete(confirmDel.id)}
          onCancel={()=>setCD(null)}/>
      )}
    </div>
  );
};

/* ─── REPOSSESSION ───────────────────────────────────────────────────────────── */
const Repossession = ({ repos, setRepos }) => {
  const [newM, setNew]      = useState(false);
  const [det, setDet]       = useState(null);
  const [editM, setEditM]   = useState(null);
  const [confirmDel, setCD] = useState(null);
  const [toast, setToast]   = useState(null);
  const [sfilt, setSfilt]   = useState("All");
  const [repoPrevOpen, setRepoPrevOpen] = useState(false);
  const [form, setForm]     = useState({ pod:"", address:"", contact:"", phone:"", components:"", notes:"" });
  const [editForm, setEF]   = useState({});
  const F  = k => e => setForm(p=>({...p,[k]:e.target.value}));
  const EF = k => e => setEF(p=>({...p,[k]:e.target.value}));

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(null), 3000); };

  const data = useMemo(()=> sfilt==="All" ? repos : repos.filter(r=>r.status===sfilt), [repos,sfilt]);

  const handleAdd = () => {
    if (!form.pod) return alert("POD Name is required.");
    const entry = {
      id:"REP-"+String(repos.length+1).padStart(3,"0"),
      pod:form.pod, address:form.address, contact:form.contact, phone:form.phone,
      components:form.components, serials:"",
      ticket:"TKT-"+(4000+repos.length+1), expectedDate:new Date().toISOString().split("T")[0],
      reshipDate:"", notes:form.notes, status:"Pending",
    };
    setRepos(p=>[entry,...p]);
    setNew(false); setForm({ pod:"", address:"", contact:"", phone:"", components:"", notes:"" });
    showToast(`Repossession request ${entry.id} created.`);
  };

  const handleEditSave = () => {
    setRepos(p => p.map(r => r.id===editForm.id ? {...r,...editForm} : r));
    setEditM(null);
    showToast("Repossession updated.");
  };

  const handleDelete = id => { setRepos(p=>p.filter(r=>r.id!==id)); setCD(null); if(det?.id===id) setDet(null); };
  const openEdit = (entry) => { setEF({...entry}); setEditM(entry); };
  const isCompleted = r => r.status === "Completed";

  const cols = [
    { k:"pod",          l:"POD Name",            filterable:false },
    { k:"ticket",       l:"Ticket Number",       filterable:false },
    { k:"components",   l:"Components Picked",   filterable:false },
    { k:"expectedDate", l:"Expected Reship Date",filterable:false },
    { k:"reshipDate",   l:"Reshipped Date",      filterable:false },
    { k:"status",       l:"Status",              filterable:true  },
    { k:"_actions",     l:"",                    filterable:false },
  ];

  const emailVars = det ? { pod_name:det.pod, contact_person:det.contact, pod_address:det.address, components:det.components, serial_numbers:det.serials||"TBD", scheduled_date:"TBD", ticket_number:det.ticket } : {};

  return (
    <div>
      {toast && (
        <div style={{ marginBottom:12, padding:"10px 16px", background:T.greenLight, border:"1px solid #bbf7d0", borderRadius:7, fontSize:13, color:T.green, fontWeight:500 }}>
          ✓ {toast}
        </div>
      )}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:18 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:T.text }}>Repossession</h2>
          <p style={{ fontSize:13, color:T.textMid, marginTop:2 }}>Equipment collection and return tracking</p>
        </div>
        <div style={{ display:"flex", gap:9, alignItems:"center" }}>
          <Sel value={sfilt} onChange={e=>setSfilt(e.target.value)} options={["All",...REPOSSESSION_STATUSES]}/>
          <Btn onClick={()=>setNew(true)}><PlusIco/> New Repossession Request</Btn>
        </div>
      </div>

      {/* ── Module stat cards ──────────────────────────────────────────────── */}
      {(() => {
        const total      = repos.length;
        const received   = repos.filter(r=>r.status==="Received"||r.status==="Completed").length;
        const inProcess  = repos.filter(r=>r.status==="In Process"||r.status==="In Progress"||r.status==="Collected").length;
        const pending    = repos.filter(r=>r.status==="Pending"||r.status==="Informed").length;
        const fromPODs   = [...new Set(repos.map(r=>r.pod))].length;

        const parseNum = (str, keyword) => {
          const m = (str||"").match(new RegExp('(\\d+)\\s*[xX×]?\\s*'+keyword,'i'));
          return m ? parseInt(m[1]) : 0;
        };
        // Count devices only from Received/Completed entries (actual repossessions done)
        const receivedRepos = repos.filter(r=>r.status==="Received"||r.status==="Completed");
        const totalCPUs  = receivedRepos.reduce((a,r)=>a+(r.cpus||parseNum(r.components,"CPU")),0);
        const totalMons  = receivedRepos.reduce((a,r)=>a+(r.monitors||parseNum(r.components,"Monitor")),0);
        const totalLaps  = receivedRepos.reduce((a,r)=>a+(r.laptops||parseNum(r.components,"Laptop")),0);
        const totalPCSets= receivedRepos.reduce((a,r)=>{
          if(r.pc_sets && r.pc_sets>0) return a+r.pc_sets;
          const m=(r.components||"").match(/(\d+)\s*[xX×]?\s*PC/i); return a+(m?parseInt(m[1]):0);
        },0);

        return (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:18 }}>
            {/* Card 1: Total + status breakdown */}
            <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:10, padding:"16px 18px", boxShadow:"0 1px 3px rgba(15,23,42,.05)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                <div style={{ width:38, height:38, borderRadius:9, background:"#f5f3ff", border:"1px solid #ddd6fe", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.8">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".08em" }}>Total Repossessions</div>
                  <div style={{ fontSize:26, fontWeight:800, color:"#8b5cf6", lineHeight:1.1 }}>{total}</div>
                </div>
              </div>
              <div style={{ borderTop:"1px solid #f1f5f9", paddingTop:8 }}>
                <div style={{ fontSize:9.5, fontWeight:700, color:"#cbd5e1", textTransform:"uppercase", letterSpacing:".08em", marginBottom:5 }}>By Status</div>
                {[["Received / Completed",received,"#22c55e"],["In Process",inProcess,"#3b82f6"],["Pending / Informed",pending,"#94a3b8"]].filter(([,v])=>v>0).map(([l,v,c])=>(
                  <div key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
                    <span style={{ fontSize:11, color:"#64748b", display:"flex", alignItems:"center", gap:5 }}>
                      <span style={{ width:6, height:6, borderRadius:"50%", background:c, flexShrink:0 }}/>{l}
                    </span>
                    <span style={{ fontSize:11, fontWeight:700, color:c }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Card 2: Completed count */}
            <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:10, padding:"16px 18px", boxShadow:"0 1px 3px rgba(15,23,42,.05)", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:38, height:38, borderRadius:9, background:"#f0fdf4", border:"1px solid #bbf7d0", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".08em", marginBottom:3 }}>Received / Completed</div>
                <div style={{ fontSize:26, fontWeight:800, color:"#22c55e", lineHeight:1.1 }}>{received}</div>
                <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{fromPODs} unique PODs</div>
              </div>
            </div>
            {/* Card 3: Devices recovered (completed only) */}
            <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:10, padding:"16px 18px", boxShadow:"0 1px 3px rgba(15,23,42,.05)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                <div style={{ width:38, height:38, borderRadius:9, background:"#eff6ff", border:"1px solid #bfdbfe", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8">
                    <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".08em" }}>Devices Recovered</div>
                  <div style={{ fontSize:26, fontWeight:800, color:"#3b82f6", lineHeight:1.1 }}>{totalPCSets+totalCPUs+totalMons+totalLaps}</div>
                  <div style={{ fontSize:10, color:"#94a3b8", marginTop:1 }}>From completed repos only</div>
                </div>
              </div>
              <div style={{ borderTop:"1px solid #f1f5f9", paddingTop:8 }}>
                {[["PC Sets",totalPCSets,"#6366f1"],["CPUs",totalCPUs,"#3b82f6"],["Monitors",totalMons,"#0891b2"],["Laptops",totalLaps,"#8b5cf6"]].filter(([,v])=>v>0).map(([l,v,c])=>(
                  <div key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:2 }}>
                    <span style={{ fontSize:11, color:"#64748b", display:"flex", alignItems:"center", gap:5 }}>
                      <span style={{ width:6, height:6, borderRadius:"50%", background:c, flexShrink:0 }}/>{l}
                    </span>
                    <span style={{ fontSize:11, fontWeight:700, color:c }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      <FiltTable cols={cols} data={data} renderRow={r=><>
        <td style={{ padding:"11px 13px", fontWeight:500, color:T.text, cursor:"pointer" }} onClick={()=>setDet(r)}>{r.pod}</td>
        <TD c={<span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:T.blue }}>{r.ticket||"—"}</span>}/>
        <TD c={<span style={{ maxWidth:180, display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={r.components}>{r.components||"—"}</span>}/>
        <TD c={r.expectedDate || <span style={{ color:T.textLight }}>—</span>}/>
        <TD c={r.reshipDate ? <span style={{ color:T.green, fontWeight:500 }}>{r.reshipDate}</span> : <span style={{ color:T.textLight }}>—</span>}/>
        <td style={{ padding:"11px 13px" }}><Badge s={r.status}/></td>
        <td style={{ padding:"11px 13px" }}>
          <div style={{ display:"flex", gap:6 }}>
            <IconBtn onClick={()=>setDet(r)} title="View details"/>
            {!isCompleted(r) && <IconBtn onClick={e=>{e.stopPropagation();openEdit(r);}} title="Edit" icon={<EditIco/>}/>}
            <IconBtn danger onClick={e=>{e.stopPropagation();setCD(r);}} title="Delete"/>
          </div>
        </td>
      </>}/>

      {det && (
        <Modal title={`Repossession — ${det.ticket}`} onClose={()=>setDet(null)} wide>
          {/* Status pipeline */}
          <div style={{ background:T.grayLight, border:`1px solid ${T.border}`, borderRadius:8, padding:"14px 18px", marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:600, color:T.textMid, textTransform:"uppercase", letterSpacing:".06em", marginBottom:12 }}>Progress</div>
            <div style={{ display:"flex", alignItems:"center" }}>
              {REPOSSESSION_STATUSES.map((s,i) => {
                const si = REPOSSESSION_STATUSES.indexOf(det.status);
                const done = i<si, cur = i===si;
                return (
                  <div key={s} style={{ display:"flex", alignItems:"center", flex:i<REPOSSESSION_STATUSES.length-1?1:0 }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                      <div style={{ width:22, height:22, borderRadius:"50%", background:done?"#22c55e":cur?T.blue:"#f1f5f9", border:`2px solid ${done?"#22c55e":cur?T.blue:"#d1d5db"}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {done ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                               : <span style={{ width:5, height:5, borderRadius:"50%", background:cur?"#fff":"#9ca3af" }}/>}
                      </div>
                      <span style={{ fontSize:9, fontWeight:cur?600:400, color:done?"#15803d":cur?T.blue:"#9ca3af", whiteSpace:"nowrap" }}>{s}</span>
                    </div>
                    {i<REPOSSESSION_STATUSES.length-1 && <div style={{ flex:1, height:2, background:i<REPOSSESSION_STATUSES.indexOf(det.status)?"#22c55e":"#e5e7eb", margin:"0 4px", marginBottom:14 }}/>}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 28px" }}>
            <DR l="POD Name" v={det.pod}/>
            <DR l="Ticket Number" v={<span style={{ fontFamily:"'DM Mono',monospace", color:T.blue }}>{det.ticket}</span>}/>
            <DR l="POD Address" v={det.address}/>
            <DR l="Contact Person" v={det.contact}/>
            <DR l="Contact Number" v={det.phone}/>
            <DR l="Reshipped Date" v={det.reshipDate}/>
          </div>
          <Hr/>
          <DR l="Components Picked" v={det.components}/>
          <DR l="Serial Numbers" v={det.serials ? <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12 }}>{det.serials}</span> : <span style={{ color:T.textLight }}>Not yet assigned</span>}/>
          {det.notes&&<DR l="Notes" v={det.notes}/>}
          <Hr/>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {!isCompleted(det) && <Btn sm onClick={()=>{ setDet(null); openEdit(det); }}><EditIco/> Edit Entry</Btn>}
            {/* Preview Mail only for Pending entries — once notice is sent, mail option is removed */}
            {det.status === "Pending" && (
              <Btn sm variant="secondary" onClick={()=>setRepoPrevOpen(true)}><EyeIco/> Preview Mail</Btn>
            )}
            <Btn variant="danger" sm onClick={()=>{ setCD(det); setDet(null); }}><TrashIco/> Delete</Btn>
          </div>
          {repoPrevOpen && (
            <EmailPrevModal tplKey="repossession"
              vars={{ pod_name:det.pod, contact_person:det.contact, pod_address:det.address, components:det.components, serial_numbers:det.serials||"TBD", scheduled_date:"TBD", ticket_number:det.ticket }}
              onClose={()=>setRepoPrevOpen(false)}
              onSend={() => { showToast("Repossession notice sent to POD contact."); setRepoPrevOpen(false); }}
            />
          )}
        </Modal>
      )}

      {/* Edit Repossession */}
      {editM && (
        <EditModal title={`Edit Repossession — ${editM.ticket||editM.id}`} onClose={()=>setEditM(null)} onSave={handleEditSave}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <TxtInput label="POD Name"       value={editForm.pod||""}        onChange={EF("pod")}        placeholder="e.g. Alpha POD"/>
            <TxtInput label="Contact Person" value={editForm.contact||""}    onChange={EF("contact")}    placeholder="Full name"/>
            <TxtInput label="POD Address"    value={editForm.address||""}    onChange={EF("address")}    placeholder="Full address" span2/>
            <TxtInput label="Contact Number" value={editForm.phone||""}      onChange={EF("phone")}      placeholder="+233..."/>
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.textMid, letterSpacing:".05em", textTransform:"uppercase" }}>Status</label>
              <Sel value={editForm.status||"Pending"} onChange={EF("status")} options={REPOSSESSION_STATUSES}/>
            </div>
            <TxtInput label="Reshipped Date" type="date" value={editForm.reshipDate||""} onChange={EF("reshipDate")}/>
            <TxtInput label="Components"     value={editForm.components||""} onChange={EF("components")} placeholder="3 x Monitor, 2 x CPU…" rows={2} span2/>
            <TxtInput label="Serial Numbers" value={editForm.serials||""}   onChange={EF("serials")}    placeholder="MON-A01, CPU-B02…" span2/>
            <TxtInput label="Notes"          value={editForm.notes||""}     onChange={EF("notes")}      placeholder="Additional notes…" rows={2} span2/>
          </div>
        </EditModal>
      )}

      {newM && (
        <Modal title="New Repossession Request" onClose={()=>setNew(false)} wide>
          <div style={{ padding:"10px 14px", background:T.blueLight, border:`1px solid ${T.blueMid}`, borderRadius:7, marginBottom:16, fontSize:12, color:T.blue }}>
            ℹ️ Add entry with basic details. Serial numbers and status can be updated later via Edit Entry.
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <TxtInput label="POD Name *"       value={form.pod}        onChange={F("pod")}        placeholder="e.g. Alpha POD"/>
            <TxtInput label="Contact Person"   value={form.contact}    onChange={F("contact")}    placeholder="Full name"/>
            <TxtInput label="POD Address"      value={form.address}    onChange={F("address")}    placeholder="Full address" span2/>
            <TxtInput label="Contact Number"   value={form.phone}      onChange={F("phone")}      placeholder="+233..."/>
            <div/>
            <TxtInput label="Components to Pick *" value={form.components} onChange={F("components")} placeholder="3 x Monitor, 2 x CPU…" rows={2} span2/>
            <TxtInput label="Notes"            value={form.notes}      onChange={F("notes")}      placeholder="Any special instructions…" rows={2} span2/>
          </div>
          <div style={{ display:"flex", gap:9, marginTop:18 }}>
            <Btn onClick={handleAdd}>Create Request</Btn>
            <Btn variant="ghost" onClick={()=>setNew(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {confirmDel && (
        <ConfirmDelete label={`${confirmDel.pod} — ${confirmDel.ticket}`}
          onConfirm={()=>handleDelete(confirmDel.id)}
          onCancel={()=>setCD(null)}/>
      )}
    </div>
  );
};

/* ─── REDEPLOYMENT ───────────────────────────────────────────────────────────── */
const Redeployment = ({ redeps, setRedeps }) => {
  const [newM, setNew]      = useState(false);
  const [det, setDet]       = useState(null);
  const [editM, setEditM]   = useState(null);
  const [confirmDel, setCD] = useState(null);
  const [toast, setToast]   = useState(null);
  const [sfilt, setSfilt]   = useState("All");
  const [redepPrevOpen, setRedepPrevOpen] = useState(false);
  const [form, setForm]     = useState({ pod:"", address:"", contact:"", phone:"", ticket:"", source:"", components:"", serials:"" });
  const [editForm, setEF]   = useState({});
  const F  = k => e => setForm(p=>({...p,[k]:e.target.value}));
  const EF = k => e => setEF(p=>({...p,[k]:e.target.value}));

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(null), 3000); };
  const data = useMemo(()=> sfilt==="All" ? redeps : redeps.filter(r=>r.status===sfilt), [redeps,sfilt]);
  const isCompleted = r => r.status === "Completed";

  const handleAdd = () => {
    if (!form.pod) return alert("Destination POD is required.");
    const entry = {
      id:"RDP-"+String(redeps.length+1).padStart(3,"0"),
      pod:form.pod, address:form.address, contact:form.contact, phone:form.phone,
      source:form.source||"TBD", components:form.components, serials:form.serials||"",
      orderDate:new Date().toISOString().split("T")[0], dispatchDate:"", deliveryDate:"",
      trackingId:"", complaintTicket:form.ticket, status:"Pending",
    };
    setRedeps(p=>[entry,...p]);
    setNew(false); setForm({ pod:"", address:"", contact:"", phone:"", ticket:"", source:"", components:"", serials:"" });
    showToast(`Redeployment ${entry.id} created.`);
  };

  const handleEditSave = () => {
    setRedeps(p => p.map(r => r.id===editForm.id ? {...r,...editForm} : r));
    setEditM(null);
    showToast("Redeployment updated.");
  };

  const handleDelete = id => { setRedeps(p=>p.filter(r=>r.id!==id)); setCD(null); if(det?.id===id) setDet(null); };
  const openEdit = (entry) => { setEF({...entry}); setEditM(entry); };

  const cols = [
    { k:"pod",             l:"POD Name",      filterable:false },
    { k:"complaintTicket", l:"Ticket Number", filterable:false },
    { k:"components",      l:"Component",     filterable:false },
    { k:"source",          l:"Source POD",    filterable:false },
    { k:"orderDate",       l:"Order Date",    filterable:false },
    { k:"deliveryDate",    l:"Delivery Date", filterable:false },
    { k:"status",          l:"Status",        filterable:true  },
    { k:"_actions",        l:"",              filterable:false },
  ];

  return (
    <div>
      {toast && (
        <div style={{ marginBottom:12, padding:"10px 16px", background:T.greenLight, border:"1px solid #bbf7d0", borderRadius:7, fontSize:13, color:T.green, fontWeight:500 }}>
          ✓ {toast}
        </div>
      )}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:18 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:T.text }}>Redeployment</h2>
          <p style={{ fontSize:13, color:T.textMid, marginTop:2 }}>Equipment reallocation between PODs</p>
        </div>
        <div style={{ display:"flex", gap:9, alignItems:"center" }}>
          <Sel value={sfilt} onChange={e=>setSfilt(e.target.value)} options={["All",...REDEPLOYMENT_STATUSES]}/>
          <Btn onClick={()=>setNew(true)}><PlusIco/> New Redeployment</Btn>
        </div>
      </div>

      {/* ── Module stat cards ──────────────────────────────────────────────── */}
      {(() => {
        const total     = redeps.length;
        const delivered = redeps.filter(r=>r.status==="Completed").length;
        const solvedVia = redeps.filter(r=>r.status==="Completed" && r.complaintTicket && r.complaintTicket.trim()!=="" && r.complaintTicket.trim().toLowerCase()!=="n/a").length;
        const cards = [
          { label:"Redeployment Orders",    value:total,     color:"#06b6d4", bg:"#ecfeff", bd:"#a5f3fc",
            icon:<><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></> },
          { label:"Redeployments Delivered",value:delivered, color:"#22c55e", bg:"#f0fdf4", bd:"#bbf7d0",
            icon:<><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></> },
          { label:"Solved via Redeployment",value:solvedVia, color:"#8b5cf6", bg:"#f5f3ff", bd:"#ddd6fe",
            icon:<><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></> },
        ];
        return (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:18 }}>
            {cards.map(c=>(
              <div key={c.label} style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:10,
                padding:"16px 18px", boxShadow:"0 1px 3px rgba(15,23,42,.05)", display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:38, height:38, borderRadius:9, background:c.bg, border:`1px solid ${c.bd}`,
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.color} strokeWidth="1.8">{c.icon}</svg>
                </div>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".08em", marginBottom:3 }}>{c.label}</div>
                  <div style={{ fontSize:24, fontWeight:800, color:c.color, fontVariantNumeric:"tabular-nums", lineHeight:1 }}>{c.value}</div>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      <FiltTable cols={cols} data={data} renderRow={r=><>
        <td style={{ padding:"11px 13px", fontWeight:500, color:T.text, cursor:"pointer" }} onClick={()=>setDet(r)}>{r.pod}</td>
        <TD c={r.complaintTicket && r.complaintTicket.toLowerCase()!=="n/a" ? <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:T.blue }}>{r.complaintTicket}</span> : <span style={{ color:T.textLight }}>—</span>}/>
        <TD c={<span style={{ maxWidth:140, display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={r.components}>{r.components}</span>}/>
        <TD c={<span style={{ color:T.indigo }}>{r.source||"—"}</span>}/>
        <TD c={r.orderDate || <span style={{ color:T.textLight }}>—</span>}/>
        <TD c={r.deliveryDate ? <span style={{ color:T.green, fontWeight:500 }}>{r.deliveryDate}</span> : <span style={{ color:T.textLight }}>—</span>}/>
        <td style={{ padding:"11px 13px" }}><Badge s={r.status}/></td>
        <td style={{ padding:"11px 13px" }}>
          <div style={{ display:"flex", gap:6 }}>
            <IconBtn onClick={()=>setDet(r)} title="View details"/>
            {!isCompleted(r) && <IconBtn onClick={e=>{e.stopPropagation();openEdit(r);}} title="Edit" icon={<EditIco/>}/>}
            <IconBtn danger onClick={e=>{e.stopPropagation();setCD(r);}} title="Delete"/>
          </div>
        </td>
      </>}/>

      {det && (
        <Modal title={`Redeployment — ${det.id}`} onClose={()=>setDet(null)} wide>
          {/* Status pipeline */}
          <div style={{ background:T.grayLight, border:`1px solid ${T.border}`, borderRadius:8, padding:"14px 18px", marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:600, color:T.textMid, textTransform:"uppercase", letterSpacing:".06em", marginBottom:12 }}>Progress</div>
            <div style={{ display:"flex", alignItems:"center" }}>
              {REDEPLOYMENT_STATUSES.map((s,i) => {
                const si = REDEPLOYMENT_STATUSES.indexOf(det.status);
                const done = i<si, cur = i===si;
                return (
                  <div key={s} style={{ display:"flex", alignItems:"center", flex:i<REDEPLOYMENT_STATUSES.length-1?1:0 }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                      <div style={{ width:22, height:22, borderRadius:"50%", background:done?"#22c55e":cur?T.blue:"#f1f5f9", border:`2px solid ${done?"#22c55e":cur?T.blue:"#d1d5db"}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {done ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                               : <span style={{ width:5, height:5, borderRadius:"50%", background:cur?"#fff":"#9ca3af" }}/>}
                      </div>
                      <span style={{ fontSize:9, fontWeight:cur?600:400, color:done?"#15803d":cur?T.blue:"#9ca3af", whiteSpace:"nowrap" }}>{s}</span>
                    </div>
                    {i<REDEPLOYMENT_STATUSES.length-1 && <div style={{ flex:1, height:2, background:i<si?"#22c55e":"#e5e7eb", margin:"0 4px", marginBottom:14 }}/>}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 28px" }}>
            <DR l="Destination POD"    v={det.pod}/>
            <DR l="Source POD"         v={<span style={{ color:T.blue }}>{det.source}</span>}/>
            <DR l="POD Address"        v={det.address}/>
            <DR l="Contact Person"     v={det.contact}/>
            <DR l="Contact Number"     v={det.phone}/>
            <DR l="Complaint Ticket"   v={<span style={{ fontFamily:"'DM Mono',monospace", color:T.blue }}>{det.complaintTicket}</span>}/>
            <DR l="Tracking ID"        v={det.trackingId ? <span style={{ fontFamily:"'DM Mono',monospace", color:T.blue }}>{det.trackingId}</span> : null}/>
            <DR l="Order Date"         v={det.orderDate}/>
            <DR l="Dispatch Date"      v={det.dispatchDate}/>
            <DR l="Delivery Date"      v={det.deliveryDate}/>
          </div>
          <Hr/>
          <DR l="Components"     v={det.components}/>
          <DR l="Serial Numbers" v={det.serials ? <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12 }}>{det.serials}</span> : <span style={{ color:T.textLight }}>Not yet assigned</span>}/>
          <Hr/>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {!isCompleted(det) && <Btn sm onClick={()=>{ setDet(null); openEdit(det); }}><EditIco/> Edit Entry</Btn>}
            {/* Preview Mail only for Pending entries — once order is placed, mail option is removed */}
            {det.status === "Pending" && (
              <Btn sm variant="secondary" onClick={()=>setRedepPrevOpen(true)}><EyeIco/> Preview Mail</Btn>
            )}
            <Btn variant="danger" sm onClick={()=>{ setCD(det); setDet(null); }}><TrashIco/> Delete</Btn>
          </div>
          {redepPrevOpen && (
            <EmailPrevModal tplKey="redeployment"
              vars={{ pod_name:det.pod, contact_person:det.contact, pod_address:det.address, source_pod:det.source, components:det.components, serial_numbers:det.serials||"TBD", complaint_ticket:det.complaintTicket||"N/A", delivery_date:det.deliveryDate||"TBD", tracking_id:det.trackingId||"TBD" }}
              onClose={()=>setRedepPrevOpen(false)}
              onSend={() => { showToast("Redeployment notice sent to destination POD contact."); setRedepPrevOpen(false); }}
            />
          )}
        </Modal>
      )}

      {editM && (
        <EditModal title={`Edit Redeployment — ${editM.id}`} onClose={()=>setEditM(null)} onSave={handleEditSave}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <TxtInput label="Destination POD *" value={editForm.pod||""}           onChange={EF("pod")}           placeholder="e.g. Eta POD"/>
            <TxtInput label="Source POD"        value={editForm.source||""}        onChange={EF("source")}        placeholder="e.g. Alpha POD"/>
            <TxtInput label="Contact Person"    value={editForm.contact||""}       onChange={EF("contact")}       placeholder="Full name"/>
            <TxtInput label="Contact Number"    value={editForm.phone||""}         onChange={EF("phone")}         placeholder="+233..."/>
            <TxtInput label="POD Address"       value={editForm.address||""}       onChange={EF("address")}       placeholder="Full address" span2/>
            <TxtInput label="Complaint Ticket #" value={editForm.complaintTicket||""} onChange={EF("complaintTicket")} placeholder="TKT-XXXX"/>
            <TxtInput label="Tracking ID"       value={editForm.trackingId||""}   onChange={EF("trackingId")}    placeholder="TRK-XXXX"/>
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              <label style={{ fontSize:11, fontWeight:600, color:T.textMid, letterSpacing:".05em", textTransform:"uppercase" }}>Status</label>
              <Sel value={editForm.status||"Pending"} onChange={EF("status")} options={REDEPLOYMENT_STATUSES}/>
            </div>
            <TxtInput label="Order Date"        type="date" value={editForm.orderDate||""}    onChange={EF("orderDate")}/>
            <TxtInput label="Dispatch Date"     type="date" value={editForm.dispatchDate||""} onChange={EF("dispatchDate")}/>
            <TxtInput label="Delivery Date"     type="date" value={editForm.deliveryDate||""} onChange={EF("deliveryDate")}/>
            <TxtInput label="Components"        value={editForm.components||""}   onChange={EF("components")}    placeholder="3 x CPU…" rows={2} span2/>
            <TxtInput label="Serial Numbers"    value={editForm.serials||""}      onChange={EF("serials")}       placeholder="CPU-D01, CPU-D02…" span2/>
          </div>
        </EditModal>
      )}

      {newM && (
        <Modal title="New Redeployment Order" onClose={()=>setNew(false)} wide>
          <div style={{ padding:"10px 14px", background:T.blueLight, border:`1px solid ${T.blueMid}`, borderRadius:7, marginBottom:16, fontSize:12, color:T.blue }}>
            ℹ️ Add entry. Tracking ID, dispatch/delivery dates and serial numbers can be updated later via Edit Entry.
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <TxtInput label="Destination POD *" value={form.pod}        onChange={F("pod")}        placeholder="e.g. Eta POD"/>
            <TxtInput label="Contact Person"    value={form.contact}    onChange={F("contact")}    placeholder="Full name"/>
            <TxtInput label="POD Address"       value={form.address}    onChange={F("address")}    placeholder="Full address" span2/>
            <TxtInput label="Contact Number"    value={form.phone}      onChange={F("phone")}      placeholder="+233..."/>
            <TxtInput label="Source POD"        value={form.source}     onChange={F("source")}     placeholder="e.g. Alpha POD"/>
            <TxtInput label="Complaint Ticket #" value={form.ticket}    onChange={F("ticket")}     placeholder="TKT-XXXX"/>
            <TxtInput label="Components *"      value={form.components} onChange={F("components")} placeholder="List components…" rows={2} span2/>
            <TxtInput label="Serial Numbers"    value={form.serials}    onChange={F("serials")}    placeholder="Can be added later…" span2/>
          </div>
          <div style={{ display:"flex", gap:9, marginTop:18 }}>
            <Btn onClick={handleAdd}>Create Redeployment</Btn>
            <Btn variant="ghost" onClick={()=>setNew(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {confirmDel && (
        <ConfirmDelete label={`${confirmDel.pod} (${confirmDel.id})`}
          onConfirm={()=>handleDelete(confirmDel.id)}
          onCancel={()=>setCD(null)}/>
      )}
    </div>
  );
};

/* ─── TEMPLATES ──────────────────────────────────────────────────────────────── */
const Templates = () => {
  const [active, setActive] = useState("shipment");
  const [tpls, setTpls]     = useState(TMPL);
  const [editing, setEdit]  = useState(false);
  const [preview, setPrev]  = useState(false);
  const FIELDS = {
    shipment:     [["pod_name","POD Name"],["contact_person","Contact Person"],["contact_number","Contact Number"],["pod_address","POD Address"],["components","Components"],["cpus","CPUs"],["order_date","Order Date"],["serial_numbers","Serial Numbers"],["tracking_id","Tracking ID"]],
    complaint:    [["pod_name","POD Name"],["contact_name","Contact Name"],["device_issue","Device Issue"],["device_serial","Device Serial"],["ticket_number","Ticket #"],["reported_date","Reported Date"],["description","Description"]],
    repossession: [["pod_name","POD Name"],["contact_person","Contact Person"],["pod_address","POD Address"],["components","Components"],["serial_numbers","Serial Numbers"],["scheduled_date","Collection Date"],["ticket_number","Ticket #"]],
    redeployment: [["pod_name","Destination POD"],["contact_person","Contact Person"],["pod_address","POD Address"],["source_pod","Source POD"],["components","Components"],["serial_numbers","Serial Numbers"],["complaint_ticket","Complaint Ticket"],["delivery_date","Delivery Date"],["tracking_id","Tracking ID"]],
  };
  const initF = t => Object.fromEntries(FIELDS[t].map(([k])=>[k,""]));
  const [fields, setFields] = useState(initF("shipment"));
  const ff = k => e => setFields(p=>({...p,[k]:e.target.value}));
  const switchTpl = t => { setActive(t); setEdit(false); setFields(initF(t)); };

  return (
    <div>
      <div style={{ marginBottom:18 }}>
        <h2 style={{ fontSize:20, fontWeight:700, color:T.text }}>Templates</h2>
        <p style={{ fontSize:13, color:T.textMid, marginTop:2 }}>Fill fields, preview, and send emails for each workflow</p>
      </div>
      <div style={{ display:"flex", gap:6, marginBottom:18 }}>
        {Object.keys(TMPL).map(t=>(
          <button key={t} onClick={()=>switchTpl(t)}
            style={{ padding:"7px 16px", borderRadius:6, fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit",
              border:active===t?`1px solid ${T.blue}`:`1px solid ${T.border}`,
              background:active===t?T.blue:"#fff", color:active===t?"#fff":T.textMid, textTransform:"capitalize",
              transition:"all .15s" }}>
            {t}
          </button>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:18 }}>
          <div style={{ fontSize:13, fontWeight:600, color:T.text, marginBottom:14, textTransform:"capitalize" }}>Fill {active} Fields</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {FIELDS[active].map(([k,l])=>(
              <div key={k}>
                <label style={{ fontSize:11, fontWeight:600, color:T.textMid, letterSpacing:".05em", textTransform:"uppercase", display:"block", marginBottom:4 }}>{l}</label>
                <input value={fields[k]||""} onChange={ff(k)} placeholder={`{{${k}}}`}
                  style={{ width:"100%", border:`1px solid ${T.border}`, borderRadius:6, padding:"7px 10px", fontSize:13, color:T.text, fontFamily:"inherit", outline:"none" }}/>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:8, marginTop:14 }}>
            <Btn onClick={()=>setPrev(true)}><EyeIco/> Preview Email</Btn>
            <Btn variant="secondary"><MailIco/> Send</Btn>
          </div>
        </div>
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:18, display:"flex", flexDirection:"column" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:600, color:T.text, textTransform:"capitalize" }}>{active} Template</div>
            <Btn sm variant="secondary" onClick={()=>setEdit(!editing)}>{editing?"View":"Edit"}</Btn>
          </div>
          <Lbl c="Subject"/>
          {editing
            ? <input value={tpls[active].subject} onChange={e=>setTpls(p=>({...p,[active]:{...p[active],subject:e.target.value}}))}
                style={{ width:"100%", border:`1px solid ${T.border}`, borderRadius:6, padding:"7px 10px", fontSize:13, color:T.text, fontFamily:"inherit", outline:"none", marginBottom:10 }}/>
            : <div style={{ background:T.grayLight, borderRadius:6, padding:"8px 10px", fontSize:13, color:T.text, border:`1px solid ${T.border}`, marginBottom:10 }}>{tpls[active].subject}</div>}
          <Lbl c="Body"/>
          {editing
            ? <textarea value={tpls[active].body} onChange={e=>setTpls(p=>({...p,[active]:{...p[active],body:e.target.value}}))} rows={13}
                style={{ border:`1px solid ${T.border}`, borderRadius:6, padding:"10px 12px", fontSize:12, color:T.text, fontFamily:"'DM Mono',monospace", outline:"none", resize:"none", lineHeight:1.75 }}/>
            : <pre style={{ background:T.grayLight, borderRadius:6, padding:"10px 12px", fontSize:12, color:T.textMid, fontFamily:"'DM Mono',monospace", whiteSpace:"pre-wrap", lineHeight:1.75, overflow:"auto", flex:1, border:`1px solid ${T.border}`, minHeight:200 }}>
                {tpls[active].body}
              </pre>}
          {editing && <div style={{ marginTop:10 }}><Btn sm onClick={()=>setEdit(false)}>Save</Btn></div>}
        </div>
      </div>
      {preview && <EmailPrevModal tplKey={active} vars={fields} onClose={()=>setPrev(false)}/>}
    </div>
  );
};

/* ─── SUMMARY ────────────────────────────────────────────────────────────────── */
const Summary = ({ shipments, complaints, repos, redeps }) => {
  const _now = new Date();
  const _curYM = `${_now.getFullYear()}-${String(_now.getMonth()+1).padStart(2,"0")}`;
  const _curFrom = `${_now.getFullYear()}-${String(_now.getMonth()+1).padStart(2,"0")}-01`;
  const _curTo   = _now.toISOString().split("T")[0]; // today

  const [range, setRange]           = useState("monthly");
  const [selectedMonth, setMon]     = useState(_curYM);
  const [selectedWeek, setWeek]     = useState("1");
  const [selectedWeekMonth, setWM]  = useState(_curYM);  // month picker for weekly mode
  const [fromVal, setFrom]          = useState(_curFrom);
  const [toVal, setTo]              = useState(_curTo);
  const [applied, setApplied]       = useState({ from:_curFrom, to:_curTo });
  // insights: { saved: { [periodLabel]: {achievements, challenges} }, editing: periodLabel|null, drafts: { [periodLabel]: {achievements, challenges} } }
  const [insights, setInsights] = useState({ saved:{}, editing:null, drafts:{} });

  // Derive date range from current selection
  const getRange = () => {
    if (range === "monthly") {
      return { from: selectedMonth+"-01", to: selectedMonth+"-31" };
    }
    if (range === "weekly") {
      const [yr, mo] = selectedWeekMonth.split("-").map(Number);
      const wk = parseInt(selectedWeek);
      const start = new Date(yr, mo-1, (wk-1)*7 + 1);
      const end   = new Date(yr, mo-1, (wk-1)*7 + 7);
      // Clamp end to last day of month
      const lastDay = new Date(yr, mo, 0).getDate();
      const endDay  = Math.min((wk-1)*7 + 7, lastDay);
      const endClamped = new Date(yr, mo-1, endDay);
      const fmt = d => d.toISOString().split("T")[0];
      return { from: fmt(start), to: fmt(endClamped) };
    }
    return applied; // custom
  };

  const { from: F, to: TT } = getRange();

  const inRange = (dateStr) => {
    if (!dateStr || dateStr === "TBA") return false;
    return dateStr >= F && dateStr <= TT;
  };

  // Repossession date: prefer expectedDate if it's a real date, else reshipDate
  // Only reshipDate (actual shipment date) is used for operational calculations.
  // expectedDate is informational only and must NOT be used in any calculations or summaries.
  const repoDate = (r) => r.reshipDate || "";

  // Filter all module data by date range
  const fShipments  = useMemo(() => shipments.filter(s  => inRange(s.orderDate)),    [shipments, F, TT]);
  const fComplaints = useMemo(() => complaints.filter(c => inRange(c.reported)),      [complaints, F, TT]);
  const fRepos      = useMemo(() => repos.filter(r      => inRange(repoDate(r))),     [repos, F, TT]);
  const fRedeps     = useMemo(() => redeps.filter(r     => inRange(r.orderDate)),     [redeps, F, TT]);

  const deployedPCs  = fShipments.filter(s=>s.status==="Completed").reduce((a,s)=>a+Number(s.cpus||0),0);
  const shipsComplete= fShipments.filter(s=>s.status==="Completed").length;
  const raised       = fComplaints.length;
  const solved       = fComplaints.filter(c=>c.status==="Solved").length;
  const rep          = fRepos.length;
  const red          = fRedeps.length;
  const rate         = raised > 0 ? Math.round((solved/raised)*100) : 0;

  // Build chart data — group filtered shipments and complaints by month
  const chartData = useMemo(() => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const byMonth = {};
    fShipments.forEach(s => {
      if (!s.orderDate) return;
      const m = months[parseInt(s.orderDate.split("-")[1])-1];
      if (!byMonth[m]) byMonth[m] = { period:m, shipments:0, raised:0, solved:0 };
      byMonth[m].shipments++;
    });
    fComplaints.forEach(c => {
      if (!c.reported) return;
      const m = months[parseInt(c.reported.split("-")[1])-1];
      if (!byMonth[m]) byMonth[m] = { period:m, shipments:0, raised:0, solved:0 };
      byMonth[m].raised++;
      if (c.status==="Solved") byMonth[m].solved++;
    });
    const order = [...new Set([...fShipments.map(s=>s.orderDate?.slice(0,7)), ...fComplaints.map(c=>c.reported?.slice(0,7))].filter(Boolean))].sort();
    return order.map(ym => byMonth[months[parseInt(ym.split("-")[1])-1]] || { period:months[parseInt(ym.split("-")[1])-1], shipments:0, raised:0, solved:0 });
  }, [fShipments, fComplaints]);

  const weekMonthLabel = new Date(selectedWeekMonth+"-15").toLocaleString("default",{month:"long",year:"numeric"});
  const periodLabel = range==="weekly"
    ? `Week ${selectedWeek} — ${weekMonthLabel}`
    : range==="monthly"
    ? new Date(selectedMonth+"-15").toLocaleString("default",{month:"long",year:"numeric"})
    : `${applied.from} → ${applied.to}`;

  const months = [];
  for (let y=2024; y<=2027; y++) for (let m=1; m<=12; m++) months.push(`${y}-${String(m).padStart(2,"0")}`);

  const handleClearCustom = () => {
    setFrom(_curFrom); setTo(_curTo);
    setApplied({ from:_curFrom, to:_curTo });
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:T.text }}>Summary Report</h2>
          <p style={{ fontSize:13, color:T.textMid, marginTop:2 }}>Operational statistics filtered by selected period</p>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {["weekly","monthly","custom"].map(r=>(
            <button key={r} onClick={()=>setRange(r)}
              style={{ padding:"7px 15px", borderRadius:6, fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit",
                border:range===r?`1px solid ${T.blue}`:`1px solid ${T.border}`,
                background:range===r?T.blue:"#fff", color:range===r?"#fff":T.textMid, textTransform:"capitalize", transition:"all .15s" }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Range selectors */}
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"14px 18px", marginBottom:18, display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
        {range === "monthly" && (<>
          <span style={{ fontSize:13, color:T.textMid, fontWeight:500 }}>Month:</span>
          <select value={selectedMonth} onChange={e=>setMon(e.target.value)}
            style={{ border:`1px solid ${T.border}`, borderRadius:6, padding:"6px 10px", fontSize:13, fontFamily:"inherit", color:T.text, outline:"none", cursor:"pointer" }}>
            {months.map(m=><option key={m} value={m}>{new Date(m+"-15").toLocaleString("default",{month:"long",year:"numeric"})}</option>)}
          </select>
        </>)}
        {range === "weekly" && (<>
          <span style={{ fontSize:13, color:T.textMid, fontWeight:500 }}>Month:</span>
          <select value={selectedWeekMonth} onChange={e=>{ setWM(e.target.value); setWeek("1"); }}
            style={{ border:`1px solid ${T.border}`, borderRadius:6, padding:"6px 10px", fontSize:13, fontFamily:"inherit", color:T.text, outline:"none", cursor:"pointer" }}>
            {months.map(m=><option key={m} value={m}>{new Date(m+"-15").toLocaleString("default",{month:"long",year:"numeric"})}</option>)}
          </select>
          <span style={{ fontSize:13, color:T.textMid, fontWeight:500 }}>Week:</span>
          {["1","2","3","4"].map(w=>(
            <button key={w} onClick={()=>setWeek(w)}
              style={{ padding:"5px 14px", borderRadius:5, border:selectedWeek===w?`1px solid ${T.blue}`:`1px solid ${T.border}`, background:selectedWeek===w?T.blue:"#fff", color:selectedWeek===w?"#fff":T.textMid, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:500 }}>
              Week {w}
            </button>
          ))}
        </>)}
        {range === "custom" && (<>
          <span style={{ fontSize:13, color:T.textMid, fontWeight:500, whiteSpace:"nowrap" }}>Date range:</span>
          <input type="date" value={fromVal} onChange={e=>setFrom(e.target.value)}
            style={{ border:`1px solid ${T.border}`, borderRadius:6, padding:"6px 10px", fontSize:13, fontFamily:"inherit", color:T.text, outline:"none" }}/>
          <span style={{ color:T.textLight }}>to</span>
          <input type="date" value={toVal} onChange={e=>setTo(e.target.value)}
            style={{ border:`1px solid ${T.border}`, borderRadius:6, padding:"6px 10px", fontSize:13, fontFamily:"inherit", color:T.text, outline:"none" }}/>
          <Btn sm onClick={()=>setApplied({ from:fromVal, to:toVal })}>Apply</Btn>
          <button onClick={handleClearCustom}
            style={{ padding:"5px 13px", borderRadius:5, border:`1px solid ${T.border}`, background:"#fff", color:T.textMid, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:500, display:"flex", alignItems:"center", gap:5 }}
            onMouseOver={e=>Object.assign(e.currentTarget.style,{background:"#fef2f2",borderColor:"#fca5a5",color:"#dc2626"})}
            onMouseOut={e=>Object.assign(e.currentTarget.style,{background:"#fff",borderColor:T.border,color:T.textMid})}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            Clear
          </button>
        </>)}
        <span style={{ marginLeft:"auto", fontSize:12, fontWeight:600, color:T.blue, background:T.blueLight, border:`1px solid ${T.blueMid}`, borderRadius:5, padding:"3px 12px", whiteSpace:"nowrap" }}>
          📅 {periodLabel}
        </span>
      </div>

      {/* KPI Cards — all from filtered data */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12, marginBottom:18 }}>
        {[
          { l:"PCs Deployed",         v:deployedPCs,   c:T.blue   },
          { l:"Shipments Completed",  v:shipsComplete, c:T.indigo },
          { l:"Complaints Raised",    v:raised,        c:"#ef4444"},
          { l:"Complaints Resolved",  v:solved,        c:T.green  },
          { l:"Repossessions",        v:rep,           c:"#7c3aed"},
          { l:"Redeployments",        v:red,           c:"#0891b2"},
        ].map((m,i)=>(
          <div key={i} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"18px 18px 14px", borderTop:`3px solid ${m.c}`, boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
            <div style={{ fontSize:10, fontWeight:600, color:T.textLight, letterSpacing:".07em", textTransform:"uppercase", marginBottom:6 }}>{m.l}</div>
            <div style={{ fontSize:30, fontWeight:700, color:m.c, fontVariantNumeric:"tabular-nums" }}>{m.v}</div>
          </div>
        ))}
      </div>

      {/* Resolution Rate */}
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"16px 18px", marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:9 }}>
          <span style={{ fontSize:13, fontWeight:600, color:T.text }}>Complaint Resolution Rate</span>
          <span style={{ fontSize:18, fontWeight:700, color:rate>=80?T.green:rate>=50?T.amber:T.red }}>{rate}%</span>
        </div>
        <div style={{ height:7, background:T.borderLight, borderRadius:4, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${rate}%`, background:rate>=80?"#22c55e":rate>=50?"#f59e0b":"#ef4444", borderRadius:4, transition:"width .6s ease" }}/>
        </div>
        <div style={{ fontSize:11, color:T.textLight, marginTop:6 }}>{solved} resolved of {raised} raised in this period</div>
      </div>

      {/* Activity Chart — from filtered data */}
      {chartData.length > 0 ? (
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:18, marginBottom:22, boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
          <div style={{ fontSize:13, fontWeight:600, color:T.text, marginBottom:14 }}>Activity Chart — {periodLabel}</div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={chartData} barSize={14} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="period" tick={{ fill:T.textLight,fontSize:11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:T.textLight,fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false}/>
              <Tooltip contentStyle={{ background:"#fff", border:`1px solid ${T.border}`, borderRadius:7, fontSize:12 }}/>
              <Legend wrapperStyle={{ fontSize:12 }}/>
              <Bar dataKey="shipments" fill={T.blue}   name="Shipments" radius={[3,3,0,0]}/>
              <Bar dataKey="raised"    fill="#ef4444"  name="Complaints Raised" radius={[3,3,0,0]}/>
              <Bar dataKey="solved"    fill={T.green}  name="Complaints Solved" radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"40px 18px", marginBottom:22, textAlign:"center" }}>
          <div style={{ fontSize:28, marginBottom:8 }}>📭</div>
          <div style={{ fontSize:14, fontWeight:600, color:T.textMid }}>No activity in this period</div>
          <div style={{ fontSize:13, color:T.textLight, marginTop:4 }}>Try a different date range to see data.</div>
        </div>
      )}

      {/* Data summary tables for period */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:22 }}>
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, overflow:"hidden" }}>
          <div style={{ padding:"10px 16px", borderBottom:`1px solid ${T.border}`, background:T.grayLight, fontSize:12, fontWeight:600, color:T.textMid, textTransform:"uppercase", letterSpacing:".06em" }}>
            Shipments in Period ({fShipments.length})
          </div>
          <div style={{ maxHeight:220, overflowY:"auto" }}>
            {fShipments.length===0 ? <div style={{ padding:"20px 16px", color:T.textLight, fontSize:13, textAlign:"center" }}>None</div>
            : fShipments.map(s=>(
              <div key={s.id} style={{ padding:"9px 16px", borderBottom:`1px solid ${T.borderLight}`, display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:13 }}>
                <div><div style={{ fontWeight:500, color:T.text }}>{s.pod}</div><div style={{ fontSize:11, color:T.textLight }}>{s.orderDate} · {s.cpus} CPUs</div></div>
                <Badge s={s.status}/>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, overflow:"hidden" }}>
          <div style={{ padding:"10px 16px", borderBottom:`1px solid ${T.border}`, background:T.grayLight, fontSize:12, fontWeight:600, color:T.textMid, textTransform:"uppercase", letterSpacing:".06em" }}>
            Complaints in Period ({fComplaints.length})
          </div>
          <div style={{ maxHeight:220, overflowY:"auto" }}>
            {fComplaints.length===0 ? <div style={{ padding:"20px 16px", color:T.textLight, fontSize:13, textAlign:"center" }}>None</div>
            : fComplaints.map(c=>(
              <div key={c.id} style={{ padding:"9px 16px", borderBottom:`1px solid ${T.borderLight}`, display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:13 }}>
                <div><div style={{ fontWeight:500, color:T.text }}>{c.pod}</div><div style={{ fontSize:11, color:T.textLight }}>{c.reported} · {c.org||c.phase}</div></div>
                <Badge s={c.status}/>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Insights with Save / Edit / Clear */}
      {(() => {
        const saved     = insights.saved  || {};
        const drafts    = insights.drafts || {};
        const hasSaved  = !!(saved[periodLabel]?.achievements || saved[periodLabel]?.challenges);
        const isEditing = insights.editing === periodLabel;

        // Draft for THIS period only — blank for any new period
        const draft = drafts[periodLabel] || { achievements:"", challenges:"" };

        const setDraft = (field, val) => {
          setInsights(p => ({
            ...p,
            drafts: { ...(p.drafts||{}), [periodLabel]: { ...(p.drafts||{})[periodLabel], [field]:val } }
          }));
        };

        const handleSave = () => {
          setInsights(p => ({
            ...p,
            saved:   { ...(p.saved||{}), [periodLabel]: { ...(p.drafts||{})[periodLabel] || { achievements:"", challenges:"" } } },
            editing: null,
          }));
        };
        const handleEdit = () => {
          const s = (insights.saved||{})[periodLabel] || {};
          // Load saved values into this period's draft so user can edit them
          setInsights(p => ({
            ...p,
            drafts:  { ...(p.drafts||{}), [periodLabel]: { achievements:s.achievements||"", challenges:s.challenges||"" } },
            editing: periodLabel,
          }));
        };
        const handleClear = () => {
          const newSaved  = { ...(insights.saved||{}) };
          const newDrafts = { ...(insights.drafts||{}) };
          delete newSaved[periodLabel];
          delete newDrafts[periodLabel];
          setInsights(p => ({ ...p, saved:newSaved, drafts:newDrafts, editing:null }));
        };

        // What to display in read-only view
        const displayText = hasSaved && !isEditing
          ? saved[periodLabel]
          : { achievements:"", challenges:"" };

        return (
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:18, marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:600, color:T.text }}>Operational Insights — <span style={{ color:T.blue }}>{periodLabel}</span></div>
              <div style={{ display:"flex", gap:7, alignItems:"center" }}>
                {hasSaved && !isEditing && (
                  <span style={{ fontSize:11, color:T.green, fontWeight:600, background:T.greenLight, border:"1px solid #bbf7d0", borderRadius:5, padding:"3px 9px", display:"flex", alignItems:"center", gap:4 }}>
                    <CheckIco color={T.green}/> Saved
                  </span>
                )}
                {(!hasSaved || isEditing) && (
                  <Btn sm onClick={handleSave}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    Save
                  </Btn>
                )}
                {hasSaved && !isEditing && (
                  <Btn sm variant="secondary" onClick={handleEdit}><EditIco/> Edit</Btn>
                )}
                {(hasSaved || isEditing) && (
                  <Btn sm variant="danger" onClick={handleClear}>
                    <TrashIco/> Clear
                  </Btn>
                )}
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:T.green, textTransform:"uppercase", letterSpacing:".06em", marginBottom:6 }}>✓ Achievements</div>
                {hasSaved && !isEditing
                  ? <div style={{ fontSize:13, color:T.text, lineHeight:1.7, background:T.grayLight, border:`1px solid ${T.border}`, borderRadius:6, padding:"12px 14px", minHeight:80, whiteSpace:"pre-wrap" }}>
                      {displayText.achievements || <span style={{ color:T.textLight }}>No achievements recorded.</span>}
                    </div>
                  : <textarea className="insight-ta" rows={5} placeholder="Note key wins, milestones, and successes for this period…"
                      value={draft.achievements||""} onChange={e=>setDraft("achievements", e.target.value)}/>
                }
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:T.red, textTransform:"uppercase", letterSpacing:".06em", marginBottom:6 }}>⚠ Challenges</div>
                {hasSaved && !isEditing
                  ? <div style={{ fontSize:13, color:T.text, lineHeight:1.7, background:T.grayLight, border:`1px solid ${T.border}`, borderRadius:6, padding:"12px 14px", minHeight:80, whiteSpace:"pre-wrap" }}>
                      {displayText.challenges || <span style={{ color:T.textLight }}>No challenges recorded.</span>}
                    </div>
                  : <textarea className="insight-ta" rows={5} placeholder="Note issues, blockers, and areas needing improvement…"
                      value={draft.challenges||""} onChange={e=>setDraft("challenges", e.target.value)}/>
                }
              </div>
            </div>
          </div>
        );
      })()}

      {/* Export Report */}
      <div style={{ display:"flex", justifyContent:"flex-end", marginTop:12 }}>
        <Btn onClick={()=>{
          const saved = (insights.saved||{})[periodLabel]||{};
          const lines = [
            `CMD PORTAL — SUMMARY REPORT`,`Period: ${periodLabel}`,`Generated: ${new Date().toLocaleString()}`,``,
            `─── SHIPMENTS ───────────────────`,
            `Total Shipments: ${fShipments.length}`,
            `Completed: ${fShipments.filter(s=>s.status==="Completed").length}`,
            `Order Placed: ${fShipments.filter(s=>s.status==="Order Placed").length}`,
            `PCs Deployed: ${deployedPCs}`,``,
            `─── COMPLAINTS ──────────────────`,
            `Total: ${raised}  |  In Progress: ${fComplaints.filter(c=>c.status==="In Progress").length}  |  Solved: ${solved}`,
            `Resolution Rate: ${rate}%`,``,
            `─── REPOSSESSIONS ───────────────`,
            `Records: ${fRepos.length}`,``,
            `─── REDEPLOYMENTS ───────────────`,
            `Records: ${fRedeps.length}  |  Completed: ${fRedeps.filter(r=>r.status==="Completed").length}`,``,
            `─── ACHIEVEMENTS ────────────────`,
            saved.achievements||"(none recorded)",``,
            `─── CHALLENGES ──────────────────`,
            saved.challenges||"(none recorded)",
          ];
          const blob = new Blob([lines.join("\n")], {type:"text/plain"});
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = `CMD_Report_${periodLabel.replace(/[^a-z0-9]/gi,"_")}.txt`;
          a.click();
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export Report
        </Btn>
      </div>
    </div>
  );
};

/* ─── ICONS ──────────────────────────────────────────────────────────────────── */
const PlusIco  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>;
const MailIco  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const EyeIco   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const CheckIco = ({ color }) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color||"currentColor"} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const SendIco  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const TrashIco = ({ size=12, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
const EditIco  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;

/* ─── NAV ────────────────────────────────────────────────────────────────────── */
const NAV = [
  { id:"overview",     label:"Overview",     icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { id:"shipments",    label:"Shipments",    icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg> },
  { id:"complaints",   label:"Complaints",   icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg> },
  { id:"repossession", label:"Repossession", icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg> },
  { id:"redeployment", label:"Redeployment", icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg> },
  { id:"templates",    label:"Templates",    icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> },
  { id:"summary",      label:"Summary",      icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> },
];

/* ─── APP ────────────────────────────────────────────────────────────────────── */
export default function App() {
  const [page, setPage]             = useState("overview");
  const [shipments,  setShipments]  = useState(INIT_SHIPMENTS);
  const [complaints, setComplaints] = useState(INIT_COMPLAINTS);
  const [repos,      setRepos]      = useState(INIT_REPOSSESSIONS);
  const [redeps,     setRedeps]     = useState(INIT_REDEPLOYMENTS);

  const renderPage = () => {
    const p = { shipments, setShipments, complaints, setComplaints, repos, setRepos, redeps, setRedeps };
    switch(page) {
      case "overview":     return <Overview     {...p}/>;
      case "shipments":    return <Shipments    {...p}/>;
      case "complaints":   return <Complaints   {...p}/>;
      case "repossession": return <Repossession {...p}/>;
      case "redeployment": return <Redeployment {...p}/>;
      case "templates":    return <Templates    {...p}/>;
      case "summary":      return <Summary      {...p}/>;
      default:             return <Overview     {...p}/>;
    }
  };

  return (
    <>
      <style>{`${STYLE}
        body > div.flex.h-screen.bg-gray-50 > aside { display: none !important; }
        body > div.flex.h-screen.bg-gray-50 > main { width: 100% !important; flex: 1 1 auto !important; }
      `}</style>
      <div style={{ display:"flex", height:"100vh", background:T.bg, fontFamily:"'DM Sans',sans-serif", overflow:"hidden" }}>
        {/* Sidebar */}
        <aside style={{ width:218, background:T.sidebar, display:"flex", flexDirection:"column", flexShrink:0, boxShadow:"2px 0 12px rgba(0,0,0,.15)" }}>
          <div style={{ padding:"18px 16px 14px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#1d4ed8,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 2px 8px rgba(29,78,216,.4)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:"#fff", lineHeight:1.2, letterSpacing:"-.01em" }}>CMD Portal</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>Computer Management</div>
              </div>
            </div>
          </div>
          <nav style={{ flex:1, padding:"10px 8px", display:"flex", flexDirection:"column", gap:1 }}>
            <div style={{ fontSize:9, fontWeight:600, color:"rgba(255,255,255,0.22)", letterSpacing:".12em", textTransform:"uppercase", padding:"8px 10px 6px" }}>Navigation</div>
            {NAV.map(item => {
              const active = page===item.id;
              return (
                <button key={item.id} onClick={()=>setPage(item.id)}
                  className={active?"":"nav-btn"}
                  style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 10px", borderRadius:7, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:active?600:400, color:active?"#fff":"rgba(255,255,255,0.48)", background:active?T.sidebarActive:"transparent", border:"none", textAlign:"left", width:"100%", transition:"all .15s" }}>
                  <span style={{ opacity:active?1:0.6, flexShrink:0 }}>{item.icon}</span>
                  {item.label}
                  {active && <span style={{ marginLeft:"auto", width:5, height:5, borderRadius:"50%", background:"#60a5fa", flexShrink:0 }}/>}
                </button>
              );
            })}
          </nav>
          <div style={{ padding:"10px 12px 16px", borderTop:"1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 6px", borderRadius:7, background:"rgba(255,255,255,0.04)" }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#1d4ed8,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"#fff", flexShrink:0 }}>AD</div>
              <div><div style={{ fontSize:12, fontWeight:600, color:"#fff" }}>Admin</div><div style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>cmd@portal.com</div></div>
            </div>
          </div>
        </aside>

        <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
          {/* Header */}
          <header style={{ height:52, background:"#fff", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px", flexShrink:0, boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:14, fontWeight:700, color:T.text, textTransform:"capitalize" }}>{page}</span>
              <span style={{ fontSize:11, color:T.textLight, background:T.grayLight, border:`1px solid ${T.border}`, borderRadius:4, padding:"2px 8px" }}>CMD Portal</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:12, color:T.textMid, fontWeight:400 }}>{new Date().toLocaleDateString("en-GB",{ weekday:"short", day:"2-digit", month:"short", year:"numeric" })}</span>
              <div style={{ width:1, height:16, background:T.border }}/>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#1d4ed8,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#fff" }}>AD</div>
                <span style={{ fontSize:13, fontWeight:500, color:T.text }}>Admin</span>
              </div>
            </div>
          </header>
          <main style={{ flex:1, overflowY:"auto", padding:24 }}>
            <div className="fade" key={page}>{renderPage()}</div>
          </main>
        </div>
      </div>
    </>
  );
}
