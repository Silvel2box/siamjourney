// Point the Shopee buttons at something. All 77 of them shipped aimed at
// shopee.co.th's homepage, under labels as specific as "สั่งซื้อโรตีสายไหม".
//
// The destinations live in shopee-links.json rather than inline the way
// apply-klook-links.mjs holds its handful: there are 77 of them and they are
// generated from the affiliate worklist spreadsheet, so hand-typing any of it
// would break the rule that values from a data file get generated and verified,
// never typed. Regenerate the json from the worklist and re-run this.
//
// Today those are Shopee search URLs, which earn nothing — they are honest
// destinations, not tracked links. Swapping in the affiliate short links means
// changing the json and running this again; nothing else has to move.
//
//   node scripts/apply-shopee-links.mjs [--dry]
import fs from "node:fs";
import path from "node:path";

const LINKS = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "scripts", "shopee-links.json"), "utf8"),
);

const BLOCK = /^affiliate:\n {2}label: .*\n {2}url: .*\n( {2}image: .*\n)?/m;

// An unquoted YAML scalar cannot hold ": ", and a search URL is full of them.
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

const block = (e) => `affiliate:\n  label: ${q(e.label)}\n  url: ${q(e.url)}\n`;

const dry = process.argv.includes("--dry");
const dir = path.join(process.cwd(), "content", "places");

let written = 0, unchanged = 0, missing = [];
for (const entry of LINKS) {
  const full = path.join(dir, `${entry.slug}.md`);
  if (!fs.existsSync(full)) { missing.push(entry.slug); continue; }

  // Only ever touches the places the json names — the Klook script owns the
  // rest, and neither should be able to clear the other's block.
  const text = fs.readFileSync(full, "utf8");
  const next = BLOCK.test(text)
    ? text.replace(BLOCK, block(entry))
    : text.replace(/^imageCredit:/m, `${block(entry)}imageCredit:`);

  if (next === text) { unchanged++; continue; }
  if (!dry) fs.writeFileSync(full, next);
  written++;
}

if (missing.length) console.warn("  ! link mapped to a slug that does not exist:", missing);

console.log(
  `${dry ? "[dry] " : ""}shopee links: ${written} written, ${unchanged} unchanged of ${LINKS.length}`,
);
