'use client'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { liensSchema, Liens } from '@/lib/schema'
import { FormInput, FormCheckbox, FormTextarea } from '../FormInput'

interface LiensStepProps {
  data: Partial<Liens>
  onNext: (data: Liens) => void
  onBack: () => void
}

export function LiensStep({ data, onNext, onBack }: LiensStepProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Liens>({
    resolver: zodResolver(liensSchema),
    defaultValues: {
      ...data,
      hasKnownLiens: data.hasKnownLiens ?? false,
      hasHoaLien: data.hasHoaLien ?? false,
      hasTaxLien: data.hasTaxLien ?? false,
      hasJudgmentLien: data.hasJudgmentLien ?? false,
    },
  })

  const hasKnownLiens = useWatch({ control, name: 'hasKnownLiens' })
  const hasHoaLien = useWatch({ control, name: 'hasHoaLien' })
  const hasTaxLien = useWatch({ control, name: 'hasTaxLien' })
  const hasJudgmentLien = useWatch({ control, name: 'hasJudgmentLien' })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div className="bg-usfr-light/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-usfr-primary mb-4">
          Liens & Encumbrances
        </h3>
        <p className="text-sm text-usfr-muted mb-6">
          List any liens or encumbrances that were on the property at the time of foreclosure.
          This helps us understand what claims may be deducted from the surplus funds.
        </p>

        <FormCheckbox
          label="Were there any known liens on the property besides the foreclosing lien?"
          name="hasKnownLiens"
          register={register}
          error={errors.hasKnownLiens}
        />

        {hasKnownLiens && (
          <div className="mt-4 space-y-6 pl-4 border-l-2 border-usfr-secondary/30">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-usfr-dark mb-3">First Mortgage</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Lender Name"
                  name="firstMortgageLender"
                  register={register}
                  error={errors.firstMortgageLender}
                />
                <FormInput
                  label="Approximate Balance Owed"
                  name="firstMortgageBalance"
                  placeholder="$0.00"
                  register={register}
                  error={errors.firstMortgageBalance}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-usfr-dark mb-3">Second Mortgage / HELOC</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Lender Name"
                  name="secondMortgageLender"
                  register={register}
                  error={errors.secondMortgageLender}
                />
                <FormInput
                  label="Approximate Balance Owed"
                  name="secondMortgageBalance"
                  placeholder="$0.00"
                  register={register}
                  error={errors.secondMortgageBalance}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-usfr-light/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-usfr-primary mb-4">
          Other Liens
        </h3>

        <div className="space-y-4">
          <FormCheckbox
            label="HOA / Condo Association Lien"
            name="hasHoaLien"
            register={register}
          />
          {hasHoaLien && (
            <div className="pl-7 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="HOA Name"
                name="hoaName"
                register={register}
                error={errors.hoaName}
              />
              <FormInput
                label="Amount Owed"
                name="hoaBalance"
                placeholder="$0.00"
                register={register}
                error={errors.hoaBalance}
              />
            </div>
          )}

          <FormCheckbox
            label="Property Tax Lien"
            name="hasTaxLien"
            register={register}
          />
          {hasTaxLien && (
            <div className="pl-7">
              <FormInput
                label="Tax Lien Amount"
                name="taxLienAmount"
                placeholder="$0.00"
                register={register}
                error={errors.taxLienAmount}
              />
            </div>
          )}

          <FormCheckbox
            label="Judgment Lien"
            name="hasJudgmentLien"
            register={register}
          />
          {hasJudgmentLien && (
            <div className="pl-7 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Creditor Name"
                name="judgmentCreditor"
                register={register}
                error={errors.judgmentCreditor}
              />
              <FormInput
                label="Judgment Amount"
                name="judgmentAmount"
                placeholder="$0.00"
                register={register}
                error={errors.judgmentAmount}
              />
            </div>
          )}
        </div>

        <div className="mt-6">
          <FormTextarea
            label="Other Liens or Encumbrances"
            name="otherLiens"
            placeholder="List any other liens not mentioned above..."
            register={register}
            error={errors.otherLiens}
          />
        </div>
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
