import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ClientServicePage } from './ClientServicePage'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClientPage({ params }: PageProps) {
  const { id } = await params

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      interventions: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          technicien: {
            select: { nom: true, prenom: true },
          },
        },
      },
    },
  })

  if (!client) {
    notFound()
  }

  return <ClientServicePage client={client} />
}
