import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * What the console shows while a query is in flight.
 *
 * A corpus query can take several seconds (two Atlas Search passes, one of them
 * reading documents). Before this existed the page went on showing the PREVIOUS
 * result while the next one ran — and on a first load, whatever the failed read
 * had returned, which was "0 articles — Nothing matched". A reader cannot tell
 * "still counting" from "counted, and there is nothing", so the running state
 * has to be its own thing, announced to assistive tech, and must never contain
 * a number.
 */
export function QueryRunning() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" data-testid="analytics-query-running">
      <div className="mb-6 flex items-center gap-3 border-b border-elevated pb-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
        <div>
          <p className="text-lg font-semibold text-foreground">Analysing the corpus…</p>
          <p className="text-sm text-text-secondary">
            Counting every matching article in the window. This can take a few seconds.
          </p>
        </div>
      </div>
      <div className="space-y-6" aria-hidden="true">
        <Skeleton className="h-[240px] w-full rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[220px] rounded-2xl" />
          <Skeleton className="h-[220px] rounded-2xl" />
          <Skeleton className="h-[220px] rounded-2xl" />
          <Skeleton className="h-[220px] rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

/** The route-level fallback: the first load of `/analytics` from another page. */
export function AnalyticsPageLoading() {
  return (
    <div className="mx-auto w-full max-w-[var(--width-wide)] px-[var(--page-gutter)] py-[var(--page-block)] sm:px-[var(--page-gutter-sm)]">
      <header className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Analytics</h1>
      </header>
      <QueryRunning />
    </div>
  )
}
