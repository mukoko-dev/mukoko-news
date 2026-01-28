import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatTimeAgo, isValidImageUrl, cn, safeCssUrl } from '../utils';

describe('formatTimeAgo', () => {
  beforeEach(() => {
    // Mock current time to 2024-01-15 12:00:00 UTC
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return "Just now" for dates less than 1 minute ago', () => {
    const now = new Date('2024-01-15T12:00:00Z').toISOString();
    expect(formatTimeAgo(now)).toBe('Just now');
  });

  it('should return "Xm ago" for dates less than 1 hour ago', () => {
    const fiveMinutesAgo = new Date('2024-01-15T11:55:00Z').toISOString();
    expect(formatTimeAgo(fiveMinutesAgo)).toBe('5m ago');

    const thirtyMinutesAgo = new Date('2024-01-15T11:30:00Z').toISOString();
    expect(formatTimeAgo(thirtyMinutesAgo)).toBe('30m ago');
  });

  it('should return "Xh ago" for dates less than 24 hours ago', () => {
    const twoHoursAgo = new Date('2024-01-15T10:00:00Z').toISOString();
    expect(formatTimeAgo(twoHoursAgo)).toBe('2h ago');

    const twentyThreeHoursAgo = new Date('2024-01-14T13:00:00Z').toISOString();
    expect(formatTimeAgo(twentyThreeHoursAgo)).toBe('23h ago');
  });

  it('should return "Xd ago" for dates less than 7 days ago', () => {
    const twoDaysAgo = new Date('2024-01-13T12:00:00Z').toISOString();
    expect(formatTimeAgo(twoDaysAgo)).toBe('2d ago');

    const sixDaysAgo = new Date('2024-01-09T12:00:00Z').toISOString();
    expect(formatTimeAgo(sixDaysAgo)).toBe('6d ago');
  });

  it('should return formatted date for dates older than 7 days', () => {
    const tenDaysAgo = new Date('2024-01-05T12:00:00Z').toISOString();
    expect(formatTimeAgo(tenDaysAgo)).toBe('Jan 5');

    const lastMonth = new Date('2023-12-15T12:00:00Z').toISOString();
    expect(formatTimeAgo(lastMonth)).toBe('Dec 15');
  });

  it('should return "Recently" for future dates (clock skew)', () => {
    const futureDate = new Date('2024-01-15T13:00:00Z').toISOString();
    expect(formatTimeAgo(futureDate)).toBe('Recently');
  });

  it('should return "Recently" for invalid date strings', () => {
    expect(formatTimeAgo('invalid-date')).toBe('Recently');
    expect(formatTimeAgo('')).toBe('Recently');
  });

  it('should handle milliseconds precision correctly', () => {
    // 30 seconds ago (under 1 minute threshold)
    const thirtySecondsAgo = new Date('2024-01-15T11:59:30Z').toISOString();
    expect(formatTimeAgo(thirtySecondsAgo)).toBe('Just now');

    // 59 seconds ago (still under 1 minute)
    const fiftyNineSecondsAgo = new Date('2024-01-15T11:59:01Z').toISOString();
    expect(formatTimeAgo(fiftyNineSecondsAgo)).toBe('Just now');

    // 61 seconds ago (just over 1 minute)
    const sixtyOneSecondsAgo = new Date('2024-01-15T11:58:59Z').toISOString();
    expect(formatTimeAgo(sixtyOneSecondsAgo)).toBe('1m ago');
  });

  it('should handle exact boundary values', () => {
    // Exactly 1 hour ago
    const oneHourAgo = new Date('2024-01-15T11:00:00Z').toISOString();
    expect(formatTimeAgo(oneHourAgo)).toBe('1h ago');

    // Exactly 24 hours ago
    const oneDayAgo = new Date('2024-01-14T12:00:00Z').toISOString();
    expect(formatTimeAgo(oneDayAgo)).toBe('1d ago');

    // Exactly 7 days ago
    const sevenDaysAgo = new Date('2024-01-08T12:00:00Z').toISOString();
    expect(formatTimeAgo(sevenDaysAgo)).toBe('Jan 8');
  });
});

