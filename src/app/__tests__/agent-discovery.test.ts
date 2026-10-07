import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NextRequest } from 'next/server';
import { COUNTRY_SCOPE_TOTAL } from '@/lib/constants';

/**
 * A live count that is deliberately not the production figure — see the
 * sitemap suite for the same reasoning. If the markdown ignored the read and
 * fell back to a constant, a fixture equal to the real number would hide it.
 */
const LIVE_COUNT = 23;

import { GET as protectedResource } from '../.well-known/oauth-protected-resource/route';
import { GET as authServer } from '../.well-known/oauth-authorization-server/route';
import { GET as authMd } from '../auth.md/route';
import { normaliseAuthkitDomain, oauthIssuer } from '@/lib/agent-discovery';

const { mockGetArticle, mockGetArticles } = vi.hoisted(() => ({
  mockGetArticle: vi.fn(),
  mockGetArticles: vi.fn(),
}));

vi.mock('@/lib/actions/coverage', () => ({
  getLiveCoverageAction: async () => ({
    codes: [],
    count: LIVE_COUNT,
    scopeTotal: COUNTRY_SCOPE_TOTAL,
    fragment: `live in ${LIVE_COUNT} African countries and growing (all ${COUNTRY_SCOPE_TOTAL} in scope), readable anywhere in the world`,
    claim: `Live in ${LIVE_COUNT} African countries and growing, with the rest of Africa's ${COUNTRY_SCOPE_TOTAL} coming soon. Readable anywhere in the world.`,
    stale: false,
  }),
}));

vi.mock('@/lib/actions/feed', () => ({
  getArticleAction: mockGetArticle,
  getArticlesAction: mockGetArticles,
  searchArticlesAction: vi.fn(),
}));

describe('MCP server card (/.well-known/mcp/server-card.json)', () => {
  // No longer a static file: it states the coverage claim, which is a live
  // count now, so it is rendered per request through the same action as every
  // other surface. The test moved with it — reading `public/` would now assert
  // against a file that must NOT exist, since one there would shadow the route.
  it('is valid JSON exposing serverInfo, the MCP transport endpoint and tool capability', async () => {
    const { GET: serverCard } = await import('../.well-known/mcp/server-card.json/route');
    const body = await (await serverCard()).json();
    expect(body.serverInfo.name).toBe('mukoko-news');
    expect(body.serverInfo.version).toBeTruthy();
    expect(body.transport.endpoint).toBe('https://news.mukoko.dev/mcp');
    expect(body.capabilities.tools).toBe(true);
  });

  it('states the live coverage claim rather than a baked-in number', async () => {
    const { GET: serverCard } = await import('../.well-known/mcp/server-card.json/route');
    const body = await (await serverCard()).json();
    expect(body.serverInfo.description).toContain(String(LIVE_COUNT));
    expect(body.serverInfo.description).toContain(String(COUNTRY_SCOPE_TOTAL));
  });
});

// Test fixture — the AuthKit domain is configuration, never a code default.
process.env.WORKOS_AUTHKIT_DOMAIN = 'https://identity.example.test/';

