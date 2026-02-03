'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import {
  ArrowLeft,
  Video,
  Calendar,
  Clock,
  CheckCircle2,
  Shield,
  Globe,
  Smartphone,
  Monitor,
  ChevronRight,
  Info,
  Loader2
} from 'lucide-react'

// Available time slots (in production, fetch from notary API)
const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM'
]

// Documents requiring notary
const NOTARY_DOCUMENTS = [
  { id: 'doc-3', title: 'Power of Attorney (Limited)', status: 'pending' },
  { id: 'doc-4', title: 'Affidavit of Identity', status: 'pending' },
]

export function NotaryScheduling() {
  const { user } = useUser()
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isScheduled, setIsScheduled] = useState(false)

  // Generate next 14 days
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i + 1)
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) return null
    return date.toISOString().split('T')[0]
  }).filter(Boolean) as string[]

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime) return

    setIsSubmitting(true)

    try {
      // In production, send to notary scheduling API
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsScheduled(true)
    } catch (error) {
      console.error('Error scheduling notary:', error)
      alert('Failed to schedule. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isScheduled) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-usfr-dark mb-4">Session Scheduled!</h2>
          <p className="text-gray-600 mb-2">
            Your online notary session is confirmed for:
          </p>
          <p className="text-lg font-semibold text-usfr-primary mb-6">
            {formatDate(selectedDate)} at {selectedTime} EST
          </p>

          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-medium text-blue-900 mb-2">What to prepare:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Valid government-issued photo ID</li>
              <li>• Stable internet connection</li>
              <li>• Webcam and microphone</li>
              <li>• Quiet, well-lit location</li>
            </ul>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            You&apos;ll receive an email with the video link 30 minutes before your session.
          </p>

          <button
            onClick={() => router.push('/dashboard?tab=notary')}
            className="w-full py-3 bg-usfr-primary text-white rounded-lg font-medium hover:bg-usfr-primary/90 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard?tab=notary')}
              className="p-2 text-gray-500 hover:text-usfr-primary hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-usfr-dark">Schedule Online Notary</h1>
              <p className="text-sm text-gray-500">Complete notarization from home via video call</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <Video className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-usfr-dark mb-1">Live Video Session</h3>
            <p className="text-sm text-gray-500">Connect with a licensed notary via secure video</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-usfr-dark mb-1">Legally Valid</h3>
            <p className="text-sm text-gray-500">Recognized in all 50 states for surplus claims</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-usfr-dark mb-1">No Travel Required</h3>
            <p className="text-sm text-gray-500">Complete everything from home or office</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Documents to Notarize */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-usfr-dark mb-4">Documents to Notarize</h3>
              <div className="space-y-3">
                {NOTARY_DOCUMENTS.map(doc => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Video className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-purple-900">{doc.title}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4">
                All documents will be notarized in a single session
              </p>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
              <h3 className="font-semibold text-usfr-dark mb-4">You&apos;ll Need</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Monitor className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Computer or tablet with webcam</span>
                </li>
                <li className="flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Valid government-issued photo ID</span>
                </li>
                <li className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Stable internet connection</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Scheduling */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-usfr-dark mb-6">Select Date & Time</h3>

              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Choose a Date
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {availableDates.slice(0, 10).map(date => (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`py-3 px-2 rounded-lg text-center transition-colors ${
                        selectedDate === date
                          ? 'bg-usfr-primary text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="text-xs font-medium">
                        {formatDate(date).split(' ')[0]}
                      </div>
                      <div className="text-lg font-bold">
                        {formatDate(date).split(' ')[2]}
                      </div>
                      <div className="text-xs">
                        {formatDate(date).split(' ')[1]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Choose a Time (Eastern Time)
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {TIME_SLOTS.map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          selectedTime === time
                            ? 'bg-usfr-primary text-white'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              {selectedDate && selectedTime && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">
                      {formatDate(selectedDate)} at {selectedTime} EST
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Session duration: approximately 15-20 minutes
                  </p>
                </div>
              )}

              {/* Schedule Button */}
              <button
                onClick={handleSchedule}
                disabled={!selectedDate || !selectedTime || isSubmitting}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2 ${
                  selectedDate && selectedTime
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Video className="w-5 h-5" />
                    Schedule Notary Session
                  </>
                )}
              </button>

              {/* Info Notice */}
              <div className="flex items-start gap-3 mt-4 p-4 bg-blue-50 rounded-lg">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700">
                  Free rescheduling available up to 2 hours before your session.
                  You&apos;ll receive reminder emails 24 hours and 30 minutes before.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
