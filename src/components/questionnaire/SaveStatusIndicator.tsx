'use client'

import { SaveStatus } from '@/hooks/useAutoSave'
import { Cloud, CloudOff, Check, Loader2 } from 'lucide-react'

interface SaveStatusIndicatorProps {
  status: SaveStatus
  lastSaved: Date | null
}

export function SaveStatusIndicator({ status, lastSaved }: SaveStatusIndicatorProps) {
  const getStatusContent = () => {
    switch (status) {
      case 'saving':
        return (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-usfr-secondary" />
            <span className="text-usfr-secondary">Saving...</span>
          </>
        )
      case 'saved':
        return (
          <>
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-green-600">Saved</span>
          </>
        )
      case 'error':
        return (
          <>
            <CloudOff className="w-4 h-4 text-red-500" />
            <span className="text-red-500">Save failed - will retry</span>
          </>
        )
      default:
        return (
          <>
            <Cloud className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">
              {lastSaved
                ? `Last saved ${formatTimeAgo(lastSaved)}`
                : 'Auto-save enabled'}
            </span>
          </>
        )
    }
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {getStatusContent()}
    </div>
  )
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return date.toLocaleDateString()
}
