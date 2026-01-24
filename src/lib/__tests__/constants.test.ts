import { describe, it, expect } from 'vitest';
import { COUNTRIES, CATEGORY_META, getCategoryEmoji, BASE_URL, getArticleUrl, getFullUrl } from '../constants';

describe('COUNTRIES', () => {
  it('should have all 16 Pan-African countries', () => {
    expect(COUNTRIES).toHaveLength(16);
  });

  it('should have Zimbabwe as the first country (primary market)', () => {
    expect(COUNTRIES[0].code).toBe('ZW');
    expect(COUNTRIES[0].name).toBe('Zimbabwe');
  });

  it('should have required properties for each country', () => {
    COUNTRIES.forEach((country) => {
      expect(country).toHaveProperty('code');
      expect(country).toHaveProperty('name');
      expect(country).toHaveProperty('flag');
      expect(country).toHaveProperty('color');
      expect(country.code).toMatch(/^[A-Z]{2}$/);
      expect(country.flag).toBeTruthy();
      expect(country.color).toMatch(/^bg-/);
    });
  });

  it('should have unique country codes', () => {
    const codes = COUNTRIES.map((c) => c.code);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });

  it('should include key African markets', () => {
    const codes = COUNTRIES.map((c) => c.code);
    expect(codes).toContain('ZW'); // Zimbabwe
    expect(codes).toContain('ZA'); // South Africa
    expect(codes).toContain('KE'); // Kenya
    expect(codes).toContain('NG'); // Nigeria
    expect(codes).toContain('GH'); // Ghana
  });
});

describe('CATEGORY_META', () => {
  it('should have emoji and color for common categories', () => {
    const commonCategories = ['politics', 'economy', 'technology', 'sports', 'health'];

    commonCategories.forEach((category) => {
      expect(CATEGORY_META[category]).toBeDefined();
      expect(CATEGORY_META[category].emoji).toBeTruthy();
      expect(CATEGORY_META[category].color).toMatch(/^bg-/);
    });
  });

  it('should have a fallback "all" category', () => {
    expect(CATEGORY_META['all']).toBeDefined();
    expect(CATEGORY_META['all'].emoji).toBe('📰');
  });
});

describe('getCategoryEmoji', () => {
  it('should return correct emoji for known categories', () => {
    expect(getCategoryEmoji('politics')).toBe('🏛️');
    expect(getCategoryEmoji('technology')).toBe('💻');
    expect(getCategoryEmoji('sports')).toBe('⚽');
  });

  it('should return default emoji for unknown categories', () => {
    expect(getCategoryEmoji('unknown-category')).toBe('📰');
    expect(getCategoryEmoji('random')).toBe('📰');
  });

  it('should return default emoji for empty or null input', () => {
    expect(getCategoryEmoji('')).toBe('📰');
  });

  it('should be case-insensitive', () => {
    expect(getCategoryEmoji('POLITICS')).toBe('🏛️');
    expect(getCategoryEmoji('Politics')).toBe('🏛️');
    expect(getCategoryEmoji('TECHNOLOGY')).toBe('💻');
  });
});

describe('BASE_URL', () => {
  it('should have a default base URL', () => {
    expect(BASE_URL).toBeTruthy();
    expect(BASE_URL).toMatch(/^https?:\/\//);
  });
});

describe('getArticleUrl', () => {
  it('should generate correct article URL', () => {
    const url = getArticleUrl('123');
    expect(url).toBe(`${BASE_URL}/article/123`);
  });

  it('should handle article IDs with special characters', () => {
    const url = getArticleUrl('abc-123-def');
    expect(url).toBe(`${BASE_URL}/article/abc-123-def`);
  });
});

describe('getFullUrl', () => {
  it('should generate full URL from path with leading slash', () => {
    const url = getFullUrl('/discover');
    expect(url).toBe(`${BASE_URL}/discover`);
  });

  it('should handle paths without leading slash', () => {
    const url = getFullUrl('discover');
    expect(url).toBe(`${BASE_URL}/discover`);
  });

  it('should handle paths with query parameters', () => {
    const url = getFullUrl('/discover?category=politics');
    expect(url).toBe(`${BASE_URL}/discover?category=politics`);
  });

  it('should handle root path', () => {
    const url = getFullUrl('/');
    expect(url).toBe(`${BASE_URL}/`);
  });
});
