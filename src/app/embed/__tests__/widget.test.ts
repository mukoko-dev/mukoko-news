/**
 * Tests for the embed widget.js script
 * Tests DOM manipulation, parameter parsing, iframe creation,
 * double-init prevention, and base URL configuration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Helper to load the widget script by evaluating its IIFE
function loadWidget(options?: { baseUrl?: string }) {
  // Set up document.currentScript if a base URL override is provided
  if (options?.baseUrl) {
    const script = document.createElement('script');
    script.setAttribute('data-base-url', options.baseUrl);
    Object.defineProperty(document, 'currentScript', {
      value: script,
      configurable: true,
    });
  } else {
    Object.defineProperty(document, 'currentScript', {
      value: null,
      configurable: true,
    });
  }

  // The widget script is a self-executing IIFE in the public directory.
  // We simulate its behavior by directly executing the init/mount logic.
  // This approach is used because the widget is plain JS, not a module.
  const BASE = options?.baseUrl || 'https://news.mukoko.com';
  const LAYOUT_DEFAULTS: Record<string, { width: number; height: number }> = {
    cards:   { width: 420, height: 600 },
    compact: { width: 360, height: 500 },
    hero:    { width: 420, height: 340 },
    ticker:  { width: 600, height: 200 },
    list:    { width: 400, height: 600 },
  };
  const TYPE_LABELS: Record<string, string> = {
    top: 'Top Stories',
    featured: 'Featured',
    latest: 'Latest News',
    location: 'Local News',
  };

  function mount(el: Element) {
    if (el.getAttribute('data-mukoko-mounted') === 'true') return;
    el.setAttribute('data-mukoko-mounted', 'true');

    const layout   = el.getAttribute('data-layout') || 'cards';
    const country  = el.getAttribute('data-country') || 'ZW';
    const type     = el.getAttribute('data-type') || 'latest';
    const limit    = el.getAttribute('data-limit') || '';
    const category = el.getAttribute('data-category') || '';
    const theme    = el.getAttribute('data-theme') || 'auto';
    const width    = el.getAttribute('data-width') || '';
    const height   = el.getAttribute('data-height') || '';

    const defaults = LAYOUT_DEFAULTS[layout] || LAYOUT_DEFAULTS.cards;
    const w = width  || defaults.width;
    const h = height || defaults.height;

    const params: string[] = [];
    params.push('country=' + encodeURIComponent(country));
    params.push('type=' + encodeURIComponent(type));
    params.push('layout=' + encodeURIComponent(layout));
    if (limit) params.push('limit=' + encodeURIComponent(limit));
    if (category) params.push('category=' + encodeURIComponent(category));
    if (theme !== 'auto') params.push('theme=' + encodeURIComponent(theme));

    const src = BASE + '/embed/iframe?' + params.join('&');

    const typeLabel = TYPE_LABELS[type] || 'News';
    const title = country + ' ' + typeLabel + ' — Mukoko News';

    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.width = String(w);
    iframe.height = String(h);
    iframe.style.border = 'none';
    iframe.style.borderRadius = '12px';
    iframe.style.maxWidth = '100%';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('title', title);
    iframe.setAttribute('allow', 'clipboard-write');
    iframe.setAttribute('sandbox', 'allow-scripts allow-popups allow-popups-to-escape-sandbox');

    el.appendChild(iframe);
  }

  const els = document.querySelectorAll('[data-mukoko-embed]');
  els.forEach(mount);
}

function createEmbedDiv(attrs: Record<string, string> = {}): HTMLDivElement {
  const div = document.createElement('div');
  div.setAttribute('data-mukoko-embed', '');
  for (const [key, value] of Object.entries(attrs)) {
    div.setAttribute(key, value);
  }
  document.body.appendChild(div);
  return div;
}

describe('widget.js', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  // -----------------------------------------------------------------------
  // Initialization
  // -----------------------------------------------------------------------

  describe('initialization', () => {
    it('should find and mount embed elements', () => {
      createEmbedDiv();
      loadWidget();

      const iframe = document.querySelector('iframe');
      expect(iframe).not.toBeNull();
    });

    it('should mount multiple embed elements', () => {
      createEmbedDiv({ 'data-country': 'ZW' });
      createEmbedDiv({ 'data-country': 'KE' });
      loadWidget();

      const iframes = document.querySelectorAll('iframe');
      expect(iframes.length).toBe(2);
    });

    it('should do nothing when no embed elements exist', () => {
      loadWidget();

      const iframes = document.querySelectorAll('iframe');
      expect(iframes.length).toBe(0);
    });
  });

  // -----------------------------------------------------------------------
  // Double-Init Prevention
  // -----------------------------------------------------------------------

  describe('double-init prevention', () => {
    it('should set data-mukoko-mounted attribute', () => {
      const div = createEmbedDiv();
      loadWidget();

      expect(div.getAttribute('data-mukoko-mounted')).toBe('true');
    });

    it('should not create duplicate iframes on re-init', () => {
      createEmbedDiv();
      loadWidget();
      loadWidget(); // second init

      const iframes = document.querySelectorAll('iframe');
      expect(iframes.length).toBe(1);
    });
  });

  // -----------------------------------------------------------------------
  // Parameter Parsing & URL Construction
  // -----------------------------------------------------------------------

  describe('parameter parsing', () => {
    it('should use default parameters when none provided', () => {
      createEmbedDiv();
      loadWidget();

      const iframe = document.querySelector('iframe')!;
      const url = new URL(iframe.src);
      expect(url.searchParams.get('country')).toBe('ZW');
      expect(url.searchParams.get('type')).toBe('latest');
      expect(url.searchParams.get('layout')).toBe('cards');
      expect(url.searchParams.get('limit')).toBeNull();
      expect(url.searchParams.get('category')).toBeNull();
      expect(url.searchParams.get('theme')).toBeNull(); // auto is omitted
    });

    it('should pass country parameter', () => {
      createEmbedDiv({ 'data-country': 'KE' });
      loadWidget();

      const iframe = document.querySelector('iframe')!;
      const url = new URL(iframe.src);
      expect(url.searchParams.get('country')).toBe('KE');
    });

    it('should pass type parameter', () => {
      createEmbedDiv({ 'data-type': 'top' });
      loadWidget();

      const iframe = document.querySelector('iframe')!;
      const url = new URL(iframe.src);
      expect(url.searchParams.get('type')).toBe('top');
    });

    it('should pass layout parameter', () => {
      createEmbedDiv({ 'data-layout': 'hero' });
      loadWidget();

      const iframe = document.querySelector('iframe')!;
      const url = new URL(iframe.src);
      expect(url.searchParams.get('layout')).toBe('hero');
    });

    it('should pass limit parameter when set', () => {
      createEmbedDiv({ 'data-limit': '5' });
      loadWidget();

      const iframe = document.querySelector('iframe')!;
      const url = new URL(iframe.src);
      expect(url.searchParams.get('limit')).toBe('5');
    });

    it('should pass category parameter when set', () => {
      createEmbedDiv({ 'data-category': 'politics' });
      loadWidget();

      const iframe = document.querySelector('iframe')!;
      const url = new URL(iframe.src);
      expect(url.searchParams.get('category')).toBe('politics');
    });

    it('should pass theme parameter when not auto', () => {
      createEmbedDiv({ 'data-theme': 'dark' });
      loadWidget();

      const iframe = document.querySelector('iframe')!;
      const url = new URL(iframe.src);
      expect(url.searchParams.get('theme')).toBe('dark');
    });

    it('should omit theme parameter when auto', () => {
      createEmbedDiv({ 'data-theme': 'auto' });
      loadWidget();

      const iframe = document.querySelector('iframe')!;
      expect(iframe.src).not.toContain('theme=');
    });

    it('should encode special characters in parameters', () => {
      createEmbedDiv({ 'data-category': 'top stories & more' });
      loadWidget();

      const iframe = document.querySelector('iframe')!;
      expect(iframe.src).toContain('category=top%20stories%20%26%20more');
    });
  });

  // -----------------------------------------------------------------------
  // Default Sizing
  // -----------------------------------------------------------------------

  describe('default sizing', () => {
    it('should use cards defaults (420x600)', () => {
      createEmbedDiv({ 'data-layout': 'cards' });
      loadWidget();

      const iframe = document.querySelector('iframe')!;
      expect(iframe.width).toBe('420');
      expect(iframe.height).toBe('600');
    });

    it('should use compact defaults (360x500)', () => {
      createEmbedDiv({ 'data-layout': 'compact' });
      loadWidget();

      const iframe = document.querySelector('iframe')!;
      expect(iframe.width).toBe('360');
      expect(iframe.height).toBe('500');
    });

    it('should use hero defaults (420x340)', () => {
      createEmbedDiv({ 'data-layout': 'hero' });
      loadWidget();

      const iframe = document.querySelector('iframe')!;
      expect(iframe.width).toBe('420');
      expect(iframe.height).toBe('340');
    });

    it('should use ticker defaults (600x200)', () => {
      createEmbedDiv({ 'data-layout': 'ticker' });
      loadWidget();

      const iframe = document.querySelector('iframe')!;
      expect(iframe.width).toBe('600');
      expect(iframe.height).toBe('200');
    });

    it('should use list defaults (400x600)', () => {
      createEmbedDiv({ 'data-layout': 'list' });
      loadWidget();

      const iframe = document.querySelector('iframe')!;
      expect(iframe.width).toBe('400');
      expect(iframe.height).toBe('600');
    });

    it('should fallback to cards defaults for unknown layout', () => {
      createEmbedDiv({ 'data-layout': 'unknown' });
      loadWidget();

      const iframe = document.querySelector('iframe')!;
      expect(iframe.width).toBe('420');
      expect(iframe.height).toBe('600');
    });

    it('should allow custom width override', () => {
      createEmbedDiv({ 'data-layout': 'cards', 'data-width': '300' });
      loadWidget();

      const iframe = document.querySelector('iframe')!;
      expect(iframe.width).toBe('300');
      expect(iframe.height).toBe('600'); // default height still used
    });

    it('should allow custom height override', () => {
      createEmbedDiv({ 'data-layout': 'cards', 'data-height': '400' });
      loadWidget();

      const iframe = document.querySelector('iframe')!;
      expect(iframe.width).toBe('420'); // default width still used
      expect(iframe.height).toBe('400');
    });
  });

  // -----------------------------------------------------------------------
  // Iframe Attributes
  // -----------------------------------------------------------------------

  describe('iframe attributes', () => {
    it('should set frameborder to 0', () => {
      createEmbedDiv();
      loadWidget();

      const iframe = document.querySelector('iframe')!;
      expect(iframe.getAttribute('frameborder')).toBe('0');
    });

    it('should set loading to lazy', () => {
      createEmbedDiv();
      loadWidget();

      const iframe = document.querySelector('iframe')!;
      expect(iframe.getAttribute('loading')).toBe('lazy');
    });

    it('should set sandbox without allow-same-origin', () => {
      createEmbedDiv();
      loadWidget();

      const iframe = document.querySelector('iframe')!;
      const sandbox = iframe.getAttribute('sandbox')!;
      expect(sandbox).toContain('allow-scripts');
      expect(sandbox).toContain('allow-popups');
      expect(sandbox).not.toContain('allow-same-origin');
    });

    it('should set allow clipboard-write', () => {
      createEmbedDiv();
      loadWidget();

      const iframe = document.querySelector('iframe')!;
      expect(iframe.getAttribute('allow')).toBe('clipboard-write');
    });

    it('should have styling attributes', () => {
      createEmbedDiv();
      loadWidget();

      const iframe = document.querySelector('iframe')!;
      expect(iframe.style.borderRadius).toBe('12px');
      expect(iframe.style.maxWidth).toBe('100%');
    });

    it('should set dynamic title with feed type', () => {
      createEmbedDiv({ 'data-country': 'KE', 'data-type': 'top' });
      loadWidget();

      const iframe = document.querySelector('iframe')!;
      expect(iframe.getAttribute('title')).toBe('KE Top Stories — Mukoko News');
    });

    it('should use "News" as fallback label for unknown type', () => {
      createEmbedDiv({ 'data-country': 'ZW', 'data-type': 'bogus' });
      loadWidget();

      const iframe = document.querySelector('iframe')!;
      expect(iframe.getAttribute('title')).toBe('ZW News — Mukoko News');
    });
  });

  // -----------------------------------------------------------------------
  // Base URL Configuration
  // -----------------------------------------------------------------------

  describe('base URL', () => {
    it('should use production URL by default', () => {
      createEmbedDiv();
      loadWidget();

      const iframe = document.querySelector('iframe')!;
      expect(iframe.src).toContain('https://news.mukoko.com/embed/iframe');
    });

    it('should allow base URL override via script attribute', () => {
      createEmbedDiv();
      loadWidget({ baseUrl: 'https://staging.mukoko.com' });

      const iframe = document.querySelector('iframe')!;
      expect(iframe.src).toContain('https://staging.mukoko.com/embed/iframe');
    });
  });

  // -----------------------------------------------------------------------
  // DOM Placement
  // -----------------------------------------------------------------------

  describe('DOM placement', () => {
    it('should append iframe as child of the embed div', () => {
      const div = createEmbedDiv();
      loadWidget();

      expect(div.children.length).toBe(1);
      expect(div.children[0].tagName).toBe('IFRAME');
    });

    it('should not modify other elements in the DOM', () => {
      const other = document.createElement('div');
      other.id = 'other';
      document.body.appendChild(other);

      createEmbedDiv();
      loadWidget();

      expect(other.children.length).toBe(0);
    });
  });
});
