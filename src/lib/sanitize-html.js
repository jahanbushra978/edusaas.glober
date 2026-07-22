import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes admin/branch_admin-authored rich text (Notices, Blog posts, etc.)
 * before it is rendered with dangerouslySetInnerHTML on the public website.
 *
 * H1 fix: previously this content was rendered completely unsanitized, which
 * meant a compromised or careless admin account could inject a <script>
 * payload that would execute in every visitor's browser (stored XSS).
 *
 * Allows the basic rich-text formatting these editors actually produce
 * (headings, paragraphs, lists, links, images, tables, emphasis) and strips
 * everything else, including inline event handlers and javascript: URLs.
 */
export function sanitizeHtml(html) {
  if (!html || typeof html !== "string") return "";

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "hr",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "strong", "b", "em", "i", "u", "s", "strike", "sub", "sup", "mark",
      "ul", "ol", "li",
      "a", "img",
      "blockquote", "pre", "code",
      "table", "thead", "tbody", "tr", "th", "td",
      "span", "div",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "target", "rel", "colspan", "rowspan"],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i,
    ADD_ATTR: ["target", "rel"],
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input", "svg"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "style"],
  });
}

export default sanitizeHtml;
