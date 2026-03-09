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
  peripherals: z
    .string()
    .min(1, 'Peripherals information is required')
    .max(500, 'Peripherals must be less than 500 characters'),
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
  setupDate: z
    .string()
    .optional()
    .nullable()
    .transform(str => str ? new Date(str) : null),
  totalCost: z
    .number()
    .positive('Total cost must be positive')
    .max(99999999.99, 'Total cost exceeds maximum value'),
  notes: z.string().max(1000).optional(),
})

export const shipmentCreateSchema = shipmentBaseSchema.refine(data => {
  // Validate date logic
  if (data.dispatchDate && data.dispatchDate < data.orderDate) {
    return false
  }
  if (data.deliveryDate && data.dispatchDate && data.deliveryDate < data.dispatchDate) {
    return false
  }
  if (data.setupDate && data.deliveryDate && data.setupDate < data.deliveryDate) {
    return false
  }
  return true
}, {
  message: 'Invalid date sequence: dispatch must be after order, delivery after dispatch, setup after delivery',
})

export const shipmentUpdateSchema = shipmentBaseSchema.partial()

// ==================== Complaint Validations ====================

export const complaintCreateSchema = z.object({
  computerId: z
    .string()
    .min(1, 'Computer ID is required')
    .max(50, 'Computer ID must be less than 50 characters'),
  issue: z
    .string()
    .min(5, 'Issue must be at least 5 characters')
    .max(200, 'Issue must be less than 200 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], {
    message: 'Invalid priority level',
  }),
  notes: z.string().max(1000).optional(),
})

export const complaintUpdateSchema = complaintCreateSchema.partial().extend({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'SOLVED', 'CLOSED']).optional(),
  resolvedAt: z
    .string()
    .optional()
    .nullable()
    .transform(str => str ? new Date(str) : null),
})

// ==================== Repossession Validations ====================

export const repossessionCreateSchema = z.object({
  podName: z
    .string()
    .min(1, 'POD name is required')
    .max(200, 'POD name must be less than 200 characters'),
  computerId: z
    .string()
    .min(1, 'Computer ID is required')
    .max(50, 'Computer ID must be less than 50 characters'),
  reason: z
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must be less than 500 characters'),
  notes: z.string().max(1000).optional(),
})

export const repossessionUpdateSchema = repossessionCreateSchema.partial().extend({
  status: z.enum(['PENDING', 'SCHEDULED', 'COLLECTED', 'COMPLETED', 'CANCELLED']).optional(),
  collectedAt: z
    .string()
    .optional()
    .nullable()
    .transform(str => str ? new Date(str) : null),
})

// ==================== Redeployment Validations ====================

export const redeploymentCreateSchema = z.object({
  shipmentId: z.string().optional().nullable(),
  destination: z
    .string()
    .min(5, 'Destination must be at least 5 characters')
    .max(200, 'Destination must be less than 200 characters'),
  notes: z.string().max(1000).optional(),
})

export const redeploymentUpdateSchema = redeploymentCreateSchema.partial().extend({
  status: z.enum(['PROCESSING', 'SCHEDULED', 'DEPLOYED', 'COMPLETED', 'CANCELLED']).optional(),
  deployedAt: z
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
    .default('10')
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
