import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { InterventionsPage } from './InterventionsPage'

export default async function Page() {
  const session = await getServerSession(authOptions)
  const technicienId = (session?.user as any)?.id

  const interventions = await prisma.intervention.findMany({
    where: technicienId ? { technicienId } : {},
    orderBy: { createdAt: 'desc' },
    include: {
      client: {
        select: {
          nom: true,
          dLigne: true,
          offre: true,
          problemStatus: true,
        },
      },
    },
  })

  return <InterventionsPage interventions={interventions} />
}