describe('OAuth discovery metadata', () => {
  it('answers 503 when WORKOS_AUTHKIT_DOMAIN is not configured — no default host', async () => {
    const saved = process.env.WORKOS_AUTHKIT_DOMAIN;
    delete process.env.WORKOS_AUTHKIT_DOMAIN;
    try {
      for (const res of [protectedResource(), authServer(), authMd()]) {
        expect(res.status).toBe(503);
        expect((await res.json()).error).toBe('WORKOS_AUTHKIT_DOMAIN is not configured');
      }
    } finally {
      process.env.WORKOS_AUTHKIT_DOMAIN = saved;
    }
  });

  it('answers 503 when WORKOS_AUTHKIT_DOMAIN is not an https origin', async () => {
    const saved = process.env.WORKOS_AUTHKIT_DOMAIN;
    try {
      for (const bad of ['http://identity.example.test', 'https://user:pass@identity.example.test']) {
        process.env.WORKOS_AUTHKIT_DOMAIN = bad;
        for (const res of [protectedResource(), authServer(), authMd()]) {
          expect(res.status, bad).toBe(503);
        }
      }
    } finally {
      process.env.WORKOS_AUTHKIT_DOMAIN = saved;
    }
  });

  it('protected-resource lists a resource + authorization server', async () => {
    const body = await protectedResource().json();
    expect(body.resource).toBe('https://news.mukoko.com');
    expect(body.authorization_servers).toContain('https://identity.example.test');
    expect(Array.isArray(body.scopes_supported)).toBe(true);
  });

  it('authorization-server mirrors the WorkOS issuer + endpoints', async () => {
    const body = await authServer().json();
    expect(body.issuer).toBe('https://identity.example.test');
    expect(body.authorization_endpoint).toBe('https://identity.example.test/oauth2/authorize');
    expect(body.token_endpoint).toBe('https://identity.example.test/oauth2/token');
    expect(body.code_challenge_methods_supported).toContain('S256');
  });
});

describe('auth.md', () => {
  it('serves markdown with the required auth.md H1', async () => {
    const res = authMd();
    expect(res.headers.get('content-type')).toContain('text/markdown');
    const text = await res.text();
    expect(text).toMatch(/^# auth\.md/m);
    expect(text).toContain('identity.example.test');
  });
});

describe('Markdown for Agents (/api/agent-md)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders an article as markdown with a title and body', async () => {
    const { GET } = await import('../api/agent-md/route');
    mockGetArticle.mockResolvedValue({
      id: 'a1',
      title: 'Big Story',
      source: 'Herald',
      published_at: '2026-07-03',
      content_markdown: '## Section\n\nBody text.',
      original_url: 'https://herald.co.zw/big-story',
    });
    const req = new NextRequest('https://news.mukoko.com/api/agent-md?path=/article/a1');
    const res = await GET(req);
    expect(res.headers.get('content-type')).toContain('text/markdown');
    const text = await res.text();
    expect(text).toContain('# Big Story');
    expect(text).toContain('Body text.');
    expect(text).toContain('herald.co.zw/big-story');
    expect(res.headers.get('x-markdown-tokens')).toBeTruthy();
  });

  it('renders the homepage as a markdown headline index', async () => {
    const { GET } = await import('../api/agent-md/route');
    mockGetArticles.mockResolvedValue({
      articles: [{ id: 'a1', title: 'One', source: 'Herald', published_at: '2026-07-03' }],
      total: 1,
    });
    const req = new NextRequest('https://news.mukoko.com/api/agent-md?path=/');
    const text = await (await GET(req)).text();
    expect(text).toContain('# Mukoko News');
    expect(text).toContain('- [One]');
  });

  it('404s an unknown article', async () => {
    const { GET } = await import('../api/agent-md/route');
    mockGetArticle.mockResolvedValue(null);
    const req = new NextRequest('https://news.mukoko.com/api/agent-md?path=/article/missing');
    const res = await GET(req);
    expect(res.status).toBe(404);
  });

  /**
   * This endpoint used to serve the publisher's COMPLETE body under a "Read on
   * Mukoko News" link listed above "Original source" — an agent could satisfy a
   * reader end-to-end without the newsroom ever being fetched, from a document
   * whose link order said the aggregator was the destination.
   */
  it('serves an excerpt, not the publisher\'s full text', async () => {
    const { GET } = await import('../api/agent-md/route');
    const fullBody = Array.from({ length: 300 }, (_, i) => `paragraph ${i} of real reporting`).join('. ');
    mockGetArticle.mockResolvedValue({
      id: 'a1',
      title: 'Big Story',
      source: 'Herald',
      published_at: '2026-07-03',
      content: fullBody,
      original_url: 'https://herald.co.zw/big-story',
    });
    const req = new NextRequest('https://news.mukoko.com/api/agent-md?path=/article/a1');
    const text = await (await GET(req)).text();

    expect(text).not.toContain(fullBody);
    expect(text).not.toContain(fullBody.slice(-80)); // the tail never ships
    expect(text).toContain(fullBody.slice(0, 60)); // the opening does
    expect(text).toContain('Excerpt only.');
  });

  it('links the publisher first and labels it as the full article', async () => {
    const { GET } = await import('../api/agent-md/route');
    mockGetArticle.mockResolvedValue({
      id: 'a1',
      title: 'Big Story',
      source: 'Herald',
      published_at: '2026-07-03',
      content: 'Short body.',
      original_url: 'https://herald.co.zw/big-story',
    });
    const req = new NextRequest('https://news.mukoko.com/api/agent-md?path=/article/a1');
    const text = await (await GET(req)).text();

    const publisherLink = text.indexOf('https://herald.co.zw/big-story');
    const mukokoLink = text.indexOf('/article/a1');
    expect(publisherLink).toBeGreaterThan(-1);
    expect(mukokoLink).toBeGreaterThan(-1);
    expect(publisherLink).toBeLessThan(mukokoLink);
    expect(text).toContain('Read the full article at Herald');
  });

  it('still links Mukoko when the article has no original URL', async () => {
    const { GET } = await import('../api/agent-md/route');
    mockGetArticle.mockResolvedValue({
      id: 'a1',
      title: 'Big Story',
      source: 'Herald',
      published_at: '2026-07-03',
      content: 'Short body.',
    });
    const req = new NextRequest('https://news.mukoko.com/api/agent-md?path=/article/a1');
    const text = await (await GET(req)).text();
    expect(text).toContain('/article/a1');
  });

  it('states the 54-in-scope / 16-live coverage claim on the index', async () => {
    const { GET } = await import('../api/agent-md/route');
    mockGetArticles.mockResolvedValue({
      articles: [{ id: 'a1', title: 'One', source: 'Herald', published_at: '2026-07-03' }],
      total: 1,
    });
    const req = new NextRequest('https://news.mukoko.com/api/agent-md?path=/');
    const text = await (await GET(req)).text();
    expect(text).toContain(String(LIVE_COUNT));
    expect(text).toContain(String(COUNTRY_SCOPE_TOTAL));
    expect(text.toLowerCase()).toContain('coming soon');
  });
});

