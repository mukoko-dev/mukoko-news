# API Secret Setup Guide

## Overview

The Mukoko News backend API is now protected with bearer token authentication. Only authorized clients (the Vercel frontend) can access the API endpoints.

## Architecture

```
Mobile App (Vercel) → Bearer Token → Backend API (Cloudflare Workers)
```

- **Protected Routes**: All `/api/*` endpoints (except `/api/health` and `/api/admin/*`)
- **Public Routes**: `/api/health`, `/api/admin/*` (has separate admin auth)
- **Authentication Methods**:
  1. API_SECRET bearer token (for frontend-to-backend auth)
  2. OIDC JWT bearer token (for authenticated user requests)

## Production Secret

The API secret has been set in production:

```
API_SECRET: 19482d51c865fcda11c56ee6a17ed70c
```

This secret is:
- ✅ Set in Cloudflare Workers via `wrangler secret put API_SECRET`
- ✅ Set in local `.env.local` for development
- ⚠️ **MUST BE SET IN VERCEL** for production deployment

## Vercel Setup Instructions

### 1. Add Environment Variable in Vercel

Go to your Vercel project settings:

1. Navigate to: **Settings** → **Environment Variables**
2. Add new variable:
   - **Name**: `EXPO_PUBLIC_API_SECRET`
   - **Value**: `19482d51c865fcda11c56ee6a17ed70c`
   - **Environments**: Production, Preview, Development (check all)

3. Click **Save**

### 2. Redeploy

After adding the environment variable, redeploy your Vercel app:

```bash
# Option 1: Trigger redeploy via Git
git commit --allow-empty -m "Add API_SECRET environment variable"
git push

# Option 2: Redeploy via Vercel CLI
vercel --prod
```

## Testing

**API URL**: `https://mukoko-news-backend.nyuchi.workers.dev`

### Without Token (Should Fail)

```bash
curl https://mukoko-news-backend.nyuchi.workers.dev/api/feeds
# Response: {"error":"Unauthorized","message":"Valid API key or user token required..."}
```

### With Token (Should Work)

```bash
curl -H "Authorization: Bearer 19482d51c865fcda11c56ee6a17ed70c" \
  https://mukoko-news-backend.nyuchi.workers.dev/api/feeds
# Response: {"articles":[...]}
```

### Health Endpoint (Always Public)

```bash
curl https://mukoko-news-backend.nyuchi.workers.dev/api/health
# Response: {"status":"healthy","security":{"apiAuthEnabled":true,...}}
```

## How It Works

### Mobile App Client (mobile/api/client.js)

The mobile app automatically includes the API secret in requests:

```javascript
// Priority: User OIDC token > API Secret
const authHeader = token
  ? `Bearer ${token}`  // User authenticated - use their token
  : API_SECRET
    ? `Bearer ${API_SECRET}`  // No user token - use API secret
    : undefined;
```

### Backend Middleware (backend/middleware/apiAuth.ts)

The backend validates tokens:

```typescript
// Accepts either:
// 1. API_SECRET (exact match)
// 2. JWT token (OIDC user token - validated by separate middleware)
const isApiSecret = token && token === apiSecret;
const isJWT = token && token.split('.').length === 3;
const isValid = isApiSecret || isJWT;
```

## Security Notes

- ⚠️ **Keep this secret private** - Do not commit to Git
- ⚠️ **Rotate periodically** - Generate new secrets for production
- ✅ Health endpoint remains public for monitoring
- ✅ Admin endpoints have separate authentication
- ✅ User OIDC tokens take priority over API secret

## Rotating the Secret

To generate a new API secret:

```bash
# 1. Generate new secret
NEW_SECRET=$(openssl rand -hex 16)
echo "New secret: $NEW_SECRET"

# 2. Update Cloudflare Workers
cd backend
echo "$NEW_SECRET" | npx wrangler secret put API_SECRET

# 3. Update Vercel environment variable
# (Do this via Vercel dashboard)

# 4. Update .env.local for development
echo "EXPO_PUBLIC_API_SECRET=\"$NEW_SECRET\"" >> .env.local
```

## Troubleshooting

### Mobile app returns 401 Unauthorized

**Solution**: Ensure `EXPO_PUBLIC_API_SECRET` is set in Vercel and matches the Cloudflare Workers secret.

### Environment variable not found

**Solution**: Restart the Expo dev server after adding the secret to `.env.local`:
```bash
npm run mobile
```

### Vercel deployment fails

**Solution**: Ensure the environment variable is added to **all environments** (Production, Preview, Development).

## References

- Backend middleware: [backend/middleware/apiAuth.ts](backend/middleware/apiAuth.ts)
- Mobile app client: [mobile/api/client.js](mobile/api/client.js)
- Wrangler config: [backend/wrangler.jsonc](backend/wrangler.jsonc)
