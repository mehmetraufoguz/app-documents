import { createFileRoute, getRouteApi, notFound } from '@tanstack/react-router'
import { z } from 'zod'
import { getDocumentContent } from '#/server/functions/documents.fns'
import { renderMarkdown } from '#/lib/markdown'
import { MarkdownPreview } from '#/components/app/markdown-preview'

const parentRoute = getRouteApi('/_admin/documents/$documentId')

export const Route = createFileRoute('/_admin/documents/$documentId/')({
  validateSearch: z.object({
    version: z.string().optional(),
  }),
  loaderDeps: ({ search }) => ({ version: search.version }),
  loader: async ({ params, deps }) => {
    const result = await getDocumentContent({
      data: {
        documentId: params.documentId,
        version: deps.version,
      },
    })
    if (!result) throw notFound()
    const html = await renderMarkdown(result.content)
    return { html, version: deps.version ?? 'main' }
  },
  component: DocumentView,
})

function DocumentView() {
  const { html, version } = Route.useLoaderData()
  const { doc } = parentRoute.useLoaderData()
  const matchedVersion = doc.versions.find((v) => v.commit === version)
  const versionDate = matchedVersion
    ? new Date(matchedVersion.date).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div className="space-y-3">
      {version !== 'main' && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 border border-border/60 px-3 py-1.5">
          <span className="size-1.5 rounded-full bg-primary inline-block shrink-0" />
          Viewing historical version:{' '}
          <code className="font-mono text-foreground/80">{version.slice(0, 7)}</code>
          {versionDate && (
            <>
              <span className="opacity-40">·</span>
              <span>{versionDate}</span>
            </>
          )}
        </div>
      )}
      <div className="bg-muted/25 border-l-2 border-primary/30 px-6 py-6">
        <MarkdownPreview html={html} />
      </div>
    </div>
  )
}
