import { Marked } from "marked";

// Markdown for guide bodies. Own Marked instance rather than marked.use() on
// the shared singleton: place/province/hotel/privacy/terms still call the plain
// `marked.parse` and must keep rendering exactly as before.

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};
const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => HTML_ESCAPES[c]);

// Send self-hosted images through the built-in optimizer so a body image gets
// the same WebP + one-year cache next/image gives the rest of the site.
// w=1200 / q=75 are the only values allowed by default (deviceSizes and
// qualities in next.config.ts are untouched) — anything else answers 400.
// Remote URLs are left alone: only images.pexels.com and res.klook.com are in
// remotePatterns, and an image the optimizer refuses would break the article.
function optimized(href: string) {
  return href.startsWith("/")
    ? `/_next/image?url=${encodeURIComponent(href)}&w=1200&q=75`
    : href;
}

const guideMarked = new Marked({
  renderer: {
    // Markdown has nowhere to put width/height, so the box is fixed in CSS
    // (.prose-body figure img has an aspect-ratio) rather than per image.
    image({ href, title, text }) {
      const caption = title ? `<figcaption>${escapeHtml(title)}</figcaption>` : "";
      return (
        `<figure class="prose-figure">` +
        `<img src="${escapeHtml(optimized(href))}" alt="${escapeHtml(text)}" loading="lazy" decoding="async">` +
        `${caption}</figure>`
      );
    },
  },
});

export function renderGuideBody(md: string) {
  const html = guideMarked.parse(md, { async: false });
  // marked wraps an image that sits alone on a line in <p>, and <figure> inside
  // <p> is invalid: the browser closes the paragraph early and the caption ends
  // up outside the figure.
  return html.replace(
    /<p>(<figure class="prose-figure">[\s\S]*?<\/figure>)<\/p>/g,
    "$1",
  );
}
