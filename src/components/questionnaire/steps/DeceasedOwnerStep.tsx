'use client'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { deceasedOwnerSchema, DeceasedOwner } from '@/lib/schema'
import { FormInput, FormCheckbox, FormTextarea } from '../FormInput'

interface DeceasedOwnerStepProps {
  data: Partial<DeceasedOwner>
  onNext: (data: DeceasedOwner) => void
  onBack: () => void
}

export function DeceasedOwnerStep({ data, onNext, onBack }: DeceasedOwnerStepProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DeceasedOwner>({
    resolver: zodResolver(deceasedOwnerSchema),
    defaultValues: {
      ...data,
      isHeir: data.isHeir ?? false,
      probateFiled: data.probateFiled ?? false,
      isEstateOpen: data.isEstateOpen ?? false,
    },
  })

  const isHeir = useWatch({ control, name: 'isHeir' })
  const probateFiled = useWatch({ control, name: 'probateFiled' })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div className="bg-usfr-light/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-usfr-primary mb-4">
          Deceased Owner Information
        </h3>
        <p className="text-sm text-usfr-muted mb-6">
          If the property owner has passed away, please provide the following information.
          If you were the owner and are still living, you may skip this section.
        </p>

        <FormCheckbox
          label="Are you claiming as an heir or beneficiary of a deceased property owner?"
          name="isHeir"
          register={register}
          error={errors.isHeir}
        />

        {isHeir && (
          <div className="mt-6 space-y-6 pl-4 border-l-2 border-usfr-secondary/30">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-usfr-dark mb-3">Deceased Owner Details</h4>

              <FormInput
                label="Deceased Owner's Full Legal Name"
                name="deceasedOwnerName"
                register={register}
                error={errors.deceasedOwnerName}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Date of Death"
                  name="dateOfDeath"
                  type="date"
                  register={register}
                  error={errors.dateOfDeath}
                />
                <FormInput
                  label="Your Relationship to Deceased"
                  name="relationshipToDeceased"
                  placeholder="e.g., Son, Daughter, Spouse"
                  register={register}
                  error={errors.relationshipToDeceased}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-usfr-dark mb-3">Probate Information</h4>

              <FormCheckbox
                label="Has probate been filed?"
                name="probateFiled"
                register={register}
              />

              {probateFiled && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Probate Case Number"
                    name="probateCaseNumber"
                    register={register}
                    error={errors.probateCaseNumber}
                  />
                  <FormInput
                    label="Probate Court (County/State)"
                    name="probateCourt"
                    register={register}
                    error={errors.probateCourt}
                  />
                </div>
              )}

              <FormCheckbox
                label="Is the estate still open?"
                name="isEstateOpen"
                register={register}
              />

              <FormInput
                label="Personal Representative / Executor Name"
                name="personalRepresentativeName"
                register={register}
                error={errors.personalRepresentativeName}
                helpText="If applicable"
              />
            </div>

            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-usfr-dark mb-3">Other Heirs</h4>
              <FormTextarea
                label="List all other known heirs"
                name="otherHeirs"
                placeholder="Include names and relationships (e.g., John Doe - Brother, Jane Doe - Sister)"
                register={register}
                error={errors.otherHeirs}
                helpText="This information is important for determining rightful claimants"
              />
            </div>
          </div>
        )}
      </div>

      {isHeir && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> As an heir, you may need to provide additional documentation
            such as a death certificate, affidavit of heirship, or probate documents.
            We will guide you through the specific requirements for your case.
          </p>
        </div>
      )}

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
