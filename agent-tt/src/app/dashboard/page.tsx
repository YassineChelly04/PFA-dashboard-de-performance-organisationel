'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Search, AlertCircle, User, LogIn } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [clientId, setClientId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!clientId.trim()) {
      setError('Veuillez saisir un ID client')
      return
    }

    try {
      const response = await fetch(`/api/clients/search?q=${encodeURIComponent(clientId)}`)
      const data = await response.json()

      if (data.client) {
        localStorage.setItem('selectedClientId', data.client.id)
        router.push(`/dashboard/client/${data.client.id}`)
      } else {
        setError('Client non trouvé. Vérifiez l\'ID et réessayez.')
      }
    } catch {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-50 via-white to-white">
      <div className="flex-1 flex flex-col px-[20%] py-6">
        <div className="w-full">
          {/* Card */}
              <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 font-[family-name:var(--font-manrope)] max-w-3xl mx-auto w-full">
                {/* Greeting */}
                <div className="text-center mb-6">
              <h2 className="font-[family-name:var(--font-montserrat)] text-xl font-bold text-slate-900 mb-1">
                Bonjour Mr {session?.user?.name?.split(' ')[0] || 'Technicien'}
              </h2>
            </div>

            {/* Search form */}
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="font-[family-name:var(--font-montserrat)] block text-xs font-semibold text-slate-500 mb-2 tracking-wide">
                  SAISIR ID CLIENT
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="Ex: 88726354"
                    className="w-full px-4 py-3.5 pl-12 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="font-[family-name:var(--font-montserrat)] w-full py-4 bg-[#00157C] hover:bg-[#00157C]/95 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-[#00157C]/25 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Recherche...' : 'Rechercher'}</span>
                <LogIn size={18} className="rotate-180" />
              </button>
            </form>
          </div>

          {/* System status */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="font-[family-name:var(--font-montserrat)] text-xs font-semibold text-slate-500 tracking-wide">SYSTÈME OPÉRATIONNEL</span>
          </div>

          {/* Footer links */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <button className="font-[family-name:var(--font-manrope)] text-sm text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1">
              <img src="/faq.svg" alt="FAQ" className="h-4 w-4" />
              Assistance technique
            </button>
            <button className="font-[family-name:var(--font-manrope)] text-sm text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1">
              <img src="/Icon.svg" alt="Language Icon" className="w-4 h-4" />
              Français
            </button>
          </div>

          {/* Copyright */}
          <div className="font-[family-name:var(--font-manrope)] text-center mt-8 text-xs text-slate-400">
            © 2026 Tunisie Telecom. Tous droits réservés.<br />
            Accès restreint au personnel autorisé uniquement.
          </div>
        </div>
      </div>
    </div>
  )
}
