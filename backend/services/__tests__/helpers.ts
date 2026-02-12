/**
 * Shared test mock helpers for backend services
 *
 * Centralizes mock creation patterns to reduce boilerplate
 * and make behavioral changes easy to propagate.
 */

import { vi } from 'vitest';

/**
 * Create a mock D1Database with chainable statement pattern.
 * Usage:
 *   const { db, statement } = createMockD1();
 *   statement.first.mockResolvedValue({ id: '1', name: 'test' });
 *   const service = new MyService(db as unknown as D1Database);
 */
export function createMockD1() {
  const statement = {
    bind: vi.fn().mockReturnThis(),
    first: vi.fn().mockResolvedValue(null),
    all: vi.fn().mockResolvedValue({ results: [] }),
    run: vi.fn().mockResolvedValue({ success: true, meta: { last_row_id: 1 } }),
  };

  const db = {
    prepare: vi.fn().mockReturnValue(statement),
    batch: vi.fn().mockResolvedValue([]),
    exec: vi.fn().mockResolvedValue({ count: 0 }),
    dump: vi.fn(),
  };

  return { db, statement };
}

/**
 * Create a mock KVNamespace.
 * Usage:
 *   const kv = createMockKV();
 *   kv.get.mockResolvedValue('cached-value');
 */
export function createMockKV() {
  return {
    get: vi.fn().mockResolvedValue(null),
    put: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    list: vi.fn().mockResolvedValue({ keys: [], list_complete: true }),
    getWithMetadata: vi.fn().mockResolvedValue({ value: null, metadata: null }),
  };
}

/**
 * Create a mock Workers AI binding.
 */
export function createMockAI() {
  return {
    run: vi.fn().mockResolvedValue({ response: '' }),
  };
}

/**
 * Create a mock Vectorize index binding.
 */
export function createMockVectorize() {
  return {
    upsert: vi.fn().mockResolvedValue({ count: 0 }),
    query: vi.fn().mockResolvedValue({ matches: [] }),
    getByIds: vi.fn().mockResolvedValue([]),
    deleteByIds: vi.fn().mockResolvedValue({ count: 0 }),
  };
}

/**
 * Create a mock Cloudflare Images binding.
 */
export function createMockImages() {
  return {
    upload: vi.fn().mockResolvedValue({ id: 'mock-image-id' }),
  };
}

/**
 * Create a mock AnalyticsEngine dataset.
 */
export function createMockAnalyticsEngine() {
  return {
    writeDataPoint: vi.fn(),
  };
}
