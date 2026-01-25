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
  onStepClick?: (stepId: number) => void
  completedSteps?: Set<number>
}

export function ProgressBar({ steps, currentStep, onStepClick, completedSteps = new Set() }: ProgressBarProps) {
  const handleStepClick = (stepId: number) => {
    if (onStepClick) {
      onStepClick(stepId)
    }
  }

  return (
    <div className="w-full py-4">
      {/* Mobile view - scrollable tabs */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-usfr-primary">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm text-usfr-muted">
            {steps[currentStep - 1]?.shortName}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div
            className="bg-usfr-accent h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
        {/* Scrollable step buttons for mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                step.id === currentStep
                  ? 'bg-usfr-primary text-white'
                  : completedSteps.has(step.id)
                  ? 'bg-usfr-accent/20 text-usfr-accent border border-usfr-accent'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {completedSteps.has(step.id) && step.id !== currentStep && (
                <Check className="w-3 h-3 inline mr-1" />
              )}
              {step.shortName}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop view - clickable step indicators */}
      <div className="hidden sm:block">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {steps.map((step, index) => (
              <li key={step.id} className="flex-1 relative">
                {index !== 0 && (
                  <div
                    className={`absolute left-0 top-4 -translate-y-1/2 w-full h-0.5 -ml-4 ${
                      step.id <= currentStep || completedSteps.has(step.id) ? 'bg-usfr-accent' : 'bg-gray-200'
                    }`}
                    style={{ width: 'calc(100% - 1rem)' }}
                  />
                )}
                <button
                  onClick={() => handleStepClick(step.id)}
                  className="relative flex flex-col items-center group w-full"
                >
                  <span
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all cursor-pointer ${
                      completedSteps.has(step.id) && step.id !== currentStep
                        ? 'bg-usfr-accent text-white hover:ring-2 hover:ring-usfr-accent hover:ring-offset-2'
                        : step.id === currentStep
                        ? 'bg-usfr-primary text-white ring-2 ring-usfr-accent ring-offset-2'
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    }`}
                  >
                    {completedSteps.has(step.id) && step.id !== currentStep ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </span>
                  <span
                    className={`mt-2 text-xs text-center max-w-[80px] transition-colors ${
                      step.id === currentStep
                        ? 'text-usfr-primary font-semibold'
                        : completedSteps.has(step.id)
                        ? 'text-usfr-accent font-medium'
                        : 'text-usfr-muted group-hover:text-usfr-dark'
                    }`}
                  >
                    {step.shortName}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  )
}
