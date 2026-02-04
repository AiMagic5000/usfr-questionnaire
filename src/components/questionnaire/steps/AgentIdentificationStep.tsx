'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { agentIdentificationSchema, type AgentIdentification } from '@/lib/schema'
import { Shield, CheckCircle2, AlertCircle, Loader2, Database } from 'lucide-react'
import { ImportLeadsModal } from '../ImportLeadsModal'
import type { MappedFormData } from '@/lib/lead-to-form-mapper'

interface AgentIdentificationStepProps {
  data: Partial<AgentIdentification>
  onNext: (data: AgentIdentification & { agentVerified: boolean }) => void
  onImportLead?: (data: MappedFormData) => void
}

export function AgentIdentificationStep({ data, onNext, onImportLead }: AgentIdentificationStepProps) {
  const [pinStatus, setPinStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle')
  const [verifiedName, setVerifiedName] = useState('')
  const [showImportModal, setShowImportModal] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AgentIdentification>({
    resolver: zodResolver(agentIdentificationSchema),
    defaultValues: {
      agentFullName: data.agentFullName || '',
      agentPin: data.agentPin || '',
    },
  })

  const agentPin = watch('agentPin')

  const validatePin = async (pin: string) => {
    if (pin.length !== 6) return

    setPinStatus('validating')

    try {
      const response = await fetch('/api/agents/validate-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })

      const result = await response.json()

      if (result.valid) {
        setPinStatus('valid')
        setVerifiedName(result.agentName)
        setValue('agentFullName', result.agentName)
        sessionStorage.setItem('usfr_agent_session', result.sessionToken)
        sessionStorage.setItem('usfr_agent_name', result.agentName)
      } else {
        setPinStatus('invalid')
      }
    } catch {
      setPinStatus('invalid')
    }
  }

  const handlePinBlur = () => {
    if (agentPin && agentPin.length === 6 && pinStatus !== 'valid') {
      validatePin(agentPin)
    }
  }

  const onSubmit = (formData: AgentIdentification) => {
    if (pinStatus !== 'valid') {
      validatePin(formData.agentPin)
      return
    }
    onNext({ ...formData, agentVerified: true })
  }

  const handleImportData = (mapped: MappedFormData) => {
    if (onImportLead) {
      onImportLead(mapped)
      setImportSuccess(true)
      setTimeout(() => setImportSuccess(false), 5000)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-[#003366]/5 border border-[#003366]/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#003366]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-[#003366]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-[#003366] text-lg">Agent Verification</h3>
                {pinStatus === 'valid' && (
                  <button
                    type="button"
                    onClick={() => setShowImportModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#003366] text-white text-sm rounded-lg hover:bg-[#002244] transition-colors"
                  >
                    <Database className="w-4 h-4" />
                    <span className="hidden sm:inline">Import from USForeclosureLeads.com</span>
                    <span className="sm:hidden">Import Lead</span>
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Before beginning the client intake, please identify yourself as the assigned
                Asset Recovery Agent. Your 6-digit PIN will be verified against our records.
              </p>
            </div>
          </div>
        </div>

        {importSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800">
              Lead data imported. Personal Info, Property Info, and Liens steps have been pre-populated. You can review and edit before proceeding.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Agent Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agent Full Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('agentFullName')}
              type="text"
              placeholder="Enter your full name"
              readOnly={pinStatus === 'valid'}
              className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#0066cc] ${
                pinStatus === 'valid'
                  ? 'bg-green-50 border-green-300 text-green-900'
                  : errors.agentFullName
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
            />
            {errors.agentFullName && (
              <p className="text-red-500 text-sm mt-1">{errors.agentFullName.message}</p>
            )}
            {pinStatus === 'valid' && (
              <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Verified agent
              </p>
            )}
          </div>

          {/* Agent PIN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agent 6-Digit PIN <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                {...register('agentPin')}
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit PIN"
                onBlur={handlePinBlur}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setValue('agentPin', val)
                  if (val.length === 6) {
                    validatePin(val)
                  } else {
                    setPinStatus('idle')
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#0066cc] pr-12 ${
                  pinStatus === 'valid'
                    ? 'bg-green-50 border-green-300'
                    : pinStatus === 'invalid'
                    ? 'border-red-300 bg-red-50'
                    : errors.agentPin
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {pinStatus === 'validating' && (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                )}
                {pinStatus === 'valid' && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
                {pinStatus === 'invalid' && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>
            {errors.agentPin && (
              <p className="text-red-500 text-sm mt-1">{errors.agentPin.message}</p>
            )}
            {pinStatus === 'invalid' && (
              <p className="text-red-500 text-sm mt-1">Invalid PIN. Please try again.</p>
            )}
            {pinStatus === 'valid' && (
              <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                PIN verified
              </p>
            )}
          </div>
        </div>

        {pinStatus === 'valid' && verifiedName && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-900">Agent Verified: {verifiedName}</p>
              <p className="text-sm text-green-700">You may now proceed with the client intake.</p>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={pinStatus !== 'valid'}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              pinStatus === 'valid'
                ? 'bg-[#ff6600] text-white hover:bg-[#e65c00]'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Begin Client Intake
          </button>
        </div>
      </form>

      <ImportLeadsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportData}
      />
    </>
  )
}
