import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { FileText, Mail, ArrowRight, CheckCircle } from 'lucide-react'
import { authClient } from '#/lib/auth-client'
import { loginSchema } from '#/lib/schemas'
import { useAppForm } from '#/hooks/form'
import { Button } from '#/components/ui/button'

// Module-level state: persists across router-triggered remounts
let _loginSuccess = false
let _loginEmail = ''

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const [success, setSuccess] = useState(_loginSuccess)
  const [submittedEmail, setSubmittedEmail] = useState(_loginEmail)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { email: '' },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null)
      try {
        const result = await authClient.signIn.magicLink({
          email: value.email,
          callbackURL: '/dashboard',
        })
        if (result.error) {
          setServerError(result.error.message ?? 'Failed to send magic link')
        } else {
          _loginSuccess = true
          _loginEmail = value.email
          setSubmittedEmail(value.email)
          setSuccess(true)
        }
      } catch (err) {
        setServerError(err instanceof Error ? err.message : 'Something went wrong')
      }
    },
  })

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <CheckCircle className="size-10 text-primary mx-auto" />
          <div className="space-y-1.5">
            <h1 className="text-lg font-semibold tracking-tight">Check your inbox</h1>
            <p className="text-sm text-muted-foreground">
              We sent a magic link to{' '}
              <strong className="text-foreground">{submittedEmail}</strong>.
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
          <form.AppForm>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
              }}
              className="space-y-3"
            >
              <div className="space-y-1.5">
                <form.AppField name="email">
                  {(field) => (
                    <field.EmailField
                      label="Email address"
                      placeholder="you@example.com"
                    />
                  )}
                </form.AppField>
              </div>

              {serverError && (
                <div className="text-sm text-destructive bg-destructive/8 border border-destructive/20 px-3 py-2">
                  {serverError}
                </div>
              )}

              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={isSubmitting}
                  >
                    <Mail className="size-4" />
                    {isSubmitting ? 'Sending link…' : 'Send magic link'}
                    {!isSubmitting && <ArrowRight className="size-3.5 ml-auto" />}
                  </Button>
                )}
              </form.Subscribe>
            </form>
          </form.AppForm>
        </div>

        <p className="text-center text-xs text-muted-foreground/60">
          No password needed — just your email.
        </p>
      </div>
    </div>
  )
}
