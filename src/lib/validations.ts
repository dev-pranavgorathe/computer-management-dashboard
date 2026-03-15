import { z } from 'zod'

// ==================== User Validations ====================

export const signUpSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .transform(email => email.toLowerCase()),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export const signInSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .transform(email => email.toLowerCase()),
  password: z.string().min(1, 'Password is required'),
})

// ==================== Shipment Validations ====================

// PRD: Status pipeline - Pending → Order Sent → Dispatched → In Transit → Delivered → Completed
export const SHIPMENT_STATUSES = ['PENDING', 'ORDER_SENT', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'] as const

const shipmentBaseSchema = z.object({
  podName: z
    .string()
    .min(1, 'POD name is required')
    .max(200, 'POD name must be less than 200 characters'),
  shippingAddress: z
    .string()
    .min(10, 'Shipping address must be at least 10 characters')
    .max(500, 'Shipping address must be less than 500 characters'),
  contactPerson: z
    .string()
    .min(2, 'Contact person name must be at least 2 characters')
    .max(100, 'Contact person name must be less than 100 characters'),
  mobileNumber: z
    .string()
    .regex(/^\+?[\d\s\-()]{10,15}$/, 'Invalid phone number format'),
  
  // PRD fields
  cpus: z
    .number()
    .int('CPU count must be a whole number')
    .min(1, 'At least 1 CPU is required')
    .max(100, 'Maximum 100 CPUs allowed')
    .default(1),
  components: z
    .string()
    .max(1000, 'Components must be less than 1000 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  serials: z
    .string()
    .max(2000, 'Serials must be less than 2000 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  trackingId: z
    .string()
    .max(100, 'Tracking ID must be less than 100 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  qcReport: z
    .string()
    .max(255, 'QC report filename must be less than 255 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  signedQc: z
    .string()
    .max(255, 'Signed QC filename must be less than 255 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  
  orderDate: z
    .string()
    .transform(str => new Date(str))
    .refine(date => date <= new Date(), 'Order date cannot be in the future'),
  dispatchDate: z
    .string()
    .optional()
    .nullable()
    .transform(str => str ? new Date(str) : null),
  deliveryDate: z
    .string()
    .optional()
    .nullable()
    .transform(str => str ? new Date(str) : null),
  totalCost: z
    .number()
    .min(0, 'Total cost cannot be negative')
    .max(99999999.99, 'Total cost exceeds maximum value')
    .optional()
    .default(0),
  notes: z.string().max(1000).optional().nullable().or(z.literal('')),
  ownerId: z.string().cuid('Invalid owner ID').optional().nullable(),
  team: z.string().max(100, 'Team must be less than 100 characters').optional().nullable().or(z.literal('')),
  location: z.string().max(150, 'Location must be less than 150 characters').optional().nullable().or(z.literal('')),
})

export const shipmentCreateSchema = shipmentBaseSchema.refine(data => {
  // Validate date logic
  if (data.dispatchDate && data.dispatchDate < data.orderDate) {
    return false
  }
  if (data.deliveryDate && data.dispatchDate && data.deliveryDate < data.dispatchDate) {
    return false
  }
  return true
}, {
  message: 'Invalid date sequence: dispatch must be after order, delivery after dispatch',
})

export const shipmentUpdateSchema = shipmentBaseSchema.partial().extend({
  status: z.enum(SHIPMENT_STATUSES).optional(),
})

// ==================== Complaint Validations ====================

// PRD: Open → In Progress → Solved
export const COMPLAINT_STATUSES = ['OPEN', 'IN_PROGRESS', 'SOLVED'] as const
export const DEVICE_TYPES = ['MONITOR', 'CPU', 'KEYBOARD', 'MOUSE', 'WEBCAM', 'HEADPHONES', 'PSU', 'NETWORK_ADAPTER', 'OTHER'] as const

export const complaintCreateSchema = z.object({
  podName: z
    .string()
    .min(1, 'POD name is required')
    .max(200, 'POD name must be less than 200 characters'),
  phase: z
    .string()
    .max(50, 'Phase must be less than 50 characters')
    .optional(), // Optional at creation per PRD
  deviceType: z
    .enum(DEVICE_TYPES)
    .default('CPU'),
  deviceSerial: z
    .string()
    .max(100, 'Device serial must be less than 100 characters')
    .optional(),
  issue: z
    .string()
    .min(5, 'Issue must be at least 5 characters')
    .max(200, 'Issue must be less than 200 characters'),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  contactPerson: z
    .string()
    .max(100, 'Contact person must be less than 100 characters')
    .optional(),
  mobileNumber: z
    .string()
    .regex(/^\+?[\d\s\-()]{10,15}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  attachments: z
    .string()
    .max(2000, 'Attachments must be less than 2000 characters')
    .optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
})

export const complaintUpdateSchema = complaintCreateSchema.partial().extend({
  status: z.enum(COMPLAINT_STATUSES).optional(),
  resolution: z.string().max(1000).optional(),
  remarks: z.string().max(1000).optional(),
  solvedDate: z
    .string()
    .optional()
    .nullable()
    .transform(str => str ? new Date(str) : null),
})

// ==================== Repossession Validations ====================

// PRD: Pending → Collected → In Progress → Completed
export const REPOSSESSION_STATUSES = ['PENDING', 'COLLECTED', 'IN_PROGRESS', 'COMPLETED'] as const

export const repossessionCreateSchema = z.object({
  podName: z
    .string()
    .min(1, 'POD name is required')
    .max(200, 'POD name must be less than 200 characters'),
  shippingAddress: z
    .string()
    .max(500, 'Address must be less than 500 characters')
    .optional(),
  contactPerson: z
    .string()
    .max(100, 'Contact person must be less than 100 characters')
    .optional(),
  mobileNumber: z
    .string()
    .regex(/^\+?[\d\s\-()]{10,15}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  components: z
    .string()
    .max(1000, 'Components must be less than 1000 characters')
    .optional(),
  serials: z
    .string()
    .max(2000, 'Serials must be less than 2000 characters')
    .optional(),
  notes: z.string().max(1000).optional(),
})

export const repossessionUpdateSchema = repossessionCreateSchema.partial().extend({
  status: z.enum(REPOSSESSION_STATUSES).optional(),
  reshippedDate: z
    .string()
    .optional()
    .nullable()
    .transform(str => str ? new Date(str) : null),
})

// ==================== Redeployment Validations ====================

// PRD: Pending → Order Sent → In Transit → Delivered → Completed
export const REDEPLOYMENT_STATUSES = ['PENDING', 'ORDER_SENT', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'] as const

export const redeploymentCreateSchema = z.object({
  podName: z
    .string()
    .min(1, 'Destination POD name is required')
    .max(200, 'POD name must be less than 200 characters'),
  shippingAddress: z
    .string()
    .max(500, 'Address must be less than 500 characters')
    .optional(),
  contactPerson: z
    .string()
    .max(100, 'Contact person must be less than 100 characters')
    .optional(),
  mobileNumber: z
    .string()
    .regex(/^\+?[\d\s\-()]{10,15}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  sourcePod: z
    .string()
    .max(200, 'Source POD must be less than 200 characters')
    .optional(),
  components: z
    .string()
    .max(1000, 'Components must be less than 1000 characters')
    .optional(),
  serials: z
    .string()
    .max(2000, 'Serials must be less than 2000 characters')
    .optional(),
  complaintTicket: z
    .string()
    .max(50, 'Complaint ticket must be less than 50 characters')
    .optional(),
  trackingId: z
    .string()
    .max(100, 'Tracking ID must be less than 100 characters')
    .optional(),
  orderDate: z
    .string()
    .optional()
    .transform(str => str ? new Date(str) : new Date()),
  notes: z.string().max(1000).optional(),
})

export const redeploymentUpdateSchema = redeploymentCreateSchema.partial().extend({
  status: z.enum(REDEPLOYMENT_STATUSES).optional(),
  dispatchDate: z
    .string()
    .optional()
    .nullable()
    .transform(str => str ? new Date(str) : null),
  deliveryDate: z
    .string()
    .optional()
    .nullable()
    .transform(str => str ? new Date(str) : null),
})

// ==================== Query Validations ====================

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .refine(n => n > 0, 'Page must be positive'),
  limit: z
    .string()
    .optional()
    .default('50')
    .transform(Number)
    .refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100'),
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
