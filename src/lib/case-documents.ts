/**
 * Maps foreclosure case types to the required document templates.
 * Based on the Foreclosure Academy guide document workflow.
 */

export type CaseType = 'standard' | 'heir' | 'attorney_required' | 'pre_estate'

export interface RequiredDocument {
  templateName: string
  priority: number
  requiresNotary: boolean
  group: 'agreements' | 'authorization' | 'notary' | 'administrative'
  condition?: 'always' | 'heir_only' | 'attorney_only' | 'pre_estate_only'
}

/**
 * Core documents required for every case.
 * Order matches the Foreclosure Academy recommended signing flow:
 * Fee Agreement FIRST, then authorization docs, then supplementary.
 */
export const CASE_DOCUMENT_SETS: Record<CaseType, RequiredDocument[]> = {
  standard: [
    { templateName: 'Contingent Fee Agreement', priority: 1, requiresNotary: false, group: 'agreements', condition: 'always' },
    { templateName: 'Letter of Direction', priority: 2, requiresNotary: true, group: 'authorization', condition: 'always' },
    { templateName: 'Assignment of Rights Agreement', priority: 3, requiresNotary: true, group: 'authorization', condition: 'always' },
    { templateName: 'Limited Power of Attorney', priority: 4, requiresNotary: true, group: 'authorization', condition: 'always' },
    { templateName: 'Third-Party Authorization Form', priority: 5, requiresNotary: false, group: 'authorization', condition: 'always' },
    { templateName: 'Letter / Mail to Client', priority: 10, requiresNotary: false, group: 'administrative', condition: 'always' },
  ],
  heir: [
    { templateName: 'Contingent Fee Agreement', priority: 1, requiresNotary: false, group: 'agreements', condition: 'always' },
    { templateName: 'Affidavit of Heirship', priority: 2, requiresNotary: true, group: 'notary', condition: 'heir_only' },
    { templateName: 'Partial Assignment of Inheritance Expectancy', priority: 3, requiresNotary: true, group: 'agreements', condition: 'heir_only' },
    { templateName: 'Letter of Direction', priority: 4, requiresNotary: true, group: 'authorization', condition: 'always' },
    { templateName: 'Assignment of Rights Agreement', priority: 5, requiresNotary: true, group: 'authorization', condition: 'always' },
    { templateName: 'Limited Power of Attorney', priority: 6, requiresNotary: true, group: 'authorization', condition: 'always' },
    { templateName: 'Third-Party Authorization Form', priority: 7, requiresNotary: false, group: 'authorization', condition: 'always' },
    { templateName: 'Letter / Mail to Client', priority: 10, requiresNotary: false, group: 'administrative', condition: 'always' },
  ],
  attorney_required: [
    { templateName: 'Contingent Fee Agreement', priority: 1, requiresNotary: false, group: 'agreements', condition: 'always' },
    { templateName: 'Employment Agreement', priority: 2, requiresNotary: false, group: 'agreements', condition: 'attorney_only' },
    { templateName: 'Letter of Direction', priority: 3, requiresNotary: true, group: 'authorization', condition: 'always' },
    { templateName: 'Limited Power of Attorney', priority: 4, requiresNotary: true, group: 'authorization', condition: 'always' },
    { templateName: 'Third-Party Authorization Form', priority: 5, requiresNotary: false, group: 'authorization', condition: 'always' },
    { templateName: 'Letter / Mail to Client', priority: 10, requiresNotary: false, group: 'administrative', condition: 'always' },
  ],
  pre_estate: [
    { templateName: 'Pre-Estate / Inactive Estate Finders Fee Agreement', priority: 1, requiresNotary: false, group: 'agreements', condition: 'pre_estate_only' },
    { templateName: 'Affidavit of Heirship', priority: 2, requiresNotary: true, group: 'notary', condition: 'heir_only' },
    { templateName: 'Letter of Direction', priority: 3, requiresNotary: true, group: 'authorization', condition: 'always' },
    { templateName: 'Limited Power of Attorney', priority: 4, requiresNotary: true, group: 'authorization', condition: 'always' },
    { templateName: 'Third-Party Authorization Form', priority: 5, requiresNotary: false, group: 'authorization', condition: 'always' },
    { templateName: 'Letter / Mail to Client', priority: 10, requiresNotary: false, group: 'administrative', condition: 'always' },
  ],
}

/**
 * Determine the case type from questionnaire data
 */
export function determineCaseType(questionnaire: Record<string, unknown>): CaseType {
  const deceasedOwner = questionnaire.deceasedOwner as Record<string, unknown> | undefined
  const isHeir = deceasedOwner?.isHeir === true
  const isEstateOpen = deceasedOwner?.isEstateOpen === true

  // Pre-estate: heir but no estate opened
  if (isHeir && !isEstateOpen) {
    return 'pre_estate'
  }

  // Heir with estate open
  if (isHeir) {
    return 'heir'
  }

  // Check if state requires attorney (Colorado, California)
  const propertyInfo = questionnaire.propertyInfo as Record<string, unknown> | undefined
  const state = (propertyInfo?.propertyState as string || '').toUpperCase()
  const attorneyRequiredStates = ['CO', 'CA']
  if (attorneyRequiredStates.includes(state)) {
    return 'attorney_required'
  }

  return 'standard'
}

/**
 * Generate a unique case number
 */
export function generateCaseNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `USFR-${year}-${random}`
}
