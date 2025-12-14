# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Workflow - CRITICAL

All changes MUST go through Pull Requests. **Never commit directly to main branch.**

**Before making changes:**

1. **Pull from main first**: `git checkout main && git pull origin main`
2. **Create feature branch**: `git checkout -b <type>/<description>`
   - Types: `feat/`, `fix/`, `docs/`, `refactor/`, `test/`, `chore/`
   - Example: `feat/user-authentication`, `fix/profile-navigation`
3. **Check CHANGELOG.md**: Review recent changes to understand project history
4. **Apply changes**: Make your changes on the feature branch
5. **Update CHANGELOG.md**: Add entry for significant changes
6. **Create Pull Request**: ALWAYS create a PR, never push directly to main

**Git Branch Rules:**
- ✅ **DO**: Create feature branches for all changes
- ✅ **DO**: Create PRs for every change, even documentation
- ❌ **DON'T**: Ever use `git push origin main`
- ❌ **DON'T**: Ever commit directly to main branch

## Development Commands

### Backend Worker (Cloudflare Workers + Hono)

```bash
npm run dev              # Start backend worker dev server (wrangler dev)
npm run deploy           # Build and deploy backend to Cloudflare
npm run typecheck        # TypeScript check
npm run clean            # Clean build artifacts and caches
npm run test             # Run build as test (dry-run deploy)
```

### Mobile App (Expo + React Native)

```bash
npm run mobile           # Start Expo dev server
npm run mobile:ios       # Run on iOS simulator
npm run mobile:android   # Run on Android emulator
npm run mobile:web       # Run in web browser
npm run mobile:deploy    # Deploy web build to Vercel
```

### Database Commands (from backend/)

```bash
cd backend
npm run db:migrate       # Apply schema to production D1
npm run db:local         # Apply schema to local D1
```

### Install Dependencies

```bash
npm run install:all      # Install backend and mobile deps
npm run install:backend  # Install backend only
npm run install:mobile   # Install mobile only
```

## Architecture Overview

**Mukoko News** (formerly Harare Metro) is a Zimbabwe news aggregation platform with mobile-first architecture:

- **Backend Worker** (`backend/`): Hono API on Cloudflare Workers - REST API, admin panel, RSS processing
- **Mobile App** (`mobile/`): Expo + React Native app for iOS, Android, and Web
- **Database**: Cloudflare D1 (`hararemetro_articles`)
- **AI**: Cloudflare Workers AI for content processing
- **Analytics**: Cloudflare Analytics Engine

### Technology Stack

| Component | Technology |
|-----------|------------|
| Backend API | Hono + TypeScript on Cloudflare Workers |
| Mobile App | Expo 54 + React Native 0.81 + React Native Paper |
| Database | Cloudflare D1 (SQLite at edge) |
| Auth Sessions | Cloudflare KV (`AUTH_STORAGE`) |
| RSS Parsing | fast-xml-parser |
| AI Processing | Cloudflare Workers AI |
| Validation | Valibot |

### Project Structure

```
/harare-metro
├── backend/                    # Cloudflare Worker (Hono API)
│   ├── index.ts                # Worker entry point
│   ├── wrangler.jsonc          # Cloudflare configuration
│   ├── services/               # Business logic
│   │   ├── RSSFeedService.ts   # RSS feed processing
│   │   ├── ArticleService.ts   # Article CRUD
│   │   ├── ArticleAIService.ts # AI content enhancement
│   │   ├── AuthService.ts      # Authentication
│   │   ├── AuthorProfileService.ts
│   │   ├── ContentProcessingPipeline.ts
│   │   └── ...
│   └── admin/                  # Admin dashboard HTML
│
├── mobile/                     # Expo + React Native app
│   ├── App.js                  # Root component
│   ├── theme.js                # Zimbabwe flag color theme
│   ├── api/client.js           # Backend API client
│   ├── screens/
│   │   ├── HomeScreen.js       # News feed
│   │   ├── NewsBytesScreen.js  # TikTok-style news
│   │   ├── DiscoverScreen.js   # Category browsing
│   │   ├── SearchScreen.js     # Article search
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   └── ...
│   └── components/             # Reusable UI components
│
├── database/
│   └── schema.sql              # D1 database schema
│
├── guides/                     # Documentation
└── archive/                    # Archived legacy code
```

