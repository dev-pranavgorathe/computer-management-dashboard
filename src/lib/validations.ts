import { z } from 'zod'

// ==================== User Validations ====================

export const signUpSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().transform(e => e.toLowerCase()),
  password: z.string().min(8).max(100),
})

export const signInSchema = z.object({
  email: z.string().email().transform(e => e.toLowerCase()),
  password: z.string().min(1),
})

// ==================== Shipment Validations ====================

export const SHIPMENT_STATUSES = ['PENDING', 'ORDER_SENT', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'] as const
export const SHIPMENT_PURPOSES = ['NEW_POD', 'MANTHAN_POD', 'TEACH_TO_EARN', 'PERIPHERALS', 'OTHER'] as const

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry',
] as const

export const RESOLUTION_METHODS = ['REPAIRED', 'REPLACED_UNDER_WARRANTY', 'REPLACED_OUT_OF_WARRANTY', 'REDEPLOYMENT', 'OTHER'] as const

export const DEVICE_TYPES = ['CPU', 'MONITOR', 'KEYBOARD', 'MOUSE', 'WEBCAM', 'HEADPHONES', 'PSU', 'NETWORK_ADAPTER', 'OTHER'] as const

// Shipment validation - make all optional fields truly optional
export const shipmentCreateSchema = z.object({
  podName: z.string().min(1).max(200).optional(),
  shippingAddress: z.string().max(500).optional(),
  state: z.string().max(100).optional().nullable(),
  pincode: z.string().max(10).optional().nullable(),
  contactPerson: z.string().max(100).optional(),
  mobileNumber: z.string().max(20).optional(),
  cpus: z.number().int().min(1).max(100).optional().default(1),
  components: z.string().max(1000).optional().nullable(),
  serials: z.string().max(2000).optional().nullable(),
  trackingId: z.string().max(100).optional().nullable(),
  qcReport: z.string().max(255).optional().nullable(),
  signedQc: z.string().max(255).optional().nullable(),
  additionalDocs: z.string().max(2000).optional().nullable(),
  purpose: z.string().max(100).optional().default('NEW_POD'),
  orderDate: z.string().optional(),
  dispatchDate: z.string().optional().nullable(),
  deliveryDate: z.string().optional().nullable(),
  totalCost: z.number().min(0).max(99999999.99).optional().default(0),
  notes: z.string().max(1000).optional().nullable(),
  ownerId: z.string().optional().nullable(),
  team: z.string().max(100).optional().nullable(),
  location: z.string().max(150).optional().nullable(),
})

export const shipmentUpdateSchema = shipmentCreateSchema.partial().extend({
  status: z.enum(SHIPMENT_STATUSES).optional(),
  mailSent: z.boolean().optional(),
  mailSentAt: z.string().optional().nullable(),
})

// ==================== Complaint Validations ====================

export const COMPLAINT_STATUSES = ['OPEN', 'IN_PROGRESS', 'SOLVED'] as const

export const complaintCreateSchema = z.object({
  podName: z.string().min(1).max(200).optional(),
  phase: z.string().max(50).optional().nullable(),
  deviceType: z.string().max(50).optional().default('CPU'),
  deviceSerial: z.string().max(100).optional().nullable(),
  issue: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  contactPerson: z.string().max(100).optional().nullable(),
  mobileNumber: z.string().max(20).optional().nullable(),
  attachments: z.string().max(2000).optional().nullable(),
  priority: z.string().max(20).optional().default('MEDIUM'),
  ticket: z.string().max(50).optional().nullable(),
})

export const complaintUpdateSchema = complaintCreateSchema.partial().extend({
  status: z.enum(COMPLAINT_STATUSES).optional(),
  resolution: z.string().max(1000).optional().nullable(),
  resolutionMethod: z.string().max(100).optional().nullable(),
  remarks: z.string().max(1000).optional().nullable(),
  solvedDate: z.string().optional().nullable(),
  mailSent: z.boolean().optional(),
  mailSentAt: z.string().optional().nullable(),
})

// ==================== Repossession Validations ====================

export const REPOSSESSION_STATUSES = ['PENDING', 'COLLECTED', 'IN_PROGRESS', 'COMPLETED'] as const

export const repossessionCreateSchema = z.object({
  podName: z.string().min(1).max(200).optional(),
  shippingAddress: z.string().max(500).optional().nullable(),
  contactPerson: z.string().max(100).optional().nullable(),
  mobileNumber: z.string().max(20).optional().nullable(),
  components: z.string().max(1000).optional().nullable(),
  serials: z.string().max(2000).optional().nullable(),
  reshippedDate: z.string().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  ticket: z.string().max(50).optional().nullable(),
})

export const repossessionUpdateSchema = repossessionCreateSchema.partial().extend({
  status: z.enum(REPOSSESSION_STATUSES).optional(),
})

// ==================== Redeployment Validations ====================

export const REDEPLOYMENT_STATUSES = ['PENDING', 'ORDER_SENT', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'] as const

export const redeploymentCreateSchema = z.object({
  podName: z.string().min(1).max(200).optional(),
  shippingAddress: z.string().max(500).optional().nullable(),
  contactPerson: z.string().max(100).optional().nullable(),
  mobileNumber: z.string().max(20).optional().nullable(),
  sourcePod: z.string().max(200).optional().nullable(),
  components: z.string().max(1000).optional().nullable(),
  serials: z.string().max(2000).optional().nullable(),
  complaintTicket: z.string().max(50).optional().nullable(),
  trackingId: z.string().max(100).optional().nullable(),
  orderDate: z.string().optional(),
  dispatchDate: z.string().optional().nullable(),
  deliveryDate: z.string().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
})

export const redeploymentUpdateSchema = redeploymentCreateSchema.partial().extend({
  status: z.enum(REDEPLOYMENT_STATUSES).optional(),
})

// ==================== Query Validations ====================

export const paginationSchema = z.object({
  page: z.string().optional().default('1').transform(Number).refine(n => n > 0),
  limit: z.string().optional().default('50').transform(Number).refine(n => n > 0 && n <= 100),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

export const idParamSchema = z.object({
  id: z.string().cuid('Invalid ID format'),
})

// ==================== Type Exports ====================

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ShipmentCreateInput = z.infer<typeof shipmentCreateSchema>
export type ShipmentUpdateInput = z.infer<typeof shipmentUpdateSchema>
export type ComplaintCreateInput = z.infer<typeof complaintCreateSchema>
export type ComplaintUpdateInput = z.infer<typeof complaintUpdateSchema>
export type RepossessionCreateInput = z.infer<typeof repossessionCreateSchema>
export type RepossessionUpdateInput = z.infer<typeof repossessionUpdateSchema>
export type RedeploymentCreateInput = z.infer<typeof redeploymentCreateSchema>
export type RedeploymentUpdateInput = z.infer<typeof redeploymentUpdateSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
