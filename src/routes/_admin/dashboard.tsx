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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your legal and policy documents
          </p>
        </div>
        <Button asChild>
          <Link to="/documents/new">
            <Plus className="size-4" />
            New document
          </Link>
        </Button>
      </div>

      {docs.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-muted/30">
          <p className="text-muted-foreground text-sm mb-4">
            No documents yet. Create your first one.
          </p>
          <Button asChild size="sm">
            <Link to="/documents/new">
              <Plus className="size-4" />
              Create document
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      )}
    </div>
  )
}
