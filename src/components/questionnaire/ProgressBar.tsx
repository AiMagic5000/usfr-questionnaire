'use client'

import { Check } from 'lucide-react'

interface Step {
  id: number
  name: string
  shortName: string
}

interface ProgressBarProps {
  steps: Step[]
  currentStep: number
}

export function ProgressBar({ steps, currentStep }: ProgressBarProps) {
  return (
    <div className="w-full py-4">
      {/* Mobile view - simple progress */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-usfr-primary">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm text-usfr-muted">
            {steps[currentStep - 1]?.shortName}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-usfr-accent h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop view - step indicators */}
      <div className="hidden sm:block">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {steps.map((step, index) => (
              <li key={step.id} className="flex-1 relative">
                {index !== 0 && (
                  <div
                    className={`absolute left-0 top-4 -translate-y-1/2 w-full h-0.5 -ml-4 ${
                      step.id <= currentStep ? 'bg-usfr-accent' : 'bg-gray-200'
                    }`}
                    style={{ width: 'calc(100% - 1rem)' }}
                  />
                )}
                <div className="relative flex flex-col items-center group">
                  <span
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                      step.id < currentStep
                        ? 'bg-usfr-accent text-white'
                        : step.id === currentStep
                        ? 'bg-usfr-primary text-white ring-2 ring-usfr-accent ring-offset-2'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </span>
                  <span
                    className={`mt-2 text-xs text-center max-w-[80px] ${
                      step.id === currentStep
                        ? 'text-usfr-primary font-semibold'
                        : 'text-usfr-muted'
                    }`}
                  >
                    {step.shortName}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  )
}
