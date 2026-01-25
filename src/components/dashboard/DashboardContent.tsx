'use client'

import { useState, useEffect } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import { DocumentCard } from './DocumentCard'
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Stamp,
  PenTool,
  Video,
  Bell,
  ChevronRight,
  Sparkles
} from 'lucide-react'

export interface Document {
  id: string
  title: string
  description: string
  status: 'pending' | 'ready_to_sign' | 'awaiting_notary' | 'completed'
  priority: number
  requiresNotary: boolean
  aiPopulated: boolean
  signedAt?: string
  notarizedAt?: string
  dueDate?: string
}

// Mock documents - in production, fetch from API
const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'doc-1',
    title: 'Surplus Funds Claim Application',
    description: 'Main claim form with your property and personal information',
    status: 'ready_to_sign',
    priority: 1,
    requiresNotary: false,
    aiPopulated: true,
  },
  {
    id: 'doc-2',
    title: 'Authorization to Release Information',
    description: 'Allows us to obtain records from county and financial institutions',
    status: 'ready_to_sign',
    priority: 2,
    requiresNotary: false,
    aiPopulated: true,
  },
  {
    id: 'doc-3',
    title: 'Power of Attorney (Limited)',
    description: 'Authorizes our team to file claims on your behalf',
    status: 'pending',
    priority: 3,
    requiresNotary: true,
    aiPopulated: false,
  },
  {
    id: 'doc-4',
    title: 'Affidavit of Identity',
    description: 'Sworn statement confirming your identity and ownership',
    status: 'pending',
    priority: 4,
    requiresNotary: true,
    aiPopulated: false,
  },
  {
    id: 'doc-5',
    title: 'Contingency Fee Agreement',
    description: 'Our service agreement outlining fees upon successful recovery',
    status: 'completed',
    priority: 5,
    requiresNotary: false,
    aiPopulated: true,
    signedAt: '2024-01-20T10:30:00Z',
  },
  {
    id: 'doc-6',
    title: 'W-9 Tax Form',
    description: 'Required for IRS reporting of recovered funds',
    status: 'ready_to_sign',
    priority: 6,
    requiresNotary: false,
    aiPopulated: true,
  },
]

export function DashboardContent() {
  const { user, isLoaded } = useUser()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'all' | 'action' | 'completed'>('action')

  useEffect(() => {
    // Simulate loading documents
    setTimeout(() => {
      setDocuments(MOCK_DOCUMENTS.sort((a, b) => a.priority - b.priority))
      setIsLoading(false)
    }, 500)
  }, [])

  const pendingCount = documents.filter(d => d.status !== 'completed').length
  const completedCount = documents.filter(d => d.status === 'completed').length
  const needsNotaryCount = documents.filter(d => d.requiresNotary && d.status !== 'completed').length

  const filteredDocuments = documents.filter(doc => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'action') return doc.status !== 'completed'
    if (activeFilter === 'completed') return doc.status === 'completed'
    return true
  })

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-usfr-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-usfr-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading your documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-usfr-light">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-usfr-primary">Document Center</h1>
              <p className="text-sm text-gray-500">
                Welcome back, {user?.firstName || 'Client'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-500 hover:text-usfr-primary transition-colors">
                <Bell className="w-5 h-5" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-usfr-accent text-white text-xs rounded-full flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-usfr-dark">{pendingCount}</p>
                <p className="text-sm text-gray-500">Documents Need Attention</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Stamp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-usfr-dark">{needsNotaryCount}</p>
                <p className="text-sm text-gray-500">Require Online Notary</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-usfr-dark">{completedCount}</p>
                <p className="text-sm text-gray-500">Documents Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Notice */}
        <div className="bg-gradient-to-r from-usfr-primary to-usfr-secondary text-white rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">AI-Powered Document Preparation</h3>
              <p className="text-white/80 text-sm">
                Your documents are automatically populated with information from your questionnaire.
                Simply review, sign, and you&apos;re done. Documents requiring notarization can be completed
                via online video notary - no need to leave home.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveFilter('action')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === 'action'
                ? 'bg-usfr-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Needs Action ({pendingCount})
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === 'completed'
                ? 'bg-usfr-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-usfr-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Documents
          </button>
        </div>

        {/* Document List */}
        <div className="space-y-4">
          {filteredDocuments.map((doc, index) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              index={index + 1}
              onSign={() => {
                // Handle sign action
                console.log('Sign document:', doc.id)
              }}
              onNotary={() => {
                // Handle notary action
                console.log('Schedule notary:', doc.id)
              }}
            />
          ))}

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-usfr-dark mb-2">
                {activeFilter === 'action' ? 'All caught up!' : 'No documents yet'}
              </h3>
              <p className="text-gray-500">
                {activeFilter === 'action'
                  ? 'You have no documents requiring action right now.'
                  : 'Documents will appear here once they are ready.'}
              </p>
            </div>
          )}
        </div>

        {/* Online Notary CTA */}
        {needsNotaryCount > 0 && (
          <div className="mt-8 bg-white rounded-xl p-6 border-2 border-purple-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Video className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-usfr-dark">Online Notary Available</h3>
                  <p className="text-sm text-gray-500">
                    {needsNotaryCount} document{needsNotaryCount > 1 ? 's' : ''} require notarization.
                    Complete it from home via secure video call.
                  </p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
                Schedule Notary Session
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Need assistance? Call{' '}
            <a href="tel:+18885458007" className="text-usfr-secondary font-medium hover:underline">
              (888) 545-8007
            </a>
            {' '}or email{' '}
            <a href="mailto:claim@usforeclosurerecovery.com" className="text-usfr-secondary font-medium hover:underline">
              claim@usforeclosurerecovery.com
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
