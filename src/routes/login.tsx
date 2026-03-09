import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { FileText, Mail, ArrowRight, CheckCircle } from 'lucide-react'
import { authClient } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

// Module-level state: persists across router-triggered remounts
let _loginSuccess = false

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(_loginSuccess)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const result = await authClient.signIn.magicLink({
        email,
        callbackURL: '/dashboard',
      })
      if (result.error) {
        setError(result.error.message ?? 'Failed to send magic link')
      } else {
        _loginSuccess = true
        setSuccess(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <CheckCircle className="size-10 text-primary mx-auto" />
          <div className="space-y-1.5">
            <h1 className="text-lg font-semibold tracking-tight">Check your inbox</h1>
            <p className="text-sm text-muted-foreground">
              We sent a magic link to{' '}
              <strong className="text-foreground">{email}</strong>.
            </p>
          </div>
          <p className="text-xs text-muted-foreground border border-border/60 px-3 py-2.5 bg-muted/40">
            <strong>Development mode:</strong> copy the link from the server console.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <FileText className="size-5 text-primary" />
            <span className="text-base font-semibold tracking-tight">App Documents</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Sign in with a magic link to your email
          </p>
        </div>

        {/* Form */}
        <div className="border border-border/60 bg-card p-5 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/8 border border-destructive/20 px-3 py-2">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isLoading}
            >
              <Mail className="size-4" />
              {isLoading ? 'Sending link…' : 'Send magic link'}
              {!isLoading && <ArrowRight className="size-3.5 ml-auto" />}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground/60">
          No password needed — just your email.
        </p>
      </div>
    </div>
  )
}
