import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DocumentSigningView } from '@/components/dashboard/DocumentSigningView'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ documentId: string }>
}

export default async function SignDocumentPage({ params }: PageProps) {
  const { userId } = await auth()
  const { documentId } = await params

  if (!userId) {
    redirect('/')
  }

  return <DocumentSigningView documentId={documentId} />
}
