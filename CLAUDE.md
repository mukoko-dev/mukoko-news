# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mukoko News is a Pan-African digital news aggregation platform. "Mukoko" means "Beehive" in Shona - where community gathers and stores knowledge. Primary market is Zimbabwe with expansion across Africa.

**Architecture**: Next.js frontend with Cloudflare Workers backend

- `src/` - Next.js 15 frontend (App Router)
- `backend/` - Cloudflare Workers API (Hono framework)
- `database/` - D1 schema and migrations

## Common Commands

### Frontend (Root Level)

```bash
npm run dev              # Start Next.js dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix
npm run typecheck        # TypeScript check
npm run clean            # Clean build artifacts
```

### Backend (`cd backend`)
```bash
npm run dev              # wrangler dev (local worker)
npm run deploy           # Deploy to Cloudflare Workers
npm run test             # vitest run
npm run test:watch       # vitest (watch mode)
npm run typecheck        # tsc --noEmit
npm run db:migrate       # Apply schema to remote D1
npm run db:local         # Apply schema to local D1
```

## Architecture

### Frontend Stack

- **Framework**: Next.js 15 with App Router
- **UI**: Tailwind CSS 4 with custom design tokens
- **Components**: Radix UI primitives
- **Icons**: Lucide React
- **Theme**: next-themes for dark mode support
- **TypeScript**: Full type safety
- **State**: React Context (ThemeContext)

### Backend Stack
- **Runtime**: Cloudflare Workers (edge computing)
- **Framework**: Hono (lightweight, fast)
- **Database**: D1 (SQLite at edge)
- **Cache**: KV Namespaces
- **Real-time**: Durable Objects (4 classes: ArticleInteractions, UserBehavior, RealtimeCounters, RealtimeAnalytics)
- **AI**: Workers AI for content processing
- **Search**: Vectorize for semantic search
- **Auth**: OIDC via id.mukoko.com

### Backend Services Pattern
Services are in `backend/services/`. Key services:
- `ArticleService` - Article CRUD and queries
- `NewsSourceService` / `SimpleRSSService` - RSS feed aggregation
- `ContentProcessingPipeline` - RSS → parse → process → store
- `AuthProviderService` - Unified auth service with RBAC
- `D1Service` / `D1CacheService` - Database operations
- `AnalyticsEngineService` - Metrics and analytics

### Access Control
- **Admin routes** (`/api/admin/*`) - Protected, requires admin role
- **All other routes** - Public (no auth required)
- Non-admin roles (moderator, support, author, user) are currently disabled

### Design System (Nyuchi Brand v6)
- Primary: Tanzanite (#4B0082)
- Secondary: Cobalt (#0047AB)
- Accent: Gold (#5D4037)
- Surface: Warm Cream (#FAF9F5) for light mode
- Typography: Noto Serif (headings), Plus Jakarta Sans (body)
- Border radius: 12px buttons, 16px cards

## Frontend Structure

```text
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx       # Root layout with providers
│   ├── page.tsx         # Home feed page
│   ├── discover/        # Discover page
│   ├── newsbytes/       # TikTok-style vertical feed
│   ├── article/[id]/    # Article detail page
│   ├── search/          # Search page
│   ├── profile/         # Profile/settings page
│   ├── admin/           # Admin dashboard
│   └── globals.css      # Tailwind styles and CSS variables
├── components/
│   ├── layout/          # Header, Footer
│   ├── ui/              # Reusable UI components
│   ├── article-card.tsx # Article card component
│   ├── share-modal.tsx  # Share modal
│   └── theme-provider.tsx
└── lib/
    ├── api.ts           # API client
    └── utils.ts         # Utility functions
```

## Database

Schema in `database/schema.sql`. 17 migrations in `database/migrations/`.

**Key Tables**: users, articles, categories, keywords, news_sources, rss_sources, user_interactions

**Roles (RBAC)**: admin (active), moderator, support, author, user (disabled)

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

### Key Endpoints

- `GET /api/feeds` - Get articles feed
- `GET /api/article/:id` - Get single article
- `GET /api/categories` - Get categories
- `GET /api/newsbytes` - Get NewsBytes articles
- `POST /api/feed/collect` - Trigger RSS collection
- `GET /api/admin/*` - Admin endpoints

**API Auth Middleware**: `backend/middleware/apiAuth.ts`
**OpenAPI Schema**: `api-schema.yml`

## Deployment

**Frontend**: Auto-deploys to Vercel on push to main

**Backend**: Manual deployment only (not CI/CD)
```bash
cd backend && npm run deploy
```

GitHub Actions runs tests on PRs but does not auto-deploy backend.

## Key Files

- `src/app/layout.tsx` - Root layout with theme provider
- `src/app/globals.css` - Tailwind config and CSS variables
- `src/lib/api.ts` - API client
- `src/components/theme-provider.tsx` - Theme context
- `backend/index.ts` - API entry point and route definitions
- `backend/wrangler.jsonc` - Cloudflare Workers config
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `eslint.config.js` - Flat ESLint 9 config

## Testing

**Backend**: Vitest with 10s timeout per test
```bash
cd backend
npm run test              # Single run
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

## Cloudflare Bindings

Defined in `wrangler.jsonc`:
- `DB` - D1 database
- `AUTH_STORAGE`, `CACHE_STORAGE` - KV namespaces
- `ARTICLE_INTERACTIONS`, `USER_BEHAVIOR`, `REALTIME_COUNTERS`, `REALTIME_ANALYTICS` - Durable Objects
- `AI` - Workers AI
- `VECTORIZE_INDEX` - Semantic search
- `IMAGES` - Cloudflare Images

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
