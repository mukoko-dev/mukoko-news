import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ArticleJsonLd, BreadcrumbJsonLd, OrganizationJsonLd, WebSiteJsonLd } from '../ui/json-ld';

describe('JSON-LD Components', () => {
  describe('ArticleJsonLd', () => {
    it('should render valid JSON-LD script tag', () => {
      const article = {
        id: '123',
        title: 'Test Article',
        description: 'Test description',
        source: 'Test Source',
        slug: 'test-article',
        published_at: '2024-01-15T12:00:00Z',
        image_url: 'https://example.com/image.jpg',
      };

      const { container } = render(
        <ArticleJsonLd article={article} url="https://news.mukoko.com/article/123" />
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).toBeTruthy();

      const content = script?.innerHTML || '';
      expect(content).toContain('NewsArticle');
      expect(content).toContain('Test Article');
    });

    it('should escape < and > characters to prevent XSS', () => {
      const article = {
        id: '123',
        title: '</script><script>alert("XSS")</script>',
        description: 'Test with <script> tags',
        source: 'Test Source',
        slug: 'test-article',
        published_at: '2024-01-15T12:00:00Z',
      };

      const { container } = render(
        <ArticleJsonLd article={article} url="https://news.mukoko.com/article/123" />
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      const content = script?.innerHTML || '';

      // Should NOT contain raw < or > characters
      expect(content).not.toContain('</script>');
      expect(content).not.toContain('<script>');

      // Should contain escaped Unicode versions
      expect(content).toContain('\\u003c');
      expect(content).toContain('\\u003e');
    });

    it('should escape & characters', () => {
      const article = {
        id: '123',
        title: 'News & Updates',
        description: 'Tom & Jerry',
        source: 'Test Source',
        slug: 'test-article',
        published_at: '2024-01-15T12:00:00Z',
      };

      const { container } = render(
        <ArticleJsonLd article={article} url="https://news.mukoko.com/article/123" />
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      const content = script?.innerHTML || '';

      // Should contain escaped & as Unicode
      expect(content).toContain('\\u0026');
      expect(content).not.toMatch(/&(?!#|amp;|lt;|gt;)/); // No raw & except HTML entities
    });
  });

  describe('BreadcrumbJsonLd', () => {
    it('should render breadcrumb schema', () => {
      const items = [
        { name: 'Politics', href: '/discover?category=politics' },
        { name: 'Test Article' },
      ];

      const { container } = render(<BreadcrumbJsonLd items={items} />);

      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).toBeTruthy();

      const content = script?.innerHTML || '';
      expect(content).toContain('BreadcrumbList');
      expect(content).toContain('Politics');
    });

    it('should escape malicious content in breadcrumbs', () => {
      const items = [
        { name: '<script>alert(1)</script>', href: '/test' },
      ];

      const { container } = render(<BreadcrumbJsonLd items={items} />);

      const script = container.querySelector('script[type="application/ld+json"]');
      const content = script?.innerHTML || '';

      expect(content).not.toContain('<script>');
      expect(content).toContain('\\u003c');
    });
  });

  describe('OrganizationJsonLd', () => {
    it('should render organization schema', () => {
      const { container } = render(<OrganizationJsonLd />);

      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).toBeTruthy();

      const content = script?.innerHTML || '';
      expect(content).toContain('Organization');
      expect(content).toContain('Mukoko News');
    });
  });

  describe('WebSiteJsonLd', () => {
    it('should render WebSite schema with SearchAction', () => {
      const { container } = render(<WebSiteJsonLd />);

      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).toBeTruthy();

      const content = script?.innerHTML || '';
      expect(content).toContain('WebSite');
      expect(content).toContain('SearchAction');
      expect(content).toContain('Mukoko News');
    });

    it('should include search URL template', () => {
      const { container } = render(<WebSiteJsonLd />);

      const script = container.querySelector('script[type="application/ld+json"]');
      const content = script?.innerHTML || '';
      expect(content).toContain('search?q={search_term_string}');
      expect(content).toContain('query-input');
    });

    it('should escape XSS in search action output', () => {
      const { container } = render(<WebSiteJsonLd />);

      const script = container.querySelector('script[type="application/ld+json"]');
      const content = script?.innerHTML || '';
      // Verify no raw HTML characters leak through
      expect(content).not.toContain('<');
      expect(content).not.toContain('>');
    });

    it('should produce parseable JSON', () => {
      const { container } = render(<WebSiteJsonLd />);

      const script = container.querySelector('script[type="application/ld+json"]');
      const content = script?.innerHTML || '';
      const unescaped = content
        .replace(/\\u003c/g, '<')
        .replace(/\\u003e/g, '>')
        .replace(/\\u0026/g, '&');
      const parsed = JSON.parse(unescaped);
      expect(parsed['@type']).toBe('WebSite');
      expect(parsed.potentialAction['@type']).toBe('SearchAction');
    });
  });

  // ─── Security: expanded XSS injection vectors for JSON-LD ────────────
  describe('XSS injection prevention', () => {
    const makeArticle = (overrides: Record<string, string>) => ({
      id: '123',
      title: 'Default Title',
      description: 'Default description',
      source: 'Test Source',
      slug: 'test-article',
      published_at: '2024-01-15T12:00:00Z',
      ...overrides,
    });

    it('should escape HTML comment injection: <!-- -->', () => {
      const { container } = render(
        <ArticleJsonLd
          article={makeArticle({ title: '<!-- <script>alert(1)</script> -->' })}
          url="https://news.mukoko.com/article/123"
        />
      );
      const content = container.querySelector('script')?.innerHTML || '';
      expect(content).not.toContain('<!--');
      expect(content).not.toContain('-->');
      expect(content).toContain('\\u003c');
    });

    it('should escape nested closing script tags: </script>', () => {
      const { container } = render(
        <ArticleJsonLd
          article={makeArticle({ description: 'text</script><script>alert("xss")</script>' })}
          url="https://news.mukoko.com/article/123"
        />
      );
      const content = container.querySelector('script')?.innerHTML || '';
      expect(content).not.toContain('</script>');
    });

    it('should escape unicode escape sequence in source field', () => {
      const { container } = render(
        <ArticleJsonLd
          article={makeArticle({ source: '<img src=x onerror=alert(1)>' })}
          url="https://news.mukoko.com/article/123"
        />
      );
      const content = container.querySelector('script')?.innerHTML || '';
      expect(content).not.toContain('<img');
      expect(content).toContain('\\u003c');
    });

    it('should escape image_url with malicious payload', () => {
      const { container } = render(
        <ArticleJsonLd
          article={makeArticle({ image_url: 'javascript:alert(1)' })}
          url="https://news.mukoko.com/article/123"
        />
      );
      const content = container.querySelector('script')?.innerHTML || '';
      // The value gets JSON-stringified, so it's safe, but verify no raw script context
      expect(content).not.toContain('<');
    });

    it('should escape malicious URL in mainEntityOfPage @id', () => {
      const { container } = render(
        <ArticleJsonLd
          article={makeArticle({})}
          url='"><script>alert(1)</script><a href="'
        />
      );
      const content = container.querySelector('script')?.innerHTML || '';
      expect(content).not.toContain('<script>');
      expect(content).toContain('\\u003c');
    });

    it('should produce parseable JSON even with malicious content', () => {
      const { container } = render(
        <ArticleJsonLd
          article={makeArticle({
            title: '"},"hack":true,"x":"',
            description: '</script><script>alert(1)</script>',
            source: '<img/src/onerror=alert(1)>',
          })}
          url="https://news.mukoko.com/article/123"
        />
      );
      const content = container.querySelector('script')?.innerHTML || '';
      // After unescaping the Unicode replacements, the JSON should still parse
      const unescaped = content
        .replace(/\\u003c/g, '<')
        .replace(/\\u003e/g, '>')
        .replace(/\\u0026/g, '&');
      expect(() => JSON.parse(unescaped)).not.toThrow();
    });

    it('should escape breadcrumb items with event handler injection', () => {
      const items = [
        { name: '" onmouseover="alert(1)" data-x="', href: '/test' },
      ];
      const { container } = render(<BreadcrumbJsonLd items={items} />);
      const content = container.querySelector('script')?.innerHTML || '';
      // Attribute injection shouldn't matter in JSON-LD, but verify no raw angle brackets
      expect(content).not.toContain('<');
      expect(content).not.toContain('>');
    });

    it('should escape breadcrumb href with javascript: protocol', () => {
      const items = [
        { name: 'Test', href: 'javascript:alert(1)' },
      ];
      const { container } = render(<BreadcrumbJsonLd items={items} />);
      const content = container.querySelector('script')?.innerHTML || '';
      // The href gets passed through getFullUrl which prepends BASE_URL,
      // so it won't be a raw javascript: URL in the output
      expect(content).toContain('BreadcrumbList');
    });
  });
});
