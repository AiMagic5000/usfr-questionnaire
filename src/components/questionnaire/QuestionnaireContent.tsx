'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import { ProgressBar } from './ProgressBar'
import { SaveStatusIndicator } from './SaveStatusIndicator'
import { useAutoSave } from '@/hooks/useAutoSave'
import {
  AgentIdentificationStep,
  PersonalInfoStep,
  PropertyInfoStep,
  OwnershipStep,
  LiensStep,
  CompetingClaimsStep,
  DeceasedOwnerStep,
  BankruptcyStep,
  DocumentChecklistStep,
  AuthorizationStep,
} from './steps'
import type {
  AgentIdentification,
  PersonalInfo,
  PropertyInfo,
  Ownership,
  Liens,
  CompetingClaims,
  DeceasedOwner,
  Bankruptcy,
  DocumentChecklist,
  Authorization,
} from '@/lib/schema'
import { CheckCircle, Phone, Mail, Info, FileCheck } from 'lucide-react'

const STEPS = [
  { id: 0, name: 'Agent Identification', shortName: 'Agent' },
  { id: 1, name: 'Personal Information', shortName: 'Personal' },
  { id: 2, name: 'Property Information', shortName: 'Property' },
  { id: 3, name: 'Ownership History', shortName: 'Ownership' },
  { id: 4, name: 'Liens & Encumbrances', shortName: 'Liens' },
  { id: 5, name: 'Competing Claims', shortName: 'Claims' },
  { id: 6, name: 'Deceased Owner', shortName: 'Heir Info' },
  { id: 7, name: 'Bankruptcy', shortName: 'Bankruptcy' },
  { id: 8, name: 'Document Checklist', shortName: 'Documents' },
  { id: 9, name: 'Authorization', shortName: 'Sign' },
]

interface FormData {
  agentIdentification: Partial<AgentIdentification> & { agentVerified?: boolean }
  personalInfo: Partial<PersonalInfo>
  propertyInfo: Partial<PropertyInfo>
  ownership: Partial<Ownership>
  liens: Partial<Liens>
  competingClaims: Partial<CompetingClaims>
  deceasedOwner: Partial<DeceasedOwner>
  bankruptcy: Partial<Bankruptcy>
  documentChecklist: Partial<DocumentChecklist>
  authorization: Partial<Authorization>
}

const initialFormData: FormData = {
  agentIdentification: {},
  personalInfo: {},
  propertyInfo: {},
  ownership: {},
  liens: {},
  competingClaims: {},
  deceasedOwner: {},
  bankruptcy: {},
  documentChecklist: {},
  authorization: {},
}

interface QuestionnaireContentProps {
  embedded?: boolean
}

