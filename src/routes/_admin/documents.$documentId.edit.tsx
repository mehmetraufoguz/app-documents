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
    <form onSubmit={handleSave} className="space-y-5">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            navigate({
              to: '/documents/$documentId',
              params: { documentId },
              search: {},
            })
          }
        >
          <ArrowLeft className="size-4" />
          Back to view
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="commit" className="text-sm whitespace-nowrap">
              Commit message
            </Label>
            <Input
              id="commit"
              className="w-[240px]"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="size-4" />
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Suspense
        fallback={
          <div className="h-[500px] border rounded-md bg-muted/30 animate-pulse" />
        }
      >
        <MarkdownEditor value={content} onChange={setContent} height={600} />
      </Suspense>
    </form>
  )
}
