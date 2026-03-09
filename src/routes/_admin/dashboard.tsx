import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { listDocuments } from '#/server/functions/documents.fns'
import { DocumentCard } from '#/components/app/document-card'
import { Button } from '#/components/ui/button'

type Document = Awaited<ReturnType<typeof listDocuments>>[number]

export const Route = createFileRoute('/_admin/dashboard')({
  loader: async () => {
    const docs = await listDocuments()
    return { docs }
  },
  component: Dashboard,
})

function Dashboard() {
  const { docs } = Route.useLoaderData()

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold tracking-tight">Documents</h1>
          <p className="text-sm text-muted-foreground">
            Manage your legal and policy documents
          </p>
        </div>
        <Button asChild className="shrink-0 gap-1.5">
          <Link to="/documents/new">
            <Plus className="size-4" />
            New document
          </Link>
        </Button>
      </div>

      {docs.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border/70 bg-muted/20">
          <p className="text-muted-foreground text-sm mb-4 font-medium">
            No documents yet
          </p>
          <Button asChild size="sm">
            <Link to="/documents/new">
              <Plus className="size-4" />
              Create your first document
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
            {docs.length} {docs.length === 1 ? 'document' : 'documents'}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {docs.map((doc: Document) => (
              <DocumentCard
                key={doc.id}
                id={doc.id}
                slug={doc.slug}
                title={doc.title}
                description={doc.description}
                updatedAt={doc.updatedAt}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
