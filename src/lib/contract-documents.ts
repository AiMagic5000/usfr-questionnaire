export interface PlaceholderField {
  name: string
  formDataKey: string
  type: 'text' | 'date' | 'number'
  required: boolean
  defaultValue?: string
}

export interface ContractDocument {
  id: string
  title: string
  filename: string
  group: 'agreements' | 'authorization' | 'notary' | 'administrative'
  description: string
  docusealTemplateId?: number
  docusealExternalId?: string
  requiresNotary: boolean
  placeholderFields: PlaceholderField[]
}

// Shared field definitions reused across documents
const CLAIMANT_FIELDS: PlaceholderField[] = [
  { name: 'Claimant First Name', formDataKey: 'client_first_name', type: 'text', required: true },
  { name: 'Claimant Last Name', formDataKey: 'client_last_name', type: 'text', required: true },
  { name: 'Claimant Middle Name', formDataKey: 'client_middle_name', type: 'text', required: false },
]

const ADDRESS_FIELDS: PlaceholderField[] = [
  { name: 'Client Address', formDataKey: 'client_address', type: 'text', required: true },
  { name: 'City', formDataKey: 'client_city', type: 'text', required: true },
  { name: 'State', formDataKey: 'client_state', type: 'text', required: true },
  { name: 'Zip Code', formDataKey: 'client_zip', type: 'text', required: true },
]

const PROPERTY_FIELDS: PlaceholderField[] = [
  { name: 'Property Address', formDataKey: 'property_address', type: 'text', required: false },
  { name: 'Property City', formDataKey: 'property_city', type: 'text', required: false },
  { name: 'Property State', formDataKey: 'property_state', type: 'text', required: false },
  { name: 'Property Zip', formDataKey: 'property_zip', type: 'text', required: false },
  { name: 'Property County', formDataKey: 'property_county', type: 'text', required: false },
  { name: 'Parcel Number', formDataKey: 'parcel_number', type: 'text', required: false },
]

const SALE_FIELDS: PlaceholderField[] = [
  { name: 'Sale Date', formDataKey: 'sale_date', type: 'date', required: false },
  { name: 'Sale Amount', formDataKey: 'sale_amount', type: 'number', required: false },
  { name: 'Estimated Surplus', formDataKey: 'estimated_surplus', type: 'number', required: false },
]

const COMPANY_FIELD: PlaceholderField = {
  name: 'Company Name',
  formDataKey: 'company_name',
  type: 'text',
  required: true,
  defaultValue: 'US Foreclosure Recovery',
}

const DATE_FIELD: PlaceholderField = {
  name: 'Date',
  formDataKey: 'signing_date',
  type: 'date',
  required: true,
}

const PHONE_FIELD: PlaceholderField = {
  name: 'Phone Number',
  formDataKey: 'client_phone',
  type: 'text',
  required: false,
}

const EMAIL_FIELD: PlaceholderField = {
  name: 'Email Address',
  formDataKey: 'client_email',
  type: 'text',
  required: false,
}

const FORECLOSURE_TYPE_FIELD: PlaceholderField = {
  name: 'Foreclosure Type',
  formDataKey: 'foreclosure_type',
  type: 'text',
  required: false,
}

// Standard field sets for common document types
const STANDARD_AGREEMENT_FIELDS: PlaceholderField[] = [
  ...CLAIMANT_FIELDS,
  ...ADDRESS_FIELDS,
  COMPANY_FIELD,
  DATE_FIELD,
  PHONE_FIELD,
  EMAIL_FIELD,
  ...PROPERTY_FIELDS,
  ...SALE_FIELDS,
  FORECLOSURE_TYPE_FIELD,
]

const STANDARD_NOTARY_FIELDS: PlaceholderField[] = [
  ...CLAIMANT_FIELDS,
  ...ADDRESS_FIELDS,
  COMPANY_FIELD,
  DATE_FIELD,
  PHONE_FIELD,
  EMAIL_FIELD,
  ...PROPERTY_FIELDS,
  ...SALE_FIELDS,
  FORECLOSURE_TYPE_FIELD,
]

