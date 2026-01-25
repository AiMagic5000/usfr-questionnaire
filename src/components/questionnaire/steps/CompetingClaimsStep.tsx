'use client'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { competingClaimsSchema, CompetingClaims } from '@/lib/schema'
import { FormInput, FormCheckbox, FormTextarea } from '../FormInput'

interface CompetingClaimsStepProps {
  data: Partial<CompetingClaims>
  onNext: (data: CompetingClaims) => void
  onBack: () => void
}

export function CompetingClaimsStep({ data, onNext, onBack }: CompetingClaimsStepProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CompetingClaims>({
    resolver: zodResolver(competingClaimsSchema),
    defaultValues: {
      ...data,
      awareOfOtherClaimants: data.awareOfOtherClaimants ?? false,
      receivedSurplusNotice: data.receivedSurplusNotice ?? false,
      contactedByOthers: data.contactedByOthers ?? false,
    },
  })

  const awareOfOthers = useWatch({ control, name: 'awareOfOtherClaimants' })
  const receivedNotice = useWatch({ control, name: 'receivedSurplusNotice' })
  const contactedByOthers = useWatch({ control, name: 'contactedByOthers' })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div className="bg-usfr-light/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-usfr-primary mb-4">
          Competing Claims Awareness
        </h3>
        <p className="text-sm text-usfr-muted mb-6">
          Help us understand if there are other parties who may claim the surplus funds.
        </p>

        <div className="space-y-4">
          <FormCheckbox
            label="Are you aware of any other individuals or entities who may claim the surplus funds?"
            name="awareOfOtherClaimants"
            register={register}
            error={errors.awareOfOtherClaimants}
          />

          {awareOfOthers && (
            <div className="pl-7">
              <FormTextarea
                label="Please provide details about other potential claimants"
                name="otherClaimantDetails"
                placeholder="Include names, relationships, and their basis for claiming..."
                register={register}
                error={errors.otherClaimantDetails}
              />
            </div>
          )}

          <FormCheckbox
            label="Have you received any official notice about surplus funds from the court or county?"
            name="receivedSurplusNotice"
            register={register}
            error={errors.receivedSurplusNotice}
          />

          {receivedNotice && (
            <div className="pl-7">
              <FormInput
                label="Date Notice Received"
                name="noticeReceivedDate"
                type="date"
                register={register}
                error={errors.noticeReceivedDate}
              />
            </div>
          )}

          <FormCheckbox
            label="Have you been contacted by any other companies or individuals about claiming these surplus funds?"
            name="contactedByOthers"
            register={register}
            error={errors.contactedByOthers}
          />

          {contactedByOthers && (
            <div className="pl-7">
              <FormTextarea
                label="Please provide details"
                name="otherContactDetails"
                placeholder="Who contacted you and what did they say?"
                register={register}
                error={errors.otherContactDetails}
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          <strong>Important:</strong> If you have signed any agreements with other recovery companies,
          please disclose this information. It may affect our ability to assist you.
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
