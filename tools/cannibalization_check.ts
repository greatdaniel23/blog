/**
 * cannibalization_check.ts — KG-SEO v3 anti-cannibalization gate (spec 06 ERR-02).
 *
 * Checks a draft post's title/description against the static_node_keywords
 * registry. A dynamic post MUST NOT target a primary keyword reserved for a
 * static page (PRD RULE-BR-2). 'ls' (LSI) keywords warn but don't block.
 *
 * Usage:
 *   npx tsx tools/cannibalization_check.ts --title "..." [--description "..."]
 *   npx tsx tools/cannibalization_check.ts --all          # sweep existing posts
 *
 * Exit codes: 0 = clean, 1 = primary-keyword conflict (block), 2 = warnings only.
 * Reads the registry from the remote D1 via wrangler (see README note below).
 */

import { execSync } from "node:child_process";

const args = process.argv.slice(2);
const titleArg = args.indexOf("--title");
const descArg = args.indexOf("--description");
const allMode = args.includes("--all");

const title = titleArg >= 0 ? args[titleArg + 1] ?? "" : "";
const description = descArg >= 0 ? args[descArg + 1] ?? "" : "";

if (!title && !allMode) {
  console.error("Usage: cannibalization_check.ts --title \"...\" [--description \"...\"] | --all");
  process.exit(2);
}

type Row = { static_url: string; primary_keyword: string; keyword_group: string };

function fetchRegistry(): Row[] {
  const out = execSync(
    `npx wrangler d1 execute blogdatabase --remote --json --command "SELECT static_url, primary_keyword, keyword_group FROM static_node_keywords"`,
    { cwd: new URL("..", import.meta.url).pathname, encoding: "utf-8" },
  );
  const parsed = JSON.parse(out);
  return (parsed[0]?.results ?? []) as Row[];
}

function findConflicts(text: string, registry: Row[]) {
  const lower = text.toLowerCase();
  const conflicts: Row[] = [];
  for (const row of registry) {
    // Match as phrase (allow word-boundary variants like "bali" inside "balikpapan"?
    // No — exact phrase match, case-insensitive.)
    if (lower.includes(row.primary_keyword)) conflicts.push(row);
  }
  return conflicts;
}

function main() {
  const registry = fetchRegistry();
  if (registry.length === 0) {
    console.error("⚠ Registry empty — run migrations/0011_static_node_keywords.sql first.");
    process.exit(2);
  }

  if (allMode) {
    // Sweep mode: pull all published post titles and report overlaps.
    const out = execSync(
      `npx wrangler d1 execute blogdatabase --remote --json --command "SELECT id, slug, title FROM posts WHERE is_published = 1"`,
      { cwd: new URL("..", import.meta.url).pathname, encoding: "utf-8" },
    );
    const posts = (JSON.parse(out)[0]?.results ?? []) as { id: number; slug: string; title: string }[];
    let blocked = 0;
    let warned = 0;
    for (const post of posts) {
      const hits = findConflicts(post.title, registry);
      const primary = hits.filter((h) => h.keyword_group === "primary");
      const lsi = hits.filter((h) => h.keyword_group !== "primary");
      if (primary.length > 0) {
        blocked++;
        console.log(`🔴 #${post.id} ${post.slug} → PRIMARY: ${primary.map((h) => h.primary_keyword + "@" + h.static_url).join(", ")}`);
      } else if (lsi.length > 0) {
        warned++;
        console.log(`🟡 #${post.id} ${post.slug} → LSI: ${lsi.map((h) => h.primary_keyword).join(", ")}`);
      }
    }
    console.log(`\nSweep: ${posts.length} posts — ${blocked} primary conflicts, ${warned} LSI warnings.`);
    process.exit(blocked > 0 ? 1 : warned > 0 ? 2 : 0);
  }

  const hits = findConflicts(`${title} ${description}`.trim(), registry);
  const primary = hits.filter((h) => h.keyword_group === "primary");
  const lsi = hits.filter((h) => h.keyword_group !== "primary");

  if (primary.length > 0) {
    console.error(`🔴 BLOCK — draft targets static-owned keyword(s):`);
    for (const h of primary) console.error(`   - "${h.primary_keyword}" → ${h.static_url}`);
    console.error("PRD RULE-BR-2: dynamic posts must not target static primary keywords.");
    console.error("Fix: re-target the post to a long-tail angle or reassign the keyword.");
    process.exit(1);
  }
  if (lsi.length > 0) {
    console.warn(`🟡 WARNING — LSI overlap: ${lsi.map((h) => h.primary_keyword).join(", ")}`);
    process.exit(2);
  }
  console.log("✅ Clean — no cannibalization.");
  process.exit(0);
}

main();
