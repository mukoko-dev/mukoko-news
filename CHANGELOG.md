# Changelog

All notable changes to Harare Metro will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Phase 2 - User Engagement Features
- Frontend UI components (in progress)
- Authentication flow testing
- User profile pages
- Integration testing

---

## [0.9.1] - 2025-12-16

### Improved - Discover & Insights Screens Redesign

Complete redesign of the Discover and Insights screens to address UX issues where screens felt like "empty broken shells".

#### DiscoverScreen Improvements
- **Unified Discovery Hub** - Single scrollable experience replacing fragmented tab-based navigation
- **Insights Banner** - Prominent entry point to analytics at the top of the screen
- **Featured Article** - Top story hero section with visual prominence
- **Horizontal Scroll Sections** - Trending Topics and Top Journalists as engaging horizontal carousels
- **Platform Stats** - Quick stats (articles, sources) visible in the Insights banner
- **Better Empty States** - Actionable empty states with category filter clearing
- **Removed Tab Complexity** - Simplified from 3 separate modes to unified scroll

#### InsightsScreen Improvements
- **Resilient Data Loading** - Uses `Promise.allSettled` so partial data failures don't break the entire screen
- **Graceful Fallbacks** - Each section only shows when data is available
- **Platform Overview Card** - Live animated stats with article/source/category counts
- **Community Activity** - Views, likes, saves engagement metrics
- **Content Quality Metrics** - Average word count, images percentage, read time
- **AI Analysis Card** - Shows AI summary when available
- **Hot Topics Grid** - 2-column grid with fire badges for top trending
- **Top Journalists List** - Ranked list with gold/silver/bronze badges
- **Quick Actions** - Trending, Search, Bytes shortcuts at bottom
- **Better Visual Hierarchy** - Clear sections with consistent spacing

#### Technical Improvements
- Removed unused imports and dependencies
- Simplified state management (removed complex expandable sections)
- Better error handling with partial failure support
- Consistent styling with theme colors
- Improved accessibility labels

---

## [0.9.0] - 2025-12-13

### Added - Admin Dashboard Frontend

- **Complete Admin Web App** - New React + Vite + TypeScript admin interface
  - Separate frontend app in `admin/` directory
  - Deployed to Vercel (admin.mukoko.com)
  - Uses existing backend API endpoints

- **Authentication System**
  - Login page with email/password authentication
  - Session-based auth with localStorage token storage
  - Protected routes with automatic redirect
  - AuthContext for global auth state management

- **Dashboard Pages**
  - **Dashboard** - Overview stats, quick actions, system status
  - **Articles** - Article listing with pagination, category filters, RSS refresh
  - **Users** - User management with role/status updates, search, delete
  - **News Sources** - RSS source toggle, add Zimbabwe sources
  - **Categories** - Category listing with article distribution chart
  - **Analytics** - Engagement metrics, content quality, category performance
  - **System Health** - Service status, AI pipeline, cron logs, alerts

- **UI Components**
  - Layout with sidebar navigation
  - ErrorBoundary for error handling
  - Toast notifications for feedback
  - Loading spinners and page loaders
  - Responsive tables with pagination

- **Styling**
  - Tailwind CSS with custom Mukoko brand colors
  - Zimbabwe flag strip accent
  - Consistent design system

### Changed
- Updated root `package.json` with admin scripts:
  - `npm run admin` - Start admin dev server
  - `npm run admin:build` - Build admin for production
  - `npm run admin:deploy` - Deploy to Vercel
  - `npm run install:admin` - Install admin dependencies

### Technical
- Vite for fast development and optimized builds
- React Router DOM for client-side routing
- TypeScript for type safety
- Lazy loading for code splitting
- Recharts ready for chart components

---

## [0.8.0] - 2025-12-11

### Added - Mobile UI Improvements

- **ArticleCard component** - New reusable article card with multiple variants
  - `default` - Standard vertical card with image on top
  - `horizontal` - Compact horizontal layout for quick scanning
  - `compact` - Minimal card for dense lists
  - `featured` - Large hero-style card for top stories
  - Image error handling with automatic fallback placeholders
  - Loading states for images
  - Relative time formatting (e.g., "2h ago")

- **CategoryChips component** - Horizontal scrollable category filters
  - Pills-style selection with clear active states
  - Optional icons and article counts
  - "All" option for showing all categories
  - Alternative CategoryPills wrapper layout

- **Responsive HomeScreen** - Complete redesign following 2025 news app patterns
  - Featured card for hero story on mobile
  - Horizontal cards for quick-scan section (items 1-4)
  - Responsive grid layout: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
  - Breakpoints at 600px, 900px, 1200px
  - Empty state with refresh button

- **Responsive NewsBytesScreen** - Fixed layout and positioning issues
  - Dynamic safe area positioning using useSafeAreaInsets
  - Screen dimension listener for responsive updates
  - ActionButton sub-component with proper styling
  - "Read Full Article" button with navigation
  - Better gradient overlay for text readability

### Changed

