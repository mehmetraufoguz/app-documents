import { useState, lazy, Suspense } from 'react'
import { createFileRoute, notFound, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Save } from 'lucide-react'
import { getDocumentContent, updateDocument } from '#/server/functions/documents.fns'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

const MarkdownEditor = lazy(
  () => import('#/components/app/document-editor.client'),
)

export const Route = createFileRoute('/_admin/documents/$documentId/edit')({
  loader: async ({ params }) => {
    const result = await getDocumentContent({
      data: { documentId: params.documentId },
    })
    if (!result) throw notFound()
    return { doc: result }
  },
  component: DocumentEdit,
})

function DocumentEdit() {
  const { doc } = Route.useLoaderData()
  const { documentId } = Route.useParams()
  const navigate = useNavigate()

  const [content, setContent] = useState(doc.content)
  const [commitMessage, setCommitMessage] = useState('Update document')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await updateDocument({
        data: { id: documentId, content, commitMessage },
      })
      navigate({
        to: '/documents/$documentId',
        params: { documentId },
        search: {},
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save document')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
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
            <Label htmlFor="commit" className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
              Commit message
            </Label>
            <Input
              id="commit"
              className="w-[200px] h-7 text-xs border-border/60"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="gap-1.5">
            <Save className="size-4" />
            {isSubmitting ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Mobile commit message */}
      <div className="flex sm:hidden items-center gap-2">
        <Label htmlFor="commit-mobile" className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
          Commit message
        </Label>
        <Input
          id="commit-mobile"
          className="flex-1 h-7 text-xs border-border/60"
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          required
        />
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/8 border border-destructive/20 px-3 py-2">
          {error}
        </div>
      )}

      <Suspense
        fallback={
          <div className="h-[500px] border border-border/60 bg-muted/20 animate-pulse" />
        }
      >
        <MarkdownEditor value={content} onChange={setContent} height={600} />
      </Suspense>
    </form>
  )
}
