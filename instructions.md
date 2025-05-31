# 📚 Harare Metro - Setup & Usage Instructions

This guide provides detailed instructions for setting up, deploying, and maintaining the Harare Metro news aggregation site.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Cloudflare Configuration](#cloudflare-configuration)
- [Deployment](#deployment)
- [Development](#development)
- [Maintenance](#maintenance)
- [Troubleshooting](#troubleshooting)
- [Command Reference](#command-reference)
- [Contributing](#contributing)

## Prerequisites

- **Node.js** 16+ installed
- **Cloudflare account** (free tier works)
- **GitHub account**
- **Git** installed
- **npm** or **yarn** package manager

## Initial Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/nyuchitech/harare-metro.git
cd harare-metro

# Install dependencies
npm install

# Or use the automated setup script
chmod +x setup.sh
./setup.sh
```

### 2. Cloudflare Authentication

```bash
# Login to Cloudflare (one-time setup)
npx wrangler login

# Verify authentication
npm run whoami
```

### 3. Create KV Namespace

```bash
# Create KV namespace for production
npx wrangler kv namespace create "NEWS_STORAGE"

# Create KV namespace for preview/development
npx wrangler kv namespace create "NEWS_STORAGE" --preview

# List your namespaces to get the IDs
npm run kv:list
```

### 4. Update Configuration

Update `wrangler.toml` with your KV namespace IDs:

```toml
[[kv_namespaces]]
binding = "NEWS_STORAGE"
preview_id = "your-preview-kv-id-here"  # Replace with your preview ID
id = "your-production-kv-id-here"       # Replace with your production ID
```

### 5. Update API Endpoints

In `index.html`, `privacy.html`, and `terms.html`, replace `YOUR_WORKER_URL`:

```javascript
// Replace this:
var API_BASE = 'YOUR_WORKER_URL';

// With your actual worker URL:
var API_BASE = 'https://harare-metro-worker.nyuchi.workers.dev';
```

## Cloudflare Configuration

### Worker Deployment

```bash
# Deploy to production
npm run deploy

# Deploy to staging environment
npm run deploy:staging

# Force deployment (skip build cache)
npm run deploy:force
```

### Pages Setup

1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Connect your GitHub repository
3. Configure build settings:
   - **Build command**: `echo "Static site"`
   - **Build output directory**: `/`
   - **Root directory**: `/`
4. Add environment variables if needed
5. Deploy!

### Custom Domain Setup

1. Add custom domain in Cloudflare Pages settings
2. Update DNS records:
   ```
   Type: CNAME
   Name: @
   Content: harare-metro.pages.dev
   ```
3. Enable SSL/TLS

## Development

### Local Development

```bash
# Start worker in development mode
npm run dev

# Worker will be available at:
# http://localhost:8787

# Test API endpoints locally:
# http://localhost:8787/api/news
# http://localhost:8787/api/update
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Viewing Logs

```bash
# View live logs
npm run logs

# View logs with pretty formatting
npm run logs:pretty

# View logs for specific worker
npx wrangler tail harare-metro-worker
```

## Maintenance

### Manual Feed Update

```bash
# Trigger manual RSS feed update
curl -X GET "https://your-worker-url.workers.dev/api/update"
```

### Check Stored Data

```bash
# Get your KV namespace ID first
npm run kv:list

# List all keys in KV storage
npx wrangler kv key list --namespace-id=your-namespace-id

# Get stored articles
npx wrangler kv key get "articles" --namespace-id=your-namespace-id

# Get last update info
npx wrangler kv key get "last_update" --namespace-id=your-namespace-id
```

### Deployment Management

```bash
# List all deployments
npm run deployments

# Rollback to previous version (via dashboard)
# Go to Workers > your-worker > Deployments > Rollback
```

### Security Updates

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm run audit-fix

# Update all dependencies
npm run update-deps
```

## Troubleshooting

### Common Issues

#### Worker Not Deploying

```bash
# Check authentication
npm run whoami

# Check wrangler version
npx wrangler --version

# Update wrangler
npm install wrangler@latest --save-dev
```

#### KV Namespace Errors

```bash
# Verify KV namespace exists
npm run kv:list

# Check binding in wrangler.toml matches
cat wrangler.toml | grep NEWS_STORAGE
```

#### RSS Feeds Not Updating

1. Check cron schedule in `wrangler.toml`:
   ```toml
   [triggers]
   crons = ["0 * * * *"]  # Should run every hour
   ```

2. Check worker logs for errors:
   ```bash
   npm run logs
   ```

3. Manually trigger update:
   ```bash
   curl -X GET "https://your-worker-url.workers.dev/api/update"
   ```

#### CORS Issues

Ensure CORS headers are present in worker responses:

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
```

### Debug Commands

```bash
# Check worker status
curl -I https://your-worker-url.workers.dev

# Test specific RSS feed
curl -I https://www.herald.co.zw/feed/

# Check KV storage usage
npx wrangler kv key list --namespace-id=your-id | wc -l

# View worker metrics (in Cloudflare dashboard)
# Workers > Analytics
```

## Command Reference

### npm Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local development server |
| `npm run deploy` | Deploy to production |
| `npm run deploy:staging` | Deploy to staging environment |
| `npm run deploy:force` | Force deployment |
| `npm test` | Run tests |
| `npm run lint` | Check code style |
| `npm run lint:fix` | Fix code style issues |
| `npm run logs` | View live worker logs |
| `npm run logs:pretty` | View formatted logs |
| `npm run deployments` | List deployments |
| `npm run whoami` | Check Cloudflare auth |
| `npm run kv:list` | List KV namespaces |
| `npm audit` | Check for vulnerabilities |
| `npm run audit-fix` | Fix vulnerabilities |
| `npm run update-deps` | Update dependencies |

### Wrangler Commands

| Command | Description |
|---------|-------------|
| `wrangler login` | Authenticate with Cloudflare |
| `wrangler whoami` | Check authentication status |
| `wrangler deploy` | Deploy worker |
| `wrangler dev` | Start local dev server |
| `wrangler tail` | View live logs |
| `wrangler deployments list` | List deployments |
| `wrangler kv namespace list` | List KV namespaces |
| `wrangler kv namespace create NAME` | Create KV namespace |
| `wrangler kv key list --namespace-id=ID` | List keys in namespace |
| `wrangler kv key get KEY --namespace-id=ID` | Get value for key |
| `wrangler kv key put KEY VALUE --namespace-id=ID` | Set key value |
| `wrangler kv key delete KEY --namespace-id=ID` | Delete key |

## Configuration Options

### Update Frequency

Modify cron schedule in `wrangler.toml`:

```toml
[triggers]
# Every hour (default)
crons = ["0 * * * *"]

# Every 30 minutes
crons = ["*/30 * * * *"]

# Every 2 hours
crons = ["0 */2 * * *"]

# Twice daily (8 AM and 8 PM)
crons = ["0 8,20 * * *"]
```

### Add New RSS Sources

Edit `RSS_SOURCES` in `worker.js`:

```javascript
const RSS_SOURCES = [
  {
    name: 'New Zimbabwe',
    url: 'https://www.newzimbabwe.com/feed/',
    category: 'general'
  },
  // ... existing sources
];
```

### Customize Categories

Update `CATEGORY_KEYWORDS` in `worker.js`:

```javascript
const CATEGORY_KEYWORDS = {
  politics: ['parliament', 'government', 'election'],
  economy: ['economy', 'inflation', 'currency'],
  business: ['business', 'company', 'market'],
  sports: ['sport', 'football', 'cricket'],
  harare: ['harare', 'capital', 'city council'],
  // Add new category
  technology: ['tech', 'software', 'internet', 'mobile']
};
```

## GitHub Actions Setup

### Required Secrets

Add these in GitHub repository settings → Secrets:

1. **CLOUDFLARE_API_TOKEN**
   - Go to Cloudflare → My Profile → API Tokens
   - Create token with `Edit Cloudflare Workers` permission

2. **CLOUDFLARE_ACCOUNT_ID**
   - Find in Cloudflare dashboard → Right sidebar

### Workflow Customization

Edit `.github/workflows/deploy.yml` to:

- Change deployment branches
- Modify build steps
- Add testing stages
- Configure notifications

## Performance Optimization

### Worker Optimization

1. **Limit RSS sources** to reduce processing time
2. **Cache responses** using Cloudflare Cache API
3. **Implement pagination** for large result sets

### Frontend Optimization

1. **Lazy load** images if added
2. **Minify** CSS and JavaScript
3. **Use CDN** for external libraries

## Monitoring

### Cloudflare Analytics

Monitor via dashboard:
- **Workers Analytics** - Request count, errors, CPU time
- **Pages Analytics** - Page views, unique visitors
- **KV Analytics** - Storage operations

### Custom Monitoring

```javascript
// Add to worker.js for custom metrics
console.log(JSON.stringify({
  type: 'metric',
  name: 'rss_update',
  value: processedArticles.length,
  timestamp: Date.now()
}));
```

## Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Make changes and test locally:
   ```bash
   npm run dev
   npm test
   ```
4. Commit changes:
   ```bash
   git add .
   git commit -m "Add amazing feature"
   ```
5. Push to your fork:
   ```bash
   git push origin feature/amazing-feature
   ```
6. Open Pull Request

### Code Style

- Use ESLint configuration
- Follow existing patterns
- Add tests for new features
- Update documentation

### Reporting Issues

1. Check existing issues first
2. Use issue templates
3. Include:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment details

## Advanced Topics

### Using Durable Objects

For real-time features:

```javascript
// In wrangler.toml
[durable_objects]
bindings = [{name = "COUNTER", class_name = "Counter"}]
```

### Implementing Cache

```javascript
// Add caching to worker
const cache = caches.default;
const cacheKey = new Request(url.toString(), request);
const cachedResponse = await cache.match(cacheKey);

if (cachedResponse) {
  return cachedResponse;
}
```

### Rate Limiting

```javascript
// Simple rate limiting
const ip = request.headers.get('CF-Connecting-IP');
const rateLimitKey = `rate_limit:${ip}`;
const requests = await env.NEWS_STORAGE.get(rateLimitKey);

if (requests && parseInt(requests) > 100) {
  return new Response('Rate limit exceeded', { status: 429 });
}
```

## Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/cli-wrangler/)
- [KV Storage Docs](https://developers.cloudflare.com/kv/)
- [Pages Docs](https://developers.cloudflare.com/pages/)

---

For more help, contact [hello@nyuchi.com](mailto:hello@nyuchi.com) or open an issue on GitHub.