"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpCircle, RefreshCw, X } from "lucide-react";

/**
 * The service worker's script URL is CONSTANT: the deploy identity lives in
 * the script BYTES (scripts/inject-sw-version.mjs writes the BUILD constant
 * at build time) and /sw.js is served `Cache-Control: no-store`
 * (src/lib/security-headers.ts), so a `registration.update()` check
 * byte-compares fresh content and finds a new release. A versioned URL like
 * /sw.js?v=<sha> cannot work with update(): the browser re-fetches the
 * registration's EXISTING url, which still names the old build — so an
 * open or background PWA never discovered the new one.
 */
const SW_URL = "/sw.js";

/**
 * The version a waiting worker would upgrade you TO, as display text.
 *
 * Built from the worker's OWN reply to {type:'GET_VERSION'} rather than from
 * `process.env`: the env var is baked into the bundle that is ALREADY
 * running, so it names the version you are leaving, not the one you are
 * getting. The reply carries the waiting worker's BUILD — its commit sha and
 * the VERSION file's release.
 *
 * `version` wins when present and is rendered with the leading `v` every git
 * UI and release page uses (owner report 2026-09-14: the card was naming a
 * commit id, which answers "which build" but cannot be checked against
 * anything). Commit SHAs are shortened the way every git UI shortens them.
 * Returns null when there is nothing trustworthy to show — a version line
 * that says "unknown" is worse than no version line.
 */
export function formatIncomingVersion(build: {
  sha?: unknown;
  version?: unknown;
}): string | null {
  const released =
    typeof build.version === "string" ? build.version.trim() : "";
  // Matched strictly: the version is ours to set, so anything that is not a
  // plain semantic version is a bug rather than something to render at a
  // reader.
  if (/^\d+\.\d+\.\d+$/.test(released)) return `v${released}`;

  const sha = typeof build.sha === "string" ? build.sha.trim() : "";
  // A 40-char hex SHA is unreadable in a toast; 7 is what git shows.
  if (/^[0-9a-f]{7,40}$/i.test(sha)) return sha.slice(0, 7);
  return sha && sha.length <= 24 ? sha : null;
}

/**
 * Ask a worker which build it is, with a timeout: a worker deployed before
 * GET_VERSION existed never replies, and the banner must not wait forever.
 */
export async function requestIncomingVersion(
  worker: ServiceWorker,
): Promise<string | null> {
  return new Promise((resolve) => {
    let settled = false;
    const container = navigator.serviceWorker;
    const finish = (value: string | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      container.removeEventListener("message", onMessage);
      resolve(value);
    };
    const onMessage = (event: MessageEvent) => {
      const data = event.data as {
        type?: string;
        sha?: unknown;
        version?: unknown;
      } | null;
      if (data && data.type === "VERSION") {
        finish(formatIncomingVersion(data));
      }
    };
    const timer = setTimeout(() => finish(null), 1500);
    container.addEventListener("message", onMessage);
    try {
      worker.postMessage({ type: "GET_VERSION" });
    } catch {
      finish(null);
    }
  });
}

interface ServiceWorkerRegisterProps {
  /** Injectable for tests — jsdom's window.location.reload is not stubbable. */
  reloadPage?: () => void;
}

/**
 * Registers /sw.js in production and shows a subtle "Update available" banner
 * when a new service worker is waiting. Accepting posts {type:'SKIP_WAITING'}
 * to the waiting worker; the page reloads once on controllerchange (guarded
 * against double reloads). Dependency-free by design.
 */
