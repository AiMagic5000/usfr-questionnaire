'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, UserButton } from '@clerk/nextjs'
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
  Sparkles,
  ClipboardList,
  Home,
  Settings,
  HelpCircle
} from 'lucide-react'
import { DocumentCard } from './DocumentCard'
import { QuestionnaireContent } from '../questionnaire/QuestionnaireContent'

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

type TabType = 'overview' | 'questionnaire' | 'documents' | 'help'

export function UnifiedDashboard() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  // Calculate questionnaire progress (mock - in production, fetch from API)
  const questionnaireProgress = 45 // percentage

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-usfr-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-usfr-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'questionnaire':
        return <QuestionnaireContent embedded={true} />
      case 'documents':
        return <DocumentsTab
          documents={documents}
          pendingCount={pendingCount}
          completedCount={completedCount}
          needsNotaryCount={needsNotaryCount}
          router={router}
        />
      case 'help':
        return <HelpTab />
      default:
        return <OverviewTab
          documents={documents}
          pendingCount={pendingCount}
          completedCount={completedCount}
          needsNotaryCount={needsNotaryCount}
          questionnaireProgress={questionnaireProgress}
          setActiveTab={setActiveTab}
          router={router}
        />
    }
  }

  return (
    <div className="min-h-screen bg-usfr-light flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="p-6">
          <h1 className="text-xl font-bold text-usfr-primary">US Foreclosure</h1>
          <p className="text-sm text-gray-500">Recovery Portal</p>
        </div>

        <nav className="px-4 space-y-1">
          <SidebarItem
            icon={Home}
            label="Overview"
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <SidebarItem
            icon={ClipboardList}
            label="Questionnaire"
            active={activeTab === 'questionnaire'}
            onClick={() => setActiveTab('questionnaire')}
            badge={questionnaireProgress < 100 ? `${questionnaireProgress}%` : undefined}
            badgeColor={questionnaireProgress < 100 ? 'yellow' : 'green'}
          />
          <SidebarItem
            icon={FileText}
            label="Documents"
            active={activeTab === 'documents'}
            onClick={() => setActiveTab('documents')}
            badge={pendingCount > 0 ? pendingCount.toString() : undefined}
            badgeColor="red"
          />
          <SidebarItem
            icon={HelpCircle}
            label="Help & Support"
            active={activeTab === 'help'}
            onClick={() => setActiveTab('help')}
          />
        </nav>

        {/* User section at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-usfr-dark capitalize">
                  {activeTab === 'questionnaire' ? 'Intake Questionnaire' : activeTab}
                </h2>
                <p className="text-sm text-gray-500">
                  Welcome back, {user?.firstName || 'Client'}
                </p>
              </div>
              <button className="relative p-2 text-gray-500 hover:text-usfr-primary transition-colors">
                <Bell className="w-5 h-5" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-usfr-accent text-white text-xs rounded-full flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <div className="p-8">
          {renderTabContent()}
        </div>
      </main>
    </div>
  )
}

// Sidebar Item Component
function SidebarItem({
  icon: Icon,
  label,
  active,
  onClick,
  badge,
  badgeColor = 'gray'
}: {
  icon: React.ElementType
  label: string
  active: boolean
  onClick: () => void
  badge?: string
  badgeColor?: 'red' | 'yellow' | 'green' | 'gray'
}) {
  const badgeColors = {
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    gray: 'bg-gray-100 text-gray-600',
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
        active
          ? 'bg-usfr-primary text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
      </div>
      {badge && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          active ? 'bg-white/20 text-white' : badgeColors[badgeColor]
        }`}>
          {badge}
        </span>
      )}
    </button>
  )
}

// Overview Tab
function OverviewTab({
  documents,
  pendingCount,
  completedCount,
  needsNotaryCount,
  questionnaireProgress,
  setActiveTab,
  router
}: {
  documents: Document[]
  pendingCount: number
  completedCount: number
  needsNotaryCount: number
  questionnaireProgress: number
  setActiveTab: (tab: TabType) => void
  router: ReturnType<typeof useRouter>
}) {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-usfr-primary to-usfr-secondary text-white rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-xl mb-2">Welcome to Your Recovery Portal</h3>
            <p className="text-white/80">
              Complete your questionnaire and sign your documents to start the recovery process.
              Our AI helps populate your documents automatically - just review and sign!
            </p>
          </div>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Questionnaire Progress */}
        <div
          onClick={() => setActiveTab('questionnaire')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:border-usfr-secondary transition-colors"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-usfr-dark">{questionnaireProgress}%</p>
              <p className="text-sm text-gray-500">Questionnaire</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${questionnaireProgress}%` }}
            />
          </div>
        </div>

        {/* Documents Pending */}
        <div
          onClick={() => setActiveTab('documents')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:border-usfr-secondary transition-colors"
        >
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

        {/* Notary Required */}
        <div
          onClick={() => router.push('/dashboard/notary')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:border-usfr-secondary transition-colors"
        >
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

        {/* Completed */}
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Next Steps */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-usfr-dark mb-4">Next Steps</h3>
          <div className="space-y-3">
            {questionnaireProgress < 100 && (
              <button
                onClick={() => setActiveTab('questionnaire')}
                className="w-full flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Complete Questionnaire</span>
                </div>
                <ChevronRight className="w-5 h-5 text-blue-600" />
              </button>
            )}
            {pendingCount > 0 && (
              <button
                onClick={() => setActiveTab('documents')}
                className="w-full flex items-center justify-between p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <PenTool className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-900">Sign Documents ({pendingCount})</span>
                </div>
                <ChevronRight className="w-5 h-5 text-yellow-600" />
              </button>
            )}
            {needsNotaryCount > 0 && (
              <button
                onClick={() => router.push('/dashboard/notary')}
                className="w-full flex items-center justify-between p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-900">Schedule Notary Session</span>
                </div>
                <ChevronRight className="w-5 h-5 text-purple-600" />
              </button>
            )}
          </div>
        </div>

        {/* Priority Documents */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-usfr-dark mb-4">Priority Documents</h3>
          <div className="space-y-3">
            {documents
              .filter(d => d.status !== 'completed')
              .slice(0, 3)
              .map(doc => (
                <div
                  key={doc.id}
                  onClick={() => router.push(`/dashboard/sign/${doc.id}`)}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    doc.status === 'ready_to_sign' ? 'bg-green-100' :
                    doc.requiresNotary ? 'bg-purple-100' : 'bg-yellow-100'
                  }`}>
                    {doc.requiresNotary ? (
                      <Stamp className="w-4 h-4 text-purple-600" />
                    ) : doc.status === 'ready_to_sign' ? (
                      <PenTool className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{doc.title}</p>
                    <p className="text-xs text-gray-500">
                      {doc.status === 'ready_to_sign' ? 'Ready to sign' :
                       doc.requiresNotary ? 'Requires notary' : 'Preparing'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Documents Tab
function DocumentsTab({
  documents,
  pendingCount,
  completedCount,
  needsNotaryCount,
  router
}: {
  documents: Document[]
  pendingCount: number
  completedCount: number
  needsNotaryCount: number
  router: ReturnType<typeof useRouter>
}) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'action' | 'completed'>('action')

  const filteredDocuments = documents.filter(doc => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'action') return doc.status !== 'completed'
    if (activeFilter === 'completed') return doc.status === 'completed'
    return true
  })

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-usfr-dark">{pendingCount}</p>
              <p className="text-sm text-gray-500">Need Attention</p>
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
              <p className="text-sm text-gray-500">Require Notary</p>
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
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Notice */}
      <div className="bg-gradient-to-r from-usfr-primary to-usfr-secondary text-white rounded-xl p-6">
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
      <div className="flex gap-2">
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
            onSign={() => router.push(`/dashboard/sign/${doc.id}`)}
            onNotary={() => router.push('/dashboard/notary')}
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
        <div className="bg-white rounded-xl p-6 border-2 border-purple-200">
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
            <button
              onClick={() => router.push('/dashboard/notary')}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Schedule Notary Session
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Help Tab
function HelpTab() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-usfr-dark mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div className="border-b border-gray-100 pb-4">
            <h4 className="font-medium text-gray-900 mb-2">How long does the recovery process take?</h4>
            <p className="text-sm text-gray-600">
              The timeline varies by county, but most claims are resolved within 60-90 days after
              all documents are submitted.
            </p>
          </div>
          <div className="border-b border-gray-100 pb-4">
            <h4 className="font-medium text-gray-900 mb-2">What is an online notary?</h4>
            <p className="text-sm text-gray-600">
              Online notarization allows you to have documents notarized via secure video call
              from the comfort of your home. It&apos;s legally valid in all 50 states.
            </p>
          </div>
          <div className="border-b border-gray-100 pb-4">
            <h4 className="font-medium text-gray-900 mb-2">How are my documents pre-populated?</h4>
            <p className="text-sm text-gray-600">
              Our AI system uses the information you provide in the questionnaire to automatically
              fill out your claim documents. You just need to review and sign.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Can I save my progress and come back later?</h4>
            <p className="text-sm text-gray-600">
              Yes! Your questionnaire progress is automatically saved. You can log out and return
              anytime to continue where you left off.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-usfr-dark mb-4">Contact Support</h3>
        <p className="text-gray-600 mb-4">
          Need assistance? Our team is here to help you through the recovery process.
        </p>
        <div className="space-y-3">
          <a
            href="tel:+18885458007"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-10 h-10 bg-usfr-primary/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-usfr-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">(888) 545-8007</p>
              <p className="text-sm text-gray-500">Mon-Fri, 9am-5pm EST</p>
            </div>
          </a>
          <a
            href="mailto:claim@usforeclosurerecovery.com"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-10 h-10 bg-usfr-primary/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-usfr-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">claim@usforeclosurerecovery.com</p>
              <p className="text-sm text-gray-500">We respond within 24 hours</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
