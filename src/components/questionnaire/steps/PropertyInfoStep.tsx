'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { propertyInfoSchema, PropertyInfo } from '@/lib/schema'
import { FormInput, FormSelect } from '../FormInput'

interface PropertyInfoStepProps {
  data: Partial<PropertyInfo>
  onNext: (data: PropertyInfo) => void
  onBack: () => void
}

const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' }, { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'Washington DC' },
]

const FORECLOSURE_TYPES = [
  { value: 'mortgage', label: 'Mortgage Foreclosure' },
  { value: 'tax_sale', label: 'Tax Sale / Tax Lien Foreclosure' },
  { value: 'hoa', label: 'HOA Foreclosure' },
  { value: 'other', label: 'Other' },
]

export function PropertyInfoStep({ data, onNext, onBack }: PropertyInfoStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PropertyInfo>({
    resolver: zodResolver(propertyInfoSchema),
    defaultValues: data,
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div className="bg-usfr-light/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-usfr-primary mb-4">
          Foreclosed Property Address
        </h3>
        <p className="text-sm text-usfr-muted mb-6">
          Enter the address of the property that was foreclosed.
        </p>

        <FormInput
          label="Property Street Address"
          name="propertyAddress"
          required
          register={register}
          error={errors.propertyAddress}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="City"
            name="propertyCity"
            required
            register={register}
            error={errors.propertyCity}
          />
          <FormSelect
            label="State"
            name="propertyState"
            required
            options={US_STATES}
            register={register}
            error={errors.propertyState}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="ZIP Code"
            name="propertyZip"
            required
            register={register}
            error={errors.propertyZip}
          />
          <FormInput
            label="County"
            name="propertyCounty"
            required
            register={register}
            error={errors.propertyCounty}
          />
        </div>

        <FormInput
          label="Parcel Number / APN"
          name="parcelNumber"
          register={register}
          error={errors.parcelNumber}
          helpText="If known - can be found on property tax records"
        />
      </div>

      <div className="bg-usfr-light/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-usfr-primary mb-4">
          Foreclosure Details
        </h3>

        <FormSelect
          label="Type of Foreclosure"
          name="foreclosureType"
          required
          options={FORECLOSURE_TYPES}
          register={register}
          error={errors.foreclosureType}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Date of Foreclosure Sale"
            name="saleDate"
            type="date"
            required
            register={register}
            error={errors.saleDate}
          />
          <FormInput
            label="Sale Amount"
            name="saleAmount"
            placeholder="$0.00"
            register={register}
            error={errors.saleAmount}
            helpText="If known"
          />
        </div>

        <FormInput
          label="Estimated Surplus Amount"
          name="estimatedSurplus"
          placeholder="$0.00"
          register={register}
          error={errors.estimatedSurplus}
          helpText="Amount you believe may be owed to you, if known"
        />
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
