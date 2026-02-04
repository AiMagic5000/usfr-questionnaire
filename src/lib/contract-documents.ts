export interface ContractDocument {
  id: string
  title: string
  filename: string
  group: 'agreements' | 'authorization' | 'notary' | 'administrative'
  description: string
}

export const CONTRACT_DOCUMENTS: ContractDocument[] = [
  {
    id: 'cd-1',
    title: 'Assignment of Rights Agreement',
    filename: 'assignment-of-rights-agreement.docx',
    group: 'authorization',
    description: 'Assigns recovery rights from client to agent',
  },
  {
    id: 'cd-2',
    title: 'Fee Agreement with Cost Cap',
    filename: 'fee-agreement-with-cost-cap.docx',
    group: 'agreements',
    description: 'Fee structure agreement with maximum cost limits',
  },
  {
    id: 'cd-3',
    title: 'Contingent Fee Agreement',
    filename: 'contingent-fee-agreement.docx',
    group: 'agreements',
    description: 'Payment contingent on successful recovery',
  },
  {
    id: 'cd-4',
    title: 'Letter of Direction',
    filename: 'letter-of-direction.docx',
    group: 'authorization',
    description: 'Client authorization directing actions on their behalf',
  },
  {
    id: 'cd-5',
    title: 'Limited Power of Attorney',
    filename: 'limited-power-of-attorney.docx',
    group: 'authorization',
    description: 'Limited authority to act on behalf of the client',
  },
  {
    id: 'cd-6',
    title: 'Mobile Notary Agreement',
    filename: 'mobile-notary-agreement.docx',
    group: 'notary',
    description: 'Agreement for mobile notary services',
  },
  {
    id: 'cd-7',
    title: 'Proposed Disbursement (For Client)',
    filename: 'proposed-disbursement-for-client.docx',
    group: 'administrative',
    description: 'Proposed fund disbursement breakdown for client',
  },
  {
    id: 'cd-8',
    title: 'Miscellaneous Notary Affidavits',
    filename: 'miscellaneous-notary-affidavits.docx',
    group: 'notary',
    description: 'Collection of standard notary affidavit forms',
  },
  {
    id: 'cd-9',
    title: 'Affidavit of Heirship',
    filename: 'affidavit-of-heirship.docx',
    group: 'notary',
    description: 'Sworn statement establishing heirship and rights',
  },
  {
    id: 'cd-10',
    title: 'Partial Assignment of Inheritance Expectancy',
    filename: 'agreement-partial-assignment-inheritance.docx',
    group: 'agreements',
    description: 'Agreement for partial assignment of inheritance rights',
  },
  {
    id: 'cd-11',
    title: 'Client Satisfaction Survey',
    filename: 'client-satisfaction-survey.docx',
    group: 'administrative',
    description: 'Post-service client satisfaction feedback form',
  },
  {
    id: 'cd-12',
    title: 'Employment Agreement',
    filename: 'employment-agreement.docx',
    group: 'agreements',
    description: 'Agent employment terms and conditions',
  },
  {
    id: 'cd-13',
    title: 'Government Audit & Beneficiary Locator Fee Agreement',
    filename: 'government-audit-beneficiary-fee-agreement.docx',
    group: 'agreements',
    description: 'Fee agreement for government audit and beneficiary locator services',
  },
  {
    id: 'cd-14',
    title: 'Pre-Estate / Inactive Estate Finders Fee Agreement',
    filename: 'pre-estate-finders-fee-agreement.docx',
    group: 'agreements',
    description: 'Fee agreement for estate finding services',
  },
  {
    id: 'cd-15',
    title: 'Third-Party Authorization Form',
    filename: 'third-party-authorization-form.docx',
    group: 'authorization',
    description: 'Authorization for third-party information access',
  },
  {
    id: 'cd-16',
    title: 'Assignment of Rights Agreement (Copy)',
    filename: 'assignment-of-rights-agreement-copy.docx',
    group: 'authorization',
    description: 'Duplicate copy of the assignment of rights agreement',
  },
  {
    id: 'cd-17',
    title: 'Additional Info About Foreclosures',
    filename: 'additional-info-about-foreclosures.docx',
    group: 'administrative',
    description: 'Supplemental information and guidance about the foreclosure recovery process',
  },
  {
    id: 'cd-18',
    title: 'Letter / Mail to Client',
    filename: 'letter-mail-to-client.docx',
    group: 'administrative',
    description: 'Standard correspondence letter template for client communication',
  },
]

export const DOCUMENT_GROUPS = {
  agreements: { label: 'Fee & Service Agreements', color: 'blue' },
  authorization: { label: 'Authorization Documents', color: 'green' },
  notary: { label: 'Notary & Affidavit Documents', color: 'purple' },
  administrative: { label: 'Administrative Documents', color: 'gray' },
} as const