## Database

D1 Database: `hararemetro_articles` (binding: `DB`)

Key tables:

- `articles` - News articles with slug, content, metadata
- `article_analytics` - View tracking and engagement metrics
- `users` - User accounts and authentication
- `user_preferences` - User settings

See [database/schema.sql](database/schema.sql) for full schema.

## Authentication

Sessions stored in Cloudflare KV (`AUTH_STORAGE` binding):

```typescript
// Key: session:${sessionId}
{
  userId: string;
  email: string;
  username: string;
  role: 'admin' | 'super_admin' | 'moderator' | 'creator';
  loginAt: string;
  expiresAt: string;
}
```

User roles: `creator` (default), `business-creator`, `moderator`, `admin`, `super_admin`

## Design System

### Mukoko Brand Color Palette

The app uses a sophisticated purple-gray and terracotta color system. Zimbabwe flag colors are reserved for the flag strip component only.

#### Primary Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#5e5772` | Primary actions, buttons, links |
| Primary Hover | `#6f6885` | Hover states |
| Accent | `#d4634a` | Warm terracotta for highlights, errors |
| Success | `#779b63` | Success states, positive indicators |
| Warning | `#e5a84d` | Warning messages |

#### Surface Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Surface | `#FFFFFF` | Card backgrounds |
| Surface Variant | `#f9f8f4` | Warm off-white backgrounds |
| On Surface | `#1f1f1f` | Primary text |
| On Surface Variant | `#4a4a4a` | Secondary text (WCAG AA compliant) |

#### Zimbabwe Flag Colors (Flag Strip Only)

| Color | Hex | Component |
|-------|-----|-----------|
| Green | `#00A651` | Flag strip |
| Yellow | `#FDD116` | Flag strip |
| Red | `#EF3340` | Flag strip |
| Black | `#000000` | Flag strip |
| White | `#FFFFFF` | Flag strip |

### Typography

- **Headings/Logo**: Noto Serif - Elegant, authoritative
- **Body**: Plus Jakarta Sans - Clean, modern, readable

### Mobile Theme (React Native Paper)

Theme defined in [mobile/theme.js](mobile/theme.js) with Mukoko brand colors and WCAG AA compliant contrast ratios.

## Backend API Endpoints

### Public Endpoints

- `GET /api/health` - Health check
- `GET /api/feeds?limit=20&offset=0&category=politics` - Get articles
- `GET /api/categories` - Get all categories

### Admin Endpoints

- `GET /` or `/admin` - Admin dashboard
- `GET /api/admin/stats` - Platform statistics
- `POST /api/refresh-rss` - Manual RSS refresh
- `GET /api/admin/sources` - News sources with stats
- `GET /api/admin/authors` - Author profiles

### User Engagement

- `POST /api/articles/:id/like` - Like/unlike article
- `POST /api/articles/:id/save` - Bookmark article
- `POST /api/articles/:id/view` - Track view
- `GET /api/user/me/preferences` - Get user preferences

## Code Conventions

### TypeScript (Backend)

- Use types from wrangler-generated bindings
- Avoid `any` types

### Import Order

```typescript
// External packages
import { Hono } from "hono";

// Internal services
import { ArticleService } from "./services/ArticleService.js";
```

### Logging Prefixes

- `[API]` - API endpoint logs
- `[SERVICE]` - Service-level logs
- `[ERROR]` - Error logs
- `[WORKER]` - Worker initialization

## Key Reminders

1. All backend business logic in `backend/services/`
2. Mobile app connects to backend via [mobile/api/client.js](mobile/api/client.js)
3. No Supabase - all auth uses D1 + KV
4. TypeScript for backend, JavaScript for mobile
5. Zimbabwe flag colors in all UI components