- **Backend wrangler.jsonc** - Updated for Cloudflare free plan compatibility
  - Added CACHE_STORAGE KV namespace (id: a9c3fa88185949d5a3e81b1865fc16d7)
  - Changed Durable Objects migrations from `new_classes` to `new_sqlite_classes`

### Fixed

- **Hardcoded pixel values** - Replaced with dynamic theme-based spacing
- **Image loading errors** - Added onError handlers with placeholder fallbacks
- **Component overlaps** - Fixed with proper safe area insets
- **Typography inconsistencies** - Standardized to theme fonts throughout
- **Responsive positioning** - Content now adapts to screen dimensions

### Technical

- Mobile app build verified successful (754 modules bundled)
- All new components follow Material Design 3 patterns via React Native Paper
- Theme values used consistently for spacing, colors, and typography

---

## [0.7.0] - 2025-10-31

### Added
- **Today's article count** - Home page now shows daily article count instead of total database count
  - More relevant metric for users to see fresh content
  - Backend still tracks total count for analytics
- **PWA icon files** - Added icon-192x192.png and icon-512x512.png for proper PWA support
- **Backend favicon support** - Admin dashboard and login page now display proper favicons
- **D1Service today filter** - Added `today` parameter to `getArticleCount()` method using SQLite date filtering

### Changed
- **API response structure** - `/api/feeds` now returns both `total` and `todayCount`
- **Home page display** - Changed from "352 Articles" to "55 Articles Today" (dynamic)
- **PWA manifest** - Fixed all icon references to use correct android-chrome files

### Fixed
- **Auth page routing** - Added missing routes for /auth/login, /auth/register, /auth/forgot-password
- **404 error page** - Complete redesign with Zimbabwe flag branding and proper navigation
- **Backend favicons** - Added favicon links to admin HTML templates
- **PWA shortcuts** - Fixed icon paths in manifest.json shortcuts (politics, economy, sports, harare)

### Deployed
- ✅ Frontend: www.hararemetro.co.zw (Version: 47f7aba5-578f-4482-a3e1-6f10d9fb3ea8)
- ✅ Backend: admin.hararemetro.co.zw (Version: 60f6150e-7d66-45f3-a44a-58ea133a4880)
- ✅ Verified: API returning todayCount=55, total=352

---

## [0.6.0] - 2025-10-29

### Added
- **Real-time log streaming** for both frontend and backend workers via wrangler tail
- **Observability configuration** enabled in both wrangler.jsonc files
- **Preview URL support** for testing deployments
- **LOGGING-AND-MONITORING.md** - Comprehensive logging guide
- **Backend deployment** with OpenAuthService enabled

### Changed
- **OpenAuthService** import re-enabled in backend/index.ts
- **Backend deployed** to production (version 780525e1-9b4d-45ea-9c1d-65d91202fff8)
- **Phase 2 status** updated from 40% to 60% complete

### Fixed
- **OpenAuthService dependencies** installed (@openauthjs/openauth + valibot)
- **Backend build** now passes with authentication enabled

### Verified
- ✅ Health endpoint operational (148ms response time)
- ✅ Log streaming working with real-time data
- ✅ All backend services healthy

---

## [0.5.0] - 2025-10-28

### Added
- **Migration 007** applied to production database (manually)
  - `article_comments` table with moderation support
  - `comment_likes` table for comment engagement
  - `user_follows` table for following sources/authors/categories
  - Full indexes and triggers for performance
- **Phase 2 backend endpoints** (9 APIs):
  - POST /api/articles/:id/like
  - POST /api/articles/:id/save
  - POST /api/articles/:id/view
  - POST /api/articles/:id/comment
  - GET /api/articles/:id/comments
  - GET /api/user/me/preferences
  - POST /api/user/me/preferences
  - POST /api/user/me/follows
  - DELETE /api/user/me/follows/:type/:id
- **PROJECT-STATUS.md** - Honest phase tracking document
- **PHASE-2-COMPLETION-PLAN.md** - Detailed 3-week roadmap
- **Documentation cleanup** - Consolidated and updated all docs

### Changed
- **Database name fixed** in all wrangler.jsonc files
  - Old: `hararemetro_db`
  - New: `hararemetro_articles`
- **Architecture simplified** from 3-worker to 2-worker system
- **Account worker archived** to `archive/account-worker-phase3a-archived-20251028/`
- **Phase status corrected**:
  - Phase 1: 95% → 100% ✅
  - Phase 2: 100% → 40% (honest assessment)
  - Phase 3a: 90% → 0% (deferred)
- **CLAUDE.md** updated with 2-worker architecture
- **README.md** updated with correct database schema

### Fixed
- **Database configuration** - All configs now reference correct database name
- **Documentation alignment** - All docs now reflect actual implementation
- **Phase tracking** - Removed false "complete" status from Phase 2

### Removed
- Account worker from main codebase (archived for future use)
- 3-worker architecture references

---

## [0.4.0] - 2025-10-24 to 2025-10-26

