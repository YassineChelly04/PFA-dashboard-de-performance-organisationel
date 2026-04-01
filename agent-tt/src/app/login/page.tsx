'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, CheckCircle, Lock, UserCircle, LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        employeeId,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Numéro d\'employé ou mot de passe incorrect')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-50 via-white to-white">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/logo-tt.png"
              alt="Tunisie Telecom"
              width={100}
              height={100}
              className="h-24 w-auto"
              priority
            />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="font-[family-name:var(--font-montserrat)] text-2xl font-bold text-indigo-900 mb-1">
              Espace Technicien
            </h1>
            <p className="font-[family-name:var(--font-manrope)] text-slate-500 text-sm">
              Gestion des interventions de terrain
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 font-[family-name:var(--font-manrope)]">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Employee ID */}
              <div>
                <label className="font-[family-name:var(--font-montserrat)] block text-xs font-semibold text-slate-500 mb-2 tracking-wide">
                  NUMÉRO D&apos;EMPLOYÉ
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <UserCircle size={20} />
                  </div>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="Ex: 88234"
                    className="w-full px-4 py-3.5 pl-12 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="font-[family-name:var(--font-montserrat)] block text-xs font-semibold text-slate-500 mb-2 tracking-wide">
                  MOT DE PASSE
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 pl-12 pr-12 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-500">Se souvenir de moi</span>
                </label>
                <button
                  type="button"
                  className="font-[family-name:var(--font-montserrat)] text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Oublié ?
                </button>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="font-[family-name:var(--font-montserrat)] w-full py-4 bg-[#00157C] hover:bg-[#00157C]/95 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-[#00157C]/25 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Connexion...' : 'Se Connecter'}</span>
                <LogIn size={18} className="rotate-180" />
              </button>
            </form>
          </div>

          {/* System status */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="font-[family-name:var(--font-montserrat)] text-xs font-semibold text-slate-500 tracking-wide">
              SYSTÈME OPÉRATIONNEL
            </span>
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
        </div>
      </main>

      {/* Copyright */}
      <footer className="font-[family-name:var(--font-manrope)] text-center py-4 text-xs text-slate-400 relative z-10">
        © 2026 Tunisie Telecom. Tous droits réservés.<br />
        Accès restreint au personnel autorisé uniquement.
      </footer>
    </div>
  )
}
