# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mukoko News is a Pan-African digital news aggregation platform. "Mukoko" means "Beehive" in Shona - where community gathers and stores knowledge. Primary market is Zimbabwe with expansion across 16 African countries.

**Architecture**: Next.js 15 frontend with Cloudflare Workers backend

- `src/` - Next.js 15 frontend (App Router)
- `backend/` - Cloudflare Workers API (Hono framework)
- `database/` - D1 schema and migrations

## Common Commands

### Frontend (Root Level)

```bash
npm run dev              # Start Next.js dev server (port 3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix
npm run typecheck        # TypeScript check
npm run clean            # Clean build artifacts

# Backend orchestration from root
npm run dev:backend      # Start backend dev server
npm run build:backend    # Build backend
npm run deploy:backend   # Deploy to Cloudflare Workers
npm run test:backend     # Run backend tests
```

### Backend (`cd backend`)

```bash
npm run dev              # wrangler dev (local worker on port 8787)
npm run deploy           # Clean, build, and deploy to Cloudflare
npm run build            # wrangler deploy --dry-run
npm run test             # vitest run (single run)
npm run test:watch       # vitest (watch mode)
npm run test:coverage    # vitest with v8 coverage report
npm run typecheck        # tsc --noEmit
npm run validate         # typecheck && build

# Database operations
npm run db:migrate       # Apply schema to remote D1
npm run db:local         # Apply schema to local D1
```

## Architecture

### Frontend Stack

- **Framework**: Next.js 15 with App Router
- **UI**: Tailwind CSS 4.x with custom design tokens
- **Components**: Radix UI primitives (Avatar, Dialog, Dropdown, Tabs, etc.)
- **Icons**: Lucide React
- **Theme**: next-themes for dark mode support
- **TypeScript**: Full type safety with strict mode
- **State**: React Context (ThemeContext, PreferencesContext)

### Backend Stack

- **Runtime**: Cloudflare Workers (edge computing)
- **Framework**: Hono (lightweight, fast)
- **Database**: D1 (SQLite at edge)
- **Cache**: KV Namespaces (AUTH_STORAGE, CACHE_STORAGE)
- **Real-time**: Durable Objects (4 classes)
- **AI**: Workers AI for content processing
- **Search**: Vectorize for semantic search
- **Auth**: OIDC via id.mukoko.com, Mobile SMS, Web3 wallets

### Backend Services Pattern

Services are in `backend/services/`. Key services include:

**Core Services**:
- `ArticleService` - Article CRUD and queries
- `ArticleAIService` - AI-powered content processing
- `SimpleRSSService` - RSS feed aggregation
- `NewsSourceManager` - News source management
- `CategoryManager` - Category operations (single source of truth)
- `CountryService` - Pan-African country management
- `StoryClusteringService` - Groups similar articles using Jaccard similarity

**Auth Services**:
- `AuthProviderService` - Unified auth service with RBAC
- `OIDCAuthService` - OIDC token validation

**Data Services**:
- `D1Service` / `D1CacheService` - Database operations and caching
- `D1UserService` - User database operations
- `PersonalizedFeedService` - User-specific feeds

**Infrastructure Services**:
- `AnalyticsEngineService` - Metrics and analytics
- `CloudflareImagesService` - Image optimization
- `AISearchService` - Semantic search (Vectorize)
- `RateLimitService` - Rate limiting
- `CSRFService` - CSRF protection
- `ObservabilityService` - Logging and monitoring

**Durable Objects**:
- `ArticleInteractionsDO` - Article engagement tracking
- `UserBehaviorDO` - User behavior tracking
- `RealtimeCountersDO` - Live counter updates
- `RealtimeAnalyticsDO` - Real-time analytics aggregation

### Access Control

- **Admin routes** (`/api/admin/*`) - Protected, requires admin role
- **API routes** (`/api/*`) - Protected with bearer token (API_SECRET or OIDC JWT)
- **Public routes** - `/api/health` only
- Non-admin roles (moderator, support, author, user) are currently disabled

