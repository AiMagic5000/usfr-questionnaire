'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import debounce from 'lodash.debounce'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface UseAutoSaveOptions {
  data: Record<string, unknown>
  onSave: (data: Record<string, unknown>) => Promise<void>
  debounceMs?: number
  enabled?: boolean
}

export function useAutoSave({
  data,
  onSave,
  debounceMs = 1500,
  enabled = true,
}: UseAutoSaveOptions) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const isFirstRender = useRef(true)
  const previousData = useRef<string>('')

  const saveData = useCallback(
    async (dataToSave: Record<string, unknown>) => {
      if (!enabled) return

      setSaveStatus('saving')
      try {
        await onSave(dataToSave)
        setSaveStatus('saved')
        setLastSaved(new Date())

        // Reset to idle after 3 seconds
        setTimeout(() => {
          setSaveStatus((current) => (current === 'saved' ? 'idle' : current))
        }, 3000)
      } catch (error) {
        console.error('Auto-save failed:', error)
        setSaveStatus('error')

        // Reset to idle after 5 seconds
        setTimeout(() => {
          setSaveStatus((current) => (current === 'error' ? 'idle' : current))
        }, 5000)
      }
    },
    [onSave, enabled]
  )

  // Create debounced save function
  const debouncedSave = useCallback(
    debounce((dataToSave: Record<string, unknown>) => {
      saveData(dataToSave)
    }, debounceMs),
    [saveData, debounceMs]
  )

  // Watch for data changes and trigger auto-save
  useEffect(() => {
    // Skip first render to avoid saving on initial load
    if (isFirstRender.current) {
      isFirstRender.current = false
      previousData.current = JSON.stringify(data)
      return
    }

    // Only save if data actually changed
    const currentDataStr = JSON.stringify(data)
    if (currentDataStr !== previousData.current) {
      previousData.current = currentDataStr
      debouncedSave(data)
    }

    // Cleanup debounce on unmount
    return () => {
      debouncedSave.cancel()
    }
  }, [data, debouncedSave])

  // Manual save function (bypasses debounce)
  const saveNow = useCallback(() => {
    debouncedSave.cancel()
    return saveData(data)
  }, [data, saveData, debouncedSave])

  return {
    saveStatus,
    lastSaved,
    saveNow,
  }
}
