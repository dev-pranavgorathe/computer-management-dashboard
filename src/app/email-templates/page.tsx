'use client'

import { useState } from 'react'
import { Mail, Truck, AlertCircle, RefreshCcw, ArrowRightLeft, Eye, Save, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface EmailTemplate {
  id: string
  type: 'shipment' | 'complaint' | 'repossession' | 'redeployment'
  name: string
  subject: string
  body: string
  variables: string[]
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: 'shipment',
    type: 'shipment',
    name: 'Shipment Order',
    subject: 'Computer Equipment Order - {{podName}} - {{refId}}',
    body: `Dear Vendor,

We are pleased to place an order for computer equipment as per the following details:

Order Reference: {{refId}}
POD Name: {{podName}}
Shipping Address: {{shippingAddress}}
Contact Person: {{contactPerson}}
Mobile: {{mobileNumber}}
Number of CPUs: {{cpus}}
Order Date: {{orderDate}}

Please confirm receipt of this order and provide:
1. Estimated dispatch date
2. Tracking ID once dispatched
3. QC report

Thank you for your prompt attention to this order.

Best regards,
Computer Management Team
Apni Pathshala`,
    variables: ['refId', 'podName', 'shippingAddress', 'contactPerson', 'mobileNumber', 'cpus', 'orderDate']
  },
  {
    id: 'complaint',
    type: 'complaint',
    name: 'Complaint Acknowledgement',
    subject: 'Complaint Registered - {{ticketId}} - {{podName}}',
    body: `Dear {{contactPerson}},

We acknowledge receipt of your complaint regarding:

Complaint Ticket: {{ticketId}}
POD Name: {{podName}}
Device Type: {{deviceType}}
Device Serial: {{deviceSerial}}
Description: {{description}}

Our team is reviewing the issue and will provide an update within 48 hours.

If you have any additional information or attachments, please reply to this email.

Best regards,
Computer Management Team
Apni Pathshala`,
    variables: ['ticketId', 'podName', 'deviceType', 'deviceSerial', 'description', 'contactPerson']
  },
  {
    id: 'repossession',
    type: 'repossession',
    name: 'Repossession Request',
    subject: 'Equipment Repossession - {{podName}} - {{refId}}',
    body: `Dear Team,

This is to request equipment repossession from the following POD:

Reference ID: {{refId}}
POD Name: {{podName}}
Contact Person: {{contactPerson}}
Mobile: {{mobileNumber}}
Components: {{components}}
Pickup Address: {{pickupAddress}}

Please coordinate with the POD contact for collection schedule.

Best regards,
Computer Management Team
Apni Pathshala`,
    variables: ['refId', 'podName', 'contactPerson', 'mobileNumber', 'components', 'pickupAddress']
  },
  {
    id: 'redeployment',
    type: 'redeployment',
    name: 'Redeployment Notification',
    subject: 'Equipment Redeployment - {{sourcePOD}} to {{destinationPOD}} - {{refId}}',
    body: `Dear {{destinationContact}},

We are redeploying equipment to your POD as per the following details:

Reference ID: {{refId}}
Source POD: {{sourcePOD}}
Destination POD: {{destinationPOD}}
Components: {{components}}
Complaint Ticket: {{complaintTicket}}
Dispatch Date: {{dispatchDate}}
Expected Delivery: {{deliveryDate}}

Please confirm receipt of the equipment upon arrival.

Best regards,
Computer Management Team
Apni Pathshala`,
    variables: ['refId', 'sourcePOD', 'destinationPOD', 'destinationContact', 'components', 'complaintTicket', 'dispatchDate', 'deliveryDate']
  }
]

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [previewData, setPreviewData] = useState<Record<string, string>>({})
  const [showPreview, setShowPreview] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const getIcon = (type: string) => {
    switch (type) {
      case 'shipment': return <Truck className="w-6 h-6" />
      case 'complaint': return <AlertCircle className="w-6 h-6" />
      case 'repossession': return <RefreshCcw className="w-6 h-6" />
      case 'redeployment': return <ArrowRightLeft className="w-6 h-6" />
      default: return <Mail className="w-6 h-6" />
    }
  }

  const handleSaveTemplate = () => {
    if (!selectedTemplate) return
    
    setTemplates(prev => 
      prev.map(t => t.id === selectedTemplate.id ? selectedTemplate : t)
    )
    toast.success('Template saved successfully!')
    setEditMode(false)
  }

  const replaceVariables = (text: string, data: Record<string, string>) => {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match)
  }

  const handlePreview = () => {
    setShowPreview(true)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
        <p className="text-gray-600 mt-2">Manage and preview email templates for all modules</p>
      </div>

      {/* Template Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {templates.map((template) => (
          <div 
            key={template.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              setSelectedTemplate(template)
              setPreviewData({})
              setEditMode(false)
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                {getIcon(template.type)}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">{template.subject}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {template.variables.slice(0, 3).map((v) => (
                  <span key={v} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {`{{${v}}}`}
                  </span>
                ))}
                {template.variables.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{template.variables.length - 3} more
                  </span>
                )}
              </div>
              <button 
                className="text-primary-600 hover:text-primary-700"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedTemplate(template)
                  setPreviewData({})
                  setEditMode(false)
                }}
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Template Editor/Preview */}
      {selectedTemplate && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{selectedTemplate.name}</h2>
            <div className="flex gap-2">
              {!editMode ? (
                <>
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
                  >
                    <span>Edit Template</span>
                  </button>
                  <button
                    onClick={handlePreview}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSaveTemplate}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {editMode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={selectedTemplate.subject}
                  onChange={(e) => setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                <textarea
                  value={selectedTemplate.body}
                  onChange={(e) => setSelectedTemplate({ ...selectedTemplate, body: e.target.value })}
                  rows={15}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Available Variables</label>
                <div className="flex gap-2 flex-wrap">
                  {selectedTemplate.variables.map((v) => (
                    <span key={v} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded border border-gray-300">
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">{selectedTemplate.subject}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                <pre className="p-4 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-wrap font-mono text-sm">
                  {selectedTemplate.body}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-auto m-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Email Preview</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Variable Inputs */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Fill Template Variables</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedTemplate.variables.map((variable) => (
                    <div key={variable}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {variable.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      <input
                        type="text"
                        value={previewData[variable] || ''}
                        onChange={(e) => setPreviewData({ ...previewData, [variable]: e.target.value })}
                        placeholder={`Enter ${variable}`}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Preview</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Subject:</span>{' '}
                      {replaceVariables(selectedTemplate.subject, previewData)}
                    </p>
                  </div>
                  <div className="p-6 bg-white">
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {replaceVariables(selectedTemplate.body, previewData)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowPreview(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  toast.success('Email sent successfully! (Preview only)')
                  setShowPreview(false)
                }}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
