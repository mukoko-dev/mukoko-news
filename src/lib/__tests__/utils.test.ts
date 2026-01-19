import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatTimeAgo, isValidImageUrl, cn } from '../utils';

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
