import { useState, lazy, Suspense } from 'react'
import { createFileRoute, notFound, redirect, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Save } from 'lucide-react'
import { z } from 'zod'
import { getDocumentContent, updateDocument } from '#/server/functions/documents.fns'
import { useAppForm } from '#/hooks/form'
import { Button } from '#/components/ui/button'

const editDocFormSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  commitMessage: z.string().min(1, 'Required').max(200),
})

const MarkdownEditor = lazy(
  () => import('#/components/app/document-editor.client'),
)

export const Route = createFileRoute('/_admin/documents/$documentId/edit')({
  loader: async ({ params }) => {
    const result = await getDocumentContent({
      data: { documentId: params.documentId },
    })
    if (!result) throw notFound()
    if (result.deletedAt) throw redirect({ to: '/deleted-documents' })
    return { doc: result }
  },
  component: DocumentEdit,
})

function DocumentEdit() {
  const { doc } = Route.useLoaderData()
  const { documentId } = Route.useParams()
  const navigate = useNavigate()

  const [serverError, setServerError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: {
      content: doc.content,
      commitMessage: 'Update document',
    },
    validators: {
      onSubmit: editDocFormSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null)
      try {
        await updateDocument({
          data: { id: documentId, content: value.content, commitMessage: value.commitMessage },
        })
        navigate({
          to: '/documents/$documentId',
          params: { documentId },
          search: {},
        })
      } catch (err) {
        setServerError(err instanceof Error ? err.message : 'Failed to save document')
      }
    },
  })

  return (
    <form.AppForm>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="space-y-4"
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/60">
          <Button
            type="button"
            variant="ghost-muted"
            size="sm"
            className="gap-1.5 -ml-2"
            onClick={() =>
              navigate({
                to: '/documents/$documentId',
                params: { documentId },
                search: {},
              })
            }
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2">
              <form.Field name="commitMessage">
                {(field) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className="text-xs text-muted-foreground whitespace-nowrap shrink-0"
                    >
                      Commit message
                    </label>
                    <input
                      id={field.name}
                      className="w-[200px] h-7 text-xs border border-border/60 bg-background px-2 rounded-md"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </>
                )}
              </form.Field>
            </div>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting} className="gap-1.5">
                  <Save className="size-4" />
                  {isSubmitting ? 'Saving…' : 'Save'}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </div>

        {/* Mobile commit message */}
        <div className="flex sm:hidden items-center gap-2">
          <form.Field name="commitMessage">
            {(field) => (
              <>
                <label
                  htmlFor={`${field.name}-mobile`}
                  className="text-xs text-muted-foreground whitespace-nowrap shrink-0"
                >
                  Commit message
                </label>
                <input
                  id={`${field.name}-mobile`}
                  className="flex-1 h-7 text-xs border border-border/60 bg-background px-2 rounded-md"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </>
            )}
          </form.Field>
        </div>

        {serverError && (
          <div className="text-sm text-destructive bg-destructive/8 border border-destructive/20 px-3 py-2">
            {serverError}
          </div>
        )}

        <form.Field name="content">
          {(field) => (
            <Suspense
              fallback={
                <div className="h-[500px] border border-border/60 bg-muted/20 animate-pulse" />
              }
            >
              <MarkdownEditor
                value={field.state.value}
                onChange={(val) => field.handleChange(val ?? '')}
                height={600}
              />
            </Suspense>
          )}
        </form.Field>
      </form>
    </form.AppForm>
  )
}
