'use client'

import { useState } from 'react'
import { ChevronRight, Upload, Phone, Clock, Settings } from 'lucide-react'

type Step = 'info' | 'upload' | 'config' | 'review'

export default function NewCampaignPage() {
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

  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: 'info', label: 'Campaign Info', icon: <Phone size={20} /> },
    { id: 'upload', label: 'Upload Contacts', icon: <Upload size={20} /> },
    { id: 'config', label: 'Configure AI', icon: <Settings size={20} /> },
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
              />
              <label htmlFor="file-upload" className="inline-block px-6 py-2 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors cursor-pointer font-semibold">
                Select File
              </label>
              <p className="text-xs text-muted-foreground mt-4">Supports CSV and Excel files</p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                <strong>Format required:</strong> First Name, Last Name, Phone Number
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Configure AI */}
        {currentStep === 'config' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Configure AI Agent</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Voice *</label>
                <select
                  value={formData.voice}
                  onChange={(e) => setFormData({ ...formData, voice: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="sarah-us">Sarah (US English)</option>
                  <option value="john-us">John (US English)</option>
                  <option value="emma-uk">Emma (UK English)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Language *</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es-ES">Spanish (Spain)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Call Timing *</label>
                <select
                  value={formData.timing}
                  onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="business-hours">Business Hours (9 AM - 5 PM)</option>
                  <option value="anytime">Anytime</option>
                  <option value="evenings">Evenings Only (5 PM - 9 PM)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Max Retries *</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxRetries}
                  onChange={(e) => setFormData({ ...formData, maxRetries: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Retry Delay (Hours) *</label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={formData.retryDelay}
                  onChange={(e) => setFormData({ ...formData, retryDelay: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review & Launch */}
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
            className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold flex items-center gap-2"
          >
            Next
            <ChevronRight size={18} />
          </button>
        ) : (
          <button className="px-6 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-semibold flex items-center gap-2">
            <Phone size={18} />
            Launch Campaign
          </button>
        )}
      </div>
    </div>
  )
}
