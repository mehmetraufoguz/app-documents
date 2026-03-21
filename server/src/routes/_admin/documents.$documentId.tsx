import { createFileRoute, Link, Outlet, notFound } from '@tanstack/react-router'
import { ExternalLink, Pencil } from 'lucide-react'
import { getDocumentWithHistory } from '#/server/functions/documents.fns'
import { VersionSelector } from '#/components/app/version-selector'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'

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

  const isDeleted = !!doc.deletedAt

  return (
    <div className="space-y-4">
      {isDeleted && (
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/5 border border-destructive/30 px-3 py-1.5">
          <span className="size-1.5 rounded-full bg-destructive/60 inline-block shrink-0" />
          Deleted on{' '}
          <strong>
            {new Date(doc.deletedAt!).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </strong>
          <span className="opacity-40 mx-0.5">·</span>
          <Link
            to="/deleted-documents"
            className="underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            Back to deleted documents
          </Link>
        </div>
      )}

      {/* Breadcrumb + header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-border/60">
        <div className="space-y-1.5">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link
              to="/dashboard"
              className="hover:text-foreground transition-colors no-underline font-medium"
            >
              Documents
            </Link>
            <span className="opacity-40">/</span>
            <span className="text-foreground/80">{doc.title}</span>
          </nav>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight">{doc.title}</h1>
            <Badge
              variant="outline"
              className="font-mono text-xs border-border/60 bg-muted/40"
            >
              {doc.slug}
            </Badge>
            {isDeleted && (
              <Badge variant="outline" className="text-xs border-destructive/40 bg-destructive/5 text-destructive/80">
                Deleted
              </Badge>
            )}
          </div>
          {doc.description && (
            <p className="text-sm text-muted-foreground">{doc.description}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <VersionSelector versions={doc.versions} documentId={documentId} />
          {!isDeleted && (
            <>
              <Button asChild size="sm" className="gap-1.5">
                <Link to="/documents/$documentId/edit" params={{ documentId }}>
                  <Pencil className="size-3.5" />
                  Edit
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="gap-1.5">
                <a
                  href={`/document/${documentId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="size-3.5" />
                  API
                </a>
              </Button>
            </>
          )}
        </div>
      </div>

      <Outlet />
    </div>
  )
}
