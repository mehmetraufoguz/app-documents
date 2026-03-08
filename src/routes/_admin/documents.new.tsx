import { useState, lazy, Suspense } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { createDocument } from '#/server/functions/documents.fns'
import { DOCUMENT_SLUGS } from '#/lib/schemas'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

const MarkdownEditor = lazy(
  () => import('#/components/app/document-editor.client'),
)

export const Route = createFileRoute('/_admin/documents/new')({
  component: NewDocument,
})

function NewDocument() {
  const navigate = useNavigate()
  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('# New Document\n\nWrite your content here...')
  const [commitMessage, setCommitMessage] = useState('Add document')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const result = await createDocument({
        data: { slug, title, description: description || undefined, content, commitMessage },
      })
      navigate({ to: '/documents/$documentId', params: { documentId: result.id } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create document')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => navigate({ to: '/dashboard' })}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-2xl font-bold">New Document</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              placeholder="e.g. tos, privacy"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              pattern="[a-z0-9-]+"
              required
              list="slug-suggestions"
            />
            <datalist id="slug-suggestions">
              {DOCUMENT_SLUGS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g. Terms of Service"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Input
            id="description"
            placeholder="Short description of this document"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Content</Label>
          <Suspense fallback={<div className="h-[500px] border rounded-md bg-muted/30 animate-pulse" />}>
            <MarkdownEditor value={content} onChange={setContent} />
          </Suspense>
        </div>

        <div className="space-y-2">
          <Label htmlFor="commit">Commit message</Label>
          <Input
            id="commit"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create document'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: '/dashboard' })}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
