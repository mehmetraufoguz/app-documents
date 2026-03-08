import { marked } from 'marked'
import { gfmHeadingId } from 'marked-gfm-heading-id'
import sanitizeHtml from 'sanitize-html'

marked.use(gfmHeadingId())

export async function renderMarkdown(md: string): Promise<string> {
  const dirty = await marked.parse(md)
  return sanitizeHtml(dirty, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'pre', 'code', 'blockquote', 'img',
      'details', 'summary',
      'del', 'ins', 'sup', 'sub',
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['id', 'class'],
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      code: ['class'],
      pre: ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  })
}