export function ServiceWorkerRegister({
  reloadPage,
}: ServiceWorkerRegisterProps) {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(
    null,
  );
  const [version, setVersion] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const reloadingRef = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator))
      return;

    const container = navigator.serviceWorker;
    let cancelled = false;

    // Single-reload guard: controllerchange fires when the new worker takes
    // over (after SKIP_WAITING); reload exactly once to pick up new assets.
    const onControllerChange = () => {
      if (reloadingRef.current) return;
      reloadingRef.current = true;
      if (reloadPage) reloadPage();
      else window.location.reload();
    };
    container.addEventListener("controllerchange", onControllerChange);

    // The registration, once available, so the active checks below can force
    // an update check instead of waiting for the browser's own navigation
    // check — an installed PWA that stays open, or is reopened without a
    // fresh navigation, would otherwise never learn about a release.
    let registration: ServiceWorkerRegistration | null = null;

    // Ask the browser to re-check /sw.js. With the no-store header on the
    // script this byte-compares fresh content; a new BUILD installs, reaches
    // `installed` with a controller present, and the banner appears.
    const checkForUpdate = () => {
      try {
        registration?.update().catch(() => {
          // no-op — an update check is best-effort
        });
      } catch {
        // no-op — some browsers throw synchronously when unsupported
      }
    };

    const register = async () => {
      try {
        registration = await container.register(SW_URL);
        if (cancelled) return;

        // A worker may already be waiting from a previous visit.
        if (registration.waiting && container.controller) {
          setWaitingWorker(registration.waiting);
        }

        registration.addEventListener("updatefound", () => {
          const installing = registration?.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            // 'installed' + an existing controller ⇒ an update is waiting
            // (no controller means this is the very first install — nothing
            // to prompt about).
            if (
              !cancelled &&
              installing.state === "installed" &&
              container.controller
            ) {
              setWaitingWorker(installing);
            }
          });
        });

        // Check once so a PWA left open across a deploy picks it up...
        checkForUpdate();
      } catch {
        // Registration failed (unsupported / blocked) — the app still works,
        // just without offline support.
      }
    };

    // ...and again whenever the document becomes visible (reopening an
    // installed PWA fires this) or is focused. Only on becoming visible, not
    // on being hidden.
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") checkForUpdate();
    };

    if (document.readyState === "complete") {
      void register();
    } else {
      window.addEventListener("load", register, { once: true });
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", checkForUpdate);

    return () => {
      cancelled = true;
      container.removeEventListener("controllerchange", onControllerChange);
      window.removeEventListener("load", register);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", checkForUpdate);
    };
  }, [reloadPage]);

  // The banner names the build it would upgrade you TO — ask the waiting
  // worker itself (its BUILD), never this bundle's env (that names the
  // version being left). A worker deployed before GET_VERSION existed never
  // answers; the banner then drops its version line rather than guessing.
  useEffect(() => {
    if (!waitingWorker) return;
    let cancelledAsk = false;
    void requestIncomingVersion(waitingWorker).then((value) => {
      if (!cancelledAsk) setVersion(value);
    });
    return () => {
      cancelledAsk = true;
    };
  }, [waitingWorker]);

  const applyUpdate = useCallback(() => {
    // The worker's message handler calls self.skipWaiting(); the resulting
    // controllerchange triggers the guarded reload above.
    waitingWorker?.postMessage({ type: "SKIP_WAITING" });
  }, [waitingWorker]);

  if (!waitingWorker || dismissed) return null;

  return (
    /* A card at the BOTTOM LEFT, in the sidebar's own column when it is docked
       (owner direction 2026-09-11). It was a centred pill floating over the
       middle of the page, which put it straight over whatever you were
       reading — and an update is never so urgent that it should take the
       reading surface. The sidebar's foot is chrome; this belongs with the
       chrome. Below `lg` it stacks above the island using the one clearance
       token every pinned surface reads. */
    <div
      role="status"
      className="fixed left-4 z-50 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-outline bg-popover p-4 shadow-lg backdrop-blur-xl bottom-[var(--bottom-nav-clearance)] lg:bottom-4 lg:w-[calc(var(--sidebar-width)-2rem)]"
    >
      <div className="flex items-start gap-3">
        <ArrowUpCircle
          className="mt-0.5 h-5 w-5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">
            New version available
          </p>
          {/* Naming the target build is the point of the card: "an update is
              available" tells you nothing you can check afterwards, and a
              reader who refreshes has no way to confirm they got it. What it
              names is the RELEASE (`v4.60.0`) rather than the commit id it
              used to show — see formatIncomingVersion. */}
          {version ? (
            <p className="mt-0.5 truncate font-mono text-xs text-text-secondary">
              Upgrading to {version}
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-text-secondary">
              A newer version is ready to install.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss update notification"
          className="-mr-1 -mt-1 shrink-0 rounded-xl p-2 text-text-tertiary transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <button
        type="button"
        onClick={applyUpdate}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Refresh now
      </button>
    </div>
  );
}
