'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  BarChart3,
  Lightbulb, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  ListFilter
} from 'lucide-react'

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
}

interface Props {
  client: Client
  resolutionCodes: string[]
  productTypes: string[]
}

export function InterventionPage({ client, resolutionCodes, productTypes }: Props) {
  const router = useRouter()
  const { data: session } = useSession()
  
  const [productType, setProductType] = useState('')
  const [resolutionCode, setResolutionCode] = useState('')
  const [observation, setObservation] = useState('')
  const [saving, setSaving] = useState(false)
  const [showAiModal, setShowAiModal] = useState(false)
  const [saved, setSaved] = useState(false)

  const attenuationLevel = client.attenuationLigne || 0
  const attenuationPercent = Math.min((attenuationLevel / 50) * 100, 100)

  const handleSave = async () => {
    if (!observation.trim()) {
      alert('Veuillez saisir la solution')
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          technicienId: (session?.user as any)?.id,
          productType: productType || 'Non spécifié',
          resolutionCode: resolutionCode || 'Standard',
          resolutionObservation: observation,
        }),
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => {
          router.push(`/dashboard/client/${client.id}`)
        }, 1500)
      } else {
        alert('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      alert('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  const handleAiSuggestion = () => {
    setShowAiModal(true)
  }

  if (saved) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-50/50 via-white to-white">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-teal-600" size={40} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Intervention sauvegardée</h2>
            <p className="text-slate-500">Redirection en cours...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-50/50 via-white to-white">

      <div className="flex-1 px-4 lg:px-[20%] py-6">
        <div className="w-full space-y-4">
          {/* Client Card - Compact */}
          <div className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50 border-l-4 border-teal-400">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-indigo-900 italic leading-tight">
                  {client.nom.split(' ').slice(0, 2).join(' ')}<br/>
                  {client.nom.split(' ').slice(2).join(' ')}
                </h2>
                <p className="text-slate-600 mt-1">
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
            
            <p className="text-indigo-200 text-sm mb-1">Atténuation Ligne</p>
            <p className="text-4xl font-bold mb-4">{attenuationLevel} dB</p>
            
            <div className="relative h-2 bg-indigo-700 rounded-full overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-300"
                style={{ width: `${attenuationPercent}%` }}
              />
            </div>
          </div>

          {/* Intervention Details Card */}
          <div className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50">
            <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
              <ListFilter size={20} className="text-indigo-600" />
              Détails de l&apos;intervention
            </h3>

            <textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Saisir la solution..."
              rows={5}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {/* AI Suggestion Button */}
            <button
              onClick={handleAiSuggestion}
              className="w-full flex items-center justify-center gap-2 py-4 px-5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-semibold rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/30"
            >
              <Lightbulb size={20} />
              <span>Recommandation IA</span>
            </button>

            {/* History Button */}
            <button
              onClick={() => {
                localStorage.setItem('selectedClientId', client.id)
                router.push('/dashboard/historique')
              }}
              className="w-full flex items-center justify-center gap-2 py-4 px-5 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl transition-all hover:bg-slate-50 hover:border-slate-300"
            >
              <Clock size={20} />
              <span>Historique Intervention</span>
            </button>

            {/* Save Button */}
            <div className="flex justify-center pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center gap-2 py-3 px-8 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold rounded-full transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-teal-500/30"
              >
                <CheckCircle size={18} />
                <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="text-purple-600" size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Recommandation IA
              </h3>
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-left mb-4">
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-amber-700">
                  Cette fonctionnalité est en cours de développement. 
                  Elle utilisera l&apos;apprentissage automatique pour suggérer 
                  le code de résolution et le type de produit optimaux.
                </p>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="w-full py-3 bg-indigo-900 text-white font-semibold rounded-xl hover:bg-indigo-800 transition-colors"
              >
                Compris
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
