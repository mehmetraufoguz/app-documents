import { createFileRoute, Link, Outlet, notFound } from '@tanstack/react-router'
import { ExternalLink, Pencil } from 'lucide-react'
import { getDocumentWithHistory } from '#/server/functions/documents.fns'
import { VersionSelector } from '#/components/app/version-selector'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Separator } from '#/components/ui/separator'

export const Route = createFileRoute('/_admin/documents/$documentId')({
  loader: async ({ params }) => {
    const doc = await getDocumentWithHistory({
      data: { documentId: params.documentId },
    })
    if (!doc) throw notFound()
    return { doc }
  },
  component: DocumentLayout,
})

function DocumentLayout() {
  const { doc } = Route.useLoaderData()
  const { documentId } = Route.useParams()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/dashboard" className="hover:text-foreground transition-colors">
              Documents
            </Link>
            <span>/</span>
            <span className="text-foreground">{doc.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{doc.title}</h1>
            <Badge variant="outline" className="font-mono text-xs">{doc.slug}</Badge>
          </div>
          {doc.description && (
            <p className="text-sm text-muted-foreground">{doc.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <VersionSelector versions={doc.versions} documentId={documentId} />
          <Button asChild size="sm">
            <Link to="/documents/$documentId/edit" params={{ documentId }}>
              <Pencil className="size-3.5" />
              Edit
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a
              href={`/document/${documentId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="size-3.5" />
              API
            </a>
          </Button>
        </div>
      </div>

      <Separator />

      <Outlet />
    </div>
  )
}
