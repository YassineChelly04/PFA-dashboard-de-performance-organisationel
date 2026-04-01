'use client'

import { useRouter } from 'next/navigation'
import { BarChart3, CheckCircle, Clock, ArrowRight } from 'lucide-react'

interface Client {
  id: string
  dLigne: string
  nom: string
  offre: string
  debitADSL: string
  typeClient: string
  problemStatus: string
  briefDescription: string | null
  attenuationLigne: number | null
  region: string
  fsiadsl: string
  interventions: Array<{
    id: string
    status: string
    createdAt: Date
    resolutionCode: string | null
    technicien: {
      nom: string
      prenom: string
    }
  }>
}

interface Props {
  client: Client
}

export function ClientServicePage({ client }: Props) {
  const router = useRouter()

  const attenuationLevel = client.attenuationLigne || 0
  const attenuationPercent = Math.min((attenuationLevel / 50) * 100, 100)

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-50/50 via-white to-white">

      <div className="flex-1 px-4 lg:px-[20%] py-6">
        <div className="w-full space-y-4">
          {/* Client Card */}
          <div className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50 border-l-4 border-teal-400">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-[family-name:var(--font-montserrat)] text-2xl font-bold text-indigo-900 italic leading-tight">
                  {client.nom.split(' ').slice(0, 2).join(' ')}<br/>
                  {client.nom.split(' ').slice(2).join(' ')}
                </h2>
                <p className="font-[family-name:var(--font-manrope)] text-slate-600 mt-1">
                  ID Client: <span className="text-indigo-600 font-semibold">#{client.dLigne.replace('DL-', '')}</span>
                </p>
              </div>
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-teal-500 text-white">
                <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                EN PANNE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-8 mt-6">
              <div>
                <span className="font-[family-name:var(--font-montserrat)] text-xs font-semibold text-slate-400 tracking-wide">OFFRE</span>
                <p className="font-[family-name:var(--font-manrope)] font-semibold text-indigo-900 mt-0.5">{client.offre.replace('Offre de Gros ', '').split(' ')[0]} Guiga</p>
              </div>
              <div>
                <span className="font-[family-name:var(--font-montserrat)] text-xs font-semibold text-slate-400 tracking-wide">DÉBIT</span>
                <p className="font-[family-name:var(--font-manrope)] font-semibold text-indigo-900 mt-0.5">{client.debitADSL.replace('mbps', ' Mbps')}</p>
              </div>
              <div>
                <span className="font-[family-name:var(--font-montserrat)] text-xs font-semibold text-slate-400 tracking-wide">TYPE</span>
                <p className="font-[family-name:var(--font-manrope)] font-semibold text-indigo-900 mt-0.5">{client.typeClient}</p>
              </div>
              <div>
                <span className="font-[family-name:var(--font-montserrat)] text-xs font-semibold text-slate-400 tracking-wide">RÉGION</span>
                <p className="font-[family-name:var(--font-manrope)] font-semibold text-indigo-900 mt-0.5">{client.region}</p>
              </div>
            </div>
          </div>

          {/* Attenuation Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center gap-1 mb-3">
              <BarChart3 size={24} className="text-teal-400" />
            </div>
            
            <p className="font-[family-name:var(--font-manrope)] text-indigo-200 text-sm mb-1">Atténuation Ligne</p>
            <p className="font-[family-name:var(--font-montserrat)] text-4xl font-bold mb-4">{attenuationLevel} dB</p>
            
            <div className="relative h-2 bg-indigo-700 rounded-full overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-300"
                style={{ width: `${attenuationPercent}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => router.push(`/dashboard/intervention/${client.id}`)}
              className="w-full flex items-center justify-center gap-2 py-4 px-5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/30"
            >
              <CheckCircle size={20} />
              <span className="font-[family-name:var(--font-montserrat)]">Intervention</span>
            </button>

            <button
              onClick={() => {
                localStorage.setItem('selectedClientId', client.id)
                router.push('/dashboard/historique')
              }}
              className="w-full flex items-center justify-center gap-2 py-4 px-5 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl transition-all hover:bg-slate-50 hover:border-slate-300"
            >
              <Clock size={20} />
              <span className="font-[family-name:var(--font-montserrat)]">Historique Intervention</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