describe('isValidImageUrl', () => {
  it('should return true for valid https URLs', () => {
    expect(isValidImageUrl('https://example.com/image.jpg')).toBe(true);
    expect(isValidImageUrl('https://cdn.example.com/path/to/image.png')).toBe(true);
  });

  it('should return true for valid http URLs', () => {
    expect(isValidImageUrl('http://example.com/image.jpg')).toBe(true);
  });

  it('should return true for relative URLs starting with /', () => {
    expect(isValidImageUrl('/images/local.jpg')).toBe(true);
    expect(isValidImageUrl('/static/logo.png')).toBe(true);
  });

  it('should return false for javascript: protocol (XSS prevention)', () => {
    expect(isValidImageUrl('javascript:alert(1)')).toBe(false);
    expect(isValidImageUrl('javascript:void(0)')).toBe(false);
  });

  it('should return false for data: URLs', () => {
    expect(isValidImageUrl('data:image/png;base64,abc123')).toBe(false);
  });

  it('should return false for null or undefined', () => {
    expect(isValidImageUrl(null)).toBe(false);
    expect(isValidImageUrl(undefined)).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidImageUrl('')).toBe(false);
  });

  it('should return false for malformed URLs', () => {
    expect(isValidImageUrl('not-a-url')).toBe(false);
    expect(isValidImageUrl('ftp://example.com/file')).toBe(false);
  });

  it('should return false for blob: URLs', () => {
    expect(isValidImageUrl('blob:https://example.com/abc123')).toBe(false);
    expect(isValidImageUrl('blob:null/abc123')).toBe(false);
  });

  it('should return false for vbscript: protocol (XSS prevention)', () => {
    expect(isValidImageUrl('vbscript:alert(1)')).toBe(false);
  });

  it('should handle URLs with query parameters', () => {
    expect(isValidImageUrl('https://example.com/image.jpg?width=100')).toBe(true);
    expect(isValidImageUrl('https://cdn.example.com/img?src=test&format=webp')).toBe(true);
  });

  it('should handle URLs with fragments', () => {
    expect(isValidImageUrl('https://example.com/image.jpg#anchor')).toBe(true);
  });
});

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    expect(cn('foo', true && 'bar', 'baz')).toBe('foo bar baz');
  });

  it('should merge Tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('should handle arrays of classes', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
  });

  it('should handle undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });
});

describe('safeCssUrl', () => {
  it('should wrap URL in CSS url() with single quotes', () => {
    expect(safeCssUrl('https://example.com/image.jpg')).toBe("url('https://example.com/image.jpg')");
  });

  it('should encode special characters with encodeURI', () => {
    const result = safeCssUrl("https://example.com/image with spaces.jpg");
    expect(result).toBe("url('https://example.com/image%20with%20spaces.jpg')");
  });

  it('should handle relative paths', () => {
    expect(safeCssUrl('/images/logo.png')).toBe("url('/images/logo.png')");
  });

  it('should handle empty string', () => {
    expect(safeCssUrl('')).toBe("url('')");
  });

  it('should handle URLs with hash fragments', () => {
    expect(safeCssUrl('https://example.com/image.jpg#section')).toBe("url('https://example.com/image.jpg#section')");
  });

  it('should handle URLs with unicode characters', () => {
    const result = safeCssUrl('https://example.com/图片/photo.jpg');
    expect(result).toMatch(/^url\('.*'\)$/);
    expect(result).toContain('%');
  });

  it('should handle very long URLs without truncation', () => {
    const longPath = 'a'.repeat(2000);
    const url = `https://example.com/${longPath}`;
    const result = safeCssUrl(url);
    expect(result).toBe(`url('${encodeURI(url)}')`);
  });
});

