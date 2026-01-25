import { z } from 'zod'

// Step 1: Personal Information
export const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  middleName: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  ssnLastFour: z.string().length(4, 'Enter last 4 digits of SSN').regex(/^\d{4}$/, 'Must be 4 digits'),
  email: z.string().email('Valid email is required'),
  phonePrimary: z.string().min(10, 'Phone number is required'),
  phoneSecondary: z.string().optional(),
  currentAddress: z.string().min(5, 'Current address is required'),
  currentCity: z.string().min(2, 'City is required'),
  currentState: z.string().length(2, 'State is required'),
  currentZip: z.string().min(5, 'ZIP code is required'),
})

// Step 2: Property Information
export const propertyInfoSchema = z.object({
  propertyAddress: z.string().min(5, 'Property address is required'),
  propertyCity: z.string().min(2, 'City is required'),
  propertyState: z.string().length(2, 'State is required'),
  propertyZip: z.string().min(5, 'ZIP code is required'),
  propertyCounty: z.string().min(2, 'County is required'),
  parcelNumber: z.string().optional(),
  foreclosureType: z.enum(['mortgage', 'tax_sale', 'hoa', 'other'], 'Please select foreclosure type'),
  saleDate: z.string().min(1, 'Sale date is required'),
  saleAmount: z.string().optional(),
  estimatedSurplus: z.string().optional(),
})

// Step 3: Ownership History
export const ownershipSchema = z.object({
  ownershipType: z.enum(['sole', 'joint', 'trust', 'corporation', 'other'], 'Please select ownership type'),
  ownershipStartDate: z.string().min(1, 'Start date is required'),
  ownershipEndDate: z.string().optional(),
  howAcquired: z.enum(['purchase', 'inheritance', 'gift', 'other'], 'Please select how property was acquired'),
  hasCoOwners: z.boolean(),
  coOwnerName: z.string().optional(),
  coOwnerRelationship: z.string().optional(),
  coOwnerContact: z.string().optional(),
})

// Step 4: Liens & Encumbrances
export const liensSchema = z.object({
  hasKnownLiens: z.boolean(),
  firstMortgageLender: z.string().optional(),
  firstMortgageBalance: z.string().optional(),
  secondMortgageLender: z.string().optional(),
  secondMortgageBalance: z.string().optional(),
  hasHoaLien: z.boolean(),
  hoaName: z.string().optional(),
  hoaBalance: z.string().optional(),
  hasTaxLien: z.boolean(),
  taxLienAmount: z.string().optional(),
  hasJudgmentLien: z.boolean(),
  judgmentCreditor: z.string().optional(),
  judgmentAmount: z.string().optional(),
  otherLiens: z.string().optional(),
})

// Step 5: Competing Claims Awareness
export const competingClaimsSchema = z.object({
  awareOfOtherClaimants: z.boolean(),
  otherClaimantDetails: z.string().optional(),
  receivedSurplusNotice: z.boolean(),
  noticeReceivedDate: z.string().optional(),
  contactedByOthers: z.boolean(),
  otherContactDetails: z.string().optional(),
})

// Step 6: Deceased Owner (Conditional)
export const deceasedOwnerSchema = z.object({
  isHeir: z.boolean(),
  deceasedOwnerName: z.string().optional(),
  dateOfDeath: z.string().optional(),
  relationshipToDeceased: z.string().optional(),
  probateFiled: z.boolean().optional(),
  probateCaseNumber: z.string().optional(),
  probateCourt: z.string().optional(),
  isEstateOpen: z.boolean().optional(),
  personalRepresentativeName: z.string().optional(),
  otherHeirs: z.string().optional(),
})

// Step 7: Bankruptcy Information (Conditional)
export const bankruptcySchema = z.object({
  filedBankruptcy: z.boolean(),
  bankruptcyChapter: z.enum(['7', '11', '13', 'none']).optional(),
  bankruptcyCaseNumber: z.string().optional(),
  bankruptcyCourt: z.string().optional(),
  filingDate: z.string().optional(),
  dischargeDate: z.string().optional(),
  currentlyInBankruptcy: z.boolean().optional(),
})

// Step 8: Document Checklist
export const documentChecklistSchema = z.object({
  hasGovernmentId: z.boolean(),
  hasDeed: z.boolean(),
  hasForeclosureNotice: z.boolean(),
  hasSaleConfirmation: z.boolean(),
  hasDeathCertificate: z.boolean().optional(),
  hasProbateDocuments: z.boolean().optional(),
  hasAffidavitHeirship: z.boolean().optional(),
  hasMarriageCertificate: z.boolean().optional(),
  hasDivorceCertificate: z.boolean().optional(),
  hasTrustDocuments: z.boolean().optional(),
  hasCorporateDocuments: z.boolean().optional(),
  additionalDocuments: z.string().optional(),
})

// Step 9: Authorization & Signature
export const authorizationSchema = z.object({
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
  authorizeRelease: z.boolean().refine(val => val === true, {
    message: 'You must authorize the release of information',
  }),
  signatureConfirmation: z.boolean().refine(val => val === true, {
    message: 'You must confirm your electronic signature',
  }),
  signatureDate: z.string().min(1, 'Date is required'),
})

// Combined schema for full form
export const fullQuestionnaireSchema = z.object({
  personalInfo: personalInfoSchema,
  propertyInfo: propertyInfoSchema,
  ownership: ownershipSchema,
  liens: liensSchema,
  competingClaims: competingClaimsSchema,
  deceasedOwner: deceasedOwnerSchema,
  bankruptcy: bankruptcySchema,
  documentChecklist: documentChecklistSchema,
  authorization: authorizationSchema,
})

export type PersonalInfo = z.infer<typeof personalInfoSchema>
export type PropertyInfo = z.infer<typeof propertyInfoSchema>
export type Ownership = z.infer<typeof ownershipSchema>
export type Liens = z.infer<typeof liensSchema>
export type CompetingClaims = z.infer<typeof competingClaimsSchema>
export type DeceasedOwner = z.infer<typeof deceasedOwnerSchema>
export type Bankruptcy = z.infer<typeof bankruptcySchema>
export type DocumentChecklist = z.infer<typeof documentChecklistSchema>
export type Authorization = z.infer<typeof authorizationSchema>
export type FullQuestionnaire = z.infer<typeof fullQuestionnaireSchema>
