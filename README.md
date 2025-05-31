# 🏙️ Harare Metro

A fast, mobile-first news aggregation site focused on Harare and Zimbabwe news. Built with Cloudflare Workers and Pages for maximum performance and global reach.

## ✨ Features

- **📱 Mobile-First Design** - Optimized for quick information access on mobile devices
- **🔍 Smart Search** - Search through article titles, summaries, and keywords
- **🏷️ Category Filtering** - Filter by Politics, Economy, Harare, Sports, Business
- **🌙 Dark/Light Mode** - Toggle between themes with persistence
- **📤 Social Sharing** - Quick sharing to WhatsApp, Twitter, and Facebook
- **⚡ Fast Loading** - Static site with edge-cached API responses
- **🔄 Auto Updates** - RSS feeds updated hourly via Cron triggers
- **🎯 Smart Ranking** - Articles ranked by Harare/Zimbabwe relevance

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Repo   │───▶│ Cloudflare Pages│───▶│ harare-metro.co │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                ▲
                                │
                       ┌─────────────────┐    ┌─────────────────┐
                       │Cloudflare Worker│───▶│ RSS Aggregation │
                       └─────────────────┘    └─────────────────┘
                                ▲
                                │
                       ┌─────────────────┐
                       │  Cloudflare KV  │
                       │ (Article Storage)│
                       └─────────────────┘
```

## 📁 Project Structure

```
harare-metro/
├── index.html              # Main news feed page
├── privacy.html            # Privacy policy page
├── terms.html              # Terms of service page
├── worker.js               # Cloudflare Worker (RSS aggregation)
├── wrangler.toml           # Cloudflare configuration
├── package.json            # Dependencies & scripts
├── setup.sh                # Automated setup script
├── worker.test.js          # Tests for Worker functionality
├── .github/workflows/
│   └── deploy.yml          # Auto-deployment pipeline
├── .gitignore              # Git ignore rules
├── LICENSE                 # MIT License
└── README.md               # This file
```

## 🚀 Quick Setup

### Prerequisites

- Node.js 16+ installed
- Cloudflare account (free tier works)
- GitHub account
- Git installed

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/harare-metro.git
cd harare-metro

# Install dependencies
npm install

# Login to Cloudflare (one-time setup)
npx wrangler login
```

### 2. Create Cloudflare Resources

```bash
# Create KV namespace for article storage
npx wrangler kv:namespace create "NEWS_STORAGE"
npx wrangler kv:namespace create "NEWS_STORAGE" --preview

# Note the IDs returned and update wrangler.toml
```

### 3. Update Configuration

1. **Update `wrangler.toml`** with your KV namespace IDs:
```toml
[[kv_namespaces]]
binding = "NEWS_STORAGE"
preview_id = "your-preview-kv-id-here"
id = "your-production-kv-id-here"
```

2. **Update `index.html`** with your Worker URL:
```javascript
// Replace YOUR_WORKER_URL with your actual worker URL
const API_BASE = 'https://zimbabwe-news-worker.your-subdomain.workers.dev';
```

### 4. Deploy Worker

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy

# Test the deployment
curl https://harare-metro-worker.harare-metro.workers.dev/api/news
```

### 5. Setup GitHub Actions

1. Go to your GitHub repository settings
2. Add these secrets:
   - `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

3. Update the workflow file URLs with your actual domains

### 6. Deploy to Cloudflare Pages

1. Connect your GitHub repo to Cloudflare Pages
2. Set build settings:
   - Build command: `echo "Static site - no build needed"`
   - Output directory: `/`
3. Deploy!

## 🛠️ Development

### Local Development

```bash
# Start the worker locally
npm run dev

# Test RSS feed updates
npm run update-feeds

# View worker logs
npm run logs
```

### Adding New RSS Sources

Edit the `RSS_SOURCES` array in `worker.js`:

```javascript
const RSS_SOURCES = [
  {
    name: 'Your News Source',
    url: 'https://yournews.co.zw/feed/',
    category: 'general'
  },
  // ... existing sources
];
```

### Debugging & Troubleshooting

```bash
# Check worker status
wrangler deployments

# View live logs
wrangler tail --format=pretty

# Test worker locally
wrangler dev
# Then visit: http://localhost:8787/api/news

# Validate configuration
wrangler whoami              # Verify you're logged in
cat wrangler.toml           # Check configuration

# KV Storage debugging
wrangler kv namespace list                    # List your namespaces
wrangler kv key list --namespace-id=<ID>     # Check stored data
wrangler kv key get "articles" --namespace-id=<ID>  # View articles

# Force redeploy
wrangler deploy --force

# Check account limits
wrangler whoami --json      # Get account details
```

