# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mukoko News is a Pan-African digital news aggregation platform. "Mukoko" means "Beehive" in Shona - where community gathers and stores knowledge. Primary market is Zimbabwe with expansion across Africa.

**Architecture**: Monorepo with independent apps (not npm workspaces)
- `backend/` - Cloudflare Workers API (Hono framework)
- `mobile/` - React Native Expo app (iOS, Android, Web)
- `database/` - D1 schema and migrations

## Common Commands

### Root Level
```bash
npm run dev              # Start backend dev server
npm run build            # Build backend (dry-run)
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix
npm run test             # Run backend tests
npm run mobile           # Start Expo dev server
npm run mobile:web       # Start Expo web
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

### Mobile (`cd mobile`)
```bash
npm start                # Expo dev server
npm run ios              # iOS simulator
npm run android          # Android emulator
npm run web              # Web browser
npm run build            # Export for web (Vercel)
npm run test             # Jest tests
```

**Note**: Use `--legacy-peer-deps` when installing mobile dependencies.

## Architecture

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

### Mobile Stack
- **Framework**: React Native 0.81.5 via Expo 54
- **UI**: React Native Paper (Material Design)
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State**: Context API (AuthContext, ThemeContext)
- **Storage**: AsyncStorage

### Design System (Nyuchi Brand v6)
- Primary: Tanzanite (#4B0082)
- Secondary: Cobalt (#0047AB)
- Accent: Gold (#5D4037)
- Surface: Warm Cream (#FAF9F5)
- Typography: Noto Serif (headings), Plus Jakarta Sans (body)
- Border radius: 12px buttons, 16px cards

## Database

Schema in `database/schema.sql`. 17 migrations in `database/migrations/`.

**Key Tables**: users, articles, categories, keywords, news_sources, rss_sources, user_interactions

**Roles (RBAC)**: admin (active), moderator, support, author, user (disabled)

## API

**Base URL**: `https://api.news.mukoko.com`

**Fallback URL**: `https://mukoko-news-backend.nyuchi.workers.dev` (if primary domain fails)

### Endpoint Protection (Updated)

- `/api/*` - **Protected** (requires bearer token: API_SECRET or OIDC JWT)
- `/api/health` - Public (no auth required)
- `/api/admin/*` - Admin only (separate admin auth + RBAC)

### Authentication Methods

1. **API_SECRET** - Bearer token for frontend (Vercel) to backend auth
   - Set via: `npx wrangler secret put API_SECRET`
   - Environment variable: `EXPO_PUBLIC_API_SECRET`
   - Configured in: `.env.local` (development), Vercel (production)

2. **OIDC JWT** - User authentication tokens from id.mukoko.com
   - Validated by oidcAuth middleware
   - Takes priority over API_SECRET

### New Endpoints

- `POST /api/feed/collect` - TikTok-style RSS collection (rate-limited 5 min)
- `POST /api/feed/initialize-sources` - Initialize 56 Pan-African RSS sources

**API Auth Middleware**: `backend/middleware/apiAuth.ts`
**Setup Guide**: `API_SECRET_SETUP.md`
**OpenAPI Schema**: `api-schema.yml`

## Deployment

**Backend**: Manual deployment only (not CI/CD)
```bash
cd backend && npm run deploy
```

**Mobile Web**: Vercel
```bash
npm run mobile:deploy
```

GitHub Actions runs tests on PRs but does not auto-deploy backend.

## Key Files

- `backend/index.ts` - API entry point and route definitions
- `backend/wrangler.jsonc` - Cloudflare Workers config (bindings, DOs, crons)
- `mobile/App.js` - React Native entry point
- `mobile/theme.js` - Design system tokens
- `vercel.json` - Vercel config for mobile web
- `eslint.config.js` - Flat ESLint 9 config

## Testing

**Backend**: Vitest with 10s timeout per test
```bash
npm run test              # Single run
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

**Mobile**: Jest
```bash
cd mobile && npm test
```

## Cloudflare Bindings

Defined in `wrangler.jsonc`:
- `DB` - D1 database
- `AUTH_STORAGE`, `CACHE_STORAGE` - KV namespaces
- `ARTICLE_INTERACTIONS`, `USER_BEHAVIOR`, `REALTIME_COUNTERS`, `REALTIME_ANALYTICS` - Durable Objects
- `AI` - Workers AI
- `VECTORIZE_INDEX` - Semantic search
- `IMAGES` - Cloudflare Images
