import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { RouteTransition } from '@/components/RouteTransition'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-indigo-50/30 via-white to-white">
      <Sidebar />
      <main className="flex-1 min-w-0 lg:ml-0">
        <Header title="Service Dérangement" />
        <RouteTransition>{children}</RouteTransition>
      </main>
    </div>
  )
}
