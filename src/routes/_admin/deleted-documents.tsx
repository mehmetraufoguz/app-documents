import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, FileText, GitCommit } from 'lucide-react'
import { listDeletedDocuments } from '#/server/functions/documents.fns'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

type DeletedDocument = Awaited<ReturnType<typeof listDeletedDocuments>>[number]

export const Route = createFileRoute('/_admin/deleted-documents')({
  loader: async () => {
    const docs = await listDeletedDocuments()
    return { docs }
  },
  component: DeletedDocuments,
})

function DeletedDocuments() {
  const { docs } = Route.useLoaderData()

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Link
              to="/dashboard"
              className="hover:text-foreground transition-colors no-underline font-medium"
            >
              Documents
            </Link>
            <span className="opacity-40">/</span>
            <span className="text-foreground/80">Deleted</span>
          </nav>
          <h1 className="text-xl font-bold tracking-tight">Deleted documents</h1>
          <p className="text-sm text-muted-foreground">
            Documents removed from the repository — content preserved in git history
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0 gap-1.5">
          <Link to="/dashboard">
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </Button>
      </div>

      {docs.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border/70 bg-muted/20">
          <p className="text-muted-foreground text-sm font-medium">No deleted documents</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
            {docs.length} {docs.length === 1 ? 'document' : 'documents'}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {docs.map((doc: DeletedDocument) => (
              <DeletedDocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function DeletedDocumentCard({ doc }: { doc: DeletedDocument }) {
  return (
    <Card className="flex flex-col border-border/60 bg-card/60 opacity-80">
      <CardHeader className="flex-1 pb-2">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <FileText className="size-4 text-muted-foreground/60 shrink-0 mt-0.5" />
          <Badge
            variant="outline"
            className="shrink-0 font-mono text-xs border-border/60 bg-muted/50 text-muted-foreground"
          >
            {doc.slug}
          </Badge>
        </div>
        <CardTitle className="text-sm font-semibold leading-snug mt-1.5">{doc.title}</CardTitle>
        {doc.description && (
          <CardDescription className="line-clamp-2 text-xs leading-relaxed mt-0.5">
            {doc.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0 pb-2 space-y-1">
        <p className="text-xs text-muted-foreground/60">
          Deleted{' '}
          {doc.deletedAt
            ? new Date(doc.deletedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : '—'}
        </p>
        {doc.lastCommitHash && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground/50 font-mono">
            <GitCommit className="size-3 shrink-0" />
            {doc.lastCommitHash.slice(0, 7)}
          </p>
        )}
      </CardContent>
      {doc.lastCommitHash && (
        <CardFooter className="pt-0 pb-3">
          <Button asChild size="sm" variant="outline" className="w-full h-7 text-xs">
            <Link
              to="/documents/$documentId"
              params={{ documentId: doc.id }}
              search={{ version: doc.lastCommitHash }}
            >
              View last version
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
