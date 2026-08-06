/**
 * decay_monitor.ts — KG-SEO v3 content decay lifecycle (spec 06 ERR-04 /
 * PRD RULE-LC-1/2). Flags posts past the 180-day audit threshold by age and
 * (when GA4/GSC metrics are wired) traffic drop.
 *
 * Usage:
 *   npx tsx tools/decay_monitor.ts            # flag REFRESH/MERGE/PRUNE candidates
 *   npx tsx tools/decay_monitor.ts --apply    # write decay_status into D1
 *
 * Action matrix (PRD RULE-LC-2):
 *   - Age > 180d + traffic drop > 50%  → REFRESH
 *   - Keyword overlap detected         → MERGE
 *   - Zero impressions > 360d          → PRUNE
 * v1: age-based flags only (traffic metrics need GA4/GSC credentials — wired
 * when the reporting token is available in this repo's tooling).
 */

import { execSync } from "node:child_process";

const APPLY = process.argv.includes("--apply");
const THRESHOLD_DAYS = 180;
const PRUNE_DAYS = 360;

type Post = {
  id: number;
  slug: string;
  title: string;
  pub_date: string | null;
  last_audit_date: string | null;
  decay_status: string | null;
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const d = new Date(iso.replace(" ", "T") + "Z");
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / 86_400_000);
}

// Windows-safe shell + SQL: temp file + wrangler --file (avoids nested-quote
// breakage and cmd.exe ENOENT from execSync shell resolution).
function sh(cmd: string): string {
  const comSpec = process.env.ComSpec ?? "C:\\Windows\\System32\\cmd.exe";
  return execSync(cmd, {
    shell: comSpec,
    env: { ...process.env, ComSpec: comSpec },
    cwd: new URL("..", import.meta.url).pathname,
    encoding: "utf-8",
  });
}

function sqlFile(query: string): string {
  const path = `${process.env.TEMP ?? "C:\\Windows\\Temp"}\\kg_sql_${Date.now()}_${Math.floor(Math.random() * 1e6)}.sql`;
  require("node:fs").writeFileSync(path, query, "utf-8");
  return path;
}

function runD1(query: string): unknown[] {
  const file = sqlFile(query);
  try {
    const out = sh(`npx wrangler d1 execute blogdatabase --remote --json --file "${file}"`);
    return JSON.parse(out) as unknown[];
  } finally {
    require("node:fs").unlinkSync(file);
  }
}

function run(): Post[] {
  const parsed = runD1(
    "SELECT id, slug, title, pub_date, last_audit_date, decay_status FROM posts WHERE is_published = 1;",
  );
  return (parsed[0]?.results ?? []) as Post[];
}

function main() {
  const posts = run();
  const today = todayISO();
  const flags: { post: Post; action: string; reason: string }[] = [];

  for (const post of posts) {
    const age = daysSince(post.pub_date);
    if (age === null) continue;
    if (age > PRUNE_DAYS) {
      // Zero-impression detection needs GSC — age > 360d alone only WARNS prune.
      flags.push({ post, action: "PRUNE-review", reason: `${age}d old — verify GSC impressions before noindex/delete` });
    } else if (age > THRESHOLD_DAYS) {
      // Traffic-drop detection needs GA4 — age > 180d alone = REFRESH-review.
      flags.push({ post, action: "REFRESH", reason: `${age}d old — review stats/facts; traffic check pending GA4 wiring` });
    }
  }

  if (flags.length === 0) {
    console.log(`✅ No decay flags (${posts.length} posts audited, threshold ${THRESHOLD_DAYS}d).`);
    return;
  }

  for (const { post, action, reason } of flags) {
    console.log(`${action === "REFRESH" ? "🟡" : "🟠"} #${post.id} ${post.slug} — ${reason}`);
  }

  if (APPLY) {
    for (const { post, action } of flags) {
      const status = action === "REFRESH" ? "decayed" : "warning";
      runD1(
        `UPDATE posts SET decay_status = '${status}', last_audit_date = '${today}' WHERE id = ${post.id};`,
      );
    }
    console.log(`\nApplied: ${flags.length} posts updated (decay_status + last_audit_date = ${today}).`);
  } else {
    console.log(`\n${flags.length} flag(s). Re-run with --apply to write decay_status into D1.`);
  }
}

main();
