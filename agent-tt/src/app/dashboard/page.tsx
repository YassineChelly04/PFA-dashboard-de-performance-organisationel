'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AlertCircle, ArrowRight, Headset, History, MapPinned, RadioReceiver, Search } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [lineNumber, setLineNumber] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')

  const stats = [
    {
      label: 'Latency',
      value: '12 ms',
      icon: History,
      tone: 'text-[#0f2a8f]',
      iconBg: 'bg-white',
    },
    {
      label: 'SNR Margin',
      value: '18.5 dB',
      icon: RadioReceiver,
      tone: 'text-[#6a42f4]',
      iconBg: 'bg-white',
    },
  ]

  const actions = [
    {
      title: 'Historique',
      description: 'Voir les 12 dernières interventions sur cette ligne.',
      cta: 'Consulter',
      icon: History,
      iconBg: 'bg-[#dfe3f7]',
      iconColor: 'text-[#1636a8]',
      onClick: () => router.push('/dashboard/historique'),
    },
    {
      title: 'Géolocalisation',
      description: "Localiser l'armoire de rue (SR) correspondante.",
      cta: 'Ouvrir Carte',
      icon: MapPinned,
      iconBg: 'bg-[#d6e6e2]',
      iconColor: 'text-[#0bb9b3]',
      onClick: () => router.push('/dashboard/profil'),
    },
    {
      title: 'Assistance',
      description: 'Contacter le support technique TT dédié fournisseurs.',
      cta: 'Appeler Support',
      icon: Headset,
      iconBg: 'bg-[#e5dcff]',
      iconColor: 'text-[#6f38ea]',
      onClick: () => window.location.href = 'mailto:support@tunisietelecom.tn',
    },
  ]

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    if (!lineNumber.trim()) {
      setError('Veuillez saisir un numéro de ligne')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/clients/search?q=${encodeURIComponent(lineNumber.trim())}`)
      const data = await response.json()

      if (data.client) {
        router.push(`/dashboard/client/${data.client.id}`)
      } else {
        setError('Ligne non trouvée. Vérifiez le numéro et réessayez.')
      }
    } catch {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncLoading(true)
    setSyncMessage('')

    try {
      const response = await fetch('/api/sync', { method: 'POST' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de synchronisation')
      }

      const { created, updated, total } = data.summary
      setSyncMessage(`Synchronisation terminée: ${created} créées, ${updated} mises à jour, ${total} lignes traitées.`)
    } catch (syncError) {
      const message = syncError instanceof Error ? syncError.message : 'Erreur de synchronisation'
      setSyncMessage(message)
    } finally {
      setSyncLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f6fb] px-4 py-6 sm:px-6 lg:px-8">
      <main className="mx-auto flex w-full max-w-[1240px] flex-col gap-6">
        <section className="relative w-full overflow-hidden rounded-[38px] bg-[#2437a6] text-white shadow-[0_24px_80px_rgba(36,55,166,0.24)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.12),_transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_52%)]" />

          <div className="relative grid min-h-[320px] lg:min-h-[380px] lg:grid-cols-2">
            <div className="relative z-10 flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 xl:px-16">
              <h1 className="max-w-2xl font-[family-name:var(--font-montserrat)] text-3xl font-bold leading-tight sm:text-4xl">
                Consultation de Ligne
              </h1>
              <p className="mt-5 max-w-3xl font-[family-name:var(--font-manrope)] text-base leading-8 text-white/55">
                Entrez le numéro de la ligne fixe ou mobile pour accéder aux détails techniques et aux actions de maintenance.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleSync}
                  disabled={syncLoading}
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-6 font-[family-name:var(--font-montserrat)] text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {syncLoading ? 'Synchronisation...' : 'Synchroniser Excel -> base'}
                </button>
                {syncMessage && (
                  <p className="max-w-2xl text-sm text-white/80">{syncMessage}</p>
                )}
              </div>

              <form onSubmit={handleSearch} className="mt-8 w-full max-w-[900px]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="relative w-full sm:max-w-[620px]">
                    <Search size={20} className="pointer-events-none absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-[#7f87bc]" />
                    <input
                      type="text"
                      value={lineNumber}
                      onChange={(e) => setLineNumber(e.target.value)}
                      placeholder="Entrez la ligne (ex: 71 000 000)"
                      className="h-14 sm:h-[68px] w-full rounded-2xl border border-white/10 bg-[#ececf2] px-12 sm:px-16 text-base sm:text-[18px] font-medium tracking-[-0.02em] text-[#1f2555] placeholder:text-[#aeb2c8] shadow-[0_14px_36px_rgba(15,23,42,0.16)] outline-none transition focus:border-transparent focus:ring-4 focus:ring-white/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-14 sm:h-[68px] w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#5b2ee2] to-[#6f38ea] px-6 sm:px-12 font-[family-name:var(--font-montserrat)] text-base sm:text-[20px] font-semibold text-white shadow-[0_16px_36px_rgba(111,56,234,0.45)] transition hover:from-[#6337eb] hover:to-[#7843f1] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span>{loading ? 'Recherche...' : 'Suivant'}</span>
                    <ArrowRight size={20} className="sm:h-6 sm:w-6" />
                  </button>
                </div>

                {error && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/90 backdrop-blur-sm">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}
              </form>
            </div>

            <div className="relative hidden overflow-hidden lg:block">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,#253aa9_0%,#1f32a1_36%,#1a2a92_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_26%_18%,rgba(134,170,255,0.28),transparent_20%),radial-gradient(circle_at_42%_52%,rgba(255,255,255,0.12),transparent_16%),radial-gradient(circle_at_62%_62%,rgba(255,255,255,0.08),transparent_14%)]" />
              <div className="absolute -left-24 -top-16 h-[140%] w-[140%] rotate-[14deg] bg-[repeating-linear-gradient(120deg,rgba(138,167,255,0.18)_0px,rgba(138,167,255,0.18)_2px,transparent_2px,transparent_14px)] opacity-60" />
              <div className="absolute inset-0 bg-[linear-gradient(102deg,rgba(37,58,169,0.25)_0%,rgba(37,58,169,0.15)_30%,rgba(58,83,194,0.35)_70%,rgba(37,58,169,0.1)_100%)]" />
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {stats.map((stat) => {
            const Icon = stat.icon

            return (
              <div
                key={stat.label}
                className="flex items-center gap-4 rounded-[24px] bg-[#f2f3f7] px-5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] ring-1 ring-slate-100 backdrop-blur-sm"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.iconBg} shadow-sm`}>
                  <Icon size={24} className={stat.tone} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className={`text-2xl font-semibold ${stat.tone}`}>{stat.value}</p>
                </div>
              </div>
            )
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {actions.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.title}
                type="button"
                onClick={item.onClick}
                className="group rounded-[28px] bg-[#f2f3f7] px-6 py-8 text-center shadow-[0_10px_30px_rgba(15,23,42,0.05)] ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
              >
                <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${item.iconBg}`}>
                  <Icon size={28} className={item.iconColor} />
                </div>
                <h2 className="font-[family-name:var(--font-montserrat)] text-xl font-bold text-[#1636a8]">{item.title}</h2>
                <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-slate-500">{item.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 font-[family-name:var(--font-montserrat)] text-sm font-semibold text-[#6f38ea] transition group-hover:gap-3">
                  {item.cta}
                  <ArrowRight size={16} />
                </span>
              </button>
            )
          })}
        </section>
      </main>
    </div>
  )
}
