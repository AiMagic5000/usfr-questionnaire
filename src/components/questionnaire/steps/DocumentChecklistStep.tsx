'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { documentChecklistSchema, DocumentChecklist } from '@/lib/schema'
import { FormCheckbox, FormTextarea } from '../FormInput'
import { FileCheck, AlertCircle } from 'lucide-react'

interface DocumentChecklistStepProps {
  data: Partial<DocumentChecklist>
  onNext: (data: DocumentChecklist) => void
  onBack: () => void
}

export function DocumentChecklistStep({ data, onNext, onBack }: DocumentChecklistStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DocumentChecklist>({
    resolver: zodResolver(documentChecklistSchema),
    defaultValues: {
      ...data,
      hasGovernmentId: data.hasGovernmentId ?? false,
      hasDeed: data.hasDeed ?? false,
      hasForeclosureNotice: data.hasForeclosureNotice ?? false,
      hasSaleConfirmation: data.hasSaleConfirmation ?? false,
      hasDeathCertificate: data.hasDeathCertificate ?? false,
      hasProbateDocuments: data.hasProbateDocuments ?? false,
      hasAffidavitHeirship: data.hasAffidavitHeirship ?? false,
      hasMarriageCertificate: data.hasMarriageCertificate ?? false,
      hasDivorceCertificate: data.hasDivorceCertificate ?? false,
      hasTrustDocuments: data.hasTrustDocuments ?? false,
      hasCorporateDocuments: data.hasCorporateDocuments ?? false,
    },
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div className="bg-usfr-light/50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileCheck className="w-6 h-6 text-usfr-primary" />
          <h3 className="text-lg font-semibold text-usfr-primary">
            Document Checklist
          </h3>
        </div>
        <p className="text-sm text-usfr-muted mb-6">
          Please indicate which documents you currently have available.
          Don&apos;t worry if you don&apos;t have all documents - we will help you obtain what&apos;s needed.
        </p>

        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-usfr-dark mb-3">Required Documents</h4>
            <FormCheckbox
              label="Government-issued Photo ID (Driver's License, Passport, State ID)"
              name="hasGovernmentId"
              register={register}
              error={errors.hasGovernmentId}
            />
            <FormCheckbox
              label="Copy of Deed or Title Document"
              name="hasDeed"
              register={register}
              error={errors.hasDeed}
            />
            <FormCheckbox
              label="Foreclosure Notice or Default Notice"
              name="hasForeclosureNotice"
              register={register}
              error={errors.hasForeclosureNotice}
            />
            <FormCheckbox
              label="Sale Confirmation / Certificate of Sale"
              name="hasSaleConfirmation"
              register={register}
              error={errors.hasSaleConfirmation}
            />
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-usfr-dark mb-3">If Claiming as Heir</h4>
            <FormCheckbox
              label="Death Certificate of Property Owner"
              name="hasDeathCertificate"
              register={register}
              error={errors.hasDeathCertificate}
            />
            <FormCheckbox
              label="Probate Documents (Letters Testamentary, Letters of Administration)"
              name="hasProbateDocuments"
              register={register}
              error={errors.hasProbateDocuments}
            />
            <FormCheckbox
              label="Affidavit of Heirship"
              name="hasAffidavitHeirship"
              register={register}
              error={errors.hasAffidavitHeirship}
            />
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-usfr-dark mb-3">If Applicable</h4>
            <FormCheckbox
              label="Marriage Certificate"
              name="hasMarriageCertificate"
              register={register}
              error={errors.hasMarriageCertificate}
            />
            <FormCheckbox
              label="Divorce Decree"
              name="hasDivorceCertificate"
              register={register}
              error={errors.hasDivorceCertificate}
            />
            <FormCheckbox
              label="Trust Documents"
              name="hasTrustDocuments"
              register={register}
              error={errors.hasTrustDocuments}
            />
            <FormCheckbox
              label="Corporate Documents (LLC Agreement, Articles of Incorporation)"
              name="hasCorporateDocuments"
              register={register}
              error={errors.hasCorporateDocuments}
            />
          </div>
        </div>

        <div className="mt-6">
          <FormTextarea
            label="Additional Documents or Notes"
            name="additionalDocuments"
            placeholder="List any other relevant documents you have or any questions about documentation..."
            register={register}
            error={errors.additionalDocuments}
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          You will be able to upload these documents after completing the questionnaire.
          Our team will also help you obtain any documents you may be missing.
        </p>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-8 py-3 border border-usfr-primary text-usfr-primary font-semibold rounded-lg hover:bg-usfr-primary/5 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          className="px-8 py-3 bg-usfr-accent text-white font-semibold rounded-lg hover:bg-usfr-accent/90 transition-colors focus:outline-none focus:ring-2 focus:ring-usfr-accent/50"
        >
          Continue
        </button>
      </div>
    </form>
  )
}
