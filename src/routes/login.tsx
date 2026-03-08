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
          <CheckCircle className="size-12 text-green-500 mx-auto" />
          <h1 className="text-xl font-semibold">Check your inbox</h1>
          <p className="text-sm text-muted-foreground">
            We sent a magic link to <strong>{email}</strong>.
          </p>
          <p className="text-xs text-muted-foreground border rounded-md p-3 bg-muted/50">
            <strong>Development mode:</strong> copy the link from the server console.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <FileText className="size-6 text-primary" />
            <span className="text-lg font-semibold">App Documents</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Sign in with a magic link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            <Mail className="size-4" />
            {isLoading ? 'Sending...' : 'Send magic link'}
            {!isLoading && <ArrowRight className="size-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