describe('oauthIssuer parses WORKOS_AUTHKIT_DOMAIN into an https origin', () => {
  const at = (value: string | undefined) => {
    const saved = process.env.WORKOS_AUTHKIT_DOMAIN;
    if (value === undefined) delete process.env.WORKOS_AUTHKIT_DOMAIN;
    else process.env.WORKOS_AUTHKIT_DOMAIN = value;
    try {
      return oauthIssuer();
    } finally {
      process.env.WORKOS_AUTHKIT_DOMAIN = saved;
    }
  };

  it('is null when unset or blank', () => {
    expect(at(undefined)).toBeNull();
    expect(at('   ')).toBeNull();
    expect(() => normaliseAuthkitDomain(undefined)).toThrow('WORKOS_AUTHKIT_DOMAIN is not configured');
  });

  it('accepts a bare host or an https origin in any case, and returns the origin', () => {
    expect(at('https://identity.example.test')).toBe('https://identity.example.test');
    expect(at('identity.example.test')).toBe('https://identity.example.test');
    expect(at('https://identity.example.test/')).toBe('https://identity.example.test');
    expect(at('HTTPS://Identity.Example.Test')).toBe('https://identity.example.test');
  });

  it('drops any path, query or fragment', () => {
    expect(at('https://identity.example.test/x/y?z=1#f')).toBe('https://identity.example.test');
  });

  it('treats anything that is not an https origin as unconfigured', () => {
    for (const bad of [
      'http://identity.example.test',
      'javascript://identity.example.test',
      'https://user:pass@identity.example.test',
      'user@identity.example.test',
      'https://',
    ]) {
      expect(at(bad), bad).toBeNull();
      expect(() => normaliseAuthkitDomain(bad), bad).toThrow('WORKOS_AUTHKIT_DOMAIN is not configured');
    }
  });
});
