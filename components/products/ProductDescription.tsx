'use client'

import ReactMarkdown from 'react-markdown'
import DOMPurify from 'isomorphic-dompurify'

export default function ProductDescription({ html }: { html: string }) {
  // If it starts with a tag it's HTML, otherwise treat as markdown
  const isHtml = html.trim().startsWith('<')

  if (isHtml) {
    const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
    return (
      <div
        className="prose prose-sm max-w-none prose-headings:font-black prose-a:text-[#FF007A]"
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    )
  }

  return (
    <div className="prose prose-sm max-w-none prose-headings:font-black prose-a:text-[#FF007A]">
      <ReactMarkdown>{html}</ReactMarkdown>
    </div>
  )
}
