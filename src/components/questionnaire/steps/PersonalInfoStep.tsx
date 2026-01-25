'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { personalInfoSchema, PersonalInfo } from '@/lib/schema'
import { FormInput, FormSelect } from '../FormInput'

interface PersonalInfoStepProps {
  data: Partial<PersonalInfo>
  onNext: (data: PersonalInfo) => void
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

export function PersonalInfoStep({ data, onNext }: PersonalInfoStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: data,
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div className="bg-usfr-light/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-usfr-primary mb-4">
          Personal Information
        </h3>
        <p className="text-sm text-usfr-muted mb-6">
          Please provide your current legal name and contact information.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            label="First Name"
            name="firstName"
            required
            register={register}
            error={errors.firstName}
          />
          <FormInput
            label="Middle Name"
            name="middleName"
            register={register}
            error={errors.middleName}
          />
          <FormInput
            label="Last Name"
            name="lastName"
            required
            register={register}
            error={errors.lastName}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            required
            register={register}
            error={errors.dateOfBirth}
          />
          <FormInput
            label="Last 4 Digits of SSN"
            name="ssnLastFour"
            placeholder="1234"
            required
            register={register}
            error={errors.ssnLastFour}
            helpText="Used for identity verification only"
          />
        </div>
      </div>

      <div className="bg-usfr-light/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-usfr-primary mb-4">
          Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            required
            register={register}
            error={errors.email}
          />
          <FormInput
            label="Primary Phone"
            name="phonePrimary"
            type="tel"
            placeholder="(555) 123-4567"
            required
            register={register}
            error={errors.phonePrimary}
          />
        </div>

        <FormInput
          label="Secondary Phone"
          name="phoneSecondary"
          type="tel"
          placeholder="(555) 123-4567"
          register={register}
          error={errors.phoneSecondary}
        />
      </div>

      <div className="bg-usfr-light/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-usfr-primary mb-4">
          Current Mailing Address
        </h3>

        <FormInput
          label="Street Address"
          name="currentAddress"
          required
          register={register}
          error={errors.currentAddress}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            label="City"
            name="currentCity"
            required
            register={register}
            error={errors.currentCity}
          />
          <FormSelect
            label="State"
            name="currentState"
            required
            options={US_STATES}
            register={register}
            error={errors.currentState}
          />
          <FormInput
            label="ZIP Code"
            name="currentZip"
            required
            register={register}
            error={errors.currentZip}
          />
        </div>
      </div>

      <div className="flex justify-end">
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
