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
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground mt-0.5 shrink-0" />
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <Badge variant="outline" className="shrink-0 font-mono text-xs">
            {slug}
          </Badge>
        </div>
        {description && (
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground">
          Updated {new Date(updatedAt).toLocaleDateString()}
        </p>
      </CardContent>
      <CardFooter className="pt-0 gap-2">
        <Button asChild size="sm" className="flex-1">
          <Link to="/documents/$documentId" params={{ documentId: id }}>
            View
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="flex-1">
          <Link to="/documents/$documentId/edit" params={{ documentId: id }}>
            Edit
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
