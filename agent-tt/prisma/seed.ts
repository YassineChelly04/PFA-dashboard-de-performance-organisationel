import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

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

  // Créer des clients de test basés sur les données Excel
  const clients = [
    {
      dLigne: 'DL-007716',
      referenceExtranet: '24.12.07.382',
      refHPSM: 'IM12436725',
      nom: 'Ahmed Ben Salem',
      region: 'GAFSA',
      offre: 'Offre de Gros ADSL Hybride',
      debitADSL: '12 mbps',
      fsiadsl: 'Hexabyte',
      typeClient: 'Résidentiel',
      problemStatus: 'En cours',
      briefDescription: 'Débit inversé',
      actionFSI: 'état modem : Connecté Test de téléchargement sur un site FTP local : Oui',
      attenuationLigne: 24.5,
    },
    {
      dLigne: 'DL-010557',
      referenceExtranet: '25.01.01.043',
      refHPSM: 'IM12436790',
      nom: 'Fatma Trabelsi',
      region: 'GAFSA',
      offre: 'Offre de Gros ADSL Hybride',
      debitADSL: '10 mbps',
      fsiadsl: 'Hexabyte',
      typeClient: 'Résidentiel',
      problemStatus: 'En cours',
      briefDescription: 'Déconnexion courante',
      actionFSI: 'état modem : Connecté Perte de synchro : Oui',
      attenuationLigne: 18.2,
    },
    {
      dLigne: 'DL-008737',
      referenceExtranet: '25.01.01.100',
      refHPSM: 'IM12436960',
      nom: 'Karim Mansour',
      region: 'KEF',
      offre: 'Offre de Gros VDSL Postpaye',
      debitADSL: '20 mbps',
      fsiadsl: 'Hexabyte',
      typeClient: 'Professionnel',
      problemStatus: 'En cours',
      briefDescription: 'Pas de synchronisation',
      actionFSI: 'état modem : Connecté Tonalité : Non Ligne Suspendue : Non',
      attenuationLigne: 32.1,
    },
  ]

  for (const clientData of clients) {
    const client = await prisma.client.upsert({
      where: { dLigne: clientData.dLigne },
      update: {},
      create: clientData,
    })
    console.log('✅ Client créé:', client.nom, '-', client.dLigne)
  }

  console.log('🎉 Seeding terminé!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
