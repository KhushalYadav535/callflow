'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronRight, Upload, Phone } from 'lucide-react'

type Step = 'info' | 'upload' | 'review'

type Contact = {
  name: string
  phone: string
  amount: number
  dueDate: string
  loanType: string
  email: string
  city: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function NewCampaignPage() {
  const params = useParams<{ tenantId: string }>()
  const router = useRouter()

  const [currentStep, setCurrentStep] = useState<Step>('info')
  const [formData, setFormData] = useState({
    name: '',
    type: 'recovery' as 'recovery' | 'reminder' | 'sales',
    description: '',
    voice: 'sarah-us',
    language: 'en-US',
    timing: 'business-hours',
    maxRetries: 3,
    retryDelay: 24,
    totalContacts: 0,
  })
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [campaignId, setCampaignId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isLaunching, setIsLaunching] = useState(false)

  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: 'info', label: 'Campaign Info', icon: <Phone size={20} /> },
    { id: 'upload', label: 'Upload Contacts', icon: <Upload size={20} /> },
    { id: 'review', label: 'Review & Launch', icon: <ChevronRight size={20} /> },
  ]

  const handleNext = () => {
    const stepIndex = steps.findIndex((s) => s.id === currentStep)
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].id)
    }
  }

  const handlePrevious = () => {
    const stepIndex = steps.findIndex((s) => s.id === currentStep)
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].id)
    }
  }

  const handleFileChange = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!API_URL) {
      setUploadError('API URL is not configured.')
      return
    }

    if (!formData.name || !formData.type) {
      setUploadError('Please fill campaign info first.')
      setCurrentStep('info')
      return
    }

    const lowerName = file.name.toLowerCase()
    const isCsv = lowerName.endsWith('.csv')
    const isExcel = lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')

    if (!isCsv && !isExcel) {
      setUploadError('Please upload a CSV or Excel file.')
      return
    }

    setUploadError('')
    setUploadedFileName(file.name)
    setIsUploading(true)

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        setUploadError('You must be logged in to upload contacts.')
        return
      }

      const body = new FormData()
      body.append('file', file)
      body.append('name', formData.name)
      body.append('type', formData.type.toUpperCase())
      body.append('voice', formData.voice)
      body.append('language', formData.language)
      body.append('maxRetries', String(formData.maxRetries))
      body.append('retryAfterHours', String(formData.retryDelay))

      const res = await fetch(`${API_URL}/api/campaigns/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.message || 'Failed to create campaign from file.')
      }

      const data = await res.json()

      setCampaignId(data.campaign._id)
      setFormData((prev) => ({
        ...prev,
        totalContacts: data.totalCount ?? data.campaign.totalContacts ?? prev.totalContacts,
      }))

      const previewContacts: Contact[] = (data.contacts || []).map((c: any) => ({
        name: c.name,
        phone: c.phone,
        amount: c.amount,
        dueDate: c.dueDate ? new Date(c.dueDate).toISOString().slice(0, 10) : '',
        loanType: c.loanType,
        email: c.email,
        city: c.city,
      }))

      setContacts(previewContacts)
      setCurrentStep('review')
    } catch (err: any) {
      setUploadError(err.message || 'Unable to upload file. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleLaunch = async () => {
    if (!campaignId) {
      setUploadError('Please upload contacts and create a campaign first.')
      setCurrentStep('upload')
      return
    }

    if (!API_URL) {
      setUploadError('API URL is not configured.')
      return
    }

    try {
      setIsLaunching(true)
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        setUploadError('You must be logged in to launch a campaign.')
        return
      }

      const res = await fetch(`${API_URL}/api/campaigns/${campaignId}/launch`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.message || 'Failed to launch campaign.')
      }

      const tenantId = params?.tenantId
      if (tenantId) {
        router.push(`/app/${tenantId}/campaigns/${campaignId}`)
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to launch campaign.')
    } finally {
      setIsLaunching(false)
    }
  }

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-2">Create New Campaign</h1>
        <p className="text-muted-foreground">Follow the steps below to set up your campaign</p>
      </div>

      {/* Steps Indicator */}
      <div className="bg-card rounded-lg border border-border p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  index <= currentStepIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step.icon}
                <span className="hidden sm:inline text-sm font-semibold">{step.label}</span>
              </button>
              {index < steps.length - 1 && (
                <div className={`h-1 flex-1 mx-2 rounded ${index < currentStepIndex ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-card rounded-lg border border-border p-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
        {/* Step 1: Campaign Info */}
        {currentStep === 'info' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Campaign Information</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Campaign Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Q1 Recovery Campaign"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Campaign Type *</label>
              <div className="grid grid-cols-3 gap-4">
                {['recovery', 'reminder', 'sales'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFormData({ ...formData, type: type as any })}
                    className={`p-4 rounded-lg border-2 transition-all text-center ${
                      formData.type === type
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <p className="font-semibold text-foreground capitalize">{type}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your campaign..."
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Upload Contacts */}
        {currentStep === 'upload' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Upload Contact List</h2>
            </div>

            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors">
              <Upload size={48} className="mx-auto mb-4 text-primary opacity-50" />
              <p className="text-lg font-semibold text-foreground mb-2">Drag and drop your file</p>
              <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
              <input
                type="file"
                accept=".csv,.xlsx"
                className="hidden"
                id="file-upload"
                onChange={handleFileChange}
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-6 py-2 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors cursor-pointer font-semibold"
              >
                Select File
              </label>
              <p className="text-xs text-muted-foreground mt-4">Supports CSV and Excel files</p>
              {uploadedFileName && (
                <p className="text-sm text-foreground mt-2">
                  Selected file: <span className="font-semibold">{uploadedFileName}</span>
                  {formData.totalContacts > 0 && ` • Contacts detected: ${formData.totalContacts}`}
                </p>
              )}
              {uploadError && (
                <p className="text-sm text-red-600 mt-2">
                  {uploadError}
                </p>
              )}
            </div>

            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
              <p className="text-sm text-muted-foreground">
                <strong>Required columns in CSV:</strong> name, phone, amount, dueDate, loanType, email, city
              </p>
              {contacts.length > 0 && (
                <div className="max-h-64 overflow-auto border border-border rounded-md bg-background">
                  <table className="min-w-full text-left text-xs">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Name</th>
                        <th className="px-3 py-2 font-semibold">Phone</th>
                        <th className="px-3 py-2 font-semibold">Amount</th>
                        <th className="px-3 py-2 font-semibold">Due Date</th>
                        <th className="px-3 py-2 font-semibold">Loan Type</th>
                        <th className="px-3 py-2 font-semibold">Email</th>
                        <th className="px-3 py-2 font-semibold">City</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.slice(0, 20).map((c, idx) => (
                        <tr key={idx} className="border-t border-border">
                          <td className="px-3 py-1.5">{c.name}</td>
                          <td className="px-3 py-1.5">{c.phone}</td>
                          <td className="px-3 py-1.5">{c.amount}</td>
                          <td className="px-3 py-1.5">{c.dueDate}</td>
                          <td className="px-3 py-1.5">{c.loanType}</td>
                          <td className="px-3 py-1.5">{c.email}</td>
                          <td className="px-3 py-1.5">{c.city}</td>
                        </tr>
                      ))}
                      {contacts.length > 20 && (
                        <tr>
                          <td className="px-3 py-2 text-muted-foreground" colSpan={7}>
                            Showing first 20 contacts out of {contacts.length}.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Review & Launch */}
        {currentStep === 'review' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Review & Launch</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">Campaign Name</p>
                <p className="font-semibold text-foreground">{formData.name || 'Not set'}</p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">Campaign Type</p>
                <p className="font-semibold text-foreground capitalize">{formData.type}</p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">Voice & Language</p>
                <p className="font-semibold text-foreground">{formData.voice} - {formData.language}</p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">Configuration</p>
                <ul className="text-sm text-foreground space-y-1">
                  <li>Call Timing: {formData.timing}</li>
                  <li>Max Retries: {formData.maxRetries}</li>
                  <li>Retry Delay: {formData.retryDelay} hours</li>
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-primary/30 bg-primary/10">
              <p className="text-sm text-primary font-semibold">Ready to launch!</p>
              <p className="text-sm text-primary/80">Your campaign is configured and ready to start making calls.</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 justify-between animate-fade-in" style={{ animationDelay: '300ms' }}>
        <button
          onClick={handlePrevious}
          disabled={currentStep === 'info'}
          className="px-6 py-2.5 rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          Previous
        </button>

        {currentStep !== 'review' ? (
          <button
            onClick={handleNext}
            disabled={currentStep === 'upload' && (isUploading || !campaignId)}
            className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2"
          >
            Next
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleLaunch}
            disabled={isLaunching || !campaignId}
            className="px-6 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2"
          >
            <Phone size={18} />
            {isLaunching ? 'Launching...' : 'Launch Campaign'}
          </button>
        )}
      </div>
    </div>
  )
}
