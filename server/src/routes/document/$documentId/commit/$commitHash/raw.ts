import { createFileRoute } from '@tanstack/react-router'
import { getDocumentContent } from '#/server/functions/documents.fns'

export const Route = createFileRoute('/document/$documentId/commit/$commitHash/raw')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const result = await getDocumentContent({
          data: {
            documentId: params.documentId,
            version: params.commitHash,
          },
        })
        if (!result) {
          return new Response('Not found', { status: 404 })
        }

        return new Response(result.content, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, immutable',
          },
        })
      },
    },
  },
})
