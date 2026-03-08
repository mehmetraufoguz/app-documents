import { createFileRoute, notFound } from '@tanstack/react-router'
import { z } from 'zod'
import { getDocumentContent } from '#/server/functions/documents.fns'
import { renderMarkdown } from '#/lib/markdown'
import { MarkdownPreview } from '#/components/app/markdown-preview'

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

  return (
    <div className="space-y-4">
      {version !== 'main' && (
        <div className="text-xs text-muted-foreground bg-muted/50 border rounded-md px-3 py-2">
          Viewing version: <code className="font-mono">{version.slice(0, 7)}</code>
        </div>
      )}
      <MarkdownPreview html={html} />
    </div>
  )
}
