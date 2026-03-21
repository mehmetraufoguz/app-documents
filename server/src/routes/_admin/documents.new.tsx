import { useState, lazy, Suspense } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { z } from 'zod'
import { createDocument } from '#/server/functions/documents.fns'
import { DOCUMENT_SLUGS } from '#/lib/schemas'
import { useAppForm } from '#/hooks/form'
import { Button } from '#/components/ui/button'

const newDocFormSchema = z.object({
  slug: z.string().min(1, 'Required').max(64).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only'),
  title: z.string().min(1, 'Required').max(200),
  description: z.string().max(500),
  content: z.string().min(1, 'Content is required'),
  commitMessage: z.string().min(1, 'Required').max(200),
})

const MarkdownEditor = lazy(
  () => import('#/components/app/document-editor.client'),
)

export const Route = createFileRoute('/_admin/documents/new')({
  component: NewDocument,
})

function NewDocument() {
  const navigate = useNavigate()

  const [serverError, setServerError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: {
      slug: '',
      title: '',
      description: '',
      content: '# New Document\n\nWrite your content here...',
      commitMessage: 'Add document',
    },
    validators: {
      onSubmit: newDocFormSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null)
      try {
        const result = await createDocument({
          data: {
            slug: value.slug,
            title: value.title,
            description: value.description || undefined,
            content: value.content,
            commitMessage: value.commitMessage,
          },
        })
        navigate({ to: '/documents/$documentId', params: { documentId: result.id } })
      } catch (err) {
        setServerError(err instanceof Error ? err.message : 'Failed to create document')
      }
    },
  })

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3 pb-3 border-b border-border/60">
        <Button
          variant="ghost-muted"
          size="icon-sm"
          className="-ml-1"
          onClick={() => navigate({ to: '/dashboard' })}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-lg font-bold tracking-tight">New Document</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Fill in the details below</p>
        </div>
      </div>

      <form.AppForm>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <form.AppField name="slug">
                {(field) => <field.TextField label="Slug" placeholder="e.g. tos, privacy" list="slug-suggestions" />}
              </form.AppField>
              <datalist id="slug-suggestions">
                {DOCUMENT_SLUGS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <div className="space-y-1.5">
              <form.AppField name="title">
                {(field) => <field.TextField label="Title" placeholder="e.g. Terms of Service" />}
              </form.AppField>
            </div>
          </div>

          <div className="space-y-2">
            <form.AppField name="description">
              {(field) => (
                <field.TextField
                  label="Description (optional)"
                  placeholder="Short description of this document"
                />
              )}
            </form.AppField>
          </div>

          <div className="space-y-2">
            <form.Field name="content">
              {(field) => (
                <Suspense
                  fallback={
                    <div className="h-[500px] border border-border/60 rounded-xl bg-muted/20 animate-pulse" />
                  }
                >
                  <MarkdownEditor
                    value={field.state.value}
                    onChange={(val) => field.handleChange(val ?? '')}
                  />
                </Suspense>
              )}
            </form.Field>
          </div>

          <div className="space-y-2">
            <form.AppField name="commitMessage">
              {(field) => <field.TextField label="Commit message" />}
            </form.AppField>
          </div>

          {serverError && (
            <div className="text-sm text-destructive bg-destructive/8 border border-destructive/20 px-3 py-2">
              {serverError}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? 'Creating…' : 'Create document'}
                </Button>
              )}
            </form.Subscribe>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: '/dashboard' })}
            >
              Cancel
            </Button>
          </div>
        </form>
      </form.AppForm>
    </div>
  )
}
