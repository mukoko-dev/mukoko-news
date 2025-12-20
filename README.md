# Mukoko News

> **Africa's Digital News Aggregation Platform**

"Mukoko" means "Beehive" in Shona - where community gathers and stores knowledge. A modern Pan-African news platform built with React Native (Expo) and Cloudflare Workers.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## 🌍 Overview

Mukoko News aggregates news from 56+ Pan-African sources across 16 countries, providing a unified platform for staying informed about African affairs. Features include:

- **TikTok-Style Feed Refresh**: Pull-to-refresh RSS collection with real-time feedback
- **Pan-African Coverage**: News from Zimbabwe, South Africa, Kenya, Nigeria, Ghana, and 11 more countries
- **Offline-First**: Articles cached in IndexedDB for reading without internet
- **Smart Personalization**: AI-powered article recommendations based on reading history
- **Real-Time Analytics**: Durable Objects for live engagement tracking

## 📁 Project Structure

```text
mukoko-news/
├── backend/           # Cloudflare Workers API (Hono framework)
├── mobile/           # React Native Expo app (iOS, Android, Web)
├── database/         # D1 schema and migrations
├── CLAUDE.md         # AI assistant instructions
└── API_SECRET_SETUP.md  # API authentication setup guide
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- Cloudflare account (for backend)
- Expo CLI (for mobile)

### Backend Setup

```bash
# Install dependencies
npm install

# Apply database schema
npm run db:local

# Start development server
npm run dev

# Deploy to Cloudflare
npm run deploy
```

### Mobile App Setup

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies (use legacy peer deps for React Native)
npm install --legacy-peer-deps

# Start Expo dev server
npm start

# Run on specific platform
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser
```

### Environment Variables

Create `.env.local` in the root directory:

```env
# Vercel OIDC Token (for local development)
VERCEL_OIDC_TOKEN="your_token_here"

# Mukoko News Backend API Secret
EXPO_PUBLIC_API_SECRET="your_api_secret_here"
```

**Security Note**: See [API_SECRET_SETUP.md](API_SECRET_SETUP.md) for complete authentication setup.

## 🏗️ Architecture

### Backend Stack

- **Runtime**: Cloudflare Workers (edge computing)
- **Framework**: Hono (lightweight, ~12KB)
- **Database**: D1 (SQLite at edge)
- **Cache**: KV Namespaces
- **Real-time**: Durable Objects (4 classes)
- **AI**: Workers AI for content processing
- **Search**: Vectorize for semantic search
- **Auth**: OIDC via id.mukoko.com

### Mobile Stack

- **Framework**: React Native 0.81.5 via Expo 54
- **UI**: React Native Paper (Material Design)
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State**: Context API (AuthContext, ThemeContext)
- **Storage**: AsyncStorage + IndexedDB (web)

### Design System (Nyuchi Brand v6)

```javascript
{
  primary: '#4B0082',    // Tanzanite
  secondary: '#0047AB',  // Cobalt
  accent: '#5D4037',     // Gold
  surface: '#FAF9F5',    // Warm Cream
  fonts: {
    heading: 'Noto Serif',
    body: 'Plus Jakarta Sans'
  }
}
```

## 🔐 Security

All `/api/*` endpoints are protected with bearer token authentication:

- **Frontend Auth**: API_SECRET bearer token (Vercel → Workers)
- **User Auth**: OIDC JWT tokens (id.mukoko.com)
- **Public Routes**: `/api/health` (monitoring)
- **Admin Routes**: `/api/admin/*` (separate admin auth)

See [API_SECRET_SETUP.md](API_SECRET_SETUP.md) for setup instructions.

## 📊 Database

**Schema**: 17 migrations, 15+ tables

**Key Tables**:

- `articles` - News articles with full metadata
- `rss_sources` - 56 Pan-African RSS feeds
- `categories` - News categories (Politics, Business, Tech, etc.)
- `countries` - 16 African countries supported
- `users` - User accounts with OIDC integration
- `user_interactions` - Likes, saves, views, reading time

**Roles** (RBAC):

- `admin` - Full system access (active)
- `moderator`, `support`, `author`, `user` (currently disabled)

## 🔌 API Endpoints

