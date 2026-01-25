'use client'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ownershipSchema, Ownership } from '@/lib/schema'
import { FormInput, FormSelect, FormCheckbox } from '../FormInput'

interface OwnershipStepProps {
  data: Partial<Ownership>
  onNext: (data: Ownership) => void
  onBack: () => void
}

const OWNERSHIP_TYPES = [
  { value: 'sole', label: 'Sole Owner' },
  { value: 'joint', label: 'Joint Tenants / Tenants in Common' },
  { value: 'trust', label: 'Held in Trust' },
  { value: 'corporation', label: 'Corporation / LLC' },
  { value: 'other', label: 'Other' },
]

const ACQUISITION_METHODS = [
  { value: 'purchase', label: 'Purchase' },
  { value: 'inheritance', label: 'Inheritance' },
  { value: 'gift', label: 'Gift' },
  { value: 'other', label: 'Other' },
]

export function OwnershipStep({ data, onNext, onBack }: OwnershipStepProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Ownership>({
    resolver: zodResolver(ownershipSchema),
    defaultValues: {
      ...data,
      hasCoOwners: data.hasCoOwners ?? false,
    },
  })

  const hasCoOwners = useWatch({ control, name: 'hasCoOwners' })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div className="bg-usfr-light/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-usfr-primary mb-4">
          Ownership Information
        </h3>
        <p className="text-sm text-usfr-muted mb-6">
          Provide details about how the property was owned at the time of foreclosure.
        </p>

        <FormSelect
          label="Type of Ownership"
          name="ownershipType"
          required
          options={OWNERSHIP_TYPES}
          register={register}
          error={errors.ownershipType}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Ownership Start Date"
            name="ownershipStartDate"
            type="date"
            required
            register={register}
            error={errors.ownershipStartDate}
            helpText="Date you acquired the property"
          />
          <FormInput
            label="Ownership End Date"
            name="ownershipEndDate"
            type="date"
            register={register}
            error={errors.ownershipEndDate}
            helpText="Date of foreclosure sale"
          />
        </div>

        <FormSelect
          label="How Was the Property Acquired?"
          name="howAcquired"
          required
          options={ACQUISITION_METHODS}
          register={register}
          error={errors.howAcquired}
        />
      </div>

      <div className="bg-usfr-light/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-usfr-primary mb-4">
          Co-Owners
        </h3>

        <FormCheckbox
          label="Were there any co-owners on the property?"
          name="hasCoOwners"
          register={register}
          error={errors.hasCoOwners}
        />

        {hasCoOwners && (
          <div className="mt-4 pl-4 border-l-2 border-usfr-secondary/30">
            <FormInput
              label="Co-Owner Name"
              name="coOwnerName"
              register={register}
              error={errors.coOwnerName}
            />
            <FormInput
              label="Relationship to You"
              name="coOwnerRelationship"
              placeholder="e.g., Spouse, Sibling, Business Partner"
              register={register}
              error={errors.coOwnerRelationship}
            />
            <FormInput
              label="Co-Owner Contact Information"
              name="coOwnerContact"
              placeholder="Phone or email"
              register={register}
              error={errors.coOwnerContact}
            />
          </div>
        )}
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
