# Mukoko News

**Zimbabwe's Modern News Aggregation Platform**

A mobile-first news aggregation platform built for Zimbabweans, bringing together news from across Zimbabwe's media landscape with intelligent content processing, beautiful UI, and offline-first capabilities.

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![React Native](https://img.shields.io/badge/React_Native-Expo-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## Live Deployment

- **Mobile App (Web)**: [mukoko-news.vercel.app](https://mukoko-news.vercel.app)
- **Backend API**: [news-worker.mukoko.com](https://news-worker.mukoko.com)

## What's New (December 2025)

### Mobile UI Overhaul (v0.8.0)
- **ArticleCard Component** - Multiple variants (featured, horizontal, compact, default) with image error handling
- **CategoryChips Component** - Horizontal scrollable category filters
- **Responsive HomeScreen** - 2025 news app patterns with featured cards and quick-scan layout
- **NewsBytesScreen** - Fixed positioning with safe area insets
- **Offline-First** - Service worker and IndexedDB caching for web

### SEO & Open Graph (v0.8.0)
- **Dynamic Sitemaps** - Auto-generated article, news, and category sitemaps
- **Open Graph Tags** - Full OG metadata for article sharing
- **JSON-LD Schema** - NewsArticle structured data for search engines
- **Auto SEO Updates** - Cron job updates article metadata every 6 hours

### Platform Stats
- **400+ articles** aggregated from Zimbabwe news sources
- **10+ news sources** including Herald, NewsDay, ZimLive, Chronicle
- **Real-time updates** - Hourly RSS feed refresh
- **Sub-100ms API response** - Edge-deployed globally

## Features

### For Users
- Fresh Zimbabwe news from multiple trusted sources
- Category filtering (Politics, Business, Sports, Entertainment, etc.)
- Quick-scan article cards for fast browsing
- TikTok-style NewsBytes for short-form news consumption
- Offline reading capability (PWA)
- Clean, modern UI with Zimbabwe flag color scheme

### For Developers
- **Multi-Platform Architecture** - React Native mobile + Cloudflare Workers backend
- **AI Content Processing** - Author recognition, keyword extraction, quality scoring
- **Real-time Analytics** - Article views, engagement tracking
- **SEO Optimized** - Dynamic sitemaps, OG tags, structured data
- **Edge Deployed** - Cloudflare Workers for global performance

## Architecture

```
┌─────────────────────────────────────────────┐
│          Mobile App (React Native)          │
│     mukoko-news.vercel.app / App Stores     │
│  • React Native Paper UI                    │
│  • Offline-first with IndexedDB             │
│  • Service Worker for web                   │
└─────────────────────────────────────────────┘
                      ↓
              REST API Calls
                      ↓
┌─────────────────────────────────────────────┐
│      Backend Worker (Cloudflare)            │
│        news-worker.mukoko.com               │
│  • RSS feed aggregation                     │
│  • AI content processing                    │
│  • User authentication                      │
│  • SEO metadata generation                  │
│  • Dynamic sitemap generation               │
└─────────────────────────────────────────────┘
                      ↓
           Cloudflare D1 Database
```

## Technology Stack

**Mobile App:**
- React Native + Expo
- React Native Paper (Material Design 3)
- React Navigation
- Custom Zimbabwe color theme

**Backend:**
- Cloudflare Workers
- Hono web framework
- Cloudflare D1 (SQLite)
- Cloudflare Workers AI
- fast-xml-parser for RSS

**Infrastructure:**
- Cloudflare Workers (serverless)
- Cloudflare D1 (database)
- Cloudflare KV (sessions/cache)
- Vercel (mobile web hosting)

## Project Structure

```
/mukoko-news/
├── mobile/                     # React Native + Expo app
│   ├── screens/               # App screens
│   ├── components/            # Reusable components
│   ├── api/                   # Backend API client
│   ├── contexts/              # React contexts
│   └── theme.js               # Zimbabwe color theme
│
├── backend/                    # Cloudflare Worker
│   ├── index.ts               # API routes
│   ├── services/              # Business logic
│   │   ├── SEOService.ts      # SEO metadata generation
│   │   ├── SimpleRSSService.ts
│   │   ├── ArticleAIService.ts
│   │   └── ...
│   └── wrangler.jsonc         # Worker config
│
└── database/
    ├── schema.sql             # Database schema
    └── migrations/            # Schema migrations
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Cloudflare account (for backend)
- Expo CLI (for mobile development)

### Mobile Development

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Start Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Build for web
npm run build
```

### Backend Development

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start local development
npm run dev

# Deploy to Cloudflare
npm run deploy
```

## API Endpoints

### Public Endpoints

```
GET  /api/feeds              # Get paginated articles
GET  /api/categories         # Get all categories
GET  /api/news-bytes         # Get articles with images
GET  /api/search             # Search articles
GET  /api/authors            # Get journalist profiles
```

### SEO Endpoints

```
GET  /sitemap.xml            # Sitemap index
GET  /sitemap-articles.xml   # Articles sitemap
GET  /sitemap-news.xml       # Google News sitemap
GET  /api/seo/article/:slug  # Article OG metadata
GET  /robots.txt             # Robots configuration
```

### Admin Endpoints

```
POST /api/admin/refresh-rss  # Manual RSS refresh
GET  /api/admin/stats        # Platform statistics
POST /api/admin/seo/batch-update  # Update article SEO
```

## Design System

### Zimbabwe Flag Color Palette

- **Green (#00A651)**: Primary actions, success states, growth
- **Yellow (#FDD116)**: Warnings, highlights, mineral wealth
- **Red (#EF3340)**: Errors, urgent actions, heritage
- **Black (#000000)**: Dark backgrounds, strength
- **White (#FFFFFF)**: Light backgrounds, peace

### Typography

- **Headings**: Noto Serif (editorial feel)
- **Body**: Noto Sans (readability)

## Database Schema

**Core Tables:**
- `articles` - News articles with SEO fields
- `categories` - Article categories
- `news_sources` - RSS feed sources
- `authors` - Journalist profiles

**User Tables:**
- `users` - User accounts
- `user_bookmarks` - Saved articles
- `user_likes` - Liked articles
- `user_reading_history` - Reading engagement

**System Tables:**
- `cron_logs` - Background job history
- `system_config` - Platform settings

## Environment Variables

### Backend Worker

```env
NODE_ENV=production
LOG_LEVEL=info
ADMIN_SESSION_SECRET=<set via wrangler secret>
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Make your changes
4. Create a Pull Request (never commit directly to main)

See [CLAUDE.md](./CLAUDE.md) for detailed development guidelines.

## Roadmap

### Phase 2 (In Progress)
- [ ] User authentication flow testing
- [ ] User profile pages
- [ ] Comments and engagement
- [ ] Push notifications

### Phase 3 (Planned)
- [ ] Personalized feed algorithm
- [ ] iOS App Store release
- [ ] Android Play Store release
- [ ] Regional expansion

## License

Copyright 2025 Mukoko News. All rights reserved.

## Acknowledgments

- Built on Cloudflare's edge infrastructure
- Powered by React Native and Expo
- Celebrating Zimbabwe journalism
- Zimbabwe flag colors represent national pride

---

**Mukoko News** - Zimbabwe's news, beautifully delivered.
