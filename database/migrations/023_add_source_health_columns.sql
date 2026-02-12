-- Add source health monitoring columns to rss_sources
-- consecutive_failures: tracks streak of failures for alerting
-- last_error_at: when the last error occurred (distinct from last_fetched_at)
-- last_success_at: when the last successful fetch occurred (distinct from last_fetched_at)

ALTER TABLE rss_sources ADD COLUMN consecutive_failures INTEGER DEFAULT 0;
ALTER TABLE rss_sources ADD COLUMN last_error_at DATETIME;
ALTER TABLE rss_sources ADD COLUMN last_success_at DATETIME;

-- Index for health dashboard queries that sort by failure severity
CREATE INDEX IF NOT EXISTS idx_rss_sources_health
ON rss_sources(consecutive_failures DESC, error_count DESC)
WHERE enabled = 1;
