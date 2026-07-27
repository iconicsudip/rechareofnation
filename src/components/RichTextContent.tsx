// Renders admin-authored HTML (from RichTextEditor). Content is only ever written by
// authenticated admins (see src/proxy.ts), so this carries the same trust model as any
// CMS's trusted-author content — no public user input ever reaches this field.
export default function RichTextContent({ html, className }: { html: string; className?: string }) {
  if (!html) return null;
  return (
    <div
      className={`rn-rich-text-content ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
