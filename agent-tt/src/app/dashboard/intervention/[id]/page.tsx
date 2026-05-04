import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { InterventionPage } from './InterventionPage'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params

  const existingClient = await prisma.client.findUnique({
    where: { id },
    select: { dLigne: true },
  })

  if (!existingClient) {
    notFound()
  }

  const client = await prisma.client.findUnique({
    where: { id },
  })

  if (!client) {
    notFound()
  }

  // Get possible resolution codes and product types from existing data
  const [interventionResolutionCodes, clientResolutionCodes, interventionProductTypes, clientProductTypes] =
    await Promise.all([
      prisma.intervention.findMany({
        where: { resolutionCode: { not: null } },
        select: { resolutionCode: true },
        distinct: ['resolutionCode'],
      }),
      prisma.client.findMany({
        where: { resolutionCode: { not: null } },
        select: { resolutionCode: true },
        distinct: ['resolutionCode'],
      }),
      prisma.intervention.findMany({
        where: { productType: { not: null } },
        select: { productType: true },
        distinct: ['productType'],
      }),
      prisma.client.findMany({
        where: { productType: { not: null } },
        select: { productType: true },
        distinct: ['productType'],
      }),
    ])

  const resolutionCodes = [
    ...new Set(
      [...interventionResolutionCodes, ...clientResolutionCodes]
        .map((row) => row.resolutionCode)
        .filter((value): value is string => Boolean(value))
    ),
  ]

  const productTypes = [
    ...new Set(
      [...interventionProductTypes, ...clientProductTypes]
        .map((row) => row.productType)
        .filter((value): value is string => Boolean(value))
    ),
  ]

  return (
    <InterventionPage 
      client={client}
      resolutionCodes={resolutionCodes}
      productTypes={productTypes}
    />
  )
}
