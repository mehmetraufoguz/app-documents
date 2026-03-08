import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Nav } from '#/components/app/nav'
import { getSession } from '#/server/functions/auth.fns'

export const Route = createFileRoute('/_admin')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) {
      throw redirect({ to: '/login' })
    }
    return { session }
  },
  component: AdminLayout,
})

function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
