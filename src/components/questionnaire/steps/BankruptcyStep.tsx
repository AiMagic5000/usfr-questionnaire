'use client'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bankruptcySchema, Bankruptcy } from '@/lib/schema'
import { FormInput, FormSelect, FormCheckbox } from '../FormInput'

interface BankruptcyStepProps {
  data: Partial<Bankruptcy>
  onNext: (data: Bankruptcy) => void
  onBack: () => void
}

const BANKRUPTCY_CHAPTERS = [
  { value: 'none', label: 'Not Applicable' },
  { value: '7', label: 'Chapter 7' },
  { value: '13', label: 'Chapter 13' },
  { value: '11', label: 'Chapter 11' },
]

export function BankruptcyStep({ data, onNext, onBack }: BankruptcyStepProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Bankruptcy>({
    resolver: zodResolver(bankruptcySchema),
    defaultValues: {
      ...data,
      filedBankruptcy: data.filedBankruptcy ?? false,
      currentlyInBankruptcy: data.currentlyInBankruptcy ?? false,
    },
  })

  const filedBankruptcy = useWatch({ control, name: 'filedBankruptcy' })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div className="bg-usfr-light/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-usfr-primary mb-4">
          Bankruptcy Information
        </h3>
        <p className="text-sm text-usfr-muted mb-6">
          Bankruptcy filings can affect your claim to surplus funds. Please provide accurate information.
        </p>

        <FormCheckbox
          label="Have you filed for bankruptcy within the past 10 years?"
          name="filedBankruptcy"
          register={register}
          error={errors.filedBankruptcy}
        />

        {filedBankruptcy && (
          <div className="mt-6 space-y-6 pl-4 border-l-2 border-usfr-secondary/30">
            <FormSelect
              label="Bankruptcy Chapter"
              name="bankruptcyChapter"
              options={BANKRUPTCY_CHAPTERS}
              register={register}
              error={errors.bankruptcyChapter}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Bankruptcy Case Number"
                name="bankruptcyCaseNumber"
                register={register}
                error={errors.bankruptcyCaseNumber}
              />
              <FormInput
                label="Bankruptcy Court"
                name="bankruptcyCourt"
                placeholder="e.g., US Bankruptcy Court, Central District of California"
                register={register}
                error={errors.bankruptcyCourt}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Filing Date"
                name="filingDate"
                type="date"
                register={register}
                error={errors.filingDate}
              />
              <FormInput
                label="Discharge Date"
                name="dischargeDate"
                type="date"
                register={register}
                error={errors.dischargeDate}
                helpText="If applicable"
              />
            </div>

            <FormCheckbox
              label="Are you currently in an active bankruptcy case?"
              name="currentlyInBankruptcy"
              register={register}
              error={errors.currentlyInBankruptcy}
            />
          </div>
        )}
      </div>

      {filedBankruptcy && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <strong>Important:</strong> If you are currently in an active bankruptcy case,
            the surplus funds may be considered part of your bankruptcy estate. You may need
            court approval to pursue this claim. We will work with you to navigate this process.
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
