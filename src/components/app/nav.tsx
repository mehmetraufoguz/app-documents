'use client'

import { Link, useRouter } from '@tanstack/react-router'
import { FileText, LogOut } from 'lucide-react'
import { authClient } from '#/lib/auth-client'
import { signOut } from '#/server/functions/auth.fns'
import { Button } from '#/components/ui/button'

export function Nav() {
  const router = useRouter()
  const { data: session } = authClient.useSession()

  const handleSignOut = async () => {
    await signOut()
    await authClient.signOut()
    router.navigate({ to: '/login' })
  }

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-foreground hover:opacity-80 transition-opacity no-underline">
          <FileText className="size-5 text-primary" />
          <span>App Documents</span>
        </Link>
        {session && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {session.user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
