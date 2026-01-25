'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authorizationSchema, Authorization } from '@/lib/schema'
import { FormInput, FormCheckbox } from '../FormInput'
import { Shield, FileSignature } from 'lucide-react'

interface AuthorizationStepProps {
  data: Partial<Authorization>
  onSubmit: (data: Authorization) => void
  onBack: () => void
  isSubmitting?: boolean
}

export function AuthorizationStep({ data, onSubmit, onBack, isSubmitting }: AuthorizationStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Authorization>({
    resolver: zodResolver(authorizationSchema),
    defaultValues: {
      ...data,
      agreeToTerms: data.agreeToTerms ?? false,
      authorizeRelease: data.authorizeRelease ?? false,
      signatureConfirmation: data.signatureConfirmation ?? false,
      signatureDate: data.signatureDate || new Date().toISOString().split('T')[0],
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-usfr-light/50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-usfr-primary" />
          <h3 className="text-lg font-semibold text-usfr-primary">
            Authorization & Agreement
          </h3>
        </div>
        <p className="text-sm text-usfr-muted mb-6">
          Please review and agree to the following terms to complete your application.
        </p>

        <div className="space-y-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-usfr-dark mb-3">Terms and Conditions</h4>
            <div className="max-h-48 overflow-y-auto text-sm text-usfr-muted mb-4 pr-2">
              <p className="mb-3">
                By agreeing to these terms, you acknowledge and agree to the following:
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  You are the rightful claimant or authorized representative for the surplus funds
                  related to the foreclosed property described in this application.
                </li>
                <li>
                  All information provided in this application is true and accurate to the best of your knowledge.
                </li>
                <li>
                  You understand that US Foreclosure Recovery will charge a contingency fee of up to 35% of any
                  surplus funds successfully recovered on your behalf.
                </li>
                <li>
                  You agree to cooperate with US Foreclosure Recovery in providing necessary documentation
                  and information to process your claim.
                </li>
                <li>
                  You understand that recovery is not guaranteed and depends on various factors including
                  the existence and availability of surplus funds.
                </li>
                <li>
                  You agree to our Privacy Policy and understand how your personal information will be used
                  in connection with your claim.
                </li>
              </ol>
            </div>
            <FormCheckbox
              label="I have read, understand, and agree to the Terms and Conditions"
              name="agreeToTerms"
              register={register}
              error={errors.agreeToTerms}
            />
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-usfr-dark mb-3">Authorization to Release Information</h4>
            <p className="text-sm text-usfr-muted mb-4">
              I authorize US Foreclosure Recovery and its agents to request and obtain information
              from any court, county clerk, title company, lender, HOA, or other entity that may have
              records related to my foreclosure and potential surplus funds claim. This authorization
              includes but is not limited to: property records, foreclosure documents, sale proceeds,
              lien information, and any other relevant documentation.
            </p>
            <FormCheckbox
              label="I authorize the release of information as described above"
              name="authorizeRelease"
              register={register}
              error={errors.authorizeRelease}
            />
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <FileSignature className="w-5 h-5 text-usfr-secondary" />
              <h4 className="font-medium text-usfr-dark">Electronic Signature</h4>
            </div>
            <p className="text-sm text-usfr-muted mb-4">
              By checking the box below and entering today&apos;s date, you are providing your electronic
              signature and agree that this has the same legal effect as a handwritten signature.
            </p>
            <FormCheckbox
              label="I confirm that I am providing my electronic signature"
              name="signatureConfirmation"
              register={register}
              error={errors.signatureConfirmation}
            />
            <div className="mt-4 max-w-xs">
              <FormInput
                label="Date"
                name="signatureDate"
                type="date"
                required
                register={register}
                error={errors.signatureDate}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="px-8 py-3 border border-usfr-primary text-usfr-primary font-semibold rounded-lg hover:bg-usfr-primary/5 transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 bg-usfr-accent text-white font-semibold rounded-lg hover:bg-usfr-accent/90 transition-colors focus:outline-none focus:ring-2 focus:ring-usfr-accent/50 disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Application'
          )}
        </button>
      </div>
    </form>
  )
}
