import '@testing-library/jest-dom';

// Web Storage for the jsdom environment. Node 25 and later define their own
// `localStorage`/`sessionStorage` globals (the experimental Web Storage API,
// on by default), and without `--localstorage-file` those are not usable
// Storage objects. They shadow jsdom's, so on the org CI runner's current
// Node `window.localStorage` read as undefined and every test touching it
// failed. Install a working in-memory Storage whenever the one in place is
// not usable, so the suite behaves the same on Node 22, 24 and 26.
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }
  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
}

function usableStorage(get: () => Storage | undefined): boolean {
  try {
    const s = get();
    return !!s && typeof s.clear === 'function' && typeof s.setItem === 'function';
  } catch {
    return false;
  }
}

for (const name of ['localStorage', 'sessionStorage'] as const) {
  if (!usableStorage(() => window[name])) {
    const storage = new MemoryStorage();
    Object.defineProperty(window, name, { configurable: true, value: storage });
    Object.defineProperty(globalThis, name, { configurable: true, value: storage });
  }
}

// Mock window.matchMedia (used by theme providers, responsive components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(function (query: string) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  }),
});

// Mock IntersectionObserver (used by lazy loading, infinite scroll)
class MockIntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
}
global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Mock ResizeObserver (used by responsive components)
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
