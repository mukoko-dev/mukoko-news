# Test Coverage Analysis

Generated: 2025-12-22

## Current Test Coverage Summary

### Backend (3 test files, 90 tests)

| File Tested | Test File | Tests |
|-------------|-----------|-------|
| ArticleService | `services/__tests__/ArticleService.test.ts` | 51 tests (slug generation, reading time, HTML extraction, hashtags) |
| CSRFService | `services/__tests__/CSRFService.test.ts` | 19 tests (token generation, validation, invalidation) |
| RateLimitService | `services/__tests__/RateLimitService.test.ts` | 20 tests (rate limiting, blocking, configuration) |

### Mobile (20 test files)

| Category | Files Tested |
|----------|--------------|
| Components | 12 files (AppHeader, ArticleCard, CategoryChips, ErrorBoundary, ShareModal, UI components) |
| Screens | 6 files (Home, ArticleDetail, Search, NewsBytes, Admin Dashboard, Admin System) |
| Services | 1 file (CacheService) |
| Contexts | 1 file (AuthContext) |

---

## Critical Gaps in Test Coverage

### Priority 1: Backend Services (High Risk)

| Service | Risk Level | Reason |
|---------|------------|--------|
| `AuthProviderService.ts` | **Critical** | RBAC, user management, multi-auth provider - security critical |
| `OIDCAuthService.ts` | **Critical** | JWT validation, token handling - auth bypass risk |
| `oidcAuth.ts` middleware | **Critical** | Role checking, minor blocking - authorization bypass |
| `apiAuth.ts` middleware | **Critical** | API key validation - untested auth layer |
| `SimpleRSSService.ts` | **High** | Core RSS parsing - data integrity for all articles |
| `ContentProcessingPipeline.ts` | **High** | Article ingestion workflow - business logic |

### Priority 2: Backend Services (Medium Risk)

| Service | Risk Level | Reason |
|---------|------------|--------|
| `D1UserService.ts` | Medium | User CRUD operations - data integrity |
| `D1CacheService.ts` | Medium | Caching logic - performance/consistency |
| `NewsSourceService.ts` | Medium | Source management - affects feed quality |
| `MobileAuthService.ts` | Medium | Mobile auth flows - SMS/WhatsApp OTP |
| `CategoryManager.ts` | Medium | Category assignment - affects article discovery |

### Priority 3: Durable Objects

| Durable Object | Status |
|----------------|--------|
| `ArticleInteractionsDO.ts` | ❌ No tests |
| `UserBehaviorDO.ts` | ❌ No tests |
| `RealtimeCountersDO.ts` | ❌ No tests |
| `RealtimeAnalyticsDO.ts` | ❌ No tests |

### Priority 4: Mobile Gaps

| Category | Missing Tests |
|----------|---------------|
| Contexts | `ThemeContext.js` |
| Hooks | `useLocalPreferences.js` |
| Screens | `DiscoverScreen.js`, `InsightsScreen.js`, `OnboardingScreen.js`, `ProfileSettingsScreen.js`, `UserProfileScreen.js` |
| Admin Screens | `AdminSourcesScreen.js`, `AdminAnalyticsScreen.js`, `AdminUsersScreen.js` |
| Components | `CountryPicker.js`, `MasonryGrid.js`, `Logo.js`, `ProfileHeader.js`, `InsightsPromo.js`, `LoginPromo.js` |
| Services | `FaviconService.js`, `LocalPreferencesService.js` |

---

## Recommended Test Improvements

### 1. Add Authentication/Authorization Tests (Critical)

Create new test files:

```
backend/middleware/__tests__/
├── apiAuth.test.ts
└── oidcAuth.test.ts
```

**Tests should cover:**
- Valid/invalid tokens
- Missing Authorization header
- Role-based access control (admin, moderator, user)
- Minor restriction enforcement
- Token expiration handling

### 2. Add Core Service Tests (High Priority)

Create new test files:

```
backend/services/__tests__/
├── AuthProviderService.test.ts
├── OIDCAuthService.test.ts
├── SimpleRSSService.test.ts
└── D1UserService.test.ts
```

### 3. Add Integration Tests (Medium Priority)

Create route-level tests:

```
backend/__tests__/routes/
├── feed.test.ts
├── articles.test.ts
├── admin.test.ts
└── health.test.ts
```

### 4. Improve Mobile Service Tests

- Test actual AsyncStorage interactions with proper mocking
- Add tests for `FaviconService` with fetch mocking
- Add tests for `LocalPreferencesService` persistence

### 5. Add Mobile Navigation Tests

- Tab navigation flows
- Deep linking
- Authentication redirect flows

---

## Test Quality Observations

### Strengths
- Backend tests properly mock KV storage and D1
- Good edge case coverage (error handling, empty inputs)
- Well-structured describe blocks

### Weaknesses
- No integration tests (routes not tested end-to-end)
- ArticleService tests re-implement functions instead of importing them
- Mobile tests don't use proper async mocking for AsyncStorage
- No test coverage for Durable Objects

---

## Quick Wins (Effort vs Impact)

| Improvement | Effort | Impact |
|-------------|--------|--------|
| Add apiAuth middleware tests | Low | High (security) |
| Add oidcAuth middleware tests | Low | High (security) |
| Add SimpleRSSService tests | Medium | High (core feature) |
| Test AuthProviderService role checking | Medium | High (RBAC) |
| Add health endpoint integration test | Low | Medium (CI/smoke test) |

---

## Backend Services Inventory

### Services WITH Tests (3/29)
- ArticleService.ts ✅
- CSRFService.ts ✅
- RateLimitService.ts ✅

### Services WITHOUT Tests (26/29)
- AISearchService.ts
- AnalyticsEngineService.ts
- ArticleAIService.ts
- ArticleInteractionsDO.ts
- AuthProviderService.ts
- AuthorProfileService.ts
- CategoryManager.ts
- CloudflareImagesService.ts
- ContentProcessingPipeline.ts
- CountryService.ts
- D1CacheService.ts
- D1ConfigService.ts
- D1UserService.ts
- EmailService.ts
- MobileAuthService.ts
- NewsSourceManager.ts
- NewsSourceService.ts
- ObservabilityService.ts
- OIDCAuthService.ts
- PersonalizedFeedService.ts
- RealtimeAnalyticsDO.ts
- RealtimeCountersDO.ts
- SEOService.ts
- SimpleRSSService.ts
- UserBehaviorDO.ts
- Web3AuthService.ts

### Middleware WITHOUT Tests (2/2)
- apiAuth.ts
- oidcAuth.ts
