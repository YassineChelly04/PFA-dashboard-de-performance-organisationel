'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  Menu,
  X,
  Home,
  History,
  ListChecks,
  User,
  LogOut,
} from 'lucide-react'

const navigation = [
  { name: 'Accueil', href: '/dashboard', icon: Home },
  { name: 'Queue FSI', href: '/dashboard/queue', icon: ListChecks },
  { name: 'Historique', href: '/dashboard/historique', icon: History },
  { name: 'Profil', href: '/dashboard/profil', icon: User },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:z-auto shadow-lg lg:shadow-none`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <Image
              src="/logo-tt.png"
              alt="Tunisie Telecom"
              width={80}
              height={80}
              className="h-12 w-auto"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00157C] flex items-center justify-center text-white font-semibold text-sm">
                {session?.user?.name?.charAt(0) || 'T'}
              </div>
              <div>
                <p className="font-[family-name:var(--font-montserrat)] text-indigo-900 font-semibold text-sm">
                  {session?.user?.name || 'Technicien'}
                </p>
                <p className="font-[family-name:var(--font-manrope)] text-slate-400 text-xs">
                  ID: {(session?.user as any)?.employeeId || '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-6 py-5 rounded-[999px] transition-all duration-500 ease-out ${
                    isActive
                      ? 'nav-active-animate bg-gradient-to-r from-[#5F2EE5] to-[#6B4CF6] text-white shadow-[0_12px_24px_rgba(95,46,229,0.28)]'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <item.icon size={20} className={`transition-colors duration-500 ${isActive ? 'text-white' : ''}`} />
                  <span className={`font-[family-name:var(--font-montserrat)] font-medium text-sm transition-colors duration-500 ${isActive ? 'text-white' : ''}`}>
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-slate-100">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={20} />
              <span className="font-[family-name:var(--font-montserrat)] font-medium text-sm">Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-30 lg:hidden p-2 bg-white rounded-xl text-slate-700 shadow-lg border border-slate-200"
      >
        <Menu size={24} />
      </button>
    </>
  )
}
