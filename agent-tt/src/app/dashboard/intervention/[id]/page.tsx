import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { InterventionPage } from './InterventionPage'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params

  const client = await prisma.client.findUnique({
    where: { id },
  })

  if (!client) {
    notFound()
  }

  // Get possible resolution codes and product types from existing data
  const resolutionCodes = await prisma.intervention.findMany({
    where: { resolutionCode: { not: null } },
    select: { resolutionCode: true },
    distinct: ['resolutionCode'],
  })

  const productTypes = await prisma.intervention.findMany({
    where: { productType: { not: null } },
    select: { productType: true },
    distinct: ['productType'],
  })

  return (
    <InterventionPage 
      client={client}
      resolutionCodes={resolutionCodes.map(r => r.resolutionCode!).filter(Boolean)}
      productTypes={productTypes.map(p => p.productType!).filter(Boolean)}
    />
  )
}