### Design System (Nyuchi Brand v6)

**Colors** (African Minerals palette):
- Primary: Tanzanite (#4B0082)
- Secondary: Cobalt (#0047AB)
- Accent: Gold (#5D4037)
- Success: Malachite (#2E8B57)
- Warning: Terracotta (#E07A4D)
- Surface: Warm Cream (#FAF9F5) for light mode

**Typography**:
- Headings: Noto Serif
- Body: Plus Jakarta Sans

**Spacing**:
- Border radius: 12px buttons, 16px cards
- WCAG AAA compliant (7:1 contrast ratio)

## Frontend Structure

```text
src/
├── app/                     # Next.js App Router
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Home feed page
│   ├── globals.css          # Tailwind styles and CSS variables
│   ├── admin/               # Admin dashboard
│   │   ├── analytics/       # Admin analytics
│   │   ├── sources/         # RSS source management
│   │   ├── system/          # System settings
│   │   └── users/           # User management
│   ├── article/[id]/        # Article detail page
│   ├── categories/          # Categories page
│   ├── discover/            # Discover page (country/category filtering, tag cloud, sources)
│   │   ├── page.tsx         # Discover page with log-scaled tag cloud, source/category/country browsing
│   │   └── __tests__/
│   │       └── discover-page.test.tsx  # Discover page, tag cloud, sources section (14 tests)
│   ├── sources/             # News sources directory page
│   │   ├── page.tsx         # Sources page with search, country filter, sort, health indicators
│   │   ├── layout.tsx       # Sources SEO metadata
│   │   └── __tests__/
│   │       └── sources-page.test.tsx   # Sources page rendering, filtering, sorting (11 tests)
│   ├── embed/               # Embeddable news card widgets (promotion framework)
│   │   ├── page.tsx         # Embed documentation & live preview page
│   │   ├── layout.tsx       # Embed SEO metadata layout
│   │   ├── iframe/
│   │   │   ├── page.tsx     # Iframe widget renderer (5 layouts, 4 feed types)
│   │   │   └── layout.tsx   # Iframe layout with Suspense boundary
│   │   └── __tests__/
│   │       ├── embed-iframe.test.tsx  # Widget rendering, params, themes (42 tests)
│   │       └── widget.test.ts        # widget.js script behavior (38 tests)
│   ├── newsbytes/           # TikTok-style vertical feed
│   ├── search/              # Search page
│   ├── profile/             # User profile/settings
│   ├── saved/               # Saved articles
│   ├── insights/            # Analytics insights
│   ├── help/                # Help pages
│   ├── privacy/             # Privacy policy
│   └── terms/               # Terms of service
├── components/
│   ├── layout/
│   │   ├── header.tsx       # Navigation header
│   │   ├── footer.tsx       # Footer component
│   │   └── bottom-nav.tsx   # Mobile bottom navigation
│   ├── ui/                  # Reusable UI components (Radix UI based)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── avatar.tsx
│   │   ├── category-chip.tsx
│   │   ├── theme-toggle.tsx
│   │   ├── engagement-bar.tsx
│   │   ├── source-icon.tsx
│   │   ├── error-boundary.tsx  # React error boundary component
│   │   ├── skeleton.tsx        # Skeleton loading components
│   │   ├── discover-skeleton.tsx # Page-specific skeletons
│   │   ├── json-ld.tsx         # Schema.org JSON-LD components
│   │   └── breadcrumb.tsx      # Breadcrumb navigation
│   ├── article-card.tsx     # Main article display component
│   ├── hero-card.tsx        # Featured article card with large image
│   ├── compact-card.tsx     # Text-focused card for articles without images
│   ├── share-modal.tsx      # Share/engagement modal
│   ├── onboarding-modal.tsx # Country/category selection
│   ├── theme-provider.tsx   # Theme context provider
│   └── __tests__/           # Component tests
│       ├── article-card.test.tsx
│       ├── engagement-bar.test.tsx
│       ├── share-modal.test.tsx
│       ├── onboarding-modal.test.tsx
│       ├── story-cluster.test.tsx
│       ├── hero-card.test.tsx
│       ├── compact-card.test.tsx
│       ├── json-ld.test.tsx
│       ├── bottom-nav.test.tsx
│       ├── breadcrumb.test.tsx
│       └── error-boundary.test.tsx
├── contexts/
│   ├── preferences-context.tsx # User preferences (countries, categories)
│   └── __tests__/
│       └── preferences-context.test.tsx # Context tests
└── lib/
    ├── api.ts               # API client with fetch utilities
    ├── utils.ts             # Utility functions (cn, formatTimeAgo, isValidImageUrl, safeCssUrl)
    ├── constants.ts         # Centralized countries and categories data
    ├── source-profiles.ts   # News source configurations
    └── __tests__/           # Unit tests
        ├── api.test.ts      # Tests for API client
        ├── utils.test.ts    # Tests for utility functions
        └── constants.test.ts # Tests for constants and helpers
```

## Backend Structure

```text
backend/
├── index.ts                 # API entry point and route definitions
├── admin/
│   ├── index.ts             # Admin UI HTML and login logic
│   └── login.html           # Admin login form
├── durable-objects/         # Real-time state management
├── middleware/
│   ├── apiAuth.ts           # Bearer token authentication
│   ├── oidcAuth.ts          # OIDC authentication
│   └── __tests__/           # Middleware tests
├── services/                # Core business logic (27+ services)
│   ├── __tests__/           # Service tests (Vitest)
│   └── *.ts                 # Individual service files
├── wrangler.jsonc           # Cloudflare Workers config
├── vitest.config.ts         # Test configuration
├── package.json             # Backend dependencies
└── tsconfig.json            # TypeScript config
```

## Database

Schema in `database/schema.sql`. 18 migrations in `database/migrations/`.

**Key Tables**: users, articles, categories, keywords, news_sources, rss_sources, user_interactions, countries, author_profiles

**Roles (RBAC)**: admin (active), moderator, support, author, user (disabled)

**OIDC Support**: Standard claims (sub, email, email_verified, picture, etc.) with multi-provider auth linking

## API

**Base URL**: `https://mukoko-news-backend.nyuchi.workers.dev`

### Endpoint Protection

- `/api/*` - **Protected** (requires bearer token: API_SECRET or OIDC JWT)
- `/api/health` - Public (no auth required)
- `/api/admin/*` - Admin only (separate admin auth + RBAC)

### Authentication Methods

1. **API_SECRET** - Bearer token for frontend (Vercel) to backend auth
   - Set via: `npx wrangler secret put API_SECRET`
   - Environment variable: `NEXT_PUBLIC_API_SECRET`
   - Configured in: `.env.local` (development), Vercel (production)

2. **OIDC JWT** - User authentication tokens from id.mukoko.com
   - Validated by oidcAuth middleware
   - Takes priority over API_SECRET
   - Sets context: `user`, `userId`, `isAuthenticated`

3. **Mobile Auth** - SMS-based authentication for mobile apps

4. **Web3 Auth** - Ethereum/EVM wallet authentication

### Key Endpoints

- `GET /api/feeds` - Get articles feed with filtering
- `GET /api/article/:id` - Get single article
- `GET /api/categories` - Get categories
- `GET /api/keywords` - Get trending topics/keywords
- `GET /api/sources` - Get all enabled RSS sources with article counts (JOIN query)
- `GET /api/newsbytes` - Get NewsBytes articles
- `POST /api/feed/collect` - Trigger RSS collection
- `GET /api/admin/*` - Admin endpoints

**API Auth Middleware**: `backend/middleware/apiAuth.ts`
**OpenAPI Schema**: `api-schema.yml`

## Environment Variables

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=https://mukoko-news-backend.nyuchi.workers.dev
NEXT_PUBLIC_BASE_URL=https://news.mukoko.com  # Base URL for SEO/schema.org (optional, has default)
NEXT_PUBLIC_API_SECRET=your-api-secret  # Optional: for direct browser auth
API_SECRET=your-api-secret               # Server-side API authentication
```

### Backend (Cloudflare Secrets)

```bash
npx wrangler secret put API_SECRET
npx wrangler secret put ADMIN_SESSION_SECRET
npx wrangler secret put OIDC_CLIENT_SECRET
```

## Deployment

**Frontend**: Auto-deploys to Vercel on push to main

**Backend**: Deployed via CI/CD on main branch (after tests pass)
```bash
cd backend && npm run deploy
```

**CI/CD Pipeline** (`.github/workflows/deploy.yml`):
1. Test frontend (typecheck, lint, build)
2. Test backend (vitest, typecheck, build)
3. Deploy backend (migrations + wrangler deploy)
4. Health check verification

## Testing

### Frontend Testing (Vitest)

```bash
npm run test              # Single run
npm run test:watch        # Watch mode
npm run test:coverage     # With v8 coverage report
```

**Test Files** (419 tests in 19 files):

`src/lib/__tests__/`:
- `api.test.ts` - API client, fetch wrapper, error handling, rate limiting, all endpoints (33 tests)
- `utils.test.ts` - Utility functions, safeCssUrl, CSS injection, prototype pollution, path traversal (62 tests)
- `constants.test.ts` - Constants, URL helpers, path traversal, URL injection security tests (28 tests)

`src/contexts/__tests__/`:
- `preferences-context.test.tsx` - localStorage persistence, country/category selection, onboarding flow (22 tests)

`src/components/__tests__/`:
- `article-card.test.tsx` - ArticleCard rendering, image handling, date formatting, engagement display (21 tests)
- `engagement-bar.test.tsx` - EngagementBar and InlineEngagement components, click handlers, count formatting (28 tests)
- `share-modal.test.tsx` - Share options, copy link, social sharing, escape key handling (18 tests)
- `onboarding-modal.test.tsx` - Modal visibility, country selection, completing onboarding, accessibility (16 tests)
- `story-cluster.test.tsx` - StoryCluster component tests (30 tests)
- `json-ld.test.tsx` - JSON-LD rendering, XSS prevention, expanded injection payloads (14 tests)
- `hero-card.test.tsx` - HeroCard component tests (8 tests)
- `compact-card.test.tsx` - CompactCard component tests (8 tests)
- `bottom-nav.test.tsx` - Mobile bottom navigation + routing tests (10 tests)
- `breadcrumb.test.tsx` - Breadcrumb navigation tests (7 tests)
- `error-boundary.test.tsx` - ErrorBoundary tests (5 tests)

`src/app/discover/__tests__/`:
- `discover-page.test.tsx` - Discover page rendering, tag cloud logarithmic scaling, sources section filtering/sorting (14 tests)

`src/app/sources/__tests__/`:
- `sources-page.test.tsx` - Sources page header/stats, search, country filter, sort, skeleton, source links, country flags (11 tests)

`src/app/embed/__tests__/`:
- `embed-iframe.test.tsx` - Embed widget rendering, params, themes, layouts, empty states, refresh (42 tests)
- `widget.test.ts` - widget.js script behavior, URL validation, sizing, security (38 tests)

**Test Pattern**: Vitest with jsdom environment, React Testing Library

### Backend Testing (Vitest)

```bash
cd backend
npm run test              # Single run
npm run test:watch        # Watch mode
npm run test:coverage     # With v8 coverage report
```

**Test Files** (501 tests in `backend/services/__tests__/`):
- `ArticleAIService.test.ts` - AI content processing, keyword extraction, quality scoring, embeddings, JSON edge cases (67 tests)
- `StoryClusteringService.test.ts` - Title normalization, Jaccard similarity, clustering (41 tests)
- `CategoryManager.test.ts` - Category operations, batch updates, cleanup (36 tests)
- `AISearchService.test.ts` - Semantic search, keyword fallback, AI insights, SQL injection prevention (35 tests)
- `PersonalizedFeedService.test.ts` - Personalized feed generation, scoring algorithms, diversity factors, large preference lists (21 tests)
- `ArticleService.test.ts` - Slug generation, content extraction
- `ArticleInteractionsDO.test.ts` - Durable Object engagement tracking
- `D1CacheService.test.ts` - Caching logic
- `D1UserService.test.ts` - User database operations
- `SimpleRSSService.test.ts` - RSS feed parsing and collection
- `RateLimitService.test.ts` - Rate limiting
- `CSRFService.test.ts` - CSRF protection
- `OIDCAuthService.test.ts` - OIDC authentication

`backend/middleware/__tests__/`:
- `apiAuth.test.ts` - API authentication middleware
- `oidcAuth.test.ts` - OIDC authentication middleware

**Mock Pattern**: Mock D1Database with `prepare().bind().first/all/run()` chain

**Pre-commit Hook**: Runs typecheck + build validation via Husky

### Total Test Count: 929 tests (419 frontend + 510 backend)

## Cloudflare Bindings

Defined in `wrangler.jsonc`:

**Storage**:
- `DB` - D1 database
- `AUTH_STORAGE`, `CACHE_STORAGE` - KV namespaces

**Durable Objects**:
- `ARTICLE_INTERACTIONS` - ArticleInteractionsDO
- `USER_BEHAVIOR` - UserBehaviorDO
- `REALTIME_COUNTERS` - RealtimeCountersDO
- `REALTIME_ANALYTICS` - RealtimeAnalyticsDO

**AI & Search**:
- `AI` - Workers AI
- `VECTORIZE_INDEX` - Semantic search

**Media**:
- `IMAGES` - Cloudflare Images

**Analytics Datasets**:
- NEWS_ANALYTICS, SEARCH_ANALYTICS, CATEGORY_ANALYTICS
- USER_ANALYTICS, PERFORMANCE_ANALYTICS, AI_INSIGHTS_ANALYTICS

## Theme System

The app uses CSS variables for theming, defined in `src/app/globals.css`:

```css
:root {
  --primary: #4B0082;      /* Tanzanite */
  --secondary: #0047AB;    /* Cobalt */
  --background: #FAF9F5;   /* Warm Cream */
  --foreground: #1a1a1a;
  /* ... more variables */
}

.dark {
  --background: #0a0a0a;
  --foreground: #ededed;
  /* ... dark mode overrides */
}
```

Use Tailwind classes like `bg-primary`, `text-foreground`, `bg-surface` etc.

## Code Conventions

### TypeScript

- Strict mode enabled
- `const` preferred over `let`
- Unused variables: prefix with `_` to ignore
- Path alias: `@/*` maps to `src/*`

### File Naming

- Components/services: camelCase (`ArticleService.ts`, `articleCard.tsx`)
- Pages: kebab-case (`article/[id]/page.tsx`)
- SQL identifiers: snake_case
- URL paths: kebab-case

### Component Patterns

- Functional components with React 19 + TypeScript
- Radix UI primitives for accessibility
- Tailwind classes for styling (no inline styles)
- Props spread via `className` prop pattern
- Error boundaries on all pages with data fetching
- Skeleton loaders for graceful loading states

### React Best Practices

**List Keys**: Use stable, unique keys instead of array indices:
```tsx
// Good - uses stable identifier
{items.map((item) => (
  <li key={item.id || item.href || item.label}>{item.name}</li>
))}

// Bad - array index can cause issues with reordering
{items.map((item, index) => (
  <li key={index}>{item.name}</li>
))}
```

**Memoization**: Use `useMemo` to prevent expensive recalculations:
```tsx
// Stable sorted key - prevents refetch when array is reordered
// Example: [ZW, KE] and [KE, ZW] produce same key "KE,ZW"
const countryKey = useMemo(
  () => selectedCountries.slice().sort().join(","),
  [selectedCountries]
);
```

**Cleanup Effects**: Always clean up timeouts and subscriptions:
```tsx
useEffect(() => {
  const timer = setTimeout(() => setFlag(false), 2000);
  return () => clearTimeout(timer);  // Cleanup prevents memory leaks
}, [dependency]);
```

**Pathname Matching**: Use anchored regex for robust route matching:
```tsx
// Good - anchored regex matches exactly /article/{id}, not sub-routes
if (/^\/article\/[^/]+$/.test(pathname)) return null;

// Less robust - matches sub-routes like /article/123/comments
if (/^\/article\/[^/]+/.test(pathname)) return null;

// Least robust - matches any path starting with /article/
if (pathname.startsWith("/article/")) return null;
```

**Clipboard API**: Provide fallbacks for older browsers:
```tsx
const copyToClipboard = async (text: string) => {
  if (!navigator.clipboard) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textArea);
    return success;
  }
  await navigator.clipboard.writeText(text);
  return true;
};
```

**useCallback Dependencies**: Align callback dependencies with the effect that triggers them:
```tsx
// fetchData derives countries from countryKey (not selectedCountries directly)
// This ensures fetchData only changes when countryKey changes
const fetchData = useCallback(async () => {
  const countries = countryKey ? countryKey.split(",") : [];
  await api.getArticles({ countries });
}, [countryKey]);

// Effect depends on fetchData, which only changes when countryKey changes
useEffect(() => { fetchData(); }, [fetchData]);
```

**Stable Event Handlers via Refs**: Avoid re-registering event listeners on state changes:
```tsx
// Ref always holds the latest handler without causing effect re-runs
const handleRefreshRef = useRef(() => {});
useEffect(() => { handleRefreshRef.current = handleRefresh; }, [handleRefresh]);

// Touch listener registered once, calls latest handler via ref
useEffect(() => {
  const onTouchEnd = () => { handleRefreshRef.current(); };
  window.addEventListener("touchend", onTouchEnd);
  return () => window.removeEventListener("touchend", onTouchEnd);
}, []); // No dependencies - never re-registers
```

**CSS URL Escaping**: Use `safeCssUrl()` from `@/lib/utils` for CSS `url()` values:
```tsx
import { safeCssUrl } from "@/lib/utils";

// Good - handles already-encoded URLs and encodes fresh
// Decodes first to prevent double-encoding (%20 → %2520)
style={{ backgroundImage: safeCssUrl(src) }}

// Bad - manual escaping is incomplete and error-prone
style={{ backgroundImage: `url('${src.replace(/'/g, "\\'")}')` }}

// Bad - unescaped URL could break out of quotes
style={{ backgroundImage: `url(${src})` }}
```

**Note**: `safeCssUrl()` uses `decodeURI()` then `encodeURI()` to safely handle URLs that may already be percent-encoded, preventing issues like `%20` becoming `%2520`.

### Error Boundaries

Error boundaries wrap page content in:
- Feed page (`page.tsx`) - All feed sections
- Article page (`article/[id]/page.tsx`)
- Discover page (`discover/page.tsx`)
- Search page (`search/page.tsx`)
- NewsBytes page (`newsbytes/page.tsx`)

Component: `src/components/ui/error-boundary.tsx`

### Skeleton Loaders

Skeleton components provide graceful loading states:
- `FeedPageSkeleton` - Home feed loading
- `ArticlePageSkeleton` - Article detail loading
- `ArticleCardSkeleton` - Individual card loading
- `CompactCardSkeleton` - Compact card loading
- `HeroCardSkeleton` - Hero section loading
- `DiscoverPageSkeleton` - Discover page loading
- `NewsBytesSkeleton` - NewsBytes loading
- `SearchPageSkeleton` - Search page loading

Components: `src/components/ui/skeleton.tsx`, `src/components/ui/discover-skeleton.tsx`

### API Client Pattern

- Centralized `fetchAPI<T>()` function with 10s timeout
- Bearer token authentication
- Error handling: AbortError → timeout message
- Response validation required (non-OK throws)

### JSON-LD Security Pattern

All JSON-LD structured data uses `safeJsonLdStringify()` to prevent XSS:
- Escapes `<` to `\u003c` (prevents `</script>` injection)
- Escapes `>` to `\u003e` (prevents HTML tag injection)
- Escapes `&` to `\u0026` (prevents HTML entity issues)

Component: `src/components/ui/json-ld.tsx`
Tests: `src/components/__tests__/json-ld.test.tsx`

### Image URL Validation

Use `isValidImageUrl()` from `src/lib/utils.ts` before rendering user-provided image URLs:
- Allows: `http://`, `https://`, `/` (relative paths)
- Blocks: `javascript:`, `data:`, `blob:`, `vbscript:` protocols

### Base URL Pattern

Use centralized URL utilities from `src/lib/constants.ts`:
- `BASE_URL` - Uses `NEXT_PUBLIC_BASE_URL` env var or defaults to production URL
- `getArticleUrl(id)` - Generates full article URLs
- `getFullUrl(path)` - Generates full URLs from relative paths

```typescript
import { BASE_URL, getArticleUrl, getFullUrl } from "@/lib/constants";

// Examples
const url = getArticleUrl("123");  // https://news.mukoko.com/article/123
const fullUrl = getFullUrl("/discover");  // https://news.mukoko.com/discover
```

### Font Loading

Fonts are loaded via CSS `@import` in `globals.css` with preconnect hints in `layout.tsx`:
- Preconnect hints improve loading performance
- CSS @import chosen for build reliability (network-independent)
- Fonts: Noto Serif (headings), Plus Jakarta Sans (body)

### Embed Widget Pattern

The embed module provides embeddable news card iframes for sister apps (e.g., weather.mukoko.com):

**Layouts**: `cards` (grid), `compact` (text list), `hero` (featured card), `ticker` (horizontal scroll), `list` (thumbnails)
**Feed Types**: `top` (trending), `featured` (popular), `latest` (chronological), `location` (local news)
**Parameters**: `country`, `type`, `layout`, `limit`, `category`, `theme` (via URL search params)

**Widget Script** (`public/embed/widget.js`):
- Vanilla JS IIFE (~2KB), no dependencies
- Converts `<div data-mukoko-embed>` elements into sandboxed iframes
- `data-base-url` attribute validated with `new URL()` constructor (http/https only)
- Sandbox: `allow-scripts allow-popups allow-popups-to-escape-sandbox` (no `allow-same-origin`)

**Iframe Page** (`src/app/embed/iframe/page.tsx`):
- Client component using `useSearchParams()` wrapped in `<Suspense>`
- Theme effect with proper cleanup (restores previous theme on unmount)
- Empty states for hero/ticker layouts when no articles available

### Backend Error Handling

- Hono responses: `c.json({ error, message }, statusCode)`
- Standard HTTP status codes: 400, 401, 403, 404, 500
- Timestamp inclusion in error responses
- Console logging with `[SERVICE]` prefix

## Pan-African Country Support

Supported countries (16 total) defined in `src/lib/constants.ts`:
- Zimbabwe (ZW) - Primary market
- South Africa (ZA)
- Kenya (KE)
- Nigeria (NG)
- Ghana (GH)
- Tanzania (TZ)
- Uganda (UG)
- Rwanda (RW)
- Ethiopia (ET)
- Botswana (BW)
- Zambia (ZM)
- Malawi (MW)
- Egypt (EG)
- Morocco (MA)
- Namibia (NA)
- Mozambique (MZ)

RSS articles inherit `country_id` from source configuration.
Country data is centralized in `src/lib/constants.ts` (single source of truth).

## Key Features

1. **Multi-Auth Support**: OIDC, Mobile SMS, Web3 wallets
2. **Real-time Features**: Durable Objects for live counters and analytics
3. **AI-Powered Services**: Content processing, semantic search, insights
4. **NewsBytes**: TikTok-style vertical feed with mobile-first design
5. **RSS Feed Aggregation**: Multiple sources with content processing pipeline
6. **Admin Dashboard**: User management, analytics, source configuration
7. **Personalized Feeds**: Country/category filtering with localStorage persistence
8. **Onboarding Flow**: Modal-based country/category selection
9. **Dark Mode**: System detection or manual toggle with next-themes
10. **Schema.org SEO**: JSON-LD structured data (NewsArticle, Organization, BreadcrumbList)
11. **Mobile Bottom Navigation**: Quick access to Home, Discover, NewsBytes, Search, Profile
12. **Breadcrumb Navigation**: Clear navigation hierarchy on article pages
13. **Embed Location Cards**: Embeddable news card widgets for sister apps (5 layouts, 4 feed types, 16 countries)
14. **News Sources Page**: Browse all sources with search, country filter, sort options, and health indicators
15. **Tag Cloud**: Logarithmic-scaled trending topics with em-based sizing (prevents outlier dominance)

## Key Files

### Frontend
- `src/app/layout.tsx` - Root layout with providers, bottom nav, and Organization JSON-LD
- `src/app/page.tsx` - Home feed with simplified layout (Featured + Latest)
- `src/app/globals.css` - Tailwind config, CSS variables, and font imports
- `src/lib/api.ts` - API client with all backend endpoints
- `src/lib/utils.ts` - Utilities (cn, formatTimeAgo, isValidImageUrl, safeCssUrl)
- `src/lib/constants.ts` - Centralized countries and categories (single source of truth)
- `src/contexts/preferences-context.tsx` - User preferences context with localStorage persistence
- `src/components/article-card.tsx` - Main article display component
- `src/components/share-modal.tsx` - Share/engagement modal with social sharing
- `src/components/onboarding-modal.tsx` - Country/category selection onboarding
- `src/components/ui/json-ld.tsx` - Schema.org JSON-LD with XSS prevention
- `src/components/ui/engagement-bar.tsx` - Article engagement buttons (like, save, share)
- `src/components/ui/breadcrumb.tsx` - Breadcrumb navigation component
- `src/components/layout/bottom-nav.tsx` - Mobile bottom navigation
- `src/components/ui/skeleton.tsx` - Skeleton loading components
- `src/components/ui/error-boundary.tsx` - Error boundary component
- `vitest.config.ts` - Frontend test configuration
- `src/app/embed/page.tsx` - Embed documentation page with live previews
- `src/app/embed/iframe/page.tsx` - Embed iframe widget (5 layouts: cards, compact, hero, ticker, list)
- `public/embed/widget.js` - Lightweight embed script (~2KB) for sister apps
- `src/app/discover/page.tsx` - Discover page with log-scaled tag cloud, source/category/country browsing
- `src/app/sources/page.tsx` - Sources directory with search, filters, sort, and health status indicators
- `src/app/sources/layout.tsx` - Sources page SEO metadata

### Backend
- `backend/index.ts` - API entry point and route definitions
- `backend/wrangler.jsonc` - Cloudflare Workers config
- `backend/services/NewsSourceManager.ts` - News source management
- `backend/services/ArticleAIService.ts` - AI content processing (keywords, quality, embeddings)
- `backend/services/AISearchService.ts` - Semantic search with Vectorize
- `backend/services/PersonalizedFeedService.ts` - User-specific feed generation
- `backend/services/StoryClusteringService.ts` - Article clustering with Jaccard similarity
- `backend/services/CategoryManager.ts` - Category operations (single source of truth)
- `backend/vitest.config.ts` - Backend test configuration

### Config
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `eslint.config.js` - Flat ESLint 9 config
- `api-schema.yml` - OpenAPI documentation