### Common Issues & Solutions

**Issue: "Namespace not found"**
```bash
# List your KV namespaces
wrangler kv namespace list
# Update wrangler.toml with correct IDs
```

**Issue: "Authentication failed"**
```bash
# Re-authenticate
wrangler logout
wrangler login
```

**Issue: "Worker not updating"**
```bash
# Check deployment status
wrangler deployments
# Force deploy
wrangler deploy --force
```

**Issue: "RSS feeds not updating"**
```bash
# Check cron triggers
wrangler triggers
# Manual update trigger
curl -X GET "https://harare-metro-worker.harare-metro.workers.dev/api/update"
```

### Customizing Categories

Update the `CATEGORY_KEYWORDS` object in `worker.js`:

```javascript
const CATEGORY_KEYWORDS = {
  politics: ['parliament', 'government', 'election'],
  economy: ['economy', 'inflation', 'currency'],
  // ... add your categories
};
```

## 📊 Monitoring

### Check Feed Updates

```bash
# View last update status
curl https://your-worker-url.workers.dev/api/update

# Check stored articles
curl https://your-worker-url.workers.dev/api/news
```

### Cloudflare Analytics

Monitor your site performance:
- **Pages Analytics** - Page views, unique visitors
- **Workers Analytics** - API requests, response times
- **KV Analytics** - Storage usage

## 🔧 Configuration Options

### Update Frequency

Modify the cron schedule in `wrangler.toml`:

```toml
[triggers]
crons = ["0 */2 * * *"]  # Every 2 hours
# crons = ["0 8,20 * * *"]  # Twice daily at 8 AM and 8 PM
```

### RSS Source Timeout

Adjust fetch timeout in `worker.js`:

```javascript
const response = await fetch(source.url, {
  headers: {
    'User-Agent': 'ZimbabweNews/1.0'
  },
  // Add timeout if needed
  signal: AbortSignal.timeout(10000) // 10 seconds
});
```

## 🎨 Customization

### Colors and Styling

Update CSS variables in `index.html`:

```css
:root {
  --primary: #1e3a8a;        /* Navy blue */
  --bg-light: #ffffff;       /* White background */
  --bg-dark: #2d2d2d;        /* Charcoal background */
}
```

### News Sources

Current sources include:
- Herald Zimbabwe
- NewsDay Zimbabwe
- Chronicle Zimbabwe
- ZBC News
- Business Weekly
- Zimbabwe Independent

Add more by updating the `RSS_SOURCES` array.

## 🔒 Security

- **No API Keys Exposed** - All processing happens server-side
- **CORS Enabled** - Secure cross-origin requests
- **Rate Limiting** - Built-in Cloudflare protection
- **Input Sanitization** - HTML tags stripped from RSS content

## 📈 Performance

Expected performance metrics:
- **Page Load Speed**: < 2 seconds on 3G
- **API Response Time**: < 500ms globally
- **Lighthouse Score**: 90+ on mobile
- **Uptime**: 99.9% (Cloudflare SLA)

## 🔍 Quick Commands Reference

```bash
# 🚀 Essential Commands
npm run dev              # Start local development
npm run deploy           # Deploy to production
npm run logs             # View live logs
npm run deployments     # Check deployment status

# 🛠️ Development Workflow
wrangler dev             # Local development server
wrangler deploy          # Deploy to Cloudflare
wrangler tail            # Real-time logs
wrangler deployments    # Deployment history

# 🗂️ KV Storage Commands
npm run kv:list                              # List KV namespaces
wrangler kv key list --namespace-id=<ID>    # List stored keys
wrangler kv key get "articles" --namespace-id=<ID>  # Get articles data

# 🔧 Maintenance
npm run deploy:force     # Force redeploy
npm run whoami          # Check authentication
npm run audit           # Security audit
```

## 🐛 Troubleshooting

### Worker Not Updating

```bash
# Check cron triggers
npx wrangler cron-trigger list

# Manual update
curl -X GET "https://your-worker-url.workers.dev/api/update"
```

### RSS Feed Issues

```bash
# Check worker logs
npm run logs

# Test individual feeds
curl -I "https://www.herald.co.zw/feed/"
```

### Deployment Issues

```bash
# Verify wrangler authentication
npx wrangler whoami

# Check KV namespaces
npx wrangler kv:namespace list
```

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/harare-metro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/harare-metro/discussions)
- **Email**: your-email@example.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📸 Screenshots

### Mobile View
![Mobile Screenshot](docs/mobile-view.png)

### Desktop View
![Desktop Screenshot](docs/desktop-view.png)

### Dark Mode
![Dark Mode Screenshot](docs/dark-mode.png)

---

Built with ❤️ for Harare 🏙️