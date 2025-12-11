# Security Policy

## Overview

Mukoko News is an open-source news aggregation platform for Zimbabwe. The service aggregates publicly available news content from established Zimbabwean media outlets via RSS feeds.

## License & Content Ownership

- **Code License**: MIT License (open source)
- **Content Ownership**: All aggregated news content remains the property of the original publishers
- **Fair Use**: Content is displayed with full attribution and links to original sources
- **No Content Modification**: Original article content is not modified or rewritten

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.8.x   | :white_check_mark: |
| < 0.8   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in Mukoko News, please follow responsible disclosure:

1. **Email**: Report vulnerabilities to security@mukoko.com
2. **Response Time**: We aim to acknowledge reports within 48 hours
3. **Fix Timeline**: Critical vulnerabilities will be addressed within 7 days
4. **Recognition**: Security researchers will be credited in our changelog (if desired)

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Suggested remediation (optional)

### What NOT to Report

- Content-related issues (we aggregate, not create content)
- Social engineering attacks
- DoS/DDoS vulnerabilities
- Issues in third-party dependencies (report to upstream)

## Security Practices

### Authentication & Authorization

- Password hashing using scrypt with secure parameters
- Session-based authentication with secure, HTTP-only cookies
- Role-based access control (user, moderator, admin, super_admin)
- CSRF protection on state-changing operations
- Rate limiting on authentication endpoints

### Data Protection

- All traffic encrypted via HTTPS/TLS
- No storage of sensitive payment information
- Minimal personal data collection (email, username)
- Data stored in Cloudflare D1 (edge SQLite)
- No third-party analytics or tracking

### Infrastructure

- Deployed on Cloudflare Workers (edge computing)
- DDoS protection via Cloudflare
- No server-side file uploads from users
- Input validation and sanitization
- SQL injection prevention via parameterized queries

### Content Security

- RSS feeds fetched from verified news sources only
- Content sanitized before display
- No user-generated HTML or scripts
- CSP headers to prevent XSS

## Known Limitations

- This is an aggregation service - we do not control source content
- RSS feeds are publicly available - no authentication required to fetch
- Admin panel requires authentication but is not a high-security target

## Contact

For security concerns: security@mukoko.com
For general inquiries: hello@mukoko.com
