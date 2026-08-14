// Serialise a JSON-LD object for a <script type="application/ld+json"> block.
//
// `JSON.stringify` alone is not safe here. React does not escape anything inside
// dangerouslySetInnerHTML, and JSON leaves `<` as `<` — so text that reaches the
// block from the database ends the script element early. Shop names and shop
// descriptions are written by merchants, which makes `</script>` in a profile a
// way to put script on a public page.
//
// The escapes below are the standard set: the three characters that can start
// markup, plus the two line separators that are legal in JSON strings but not in
// JavaScript string literals. All of them stay valid JSON — a `\uXXXX` escape
// parses back to the same character.
export function jsonLdHtml(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
