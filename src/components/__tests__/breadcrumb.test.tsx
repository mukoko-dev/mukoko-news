import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumb } from '../ui/breadcrumb';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/article/123',
}));

// Mock the BreadcrumbJsonLd component to simplify testing
vi.mock('../ui/json-ld', () => ({
  BreadcrumbJsonLd: ({ items }: { items: Array<{ name: string; href?: string }> }) => (
    <script data-testid="breadcrumb-json-ld" data-items={JSON.stringify(items)} />
  ),
}));

describe('Breadcrumb', () => {
  it('should render home link', () => {
    render(<Breadcrumb items={[{ label: 'Article' }]} />);

    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should render breadcrumb items', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Politics', href: '/discover?category=politics' },
          { label: 'Test Article' },
        ]}
      />
    );

    expect(screen.getByText('Politics')).toBeInTheDocument();
    expect(screen.getByText('Test Article')).toBeInTheDocument();
  });

  it('should render items with links when href is provided', () => {
    render(
      <Breadcrumb
        items={[{ label: 'Politics', href: '/discover?category=politics' }]}
      />
    );

    const politicsLink = screen.getByRole('link', { name: 'Politics' });
    expect(politicsLink).toHaveAttribute('href', '/discover?category=politics');
  });

  it('should render items without links when href is not provided', () => {
    render(<Breadcrumb items={[{ label: 'Current Page' }]} />);

    const currentPage = screen.getByText('Current Page');
    expect(currentPage.tagName).toBe('SPAN');
    expect(currentPage).toHaveClass('font-medium');
  });

  it('should have proper aria-label for accessibility', () => {
    render(<Breadcrumb items={[{ label: 'Article' }]} />);

    const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(nav).toBeInTheDocument();
  });

  it('should include JSON-LD structured data', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Politics', href: '/discover?category=politics' },
          { label: 'Test Article' },
        ]}
      />
    );

    const jsonLd = screen.getByTestId('breadcrumb-json-ld');
    expect(jsonLd).toBeInTheDocument();

    const items = JSON.parse(jsonLd.getAttribute('data-items') || '[]');
    expect(items).toHaveLength(3); // Home + 2 items
    expect(items[0].name).toBe('Home');
    expect(items[1].name).toBe('Politics');
    expect(items[2].name).toBe('Test Article');
  });

  it('should truncate long labels', () => {
    const longTitle = 'This is a very long article title that should be truncated';
    render(<Breadcrumb items={[{ label: longTitle }]} />);

    const labelElement = screen.getByText(longTitle);
    expect(labelElement).toHaveClass('truncate');
    expect(labelElement).toHaveClass('max-w-[200px]');
  });
});
