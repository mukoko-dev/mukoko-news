# Changelog

All notable changes to Mukoko News will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- TikTok-style pull-to-refresh RSS collection with real-time feedback
- Bearer token API authentication (API_SECRET and OIDC JWT)
- Comprehensive API authentication documentation ([API_SECRET_SETUP.md](API_SECRET_SETUP.md))
- New endpoints: `/api/feed/collect` and `/api/feed/initialize-sources`
- 56+ Pan-African RSS sources across 16 countries
- Country picker UI improvements for better visibility
- Article engagement bar component
- Share modal component
- Security policy documentation ([SECURITY.md](SECURITY.md))
- Contributing guidelines ([CONTRIBUTING.md](CONTRIBUTING.md))
- GitHub issue templates

### Changed

- API base URL updated to `https://api.news.mukoko.com`
- All `/api/*` endpoints now require bearer token authentication (except `/api/health`)
- Tab bar icon colors fixed for better visibility
- Mobile app now includes API_SECRET in authorization headers
- Updated README.md with comprehensive project documentation
- Updated CLAUDE.md with security and authentication information

### Fixed

- TypeScript import error in `apiAuth.ts` middleware
- Markdown linting issues in documentation files
- Country picker visibility issues
- Tab bar icon color inconsistencies
- Trending categories fallback when no engagement data exists
- Category ID field usage in trending categories query

### Security

- Implemented bearer token authentication for all API endpoints
- API_SECRET protection for frontend-to-backend communication
- OIDC JWT token support for user authentication
- Rate limiting on RSS feed collection (5-minute cooldown)
- SQL injection protection via parameterized queries
- XSS prevention through React Native auto-escaping

## [0.1.0] - 2025-12-20

### Added

- Initial release of Mukoko News
- Cloudflare Workers backend with Hono framework
- React Native Expo mobile app (iOS, Android, Web)
- D1 database with 17 migrations
- Pan-African news aggregation from 16 countries
- RSS feed collection and processing
- User authentication via OIDC (id.mukoko.com)
- Role-based access control (RBAC) with admin role
- Article interactions tracking (likes, saves, views)
- Real-time analytics with Durable Objects
- Semantic search with Cloudflare Vectorize
- AI-powered content processing with Workers AI
- Offline-first mobile app with IndexedDB caching
- Nyuchi Brand v6 design system (Tanzanite, Cobalt, Gold)
- Material Design UI with React Native Paper
- Admin dashboard with analytics
- Health check endpoint for monitoring
- Comprehensive test suite (Vitest + Jest)
- Pre-commit hooks (TypeScript check + build validation)
- ESLint 9 flat config

### Backend Features

- **API Framework**: Hono (lightweight, fast)
- **Database**: Cloudflare D1 (SQLite at edge)
- **Cache**: KV Namespaces for session storage
- **Real-time**: 4 Durable Objects classes
  - ArticleInteractions
  - UserBehavior
  - RealtimeCounters
  - RealtimeAnalytics
- **AI**: Workers AI for content processing
- **Search**: Vectorize for semantic search
- **Cron Jobs**: Scheduled RSS collection
- **Analytics**: Analytics Engine for metrics

### Mobile Features

- **Framework**: React Native 0.81.5 via Expo 54
- **UI**: React Native Paper (Material Design)
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State Management**: Context API (AuthContext, ThemeContext)
- **Storage**: AsyncStorage + IndexedDB (web)
- **Offline Support**: Article caching for offline reading
- **Platform**: iOS, Android, Web (responsive)

### Database Schema

- **Tables**: 15+ tables including:
  - users, articles, categories, keywords
  - news_sources, rss_sources
  - user_interactions, user_preferences
  - countries, article_keywords
- **Roles**: admin, moderator, support, author, user
- **Migrations**: 17 migrations for schema evolution

### API Endpoints

- **Feed**: `/api/feeds`, `/api/feeds/personalized`
- **Articles**: `/api/article/:id`
- **Collection**: `/api/feed/collect`, `/api/feed/initialize-sources`
- **Categories**: `/api/categories`
- **Countries**: `/api/countries`
- **Admin**: `/api/admin/*` (stats, users, sources, analytics)
- **Health**: `/api/health` (monitoring)

### Deployment

- **Backend**: Cloudflare Workers (manual deployment)
- **Mobile Web**: Vercel (https://news.mukoko.com)
- **CI/CD**: GitHub Actions for tests (no auto-deploy)

---

## Version History

- **[Unreleased]** - Current development version
- **[0.1.0]** - 2025-12-20 - Initial release

## Links

- [Repository](https://github.com/nyuchitech/mukoko-news)
- [Issues](https://github.com/nyuchitech/mukoko-news/issues)
- [Pull Requests](https://github.com/nyuchitech/mukoko-news/pulls)
- [Security Policy](SECURITY.md)
- [Contributing Guide](CONTRIBUTING.md)

---

"Ndiri nekuti tiri" — I am because we are

Built with ❤️ by [Nyuchi Technologies](https://brand.nyuchi.com)
