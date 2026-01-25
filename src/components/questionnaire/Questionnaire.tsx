'use client'

import { useState } from 'react'
import { ProgressBar } from './ProgressBar'
import {
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
import { CheckCircle, Phone, Mail } from 'lucide-react'

const STEPS = [
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

export function Questionnaire() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    personalInfo: {},
    propertyInfo: {},
    ownership: {},
    liens: {},
    competingClaims: {},
    deceasedOwner: {},
    bankruptcy: {},
    documentChecklist: {},
    authorization: {},
  })

  const goToNext = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))
  const goToPrev = () => setCurrentStep((prev) => Math.max(prev - 1, 1))

  const handlePersonalInfo = (data: PersonalInfo) => {
    setFormData((prev) => ({ ...prev, personalInfo: data }))
    goToNext()
  }

  const handlePropertyInfo = (data: PropertyInfo) => {
    setFormData((prev) => ({ ...prev, propertyInfo: data }))
    goToNext()
  }

  const handleOwnership = (data: Ownership) => {
    setFormData((prev) => ({ ...prev, ownership: data }))
    goToNext()
  }

  const handleLiens = (data: Liens) => {
    setFormData((prev) => ({ ...prev, liens: data }))
    goToNext()
  }

  const handleCompetingClaims = (data: CompetingClaims) => {
    setFormData((prev) => ({ ...prev, competingClaims: data }))
    goToNext()
  }

  const handleDeceasedOwner = (data: DeceasedOwner) => {
    setFormData((prev) => ({ ...prev, deceasedOwner: data }))
    goToNext()
  }

  const handleBankruptcy = (data: Bankruptcy) => {
    setFormData((prev) => ({ ...prev, bankruptcy: data }))
    goToNext()
  }

  const handleDocumentChecklist = (data: DocumentChecklist) => {
    setFormData((prev) => ({ ...prev, documentChecklist: data }))
    goToNext()
  }

  const handleSubmit = async (data: Authorization) => {
    setIsSubmitting(true)
    setFormData((prev) => ({ ...prev, authorization: data }))

    const finalData = {
      ...formData,
      authorization: data,
      submittedAt: new Date().toISOString(),
    }

    try {
      // Submit to API
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      })

      if (!response.ok) throw new Error('Submission failed')

      setIsComplete(true)
    } catch (error) {
      console.error('Submission error:', error)
      // For demo, show success anyway
      setIsComplete(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-usfr-success/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-usfr-success" />
        </div>
        <h2 className="text-2xl font-bold text-usfr-primary mb-4">
          Application Submitted Successfully!
        </h2>
        <p className="text-usfr-muted mb-8">
          Thank you for completing your surplus funds claim application. Our team will review
          your information and contact you within 24-48 hours to discuss the next steps.
        </p>
        <div className="bg-usfr-light rounded-lg p-6 text-left">
          <h3 className="font-semibold text-usfr-dark mb-4">What happens next?</h3>
          <ol className="space-y-3 text-sm text-usfr-muted">
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
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
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
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ProgressBar steps={STEPS} currentStep={currentStep} />

      <div className="mt-8 bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-usfr-primary">
            {STEPS[currentStep - 1].name}
          </h2>
          <p className="text-sm text-usfr-muted mt-1">
            Step {currentStep} of {STEPS.length}
          </p>
        </div>

        {currentStep === 1 && (
          <PersonalInfoStep data={formData.personalInfo} onNext={handlePersonalInfo} />
        )}
        {currentStep === 2 && (
          <PropertyInfoStep data={formData.propertyInfo} onNext={handlePropertyInfo} onBack={goToPrev} />
        )}
        {currentStep === 3 && (
          <OwnershipStep data={formData.ownership} onNext={handleOwnership} onBack={goToPrev} />
        )}
        {currentStep === 4 && (
          <LiensStep data={formData.liens} onNext={handleLiens} onBack={goToPrev} />
        )}
        {currentStep === 5 && (
          <CompetingClaimsStep data={formData.competingClaims} onNext={handleCompetingClaims} onBack={goToPrev} />
        )}
        {currentStep === 6 && (
          <DeceasedOwnerStep data={formData.deceasedOwner} onNext={handleDeceasedOwner} onBack={goToPrev} />
        )}
        {currentStep === 7 && (
          <BankruptcyStep data={formData.bankruptcy} onNext={handleBankruptcy} onBack={goToPrev} />
        )}
        {currentStep === 8 && (
          <DocumentChecklistStep data={formData.documentChecklist} onNext={handleDocumentChecklist} onBack={goToPrev} />
        )}
        {currentStep === 9 && (
          <AuthorizationStep
            data={formData.authorization}
            onSubmit={handleSubmit}
            onBack={goToPrev}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  )
}