export const CONTRACT_DOCUMENTS: ContractDocument[] = [
  {
    id: 'cd-1',
    title: 'Assignment of Rights Agreement',
    filename: 'assignment-of-rights-agreement.docx',
    group: 'authorization',
    description: 'Assigns recovery rights from client to agent',
    docusealTemplateId: 17,
    docusealExternalId: 'assignment-of-rights',
    requiresNotary: true,
    placeholderFields: STANDARD_NOTARY_FIELDS,
  },
  {
    id: 'cd-2',
    title: 'Fee Agreement with Cost Cap',
    filename: 'fee-agreement-with-cost-cap.docx',
    group: 'agreements',
    description: 'Fee structure agreement with maximum cost limits',
    docusealTemplateId: 18,
    docusealExternalId: 'fee-agreement-cost-cap',
    requiresNotary: true,
    placeholderFields: STANDARD_NOTARY_FIELDS,
  },
  {
    id: 'cd-3',
    title: 'Contingent Fee Agreement',
    filename: 'contingent-fee-agreement.docx',
    group: 'agreements',
    description: 'Payment contingent on successful recovery',
    docusealTemplateId: 19,
    docusealExternalId: 'contingent-fee',
    requiresNotary: false,
    placeholderFields: STANDARD_AGREEMENT_FIELDS,
  },
  {
    id: 'cd-4',
    title: 'Letter of Direction',
    filename: 'letter-of-direction.docx',
    group: 'authorization',
    description: 'Client authorization directing actions on their behalf',
    docusealTemplateId: 20,
    docusealExternalId: 'letter-of-direction',
    requiresNotary: true,
    placeholderFields: STANDARD_NOTARY_FIELDS,
  },
  {
    id: 'cd-5',
    title: 'Limited Power of Attorney',
    filename: 'limited-power-of-attorney.docx',
    group: 'authorization',
    description: 'Limited authority to act on behalf of the client',
    docusealTemplateId: 21,
    docusealExternalId: 'limited-poa',
    requiresNotary: true,
    placeholderFields: STANDARD_NOTARY_FIELDS,
  },
  {
    id: 'cd-6',
    title: 'Mobile Notary Agreement',
    filename: 'mobile-notary-agreement.docx',
    group: 'notary',
    description: 'Agreement for mobile notary services',
    docusealTemplateId: 22,
    docusealExternalId: 'mobile-notary',
    requiresNotary: true,
    placeholderFields: [
      ...CLAIMANT_FIELDS,
      ...ADDRESS_FIELDS,
      COMPANY_FIELD,
      DATE_FIELD,
      PHONE_FIELD,
      EMAIL_FIELD,
    ],
  },
  {
    id: 'cd-7',
    title: 'Proposed Disbursement (For Client)',
    filename: 'proposed-disbursement-for-client.docx',
    group: 'administrative',
    description: 'Proposed fund disbursement breakdown for client',
    docusealTemplateId: 23,
    docusealExternalId: 'proposed-disbursement',
    requiresNotary: false,
    placeholderFields: [
      ...CLAIMANT_FIELDS,
      ...ADDRESS_FIELDS,
      COMPANY_FIELD,
      DATE_FIELD,
      ...SALE_FIELDS,
    ],
  },
  {
    id: 'cd-8',
    title: 'Miscellaneous Notary Affidavits',
    filename: 'miscellaneous-notary-affidavits.docx',
    group: 'notary',
    description: 'Collection of standard notary affidavit forms',
    docusealTemplateId: 24,
    docusealExternalId: 'misc-notary-affidavits',
    requiresNotary: true,
    placeholderFields: STANDARD_NOTARY_FIELDS,
  },
  {
    id: 'cd-9',
    title: 'Affidavit of Heirship',
    filename: 'affidavit-of-heirship.docx',
    group: 'notary',
    description: 'Sworn statement establishing heirship and rights',
    docusealTemplateId: 25,
    docusealExternalId: 'affidavit-heirship',
    requiresNotary: true,
    placeholderFields: STANDARD_NOTARY_FIELDS,
  },
  {
    id: 'cd-10',
    title: 'Partial Assignment of Inheritance Expectancy',
    filename: 'agreement-partial-assignment-inheritance.docx',
    group: 'agreements',
    description: 'Agreement for partial assignment of inheritance rights',
    docusealTemplateId: 26,
    docusealExternalId: 'partial-assignment',
    requiresNotary: true,
    placeholderFields: STANDARD_NOTARY_FIELDS,
  },
  {
    id: 'cd-11',
    title: 'Client Satisfaction Survey',
    filename: 'client-satisfaction-survey.docx',
    group: 'administrative',
    description: 'Post-service client satisfaction feedback form',
    docusealTemplateId: 27,
    docusealExternalId: 'client-survey',
    requiresNotary: false,
    placeholderFields: [
      ...CLAIMANT_FIELDS,
      COMPANY_FIELD,
      DATE_FIELD,
      EMAIL_FIELD,
    ],
  },
  {
    id: 'cd-12',
    title: 'Employment Agreement',
    filename: 'employment-agreement.docx',
    group: 'agreements',
    description: 'Agent employment terms and conditions',
    docusealTemplateId: 28,
    docusealExternalId: 'employment-agreement',
    requiresNotary: false,
    placeholderFields: [
      ...CLAIMANT_FIELDS,
      ...ADDRESS_FIELDS,
      COMPANY_FIELD,
      DATE_FIELD,
      PHONE_FIELD,
      EMAIL_FIELD,
    ],
  },
  {
    id: 'cd-13',
    title: 'Government Audit & Beneficiary Locator Fee Agreement',
    filename: 'government-audit-beneficiary-fee-agreement.docx',
    group: 'agreements',
    description: 'Fee agreement for government audit and beneficiary locator services',
    docusealTemplateId: 29,
    docusealExternalId: 'govt-audit-fee',
    requiresNotary: true,
    placeholderFields: STANDARD_NOTARY_FIELDS,
  },
  {
    id: 'cd-14',
    title: 'Pre-Estate / Inactive Estate Finders Fee Agreement',
    filename: 'pre-estate-finders-fee-agreement.docx',
    group: 'agreements',
    description: 'Fee agreement for estate finding services',
    docusealTemplateId: 30,
    docusealExternalId: 'pre-estate-finders',
    requiresNotary: false,
    placeholderFields: STANDARD_AGREEMENT_FIELDS,
  },
  {
    id: 'cd-15',
    title: 'Third-Party Authorization Form',
    filename: 'third-party-authorization-form.docx',
    group: 'authorization',
    description: 'Authorization for third-party information access',
    docusealTemplateId: 31,
    docusealExternalId: 'third-party-auth',
    requiresNotary: false,
    placeholderFields: [
      ...CLAIMANT_FIELDS,
      ...ADDRESS_FIELDS,
      COMPANY_FIELD,
      DATE_FIELD,
      PHONE_FIELD,
      EMAIL_FIELD,
    ],
  },
  {
    id: 'cd-16',
    title: 'Assignment of Rights Agreement (Copy)',
    filename: 'assignment-of-rights-agreement-copy.docx',
    group: 'authorization',
    description: 'Duplicate copy of the assignment of rights agreement',
    docusealTemplateId: 32,
    docusealExternalId: 'assignment-of-rights-notary',
    requiresNotary: true,
    placeholderFields: STANDARD_NOTARY_FIELDS,
  },
  {
    id: 'cd-17',
    title: 'Additional Info About Foreclosures',
    filename: 'additional-info-about-foreclosures.docx',
    group: 'administrative',
    description: 'Supplemental information and guidance about the foreclosure recovery process',
    requiresNotary: false,
    placeholderFields: [],
  },
  {
    id: 'cd-18',
    title: 'Letter / Mail to Client',
    filename: 'letter-mail-to-client.docx',
    group: 'administrative',
    description: 'Standard correspondence letter template for client communication',
    requiresNotary: false,
    placeholderFields: [
      ...CLAIMANT_FIELDS,
      ...ADDRESS_FIELDS,
      COMPANY_FIELD,
      DATE_FIELD,
    ],
  },
]

export const DOCUMENT_GROUPS = {
  agreements: { label: 'Fee & Service Agreements', color: 'blue' },
  authorization: { label: 'Authorization Documents', color: 'green' },
  notary: { label: 'Notary & Affidavit Documents', color: 'purple' },
  administrative: { label: 'Administrative Documents', color: 'gray' },
} as const

/**
 * Find a contract document by its ID.
 */
export function getContractDocument(id: string): ContractDocument | undefined {
  return CONTRACT_DOCUMENTS.find(d => d.id === id)
}

/**
 * Find a contract document by its DocuSeal template ID.
 */
export function getContractDocumentByTemplateId(templateId: number): ContractDocument | undefined {
  return CONTRACT_DOCUMENTS.find(d => d.docusealTemplateId === templateId)
}
