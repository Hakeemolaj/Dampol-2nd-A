'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { DocumentRequest } from '@/components/ui/document-detail-modal'

interface ExportPrintProps {
  requests: DocumentRequest[]
  selectedRequest?: DocumentRequest | null
}

export function ExportPrintActions({ requests, selectedRequest }: ExportPrintProps) {
  const generateCSV = (data: DocumentRequest[]) => {
    const headers = ['Request ID', 'Document Type', 'Status', 'Submitted Date', 'Expected Date', 'Fee', 'Purpose']
    const csvContent = [
      headers.join(','),
      ...data.map(request => [
        request.id,
        request.type,
        request.status,
        request.submittedDate,
        request.expectedDate,
        request.fee,
        `"${request.purpose}"`
      ].join(','))
    ].join('\n')

    return csvContent
  }

  const generatePrintableHTML = (request: DocumentRequest) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Document Request Status - ${request.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .subtitle { color: #666; margin-top: 5px; }
            .section { margin: 20px 0; }
            .section h3 { color: #2563eb; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 15px 0; }
            .info-item { margin: 10px 0; }
            .info-label { font-weight: bold; color: #333; }
            .info-value { color: #666; margin-top: 2px; }
            .status { padding: 5px 10px; border-radius: 15px; font-weight: bold; display: inline-block; }
            .status.processing { background: #fef3c7; color: #d97706; }
            .status.ready { background: #d1fae5; color: #059669; }
            .status.pending { background: #fef3c7; color: #d97706; }
            .status.completed { background: #f3f4f6; color: #374151; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🏛️ Barangay Dampol 2nd A</div>
            <div class="subtitle">Pulilan, Bulacan</div>
            <div class="subtitle">Document Request Status Report</div>
          </div>

          <div class="section">
            <h3>📄 Request Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Request ID:</div>
                <div class="info-value">${request.id}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Document Type:</div>
                <div class="info-value">${request.type}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Status:</div>
                <div class="info-value">
                  <span class="status ${request.status.toLowerCase().replace(' ', '-')}">${request.status}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">Fee:</div>
                <div class="info-value">${request.fee}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Submitted:</div>
                <div class="info-value">${new Date(request.submittedDate).toLocaleDateString()}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Expected:</div>
                <div class="info-value">${new Date(request.expectedDate).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>📝 Purpose</h3>
            <div class="info-value">${request.purpose}</div>
          </div>

          ${request.applicant ? `
          <div class="section">
            <h3>👤 Applicant Information</h3>
            <div class="info-item">
              <div class="info-label">Name:</div>
              <div class="info-value">${request.applicant.name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Address:</div>
              <div class="info-value">${request.applicant.address}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Contact:</div>
              <div class="info-value">${request.applicant.contact}</div>
            </div>
          </div>
          ` : ''}

          ${request.documents && request.documents.length > 0 ? `
          <div class="section">
            <h3>📎 Required Documents</h3>
            ${request.documents.map(doc => `
              <div class="info-item">
                <div class="info-label">${doc.name}:</div>
                <div class="info-value">
                  <span class="status ${doc.status}">${doc.status}</span>
                  ${doc.uploadedDate ? ` - Uploaded: ${new Date(doc.uploadedDate).toLocaleDateString()}` : ''}
                </div>
              </div>
            `).join('')}
          </div>
          ` : ''}

          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>For inquiries, contact Barangay Dampol 2nd A at +63 917 123 4567</p>
          </div>

          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
              🖨️ Print This Report
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
              Close
            </button>
          </div>
        </body>
      </html>
    `
  }

  const downloadCSV = (filename: string, csvContent: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const printRequest = (request: DocumentRequest) => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(generatePrintableHTML(request))
      printWindow.document.close()
    }
  }

  const exportAllRequests = () => {
    const csvContent = generateCSV(requests)
    const filename = `document-requests-${new Date().toISOString().split('T')[0]}.csv`
    downloadCSV(filename, csvContent)
  }

  const exportSingleRequest = (request: DocumentRequest) => {
    const csvContent = generateCSV([request])
    const filename = `document-request-${request.id}.csv`
    downloadCSV(filename, csvContent)
  }

  const printSummary = () => {
    const summaryHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Document Requests Summary</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .status { padding: 3px 8px; border-radius: 10px; font-size: 12px; font-weight: bold; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏛️ Barangay Dampol 2nd A</h1>
            <p>Document Requests Summary</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Document Type</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Expected</th>
                <th>Fee</th>
              </tr>
            </thead>
            <tbody>
              ${requests.map(request => `
                <tr>
                  <td>${request.id}</td>
                  <td>${request.type}</td>
                  <td><span class="status">${request.status}</span></td>
                  <td>${new Date(request.submittedDate).toLocaleDateString()}</td>
                  <td>${new Date(request.expectedDate).toLocaleDateString()}</td>
                  <td>${request.fee}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print()">🖨️ Print Summary</button>
            <button onclick="window.close()" style="margin-left: 10px;">Close</button>
          </div>
        </body>
      </html>
    `
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(summaryHTML)
      printWindow.document.close()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Export & Print Options
        </CardTitle>
        <CardDescription>
          Download or print your document tracking information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export Options */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">📥 Export Data</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportAllRequests}
            >
              📄 Export All (CSV)
            </Button>
            {selectedRequest && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportSingleRequest(selectedRequest)}
              >
                📄 Export Selected (CSV)
              </Button>
            )}
          </div>
        </div>

        {/* Print Options */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">🖨️ Print Reports</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={printSummary}
            >
              🖨️ Print Summary
            </Button>
            {selectedRequest && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => printRequest(selectedRequest)}
              >
                🖨️ Print Selected
              </Button>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-2 border-t">
          <p className="text-sm text-gray-600">
            💡 Tip: Use CSV exports for spreadsheet analysis or print reports for offline reference.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default ExportPrintActions
