import { google } from 'googleapis'

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

class GoogleSheetsService {
  private auth: any

  constructor(credentials: any) {
    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      null
    )
    this.auth = auth
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
    return rows.map(row => ({
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
      status: row[10] as any || 'Pending',
      totalCost: Number(row[11]) || 0,
    }))
  }

  async getComplaints(spreadsheetId: string, range = 'Complaints!A1:Z1000'): Promise<ComplaintData[]> {
    const sheets = await this.getSheets()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    })

    if (!response.data.values) return []

    const rows = response.data.values.slice(1)
    return rows.map(row => ({
      id: row[0] || '',
      podName: row[1] || '',
      complaintDate: row[2] || '',
      issueType: row[3] as any || 'Other',
      description: row[4] || '',
      priority: row[5] as any || 'Medium',
      status: row[6] as any || 'Pending',
      assignedTo: row[7] || null,
      resolutionDate: row[8] || null,
    }))
  }

  async getRepossessions(spreadsheetId: string, range = 'Repossessions!A1:Z1000'): Promise<RepossessionData[]> {
    const sheets = await this.getSheets()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    })

    if (!response.data.values) return []

    const rows = response.data.values.slice(1)
    return rows.map(row => ({
      id: row[0] || '',
      podName: row[1] || '',
      repoDate: row[2] || '',
      pcCount: Number(row[3]) || 0,
      reason: row[4] || '',
      condition: row[5] as any || 'Good',
      storageLocation: row[6] || '',
      status: row[7] as any || 'Available',
      remarks: row[8] || '',
    }))
  }

  async getRedeployments(spreadsheetId: string, range = 'Redeployments!A1:Z1000'): Promise<RedeploymentData[]> {
    const sheets = await this.getSheets()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    })

    if (!response.data.values) return []

    const rows = response.data.values.slice(1)
    return rows.map(row => ({
      id: row[0] || '',
      sourceRepo: row[1] || '',
      sourcePOD: row[2] || '',
      destinationPOD: row[3] || '',
      pcCount: Number(row[4]) || 0,
      shipDate: row[5] || '',
      deliveryDate: row[6] || null,
      status: row[7] as any || 'Processing',
      complaintResolved: row[8] || null,
    }))
  }
}

export default GoogleSheetsService
