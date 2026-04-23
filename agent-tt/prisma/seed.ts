import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { getWorkbookClientInputs } from '../src/lib/workbook'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Créer un technicien de test
  const hashedPassword = await bcrypt.hash('demo123', 10)
  
  const technicien = await prisma.technicien.upsert({
    where: { employeeId: '88234' },
    update: {},
    create: {
      employeeId: '88234',
      password: hashedPassword,
      nom: 'Ben Ali',
      prenom: 'Mohamed',
      email: 'mohamed.benali@tunisietelecom.tn',
    },
  })

  console.log('✅ Technicien créé:', technicien.prenom, technicien.nom)

  const clients = getWorkbookClientInputs()

  for (const [index, clientData] of clients.entries()) {
    await prisma.client.upsert({
      where: { dLigne: clientData.dLigne },
      update: clientData,
      create: clientData,
    })

    if ((index + 1) % 500 === 0 || index === clients.length - 1) {
      console.log(`✅ ${index + 1}/${clients.length} clients synchronisés`)
    }
  }

  console.log(`🎉 Seeding terminé! ${clients.length} clients synchronisés depuis all-data.xlsx`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
