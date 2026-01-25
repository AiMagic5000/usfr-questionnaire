'use client'

import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { Shield, FileText, Clock, Lock, ArrowRight, User, PenTool, Video, CheckCircle2, Sparkles } from 'lucide-react'

export function HomeContent() {
  return (
    <div className="min-h-screen bg-usfr-light">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-usfr-primary to-usfr-secondary text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-12 h-12" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            US Foreclosure Recovery
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-4">
            Client Portal
          </p>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10">
            Create your account to complete your surplus funds claim application, sign documents, and track your case - all in one place.
          </p>

          {/* Auth Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignUpButton mode="modal">
              <button className="flex items-center justify-center gap-2 px-8 py-4 bg-usfr-accent text-white rounded-lg font-semibold hover:bg-usfr-accent/90 transition-colors text-lg shadow-lg">
                <User className="w-5 h-5" />
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors text-lg border border-white/30">
                Sign In to Your Account
              </button>
            </SignInButton>
          </div>
        </div>
      </div>

      {/* What You Can Do Section */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-usfr-primary text-center mb-4">
          Everything You Need in One Place
        </h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Your personalized dashboard gives you access to all the tools needed to recover your surplus funds.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md text-center hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="font-semibold text-usfr-dark mb-2">Intake Questionnaire</h3>
            <p className="text-sm text-gray-600">
              Complete your claim application step-by-step with auto-save
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md text-center hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <PenTool className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="font-semibold text-usfr-dark mb-2">E-Signatures</h3>
            <p className="text-sm text-gray-600">
              Sign documents electronically right from your browser
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md text-center hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Video className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="font-semibold text-usfr-dark mb-2">Online Notary</h3>
            <p className="text-sm text-gray-600">
              Get documents notarized via video call from home
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md text-center hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-usfr-dark mb-2">AI-Powered</h3>
            <p className="text-sm text-gray-600">
              Documents auto-populated from your questionnaire data
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-usfr-primary text-center mb-12">
            Why Create an Account?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-usfr-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-usfr-secondary" />
              </div>
              <h3 className="font-semibold text-usfr-dark mb-2">Save Your Progress</h3>
              <p className="text-sm text-gray-600">
                Your answers are automatically saved as you type. Return anytime to finish your application.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-usfr-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-usfr-secondary" />
              </div>
              <h3 className="font-semibold text-usfr-dark mb-2">Secure & Private</h3>
              <p className="text-sm text-gray-600">
                Your personal information is encrypted and stored securely. Only you and our team can access it.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-usfr-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-usfr-secondary" />
              </div>
              <h3 className="font-semibold text-usfr-dark mb-2">Track Your Progress</h3>
              <p className="text-sm text-gray-600">
                See which documents need your attention and track your claim status all in one dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-usfr-primary text-white py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-white/80 mb-6">
            Create your account now and take the first step toward recovering your surplus funds.
          </p>
          <SignUpButton mode="modal">
            <button className="flex items-center justify-center gap-2 px-8 py-4 bg-usfr-accent text-white rounded-lg font-semibold hover:bg-usfr-accent/90 transition-colors text-lg mx-auto">
              <User className="w-5 h-5" />
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </button>
          </SignUpButton>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600">
            <strong>Need help?</strong> Call us at{' '}
            <a href="tel:+18885458007" className="text-usfr-secondary font-semibold hover:underline">
              (888) 545-8007
            </a>{' '}
            or email{' '}
            <a href="mailto:claim@usforeclosurerecovery.com" className="text-usfr-secondary font-semibold hover:underline">
              claim@usforeclosurerecovery.com
            </a>
          </p>
          <p className="text-sm text-gray-500 mt-4">
            &copy; {new Date().getFullYear()} US Foreclosure Recovery. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
