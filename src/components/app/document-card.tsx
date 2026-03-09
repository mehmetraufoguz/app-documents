import { Link } from '@tanstack/react-router'
import { FileText } from 'lucide-react'
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

interface DocumentCardProps {
  id: string
  slug: string
  title: string
  description: string | null
  updatedAt: Date
}

export function DocumentCard({ id, slug, title, description, updatedAt }: DocumentCardProps) {
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
        <Button
          asChild
          size="sm"
          className="flex-1 h-7 text-xs"
        >
          <Link to="/documents/$documentId" params={{ documentId: id }}>
            View
          </Link>
        </Button>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="flex-1 h-7 text-xs"
        >
          <Link to="/documents/$documentId/edit" params={{ documentId: id }}>
            Edit
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
