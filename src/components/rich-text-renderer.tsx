import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

interface RichTextRendererProps {
  data: SerializedEditorState | null | undefined
  className?: string
}

/**
 * Renders Lexical rich text content from Payload CMS.
 * Uses the built-in converters for all default node types (headings, lists, links, etc.)
 */
export function RichTextRenderer({ data, className }: RichTextRendererProps) {
  if (!data) return null

  return (
    <div className={`prose-vitrina ${className ?? ''}`}>
      <RichText data={data} />
    </div>
  )
}
