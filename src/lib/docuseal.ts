/**
 * DocuSeal API client for document signing integration.
 * Self-hosted at sign.cognabase.com
 */

const DOCUSEAL_URL = process.env.DOCUSEAL_URL || 'https://sign.cognabase.com'
const DOCUSEAL_TOKEN = process.env.DOCUSEAL_API_TOKEN || ''

interface DocuSealRequestOptions {
  method?: string
  body?: unknown
  headers?: Record<string, string>
}

async function docusealFetch<T>(path: string, options: DocuSealRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options

  if (!DOCUSEAL_TOKEN) {
    throw new Error('DOCUSEAL_API_TOKEN is not configured')
  }

  const res = await fetch(`${DOCUSEAL_URL}/api${path}`, {
    method,
    headers: {
      'X-Auth-Token': DOCUSEAL_TOKEN,
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`DocuSeal API error ${res.status}: ${errorText}`)
  }

  return res.json()
}

// ---- Template Types ----

export interface DocuSealTemplate {
  id: number
  slug: string
  name: string
  schema: Array<{
    attachment_uuid: string
    name: string
  }>
  fields: Array<{
    uuid: string
    submitter_uuid: string
    name: string
    type: string
    required: boolean
    areas: Array<{
      x: number
      y: number
      w: number
      h: number
      page: number
    }>
  }>
  submitters: Array<{
    name: string
    uuid: string
  }>
  created_at: string
  updated_at: string
  external_id: string | null
}

export interface DocuSealSubmission {
  id: number
  source: string
  submitters_order: string
  slug: string
  audit_log_url: string | null
  combined_document_url: string | null
  expire_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  created_by_user: { id: number; email: string } | null
  template: { id: number; name: string }
  submitters: DocuSealSubmitter[]
}

export interface DocuSealSubmitter {
  id: number
  submission_id: number
  uuid: string
  email: string
  slug: string
  sent_at: string | null
  opened_at: string | null
  completed_at: string | null
  declined_at: string | null
  created_at: string
  updated_at: string
  name: string
  phone: string
  status: string
  external_id: string | null
  metadata: Record<string, unknown>
  preferences: Record<string, unknown>
  embed_src: string
  role: string
  values: Array<{ field: string; value: string }>
  documents: Array<{
    name: string
    url: string
  }>
}

// ---- Template Operations ----

export async function listTemplates(): Promise<{ data: DocuSealTemplate[]; pagination: { count: number } }> {
  return docusealFetch('/templates')
}

export async function getTemplate(id: number): Promise<DocuSealTemplate> {
  return docusealFetch(`/templates/${id}`)
}

/**
 * Create a template from a DOCX file URL.
 * DocuSeal will download the file and create a template from it.
 */
export async function createTemplateFromUrl(
  name: string,
  documentUrl: string,
  externalId?: string
): Promise<DocuSealTemplate> {
  return docusealFetch('/templates/docx', {
    method: 'POST',
    body: {
      name,
      documents: [{ url: documentUrl }],
      external_id: externalId || undefined,
    },
  })
}

/**
 * Create a template from HTML content.
 */
export async function createTemplateFromHtml(
  name: string,
  htmlContent: string,
  externalId?: string
): Promise<DocuSealTemplate> {
  return docusealFetch('/templates/html', {
    method: 'POST',
    body: {
      name,
      html: htmlContent,
      external_id: externalId || undefined,
    },
  })
}

// ---- Submission Operations ----

interface CreateSubmissionOptions {
  templateId: number
  sendEmail?: boolean
  submitters: Array<{
    email: string
    name?: string
    role?: string
    phone?: string
    external_id?: string
    fields?: Array<{
      name: string
      default_value: string
      readonly?: boolean
    }>
  }>
  message?: {
    subject?: string
    body?: string
  }
  order?: 'preserved' | 'random'
}

/**
 * Create a submission (signing request) for a template.
 * Returns submission with embed_src URLs for each submitter.
 */
export async function createSubmission(options: CreateSubmissionOptions): Promise<DocuSealSubmission[]> {
  const body: Record<string, unknown> = {
    template_id: options.templateId,
    send_email: options.sendEmail ?? true,
    submitters: options.submitters.map(s => ({
      email: s.email,
      name: s.name,
      role: s.role || 'First Party',
      phone: s.phone,
      external_id: s.external_id,
      fields: s.fields,
    })),
  }

  if (options.message) {
    body.message = options.message
  }

  if (options.order) {
    body.order = options.order
  }

  return docusealFetch('/submissions', {
    method: 'POST',
    body,
  })
}

/**
 * Get a submission by ID.
 */
export async function getSubmission(id: number): Promise<DocuSealSubmission> {
  return docusealFetch(`/submissions/${id}`)
}

/**
 * List submissions, optionally filtered by template.
 */
export async function listSubmissions(templateId?: number): Promise<{ data: DocuSealSubmission[]; pagination: { count: number } }> {
  const query = templateId ? `?template_id=${templateId}` : ''
  return docusealFetch(`/submissions${query}`)
}

/**
 * Get a submitter by ID (includes embed_src for signing).
 */
export async function getSubmitter(id: number): Promise<DocuSealSubmitter> {
  return docusealFetch(`/submitters/${id}`)
}

// ---- Utility ----

export function getDocuSealBaseUrl(): string {
  return DOCUSEAL_URL
}
