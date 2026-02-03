'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Lock, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'

interface PinEntryModalProps {
  onSuccess: (agentName: string, sessionToken: string) => void
  onCancel?: () => void
}

export function PinEntryModal({ onSuccess, onCancel }: PinEntryModalProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [agentName, setAgentName] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleDigitChange = useCallback((index: number, value: string) => {
    if (!/^\d?$/.test(value)) return

    const newDigits = [...digits]
    newDigits[index] = value
    setDigits(newDigits)
    setError('')

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (value && index === 5) {
      const pin = newDigits.join('')
      if (pin.length === 6) {
        validatePin(pin)
      }
    }
  }, [digits])

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }, [digits])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const newDigits = pasted.split('')
      setDigits(newDigits)
      inputRefs.current[5]?.focus()
      validatePin(pasted)
    }
  }, [])

  const validatePin = async (pin: string) => {
    setIsValidating(true)
    setError('')

    try {
      const response = await fetch('/api/agents/validate-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })

      const data = await response.json()

      if (data.valid) {
        setIsSuccess(true)
        setAgentName(data.agentName)
        setTimeout(() => {
          onSuccess(data.agentName, data.sessionToken)
        }, 1000)
      } else {
        setError(data.error || 'Invalid PIN. Please try again.')
        setDigits(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    } catch {
      setError('Unable to validate PIN. Please check your connection.')
      setDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-[#003366] to-[#0066cc] p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            {isSuccess ? (
              <CheckCircle2 className="w-8 h-8 text-green-300" />
            ) : (
              <Lock className="w-8 h-8 text-white" />
            )}
          </div>
          <h2 className="text-xl font-bold text-white">
            {isSuccess ? `Welcome, ${agentName}` : 'Agent Verification Required'}
          </h2>
          <p className="text-white/80 text-sm mt-1">
            {isSuccess
              ? 'Access granted. Loading documents...'
              : 'Enter your 6-digit Asset Recovery Agent PIN'}
          </p>
        </div>

        <div className="p-6">
          {!isSuccess && (
            <>
              <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={isValidating}
                    className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#0066cc] ${
                      error
                        ? 'border-red-300 bg-red-50'
                        : digit
                        ? 'border-[#003366] bg-blue-50'
                        : 'border-gray-300'
                    } ${isValidating ? 'opacity-50' : ''}`}
                    aria-label={`PIN digit ${index + 1}`}
                  />
                ))}
              </div>

              {isValidating && (
                <div className="flex items-center justify-center gap-2 text-[#003366] mb-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Validating PIN...</span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-3 mb-4">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </>
          )}

          {isSuccess && (
            <div className="flex items-center justify-center gap-2 text-green-600 py-4">
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-medium">PIN Verified Successfully</span>
            </div>
          )}
        </div>

        {onCancel && !isSuccess && (
          <div className="px-6 pb-6">
            <button
              onClick={onCancel}
              className="w-full py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
