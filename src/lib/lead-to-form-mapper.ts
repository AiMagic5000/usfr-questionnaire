export interface ForeclosureLead {
  id: string
  owner_name: string
  property_address: string
  city: string
  state_abbr: string
  zip_code: string
  parcel_id: string | null
  foreclosure_type: string | null
  sale_date: string | null
  sale_amount: number | null
  mortgage_amount: number | null
  lender_name: string | null
  primary_phone: string | null
  primary_email: string | null
  mailing_address: string | null
  estimated_market_value: number | null
  case_number: string | null
}

interface MappedPersonalInfo {
  firstName?: string
  lastName?: string
  middleName?: string
  email?: string
  phonePrimary?: string
  currentAddress?: string
}

interface MappedPropertyInfo {
  propertyAddress?: string
  propertyCity?: string
  propertyState?: string
  propertyZip?: string
  parcelNumber?: string
  foreclosureType?: 'mortgage' | 'tax_sale' | 'hoa' | 'other'
  saleDate?: string
  saleAmount?: string
}

interface MappedLiens {
  hasKnownLiens?: boolean
  firstMortgageLender?: string
  firstMortgageBalance?: string
}

export interface MappedFormData {
  personalInfo: MappedPersonalInfo
  propertyInfo: MappedPropertyInfo
  liens: MappedLiens
}

function splitOwnerName(ownerName: string): { firstName: string; middleName?: string; lastName: string } {
  const trimmed = ownerName.trim()

  // Handle "Last, First" or "Last, First Middle" format
  if (trimmed.includes(',')) {
    const [lastPart, rest] = trimmed.split(',').map(s => s.trim())
    if (rest) {
      const restParts = rest.split(/\s+/)
      if (restParts.length >= 2) {
        return {
          firstName: restParts[0],
          middleName: restParts.slice(1).join(' '),
          lastName: lastPart,
        }
      }
      return { firstName: rest, lastName: lastPart }
    }
    return { firstName: '', lastName: lastPart }
  }

  // Handle "First Last" or "First Middle Last" format
  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) {
    return { firstName: '', lastName: parts[0] }
  }
  if (parts.length === 2) {
    return { firstName: parts[0], lastName: parts[1] }
  }
  // 3+ parts: first = first, last = last, everything else = middle
  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(' '),
    lastName: parts[parts.length - 1],
  }
}

function mapForeclosureType(type: string | null): 'mortgage' | 'tax_sale' | 'hoa' | 'other' {
  if (!type) return 'other'
  const lower = type.toLowerCase()
  if (lower.includes('mortgage') || lower === 'judicial' || lower === 'non-judicial') {
    return 'mortgage'
  }
  if (lower.includes('tax')) {
    return 'tax_sale'
  }
  if (lower.includes('hoa')) {
    return 'hoa'
  }
  return 'other'
}

function formatCurrency(amount: number | null): string | undefined {
  if (amount === null || amount === undefined) return undefined
  return `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function mapLeadToFormData(lead: ForeclosureLead): MappedFormData {
  const { firstName, middleName, lastName } = splitOwnerName(lead.owner_name)

  const personalInfo: MappedPersonalInfo = {}
  if (firstName) personalInfo.firstName = firstName
  if (lastName) personalInfo.lastName = lastName
  if (middleName) personalInfo.middleName = middleName
  if (lead.primary_email) personalInfo.email = lead.primary_email
  if (lead.primary_phone) personalInfo.phonePrimary = lead.primary_phone
  if (lead.mailing_address) personalInfo.currentAddress = lead.mailing_address

  const propertyInfo: MappedPropertyInfo = {}
  if (lead.property_address) propertyInfo.propertyAddress = lead.property_address
  if (lead.city) propertyInfo.propertyCity = lead.city
  if (lead.state_abbr) propertyInfo.propertyState = lead.state_abbr
  if (lead.zip_code) propertyInfo.propertyZip = lead.zip_code
  if (lead.parcel_id) propertyInfo.parcelNumber = lead.parcel_id
  propertyInfo.foreclosureType = mapForeclosureType(lead.foreclosure_type)
  if (lead.sale_date) propertyInfo.saleDate = lead.sale_date
  const saleAmountStr = formatCurrency(lead.sale_amount)
  if (saleAmountStr) propertyInfo.saleAmount = saleAmountStr

  const liens: MappedLiens = {}
  if (lead.mortgage_amount && lead.mortgage_amount > 0) {
    liens.hasKnownLiens = true
    if (lead.lender_name) liens.firstMortgageLender = lead.lender_name
    const mortgageStr = formatCurrency(lead.mortgage_amount)
    if (mortgageStr) liens.firstMortgageBalance = mortgageStr
  }

  return { personalInfo, propertyInfo, liens }
}
