'use client'

import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { Shield, FileText, Clock, Lock, ArrowRight, User } from 'lucide-react'

export function HomeContent() {
  return (
    <div className="min-h-screen bg-usfr-light">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-usfr-primary to-usfr-secondary text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Client Intake Questionnaire
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Complete your surplus funds claim application securely. Create an account to save your progress and return anytime to finish.
          </p>

          {/* Auth Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignUpButton mode="modal">
              <button className="flex items-center justify-center gap-2 px-8 py-4 bg-usfr-accent text-white rounded-lg font-semibold hover:bg-usfr-accent/90 transition-colors text-lg">
                <User className="w-5 h-5" />
                Create Account
                <ArrowRight className="w-5 h-5" />
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors text-lg border border-white/30">
                Sign In to Continue
              </button>
            </SignInButton>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-usfr-primary text-center mb-12">
          Why Create an Account?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="w-12 h-12 bg-usfr-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-usfr-secondary" />
            </div>
            <h3 className="font-semibold text-usfr-dark mb-2">Save Your Progress</h3>
            <p className="text-sm text-gray-600">
              Your answers are automatically saved as you type. Return anytime to finish your application.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="w-12 h-12 bg-usfr-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-usfr-secondary" />
            </div>
            <h3 className="font-semibold text-usfr-dark mb-2">Secure & Private</h3>
            <p className="text-sm text-gray-600">
              Your personal information is encrypted and stored securely. Only you and our team can access it.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="w-12 h-12 bg-usfr-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-usfr-secondary" />
            </div>
            <h3 className="font-semibold text-usfr-dark mb-2">Track Your Case</h3>
            <p className="text-sm text-gray-600">
              After submission, log in to check your case status and communicate with your case manager.
            </p>
          </div>
        </div>

        {/* Notice */}
        <div className="mt-12 bg-usfr-primary/5 border border-usfr-primary/20 rounded-xl p-6 text-center">
          <p className="text-usfr-dark">
            <strong>Need help?</strong> Call us at{' '}
            <a href="tel:+18885458007" className="text-usfr-secondary font-semibold hover:underline">
              (888) 545-8007
            </a>{' '}
            or email{' '}
            <a href="mailto:claim@usforeclosurerecovery.com" className="text-usfr-secondary font-semibold hover:underline">
              claim@usforeclosurerecovery.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
