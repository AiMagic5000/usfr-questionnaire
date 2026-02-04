'use client'

import { use } from 'react'
import { DocumentPrepView } from '@/components/dashboard/DocumentPrepView'

interface PreparePageProps {
  params: Promise<{ id: string }>
}

export default function PreparePage({ params }: PreparePageProps) {
  const resolvedParams = use(params)
  return <DocumentPrepView documentId={resolvedParams.id} />
}