// ─── Security: CSS injection attack vectors ──────────────────────────────
describe('safeCssUrl - CSS injection prevention', () => {
  it('should neutralize double-quote paren breakout: ..."); background:url(evil)', () => {
    const payload = 'https://example.com/img"); background:url(https://evil.com/steal';
    const result = safeCssUrl(payload);
    // The result should always be a single url('...') token
    expect(result).toMatch(/^url\('.*'\)$/);
    expect(result).not.toContain('");');
  });

  it('should neutralize single-quote breakout attempt', () => {
    const payload = "https://example.com/img'); background:url('https://evil.com/steal";
    const result = safeCssUrl(payload);
    expect(result).toMatch(/^url\('.*'\)$/);
  });

  it('should encode newlines that could break CSS context', () => {
    const payload = "https://example.com/img\n} body { background: red } .x {";
    const result = safeCssUrl(payload);
    expect(result).not.toContain('\n');
    expect(result).toContain('%0A');
  });

  it('should encode angle brackets to prevent HTML injection in style attrs', () => {
    const payload = 'https://example.com/<script>alert(1)</script>';
    const result = safeCssUrl(payload);
    expect(result).not.toContain('<script>');
    expect(result).toContain('%3C');
    expect(result).toContain('%3E');
  });

  it('should handle data URI payloads (defense in depth)', () => {
    const payload = "data:text/css,body{background:red}";
    const result = safeCssUrl(payload);
    expect(result).toMatch(/^url\('.*'\)$/);
  });

  it('should handle backslash escape sequences', () => {
    const payload = 'https://example.com/img\\';
    const result = safeCssUrl(payload);
    expect(result).toMatch(/^url\('.*'\)$/);
  });

  it('should handle carriage return injection', () => {
    const payload = "https://example.com/img\r} .evil { color: red } .x {";
    const result = safeCssUrl(payload);
    expect(result).not.toContain('\r');
    expect(result).toContain('%0D');
  });
});

// ─── Security: isValidImageUrl attack vectors ────────────────────────────
describe('isValidImageUrl - XSS attack vectors', () => {
  it('should block javascript: with varied casing (bypass attempt)', () => {
    expect(isValidImageUrl('JavaScript:alert(1)')).toBe(false);
    expect(isValidImageUrl('JAVASCRIPT:alert(1)')).toBe(false);
    expect(isValidImageUrl('jAvAsCrIpT:alert(1)')).toBe(false);
  });

  it('should block javascript: with leading whitespace', () => {
    expect(isValidImageUrl('  javascript:alert(1)')).toBe(false);
    expect(isValidImageUrl('\tjavascript:alert(1)')).toBe(false);
    expect(isValidImageUrl('\njavascript:alert(1)')).toBe(false);
  });

  it('should block javascript: with tab/newline obfuscation in protocol', () => {
    expect(isValidImageUrl('java\tscript:alert(1)')).toBe(false);
    expect(isValidImageUrl('java\nscript:alert(1)')).toBe(false);
  });

  it('should block data: URIs with dangerous MIME types', () => {
    expect(isValidImageUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isValidImageUrl('data:image/svg+xml,<svg onload=alert(1)>')).toBe(false);
    expect(isValidImageUrl('data:application/javascript,alert(1)')).toBe(false);
  });

  it('should block vbscript: with varied casing', () => {
    expect(isValidImageUrl('VBScript:alert(1)')).toBe(false);
    expect(isValidImageUrl('VBSCRIPT:alert(1)')).toBe(false);
  });

  it('should block file: protocol (local file access)', () => {
    expect(isValidImageUrl('file:///etc/passwd')).toBe(false);
    expect(isValidImageUrl('file:///C:/Windows/system.ini')).toBe(false);
  });

  it('should block custom protocol handlers', () => {
    expect(isValidImageUrl('custom-proto:payload')).toBe(false);
    expect(isValidImageUrl('myapp://callback')).toBe(false);
    expect(isValidImageUrl('tel:+1234567890')).toBe(false);
    expect(isValidImageUrl('mailto:test@example.com')).toBe(false);
  });

  it('should accept legitimate CDN URLs with complex paths', () => {
    expect(isValidImageUrl('https://cdn.example.com/v1/images/resize/800x600/photo.webp?q=80&format=auto')).toBe(true);
    expect(isValidImageUrl('https://images.unsplash.com/photo-1234?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200')).toBe(true);
  });

  it('should accept URLs with encoded characters', () => {
    expect(isValidImageUrl('https://example.com/image%20with%20spaces.jpg')).toBe(true);
    expect(isValidImageUrl('https://example.com/%E5%9B%BE%E7%89%87.jpg')).toBe(true);
  });

  it('should accept URLs with authentication (user:pass@ format)', () => {
    expect(isValidImageUrl('https://user:pass@cdn.example.com/image.jpg')).toBe(true);
  });

  it('should accept URLs with ports', () => {
    expect(isValidImageUrl('https://cdn.example.com:8443/image.jpg')).toBe(true);
    expect(isValidImageUrl('http://localhost:3000/image.jpg')).toBe(true);
  });
});
