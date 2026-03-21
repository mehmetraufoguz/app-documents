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
    <header className="border-b border-border/60 bg-background/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 font-semibold text-foreground hover:opacity-75 transition-opacity no-underline shrink-0"
        >
          <FileText className="size-4 text-primary" />
          <span className="hidden sm:block text-sm tracking-tight">App Documents</span>
        </Link>

        {session && (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 border border-border/50">
              <span className="size-1.5 rounded-full bg-primary inline-block shrink-0" />
              {session.user.email}
            </div>
            <Button
              variant="ghost-destructive"
              size="sm"
              onClick={handleSignOut}
              className="gap-1.5 h-7 px-2 text-xs"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
