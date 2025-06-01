# Harare Metro - Zimbabwe News Aggregator

A modern news aggregation platform built with React and Cloudflare Workers, specifically designed to aggregate news from major Zimbabwe news sources.

## 🌟 Features

- **Real-time News Aggregation**: Fetches latest articles from multiple Zimbabwe news sources
- **Category Filtering**: Filter news by category (General, Business, Technology, etc.)
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Fast Loading**: Built on Cloudflare Workers for global edge deployment
- **RSS Feed Processing**: Intelligent RSS/XML parsing with error handling
- **Caching**: Automatic feed caching with scheduled updates every 6 hours

## 🏗️ Architecture

- **Frontend**: React SPA with Tailwind CSS
- **Backend**: Cloudflare Worker with KV storage
- **Build Tool**: Vite for fast development and optimized builds
- **Deployment**: Single Cloudflare Worker serving both frontend and API

## 📰 News Sources

- Herald Zimbabwe
- NewsDay Zimbabwe  
- Chronicle Zimbabwe
- ZBC News
- Business Weekly
- Techzim
- The Standard
- ZimLive

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Cloudflare account with Workers enabled
- Wrangler CLI installed globally: `npm install -g wrangler`

### Installation

1. **Clone and setup the repository**:
   ```bash
   git clone <your-repo-url>
   cd harare-metro
   npm install
   ```

2. **Configure Cloudflare KV**:
   ```bash
   # Create KV namespaces
   wrangler kv:namespace create "NEWS_STORAGE"
   wrangler kv:namespace create "NEWS_STORAGE" --preview
   
   # Update wrangler.toml with the returned namespace IDs
   ```

3. **Start development**:
   ```bash
   # Option 1: Use helper script
   ./scripts/dev-start.sh
   
   # Option 2: Manual (two terminals)
   npm run dev          # Terminal 1: React dev server
   npm run dev:worker   # Terminal 2: Worker dev server
   ```

4. **Open your browser**:
   - React App: http://localhost:5173
   - Worker API: http://localhost:8787

### Deployment

1. **Login to Wrangler**:
   ```bash
   wrangler login
   ```

2. **Deploy**:
   ```bash
   npm run deploy
   ```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start Vite dev server
- `npm run dev:worker` - Start Wrangler dev server  
- `npm run dev:both` - Start both servers (uses helper script)
- `npm run build` - Build for production
- `npm run deploy` - Build and deploy to Cloudflare
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── components/          # React components
│   ├── Header.jsx
│   ├── NewsCard.jsx
│   ├── CategoryFilter.jsx
│   └── LoadingSpinner.jsx
├── hooks/              # Custom React hooks
│   └── useFetchFeeds.js
├── App.jsx             # Main app component
├── main.jsx           # React entry point
└── index.css          # Global styles

worker/
└── index.js           # Cloudflare Worker code

scripts/
├── dev-start.sh       # Development helper
├── build.sh          # Build script
└── deploy.sh         # Deployment script
```

## 🔧 Configuration

### Environment Variables

Update `wrangler.toml` with your KV namespace IDs:

```toml
[[kv_namespaces]]
binding = "NEWS_STORAGE"
id = "your-production-kv-id"
preview_id = "your-preview-kv-id"
```

### Adding News Sources

Edit the `RSS_SOURCES` array in `worker/index.js`:

```javascript
const RSS_SOURCES = [
  {
    name: 'Your News Source',
    url: 'https://example.com/feed/',
    category: 'general',
    enabled: true
  }
]
```

## 📡 API Endpoints

- `GET /api/feeds` - Get all latest news feeds
- `GET /api/feeds/sources` - Get list of RSS sources
- `GET /api/feeds/cached` - Get cached feeds with metadata
- `GET /api/health` - Health check endpoint

## 🔄 Scheduled Updates

Feeds are automatically updated every 6 hours using Cloudflare Cron Triggers. You can modify the schedule in `wrangler.toml`:

```toml
[triggers]
crons = ["0 */6 * * *"]  # Every 6 hours
```

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Run `./scripts/dev-start.sh` which automatically handles port cleanup
2. **KV namespace errors**: Ensure you've created KV namespaces and updated `wrangler.toml`
3. **Build failures**: Check Node.js version (requires 18+)
4. **CORS issues**: API includes proper CORS headers for development

### Development Tips

- Use browser dev tools to monitor API calls
- Check Wrangler terminal for Worker logs
- RSS feeds may occasionally be unavailable - this is handled gracefully
- Use `npm run build:check` to test builds without deployment

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section above
- Review Cloudflare Workers documentation
- Open an issue on GitHub

---

Built with ❤️ for Zimbabwe's news ecosystem
