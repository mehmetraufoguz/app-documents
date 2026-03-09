import { useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { FileText, Trash2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import { deleteDocument } from '#/server/functions/documents.fns'

interface DocumentCardProps {
  id: string
  slug: string
  title: string
  description: string | null
  updatedAt: Date
}

export function DocumentCard({ id, slug, title, description, updatedAt }: DocumentCardProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteDocument({ data: { id, commitMessage: `Delete document: ${title}` } })
      await router.invalidate()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card className="flex flex-col group border-border/60 bg-card/80 hover:border-primary/30 transition-colors duration-150">
      <CardHeader className="flex-1 pb-2">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <FileText className="size-4 text-primary/60 shrink-0 mt-0.5" />
          <Badge
            variant="outline"
            className="shrink-0 font-mono text-xs border-border/60 bg-muted/50 text-muted-foreground group-hover:border-primary/30 group-hover:text-primary/80 transition-colors"
          >
            {slug}
          </Badge>
        </div>
        <CardTitle className="text-sm font-semibold leading-snug mt-1.5">{title}</CardTitle>
        {description && (
          <CardDescription className="line-clamp-2 text-xs leading-relaxed mt-0.5">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0 pb-2">
        <p className="text-xs text-muted-foreground/60">
          Updated {new Date(updatedAt).toLocaleDateString()}
        </p>
      </CardContent>
      <CardFooter className="pt-0 gap-2 pb-3">
        <Button asChild size="sm" className="flex-1 h-7 text-xs">
          <Link to="/documents/$documentId" params={{ documentId: id }}>
            View
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="flex-1 h-7 text-xs">
          <Link to="/documents/$documentId/edit" params={{ documentId: id }}>
            Edit
          </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
              disabled={deleting}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &ldquo;{title}&rdquo;?</AlertDialogTitle>
              <AlertDialogDescription>
                The document will be removed from the repository with a git commit. You can still
                view it on the{' '}
                <Link to="/deleted-documents" className="underline underline-offset-2">
                  deleted documents
                </Link>{' '}
                page by browsing the commit history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}
