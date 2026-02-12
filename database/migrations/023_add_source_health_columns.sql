-- Add source health monitoring columns to rss_sources
-- consecutive_failures: tracks streak of failures for alerting
-- last_error_at: when the last error occurred (distinct from last_fetched_at)

ALTER TABLE rss_sources ADD COLUMN consecutive_failures INTEGER DEFAULT 0;
ALTER TABLE rss_sources ADD COLUMN last_error_at DATETIME;
