# 🏙️ Harare Metro

A fast, mobile-first news aggregation site focused on Harare and Zimbabwe news. Built with Cloudflare Workers and Pages for maximum performance and global reach.

**🌐 Live Site:** [https://harare-metro.co.zw](https://harare-metro.co.zw)

**Created by Nyuchi Web Services**  
**Lead Developer:** Bryan Fawcett (@bryanfawcett)

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
├── setup.sh                # Automated setup script ⭐
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

### 1. Use Setup Script (Recommended)

```bash
# Download and run the setup script
curl -O https://raw.githubusercontent.com/nyuchitech/harare-metro/main/setup.sh
chmod +x setup.sh
./setup.sh

# Or clone the repository first
git clone https://github.com/nyuchitech/harare-metro.git
cd harare-metro
chmod +x setup.sh && ./setup.sh
```

### 2. Manual Setup

```bash
# Clone the repository
git clone https://github.com/nyuchitech/harare-metro.git
cd harare-metro

# Install dependencies
npm install

# Login to Cloudflare (one-time setup)
npx wrangler login
```

### 3. Create Cloudflare Resources

```bash
# Create KV namespace for article storage
npx wrangler kv:namespace create "NEWS_STORAGE"
npx wrangler kv:namespace create "NEWS_STORAGE" --preview

# Note the IDs returned and update wrangler.toml
```

### 4. Update Configuration

1. **Update `wrangler.toml`** with your KV namespace IDs:
```toml
[[kv_namespaces]]
binding = "NEWS_STORAGE"
preview_id = "your-preview-kv-id-here"
id = "your-production-kv-id-here"
```

2. **Update HTML files** with your Worker URL:
```javascript
// Replace YOUR_WORKER_URL with your actual worker URL
const API_BASE = 'https://harare-metro-worker.harare-metro.workers.dev';
```

### 5. Deploy

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy

# Test the deployment
curl https://harare-metro-worker.harare-metro.workers.dev/api/news
```

### 6. Setup GitHub Actions

1. Go to your GitHub repository settings
2. Add these secrets:
   - `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

3. Update the workflow file URLs with your actual domains

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

## 📊 News Sources

Current sources include:
- Herald Zimbabwe
- NewsDay Zimbabwe
- Chronicle Zimbabwe
- ZBC News
- Business Weekly
- Zimbabwe Independent

## 📈 Performance

Expected performance metrics:
- **Page Load Speed**: < 2 seconds on 3G
- **API Response Time**: < 500ms globally
- **Lighthouse Score**: 90+ on mobile
- **Uptime**: 99.9% (Cloudflare SLA)

## 🔒 Privacy & Terms

- [Privacy Policy](./privacy.html) - How we collect, use, and protect your information
- [Terms of Service](./terms.html) - Rules and guidelines for using our service

Both pages are fully responsive and include:
- **GDPR-compliant privacy practices**
- **Clear terms of service**
- **Zimbabwe law compliance**
- **Contact information for legal inquiries**

## 💖 Sponsor Development

Support ongoing development and new features:

- **💖 GitHub Sponsors** - [Sponsor @bryanfawcett](https://github.com/sponsors/bryanfawcett)
- **☕ Buy me a coffee** - [buymeacoffee.com/bryanfawcett](https://buymeacoffee.com/bryanfawcett)
- **🏢 Professional services** - Custom development and consulting available

Your sponsorship helps maintain this free service and develop new features for the Zimbabwe tech community.

## 📞 Contact

- **Website**: [https://nyuchi.com](https://nyuchi.com)
- **GitHub**: [https://github.com/nyuchitech](https://github.com/nyuchitech)
- **Email**: [hello@nyuchi.com](mailto:hello@nyuchi.com)
- **Issues**: [GitHub Issues](https://github.com/nyuchitech/harare-metro/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🏆 Credits

**Created by Nyuchi Web Services**
- **Lead Developer**: Bryan Fawcett (@bryanfawcett)
- **Development Assistant**: Claude AI
- **Organization**: [Nyuchi Web Services](https://nyuchi.com)

**Special Thanks:**
- Zimbabwe news organizations for providing RSS feeds
- Cloudflare for hosting and edge infrastructure
- Open source community for tools and libraries

**Professional Services:**
For custom web development, mobile apps, and tech consulting in Zimbabwe and beyond, visit [nyuchi.com](https://nyuchi.com).

---

Built with ❤️ for Harare 🏙️
