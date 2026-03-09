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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="slug" className="text-sm font-medium">Slug</Label>
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
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-sm font-medium">Title</Label>
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
          <Label htmlFor="description" className="text-sm font-medium">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input
            id="description"
            placeholder="Short description of this document"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-xl border-border/60"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Content</Label>
          <Suspense fallback={<div className="h-[500px] border border-border/60 rounded-xl bg-muted/20 animate-pulse" />}>
            <MarkdownEditor value={content} onChange={setContent} />
          </Suspense>
        </div>

        <div className="space-y-2">
          <Label htmlFor="commit" className="text-sm font-medium">Commit message</Label>
          <Input
            id="commit"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            required
            className="rounded-xl border-border/60"
          />
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/8 border border-destructive/20 px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? 'Creating…' : 'Create document'}
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
