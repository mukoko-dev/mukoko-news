// Generates public/sw.js from scripts/sw.template.js with this build's
// identity injected. Runs as the first step of `pnpm build`.
//
// Why the version lives INSIDE the script, not in its URL: the page calls
// registration.update() whenever an installed PWA becomes visible or focused
// again, and update() re-fetches the registration's EXISTING script URL. A
// URL-versioned worker (/sw.js?v=<sha>) therefore re-fetches the old URL and
// can never observe a new deploy — an open or background PWA stayed on the
// old build until a fresh navigation happened to register the new URL. With
// the identity in the script bytes and /sw.js served `Cache-Control:
// no-store` (src/lib/security-headers.ts), update() byte-compares fresh
// content and finds the new release. This is the mukoko-weather model.
//
//   sha      VERCEL_GIT_COMMIT_SHA on Vercel, `git rev-parse` locally.
//            Unique per deploy; the worker derives its cache names from it.
//   version  the VERSION file — the one version in this repo that MOVES
//            (release.yml bumps it on every green merge to main). Empty
//            rather than a guess: the banner drops its version line when
//            there is nothing trustworthy to show.
//
// public/sw.js is generated, gitignored, and never committed; the template is
// the source of truth.

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function buildSha() {
  const fromEnv = process.env.VERCEL_GIT_COMMIT_SHA?.trim();
  if (fromEnv && /^[0-9a-f]{7,40}$/i.test(fromEnv)) return fromEnv.slice(0, 40);
  try {
    return execSync("git rev-parse --short=7 HEAD", {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return "";
  }
}

function releasedVersion() {
  try {
    const raw = readFileSync(join(root, "VERSION"), "utf8").trim();
    return /^\d+\.\d+\.\d+$/.test(raw) ? raw : "";
  } catch {
    return "";
  }
}

const template = readFileSync(join(root, "scripts/sw.template.js"), "utf8");
const generated = template
  .replaceAll("__SW_SHA__", buildSha())
  .replaceAll("__SW_VERSION__", releasedVersion());

writeFileSync(join(root, "public/sw.js"), generated);
