# 🏙️ Harare Metro

A fast, mobile-first news aggregation site focused on Harare and Zimbabwe news. Built with Cloudflare Workers and Pages for maximum performance and global reach.

**🌐 Live Site:** [https://www.hararemetro.co.zw](https://www.hararemetro.co.zw)

**Created by Nyuchi Web Services**  
**Lead Developer:** Bryan Fawcett (@bryanfawcett)  
**Development Assistant:** Claude AI

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
├── worker.test.js          # Tests for Worker functionality
├── setup.sh                # Automated setup script
├── INSTRUCTIONS.md         # Detailed setup and usage guide
├── .github/workflows/
│   └── deploy.yml          # Auto-deployment pipeline
├── .gitignore              # Git ignore rules
├── LICENSE                 # MIT License
└── README.md               # This file
```

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/nyuchitech/harare-metro.git
cd harare-metro

# Run automated setup
chmod +x setup.sh && ./setup.sh

# Install dependencies
npm install
```

For detailed setup instructions, see [INSTRUCTIONS.md](./INSTRUCTIONS.md).

## 📊 News Sources

The site aggregates news from major Zimbabwe publications:
- Herald Zimbabwe
- NewsDay Zimbabwe
- Chronicle Zimbabwe
- ZBC News
- Business Weekly
- Zimbabwe Independent

## 🔒 Privacy & Security

- **No user tracking** - We don't collect personal data
- **No API keys exposed** - All processing happens server-side
- **CORS enabled** - Secure cross-origin requests
- **Input sanitization** - HTML tags stripped from RSS content

See our [Privacy Policy](./privacy.html) and [Terms of Service](./terms.html) for details.

## 💖 Support the Project

Help maintain this free service for the Zimbabwe tech community:

- **GitHub Sponsors**: [Sponsor @bryanfawcett](https://github.com/sponsors/bryanfawcett)
- **Buy me a coffee**: [buymeacoffee.com/bryanfawcett](https://buymeacoffee.com/bryanfawcett)
- **Professional services**: Custom development available at [nyuchi.com](https://nyuchi.com)

## 📞 Contact

- **Website**: [https://nyuchi.com](https://nyuchi.com)
- **GitHub**: [https://github.com/nyuchitech](https://github.com/nyuchitech)
- **Email**: [hello@nyuchi.com](mailto:hello@nyuchi.com)
- **Issues**: [GitHub Issues](https://github.com/nyuchitech/harare-metro/issues)

## 🤝 Contributing

We welcome contributions! Please see [INSTRUCTIONS.md](./INSTRUCTIONS.md#contributing) for guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for Harare 🏙️ by [Nyuchi Web Services](https://nyuchi.com)
