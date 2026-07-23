const SANITIZE_OPTIONS = {
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
};

let DOMPurify = null;
try {
  DOMPurify = (require("isomorphic-dompurify").default || require("isomorphic-dompurify"));
} catch {
  DOMPurify = null;
}

export function sanitizeHtml(html) {
  if (!html || typeof html !== "string") return "";
  if (!DOMPurify) return html;
  return DOMPurify.sanitize(html, SANITIZE_OPTIONS);
}

export default sanitizeHtml;
