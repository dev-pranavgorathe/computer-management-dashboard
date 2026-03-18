'use client'

import React from 'react'
import { X, Send, Mail } from 'lucide-react'

interface EmailTemplate {
  subject: string
  body: string
}

interface EmailPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSend?: () => void
  templateType: 'shipment' | 'complaint' | 'repossession' | 'redeployment'
  variables: Record<string, string>
  toEmail?: string
}

const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  shipment: {
    subject: 'Shipment Order – {{pod_name}}',
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
Computer Management Department`,
  },
  complaint: {
    subject: 'Complaint Acknowledgment – {{ticket_number}}',
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
Computer Management Department`,
  },
  repossession: {
    subject: 'Equipment Repossession Notice – {{pod_name}}',
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
Computer Management Department`,
  },
  redeployment: {
    subject: 'Equipment Redeployment Notification – {{pod_name}}',
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
Computer Management Department`,
  },
}

function fillTemplate(template: string, vars: Record<string, string>): string {
  let result = template
  Object.entries(vars).forEach(([key, value]) => {
    result = result.replaceAll(`{{${key}}}`, value || `[${key}]`)
  })
  return result
}

export default function EmailPreviewModal({
  isOpen,
  onClose,
  onSend,
  templateType,
  variables,
  toEmail = 'Vendor (Scogo)',
}: EmailPreviewModalProps) {
  if (!isOpen) return null

  const template = EMAIL_TEMPLATES[templateType]
  const subject = fillTemplate(template.subject, variables)
  const body = fillTemplate(template.body, variables)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Email Preview</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* To Field */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="font-semibold text-blue-700 mr-2">To:</span>
            <span className="text-gray-700">{toEmail}</span>
          </div>

          {/* Subject */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Subject
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg font-medium text-gray-900">
              {subject}
            </div>
          </div>

          {/* Body */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Body
            </label>
            <pre className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
              {body}
            </pre>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {onSend && (
              <button
                onClick={onSend}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Send className="w-4 h-4" />
                Send Mail to Vendor
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to get email variables from shipment
export function getShipmentEmailVars(shipment: any): Record<string, string> {
  return {
    pod_name: shipment.podName || '',
    pod_address: shipment.shippingAddress || '',
    contact_person: shipment.contactPerson || '',
    contact_number: shipment.mobileNumber || '',
    components: shipment.components || '',
    cpus: String(shipment.cpus || 0),
    order_date: shipment.orderDate ? new Date(shipment.orderDate).toLocaleDateString() : '',
    serial_numbers: shipment.serials || '',
  }
}

// Helper function to get email variables from complaint
export function getComplaintEmailVars(complaint: any): Record<string, string> {
  return {
    contact_name: complaint.contactPerson || '',
    pod_name: complaint.podName || '',
    device_issue: complaint.issue || '',
    device_serial: complaint.deviceSerial || '',
    ticket_number: complaint.ticket || 'N/A',
    reported_date: complaint.reportedDate ? new Date(complaint.reportedDate).toLocaleDateString() : '',
    description: complaint.description || '',
  }
}
