import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ArticleJsonLd, BreadcrumbJsonLd, OrganizationJsonLd } from '../ui/json-ld';

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
});
