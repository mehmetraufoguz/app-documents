import { createFileRoute } from '@tanstack/react-router'
import { getDocumentContent } from '#/server/functions/documents.fns'
import { renderMarkdown } from '#/lib/markdown'

export const Route = createFileRoute('/document/$documentId/main')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const result = await getDocumentContent({
          data: { documentId: params.documentId, version: 'main' },
        })
        if (!result) {
          return new Response('Not found', { status: 404 })
        }

        const html = await renderMarkdown(result.content)

        return new Response(html, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
          },
        })
      },
    },
  },
})