### Added
- **Cron logging system** (migration 006)
  - `cron_logs` table for tracking RSS refresh execution
  - D1-based logging instead of Analytics Engine
- **Phase 2 user engagement planning**
  - Database migration 007 created
  - Backend endpoints written (not yet enabled)
- **Admin dashboard redesign**
  - Black/white theme with Lucide icons
  - Tab-based navigation
  - Source management interface

### Changed
- **Category classification fixed** - JSON keyword parsing corrected
- **RSS feed processing** - Better error handling

---

## [0.3.0] - 2025-10-11 to 2025-10-23

### Added
- **Phase 1 completion** - Core platform features
  - RSS feed aggregation from Zimbabwe news sources
  - Hourly cron job (frontend → backend)
  - AI content pipeline (author extraction, keywords, quality scoring)
  - Author recognition across multiple outlets
  - Category classification system (256-keyword taxonomy)
- **Public API endpoints**:
  - GET /api/feeds - Paginated articles
  - GET /api/categories - All categories
  - GET /api/article/by-source-slug - Single article
  - GET /api/health - Health check
  - GET /api/news-bytes - Articles with images only
  - GET /api/search - Full-text search
  - GET /api/authors - Journalist discovery
  - GET /api/sources - News sources listing
  - GET /api/refresh - User-triggered refresh (rate-limited)
- **Admin dashboard** - Source management, statistics, AI pipeline status
- **Frontend** - React Router 7 SSR application with Zimbabwe flag branding

### Technical
- **2-worker architecture**:
  - www.hararemetro.co.zw (frontend)
  - admin.hararemetro.co.zw (backend)
- **Cloudflare D1 database** - Single database (hararemetro_articles)
- **Cloudflare Workers AI** - Content processing pipeline
- **Cloudflare Analytics Engine** - User interaction tracking
- **Cloudflare Vectorize** - Semantic search (configured, not active)

---

## [0.2.0] - 2025-09-20 to 2025-10-10

### Added
- **Database schema** design and initial migrations
- **RSS feed service** with XML parsing
- **News source management** system
- **Article AI service** with Cloudflare Workers AI
- **Author profile service** with deduplication
- **Content processing pipeline** - AI orchestration

### Technical
- TypeScript codebase
- Hono web framework for backend
- React Router 7 for frontend
- Tailwind CSS 4.x with Zimbabwe flag colors

---

## [0.1.0] - 2025-08-21 to 2025-09-19

### Added
- **Initial project setup**
- **Cloudflare Workers** infrastructure
- **D1 database** creation
- **Basic frontend** structure
- **Project documentation** (README, CLAUDE.md)

### Technical
- Monorepo structure
- Separate frontend and backend workers
- GitHub Actions CI/CD

---

## Version History Summary

| Version | Date | Phase | Completion | Key Features |
|---------|------|-------|------------|--------------|
| 0.8.0 | 2025-12-11 | Phase 2 | 70% | Mobile UI improvements, responsive design |
| 0.7.0 | 2025-10-31 | Phase 2 | 65% | Today count, PWA icons, auth routes |
| 0.6.0 | 2025-10-29 | Phase 2 | 60% | Logging, backend deployed |
| 0.5.0 | 2025-10-28 | Phase 2 | 40% | Migration 007, docs cleanup |
| 0.4.0 | 2025-10-26 | Phase 2 | 30% | Cron logging, planning |
| 0.3.0 | 2025-10-23 | Phase 1 | 100% | Core platform complete |
| 0.2.0 | 2025-10-10 | Phase 1 | 70% | RSS + AI processing |
| 0.1.0 | 2025-09-19 | Phase 1 | 30% | Initial setup |

---

## Upcoming Releases

### [0.7.0] - Planned
**Phase 2 Frontend Integration**
- Like/save buttons on articles
- Comment system UI
- Follow buttons for sources/authors
- User profile pages
- Authentication flow tested
- Integration testing complete

### [0.8.0] - Planned
**Phase 2 Complete**
- All Phase 2 features deployed
- User engagement functional
- Performance optimized
- Production ready

### [1.0.0] - Planned
**Phase 3 - Advanced Features**
- Personalized feed algorithm
- Notifications system
- Reading analytics
- User dashboards
- Mobile app considerations

---

## Links

- **Repository**: https://github.com/nyuchitech/harare-metro
- **Live Site**: https://www.hararemetro.co.zw
- **Admin Panel**: https://admin.hararemetro.co.zw
- **Documentation**: [CLAUDE.md](CLAUDE.md)
- **Status**: [PROJECT-STATUS.md](PROJECT-STATUS.md)
- **Plan**: [PHASE-2-COMPLETION-PLAN.md](PHASE-2-COMPLETION-PLAN.md)

---

## Contributors

- **Owner**: Bryan Fawcett
- **Development**: Claude Code (AI Assistant)
- **Stack**: Cloudflare Workers, D1, React Router 7, TypeScript

---

**Note**: This changelog was created on 2025-10-29 to consolidate project history.
Previous changes were retroactively documented from git commits and documentation.
