interface MarkdownPreviewProps {
  html: string
  className?: string
}

export function MarkdownPreview({ html, className }: MarkdownPreviewProps) {
  return (
    <div
      className={`prose prose-slate dark:prose-invert max-w-none ${className ?? ''}`}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized by sanitize-html
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
