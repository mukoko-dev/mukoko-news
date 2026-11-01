# agents.md — mukoko-news

**Canonical rule set for running tasks in this repo.** Any agent (Claude Code or otherwise) working here must follow this document. `CLAUDE.md` is the Claude-Code entry point and carries the full architecture detail; this file is the task rules + boundaries, `review.md` is the merge gate, and `auth.md` is the trust model.

## What this repo is

The **Next.js 15 frontend only** for Mukoko News, deployed to Vercel. It reads MongoDB Atlas directly via Server Actions and renders the public news experience plus an RBAC-gated admin app. The Cloudflare Workers API/MCP (`mukoko-news-gateway`) and the data pipeline (`mukoko-news-pipeline`) are separate repos.

## 🛑 Rule 1 — Data-flow boundaries (single source of truth)

The platform runs one MongoDB Atlas cluster with many **domain-separated databases**, each the single source of truth for its domain. From the frontend:

- **Reads** go through Server Actions (`src/lib/actions/feed.ts` → `src/lib/mongodb/*.ts`) to the **`news`** database. Never read through the gateway Worker.
- **Reads are migrating to the Nyuchi API** (`api.nyuchi.com/v1`, nyuchi/api-gateway — not the news gateway Worker) through `viaGateway()` in `src/lib/nyuchi-api/client.ts`, behind `NEWS_DATA_SOURCE` with the direct read as the fallback. Do not add a new direct MongoDB read; add the endpoint to the API (see that repo's `docs/architecture/data-access.md`).
- **Engagement writes** (like/view/save) go through Route Handlers under `src/app/api/articles/[id]/*` — rate-limited.
- **Admin mutations** are the **only** frontend→gateway calls (`src/lib/admin/gateway.ts`), forwarding the WorkOS token so the Worker re-verifies RBAC.
- **Never silo another domain's records** into an article or a new collection. Category/tag data the feed reads lives under the article's `engagement.{interest_categories,tags}` (a denormalised cache the pipeline writes); the frontend **reads** it — it does not invent new article sub-objects for places, entities, or other domains.

## Rule 2 — pnpm only, one lockfile

**pnpm is the only package manager** and `pnpm-lock.yaml` is the only lockfile; Vercel, CI and the Husky hook all install from it, with the version pinned in `package.json#packageManager`. Change dependencies with `pnpm add` / `pnpm remove` / `pnpm update` and commit `pnpm-lock.yaml` with `package.json`. **Never run `npm install` or `yarn`** — they resolve a different tree from the one that deploys; a committed `package-lock.json` or `yarn.lock` fails the `Single lockfile` CI job. Security overrides live in `pnpm-workspace.yaml`, not `package.json`. See `CLAUDE.md` → Commands for why.

## Rule 3 — The pre-commit gate is real

Husky `.husky/pre-commit` runs `vitest related` on staged files → `typecheck` → `build`, and **all three must pass**. Don't bypass it. CI (`deploy.yml`) additionally runs the `lint / *` gate + `test:coverage`, `typecheck`, `lint` and `build` on Node 24.

## Rule 4 — Test the way the app reads

Pages read via Server Actions, so in tests **mock `@/lib/actions/feed`** (NOT `@/lib/api`) and match the documented return shapes (see `CLAUDE.md` → Data Flow). ~460 tests across 21 files; coverage thresholds 60% statements/functions/lines, 50% branches.

## Rule 5 — Follow the security & component patterns

- Structured data only via `safeJsonLdStringify()` (`src/components/ui/json-ld.tsx`).
- Validate image URLs with `isValidImageUrl()` and CSS `url()` values with `safeCssUrl()` (`src/lib/utils.ts`) — never interpolate raw URLs into styles.
- Engagement Route Handlers use `checkRateLimit()` + `getRequestIp()` (`src/lib/rate-limit.ts`).
- Error boundaries + skeleton loaders on every data-fetching page; Radix primitives + Tailwind (no inline styles); stable unique list keys (never array indices).

## Rule 6 — Git workflow

- Feature branch; never push to `main` outside the designated task branch.
- Conventional commits; PRs open as **draft**.
- Merge to `main` auto-deploys to Vercel — keep `main` releasable.

## Running a task — checklist

1. Confirm the read path (Server Action → `news` DB) or write path (Route Handler / admin gateway) — Rule 1.
2. Make the change on a feature branch; follow the component + security patterns (Rule 5).
3. If deps changed, change them with pnpm and commit `pnpm-lock.yaml` (Rule 2).
4. Run `pnpm test && pnpm typecheck && pnpm lint && pnpm build` (the pre-commit + CI gate).
5. Commit (conventional), push, open a **draft** PR.

## Track big work in GitHub issues

Any substantial build, migration, investigation or multi-step task gets a GitHub issue in the repo that owns it — before or as work starts — so another session, agent or person can pick it up.

- The issue holds the goal, the owner's decisions (verbatim where given), the plan, acceptance criteria, owner-only steps and links.
- Every PR references its issue (`Refs #n`; `Fixes #n` only when the merge completes it).
- Post progress, decisions and a hand-off note (what's done, what's left, branch names) as issue comments — at each merge and before a session or agent finishes.
- Work spanning repos gets a tracking issue that links the per-repo issues.
- Never put secrets, credential status or exploitable detail in issues on public repos.

## Dev skills, progress reports and the merge gate

Load the Mzizi **dev skills** before starting work: `mzizi_get_skills category=dev` on the Mzizi MCP (`mcp.mzizi.dev`), or `@nyuchi/mzizi-skills` from npm. They are `digital-hygiene` and `progress-report`.

- **Digital hygiene.** Check free disk before starting, clone only under `$TMPDIR`, share build caches, and audit, then delete, your clones once the work merges (`digital-hygiene` skill).
- **Clone isolation.** Clone only into a directory unique to you; never touch another agent's.
- **Progress reports.** All dev work runs on a 10-minute progress-report loop (`progress-report` skill): measured bars, what changed, and a final "Needs you:" line. Report ticks never publish, release, merge or deploy without the owner's approval.
- **Merge gate.** Merge only when the work is complete, CI is green, it's verified at runtime, and `/code-review` has run with findings resolved.