export function QuestionnaireContent({ embedded = false }: QuestionnaireContentProps) {
  const { user, isLoaded } = useUser()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  // Auto-save functionality
  const handleSave = useCallback(async (data: Record<string, unknown>) => {
    if (!user?.id) return

    const response = await fetch('/api/intake/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formData: data,
        currentStep,
        completedSteps: Array.from(completedSteps),
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to save')
    }
  }, [user?.id, currentStep, completedSteps])

  const { saveStatus, lastSaved } = useAutoSave({
    data: formData as unknown as Record<string, unknown>,
    onSave: handleSave,
    debounceMs: 1500,
    enabled: isLoaded && !!user && !isComplete,
  })

  // Load saved data on mount
  useEffect(() => {
    async function loadSavedData() {
      if (!user?.id) return

      try {
        const response = await fetch('/api/intake/load')
        if (response.ok) {
          const data = await response.json()
          if (data.formData) {
            setFormData(data.formData)
            setCurrentStep(data.currentStep ?? 0)
            setCompletedSteps(new Set(data.completedSteps || []))
            if (data.isComplete) {
              setIsComplete(true)
            }
          }
        }
      } catch (error) {
        console.error('Failed to load saved data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isLoaded && user) {
      loadSavedData()
    }
  }, [isLoaded, user])

  const goToStep = (stepId: number) => {
    setCurrentStep(stepId)
  }

  const markStepComplete = (stepId: number) => {
    setCompletedSteps((prev) => new Set([...Array.from(prev), stepId]))
  }

  const handleAgentIdentification = (data: AgentIdentification & { agentVerified: boolean }) => {
    setFormData((prev) => ({ ...prev, agentIdentification: data }))
    markStepComplete(0)
    setCurrentStep(1)
  }

  const handlePersonalInfo = (data: PersonalInfo) => {
    setFormData((prev) => ({ ...prev, personalInfo: data }))
    markStepComplete(1)
    setCurrentStep(2)
  }

  const handlePropertyInfo = (data: PropertyInfo) => {
    setFormData((prev) => ({ ...prev, propertyInfo: data }))
    markStepComplete(2)
    setCurrentStep(3)
  }

  const handleOwnership = (data: Ownership) => {
    setFormData((prev) => ({ ...prev, ownership: data }))
    markStepComplete(3)
    setCurrentStep(4)
  }

  const handleLiens = (data: Liens) => {
    setFormData((prev) => ({ ...prev, liens: data }))
    markStepComplete(4)
    setCurrentStep(5)
  }

  const handleCompetingClaims = (data: CompetingClaims) => {
    setFormData((prev) => ({ ...prev, competingClaims: data }))
    markStepComplete(5)
    setCurrentStep(6)
  }

  const handleDeceasedOwner = (data: DeceasedOwner) => {
    setFormData((prev) => ({ ...prev, deceasedOwner: data }))
    markStepComplete(6)
    setCurrentStep(7)
  }

  const handleBankruptcy = (data: Bankruptcy) => {
    setFormData((prev) => ({ ...prev, bankruptcy: data }))
    markStepComplete(7)
    setCurrentStep(8)
  }

  const handleDocumentChecklist = (data: DocumentChecklist) => {
    setFormData((prev) => ({ ...prev, documentChecklist: data }))
    markStepComplete(8)
    setCurrentStep(9)
  }

  const handleSubmit = async (data: Authorization) => {
    setIsSubmitting(true)
    setFormData((prev) => ({ ...prev, authorization: data }))
    markStepComplete(9)

    const finalData = {
      ...formData,
      authorization: data,
      submittedAt: new Date().toISOString(),
    }

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      })

      if (!response.ok) throw new Error('Submission failed')

      setIsComplete(true)
    } catch (error) {
      console.error('Submission error:', error)
      setIsComplete(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-usfr-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-usfr-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading your application...</p>
        </div>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-usfr-light py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-usfr-primary mb-4">
            Application Submitted Successfully!
          </h2>
          <p className="text-gray-600 mb-8">
            Thank you for completing your surplus funds claim application. Our team will review
            your information and contact you within 24-48 hours to discuss the next steps.
          </p>
          <div className="bg-white rounded-lg p-6 text-left shadow-md">
            <h3 className="font-semibold text-usfr-dark mb-4">What happens next?</h3>
            <ol className="space-y-3 text-sm text-gray-600">
              <li className="flex gap-3">
                <span className="bg-usfr-accent text-white w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
                <span>Our team will verify your property and foreclosure information</span>
              </li>
              <li className="flex gap-3">
                <span className="bg-usfr-accent text-white w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
                <span>We&apos;ll research the county records to confirm available surplus funds</span>
              </li>
              <li className="flex gap-3">
                <span className="bg-usfr-accent text-white w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
                <span>A case manager will contact you to discuss your case and any additional documents needed</span>
              </li>
              <li className="flex gap-3">
                <span className="bg-usfr-accent text-white w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0">4</span>
                <span>We&apos;ll file your claim and keep you updated throughout the process</span>
              </li>
            </ol>
          </div>
          <div className="mt-6 mb-4">
            <a
              href="/dashboard?tab=documents"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-usfr-accent text-white rounded-lg font-semibold text-lg hover:bg-usfr-accent/90 transition-colors shadow-lg"
            >
              <FileCheck className="w-5 h-5" />
              Sign Your Documents
            </a>
            <p className="text-sm text-gray-500 mt-2">
              Your personalized document package is ready for review and signing.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+18885458007"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-usfr-primary text-white rounded-lg hover:bg-usfr-primary/90 transition-colors"
            >
              <Phone className="w-4 h-4" />
              (888) 545-8007
            </a>
            <a
              href="mailto:claim@usforeclosurerecovery.com"
              className="flex items-center justify-center gap-2 px-6 py-3 border border-usfr-primary text-usfr-primary rounded-lg hover:bg-usfr-primary/5 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Email Us
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={embedded ? '' : 'min-h-screen bg-usfr-light py-8 px-4'}>
      <div className={embedded ? '' : 'max-w-4xl mx-auto'}>
        {/* Header with user info and save status - hide when embedded */}
        {!embedded && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-usfr-primary">
                Client Intake Questionnaire
              </h1>
              <p className="text-sm text-gray-600">
                Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} />
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        )}

        {/* Save status indicator for embedded mode */}
        {embedded && (
          <div className="flex items-center justify-between mb-4">
            <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} />
          </div>
        )}

        {/* Auto-save notice */}
        <div className="bg-usfr-secondary/10 border border-usfr-secondary/30 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-usfr-secondary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-usfr-primary">Your progress is automatically saved</p>
            <p className="text-gray-600">
              You can sign out and return anytime to continue where you left off.
              Click any section above to jump directly to it.
            </p>
          </div>
        </div>

        {/* Progress bar with clickable steps */}
        <ProgressBar
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={goToStep}
          completedSteps={completedSteps}
        />

        {/* Form */}
        <div className={`mt-8 bg-white rounded-xl ${embedded ? 'shadow-sm' : 'shadow-lg'} p-6 md:p-8`}>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-usfr-primary">
              {STEPS.find(s => s.id === currentStep)?.name || ''}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Step {currentStep + 1} of {STEPS.length}
              {completedSteps.has(currentStep) && (
                <span className="ml-2 text-green-600 font-medium">&#10003; Completed</span>
              )}
            </p>
          </div>

          {currentStep === 0 && (
            <AgentIdentificationStep data={formData.agentIdentification} onNext={handleAgentIdentification} />
          )}
          {currentStep === 1 && (
            <PersonalInfoStep data={formData.personalInfo} onNext={handlePersonalInfo} />
          )}
          {currentStep === 2 && (
            <PropertyInfoStep data={formData.propertyInfo} onNext={handlePropertyInfo} onBack={() => goToStep(1)} />
          )}
          {currentStep === 3 && (
            <OwnershipStep data={formData.ownership} onNext={handleOwnership} onBack={() => goToStep(2)} />
          )}
          {currentStep === 4 && (
            <LiensStep data={formData.liens} onNext={handleLiens} onBack={() => goToStep(3)} />
          )}
          {currentStep === 5 && (
            <CompetingClaimsStep data={formData.competingClaims} onNext={handleCompetingClaims} onBack={() => goToStep(4)} />
          )}
          {currentStep === 6 && (
            <DeceasedOwnerStep data={formData.deceasedOwner} onNext={handleDeceasedOwner} onBack={() => goToStep(5)} />
          )}
          {currentStep === 7 && (
            <BankruptcyStep data={formData.bankruptcy} onNext={handleBankruptcy} onBack={() => goToStep(6)} />
          )}
          {currentStep === 8 && (
            <DocumentChecklistStep data={formData.documentChecklist} onNext={handleDocumentChecklist} onBack={() => goToStep(7)} />
          )}
          {currentStep === 9 && (
            <AuthorizationStep
              data={formData.authorization}
              onSubmit={handleSubmit}
              onBack={() => goToStep(8)}
              isSubmitting={isSubmitting}
            />
          )}
        </div>

        {/* Bottom notice - hide when embedded */}
        {!embedded && (
          <p className="text-center text-sm text-gray-500 mt-6">
            Need help? Call{' '}
            <a href="tel:+18885458007" className="text-usfr-secondary font-medium hover:underline">
              (888) 545-8007
            </a>
          </p>
        )}
      </div>
    </div>
  )
}
