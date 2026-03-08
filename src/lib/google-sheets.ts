import { google, Auth } from 'googleapis'

// Type guards for validation
const isValidStatus = (value: string): value is 'Processing' | 'In Transit' | 'Delivered' | 'Pending' =>
  ['Processing', 'In Transit', 'Delivered', 'Pending'].includes(value)

const isValidIssueType = (value: string): value is 'Hardware' | 'Software' | 'Network' | 'Other' =>
  ['Hardware', 'Software', 'Network', 'Other'].includes(value)

const isValidPriority = (value: string): value is 'High' | 'Medium' | 'Low' =>
  ['High', 'Medium', 'Low'].includes(value)

const isValidComplaintStatus = (value: string): value is 'Pending' | 'In Progress' | 'Solved' =>
  ['Pending', 'In Progress', 'Solved'].includes(value)

const isValidCondition = (value: string): value is 'Good' | 'Fair' | 'Needs Repair' =>
  ['Good', 'Fair', 'Needs Repair'].includes(value)

const isValidRepossessionStatus = (value: string): value is 'Available' | 'Under Repair' | 'Redeployed' =>
  ['Available', 'Under Repair', 'Redeployed'].includes(value)

const isValidRedeploymentStatus = (value: string): value is 'Processing' | 'In Transit' | 'Delivered' =>
  ['Processing', 'In Transit', 'Delivered'].includes(value)

// Types for Google Sheets data
export interface ShipmentData {
  id: string
  podName: string
  shippingAddress: string
  contactPerson: string
  mobileNumber: string
  peripherals: string
  orderDate: string
  dispatchDate: string | null
  deliveryDate: string | null
  setupDate: string | null
  status: 'Processing' | 'In Transit' | 'Delivered' | 'Pending'
  totalCost: number
}

export interface ComplaintData {
  id: string
  podName: string
  complaintDate: string
  issueType: 'Hardware' | 'Software' | 'Network' | 'Other'
  description: string
  priority: 'High' | 'Medium' | 'Low'
  status: 'Pending' | 'In Progress' | 'Solved'
  assignedTo: string | null
  resolutionDate: string | null
}

export interface RepossessionData {
  id: string
  podName: string
  repoDate: string
  pcCount: number
  reason: string
  condition: 'Good' | 'Fair' | 'Needs Repair'
  storageLocation: string
  status: 'Available' | 'Under Repair' | 'Redeployed'
  remarks: string
}

export interface RedeploymentData {
  id: string
  sourceRepo: string
  sourcePOD: string
  destinationPOD: string
  pcCount: number
  shipDate: string
  deliveryDate: string | null
  status: 'Processing' | 'In Transit' | 'Delivered'
  complaintResolved: string | null
}

interface ServiceAccountCredentials {
  client_email: string
  private_key: string
}

class GoogleSheetsService {
  private auth: Auth.JWT

  constructor(credentials: ServiceAccountCredentials) {
    this.auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })
  }

  private async getSheets() {
    const sheets = google.sheets({ version: 'v4', auth: this.auth })
    return sheets
  }

  async getShipments(spreadsheetId: string, range = 'Shipments!A1:Z1000'): Promise<ShipmentData[]> {
    const sheets = await this.getSheets()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    })

    if (!response.data.values) return []

    const rows = response.data.values.slice(1) // Skip header row
    return rows.map(row => {
      const status = row[10]
      return {
        id: row[0] || '',
        podName: row[1] || '',
        shippingAddress: row[2] || '',
        contactPerson: row[3] || '',
        mobileNumber: row[4] || '',
        peripherals: row[5] || '',
        orderDate: row[6] || '',
        dispatchDate: row[7] || null,
        deliveryDate: row[8] || null,
        setupDate: row[9] || null,
        status: status && isValidStatus(status) ? status : 'Pending',
        totalCost: Number(row[11]) || 0,
      }
    })
  }

  async getComplaints(spreadsheetId: string, range = 'Complaints!A1:Z1000'): Promise<ComplaintData[]> {
    const sheets = await this.getSheets()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    })

    if (!response.data.values) return []

    const rows = response.data.values.slice(1)
    return rows.map(row => {
      const issueType = row[3]
      const priority = row[5]
      const status = row[6]
      return {
        id: row[0] || '',
        podName: row[1] || '',
        complaintDate: row[2] || '',
        issueType: issueType && isValidIssueType(issueType) ? issueType : 'Other',
        description: row[4] || '',
        priority: priority && isValidPriority(priority) ? priority : 'Medium',
        status: status && isValidComplaintStatus(status) ? status : 'Pending',
        assignedTo: row[7] || null,
        resolutionDate: row[8] || null,
      }
    })
  }

  async getRepossessions(spreadsheetId: string, range = 'Repossessions!A1:Z1000'): Promise<RepossessionData[]> {
    const sheets = await this.getSheets()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    })

    if (!response.data.values) return []

    const rows = response.data.values.slice(1)
    return rows.map(row => {
      const condition = row[5]
      const status = row[7]
      return {
        id: row[0] || '',
        podName: row[1] || '',
        repoDate: row[2] || '',
        pcCount: Number(row[3]) || 0,
        reason: row[4] || '',
        condition: condition && isValidCondition(condition) ? condition : 'Good',
        storageLocation: row[6] || '',
        status: status && isValidRepossessionStatus(status) ? status : 'Available',
        remarks: row[8] || '',
      }
    })
  }

  async getRedeployments(spreadsheetId: string, range = 'Redeployments!A1:Z1000'): Promise<RedeploymentData[]> {
    const sheets = await this.getSheets()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    })

    if (!response.data.values) return []

    const rows = response.data.values.slice(1)
    return rows.map(row => {
      const status = row[7]
      return {
        id: row[0] || '',
        sourceRepo: row[1] || '',
        sourcePOD: row[2] || '',
        destinationPOD: row[3] || '',
        pcCount: Number(row[4]) || 0,
        shipDate: row[5] || '',
        deliveryDate: row[6] || null,
        status: status && isValidRedeploymentStatus(status) ? status : 'Processing',
        complaintResolved: row[8] || null,
      }
    })
  }
}

export default GoogleSheetsService