**Base URL**: `https://mukoko-news-backend.nyuchi.workers.dev`

### Public Endpoints (Require API Key)

```bash
# Get articles feed
GET /api/feeds?limit=20&category=politics&countries=ZW,SA

# Get personalized feed (authenticated users)
GET /api/feeds/personalized?limit=30&excludeRead=true

# Trigger RSS collection (TikTok-style refresh)
POST /api/feed/collect

# Initialize Pan-African RSS sources
POST /api/feed/initialize-sources

# Get article by ID
GET /api/article/:id

# Get categories
GET /api/categories

# Get countries (Pan-African)
GET /api/countries

# Health check (no auth required)
GET /api/health
```

### Admin Endpoints (Require Admin Role)

```bash
# Get admin dashboard stats
GET /api/admin/stats

# Manage users
GET /api/admin/users
PUT /api/admin/users/:id/role
PUT /api/admin/users/:id/status

# Manage RSS sources
GET /api/admin/sources
PUT /api/admin/rss-source/:id

# Analytics
GET /api/admin/analytics
GET /api/admin/category-insights?days=7
```

Full API documentation: [api-schema.yml](api-schema.yml)

## 🧪 Testing

### Backend Tests

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

**Test Framework**: Vitest (10s timeout per test)

### Mobile Tests

```bash
cd mobile
npm test
```

**Test Framework**: Jest

## 🚢 Deployment

### Backend (Cloudflare Workers)

```bash
npm run deploy
```

**Note**: Manual deployment only (not CI/CD). GitHub Actions runs tests on PRs but does not auto-deploy.

### Mobile Web (Vercel)

```bash
npm run mobile:deploy
```

Deployed to: `https://news.mukoko.com`

## 📝 Common Commands

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

### Backend

```bash
cd backend
npm run dev              # wrangler dev (local worker)
npm run deploy           # Deploy to Cloudflare Workers
npm run test             # vitest run
npm run test:watch       # vitest (watch mode)
npm run typecheck        # tsc --noEmit
npm run db:migrate       # Apply schema to remote D1
npm run db:local         # Apply schema to local D1
```

### Mobile

```bash
cd mobile
npm start                # Expo dev server
npm run ios              # iOS simulator
npm run android          # Android emulator
npm run web              # Web browser
npm run build            # Export for web (Vercel)
npm run test             # Jest tests
```

## 🎨 Features

### Core Features

- ✅ **Multi-Platform**: iOS, Android, Web (responsive)
- ✅ **Offline-First**: IndexedDB caching for offline reading
- ✅ **Real-Time**: Durable Objects for live engagement
- ✅ **AI-Powered**: Semantic search with Vectorize
- ✅ **Pan-African**: 16 countries, 56+ news sources
- ✅ **OIDC Auth**: Secure authentication via id.mukoko.com

### Recent Updates

- ✅ TikTok-style pull-to-refresh feed collection
- ✅ Bearer token API authentication
- ✅ Fixed tab bar icon colors
- ✅ Country picker visibility improvements
- ✅ Article engagement bar component
- ✅ Share modal component

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes and test
4. Run pre-commit checks: `npm run lint && npm run test`
5. Commit with conventional commits: `feat: Add new feature`
6. Push and create a Pull Request

### Code Style

- ESLint configuration: Flat config (ESLint 9)
- Pre-commit hooks: TypeScript check + Build validation
- Commit format: Conventional Commits

## 📖 Documentation

- [CLAUDE.md](CLAUDE.md) - AI assistant instructions
- [API_SECRET_SETUP.md](API_SECRET_SETUP.md) - API authentication setup
- [api-schema.yml](api-schema.yml) - OpenAPI specification
- [database/schema.sql](database/schema.sql) - Database schema

## 📜 License

MIT License - see [LICENSE](LICENSE) for details

## 🐝 About Mukoko

"Ndiri nekuti tiri" — I am because we are

Mukoko ("Beehive" in Shona) represents the collective knowledge and community of Africa. Just as bees work together to create something greater than themselves, Mukoko News brings together voices from across the continent to inform and empower African communities.

---

Built with ❤️ by [Nyuchi Technologies](https://brand.nyuchi.com)
