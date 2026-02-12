"""
RSS feed parser — replaces backend/services/SimpleRSSService.ts parsing logic.

Uses feedparser (handles RSS 2.0, Atom, RDF, CDF) and beautifulsoup4
for HTML cleaning, replacing:
  - fast-xml-parser + custom RSS/Atom detection
  - 8 regex patterns for image extraction
  - 3-pass loop-based HTML tag removal
  - Hardcoded HTML entity map

TS counterpart: SimpleRSSService.parseItem() + extractImage()
"""

import re
import feedparser
from bs4 import BeautifulSoup


# Common ad/tracking domains to filter — same list as SimpleRSSService.ts
AD_DOMAINS = frozenset([
    "doubleclick.net", "googlesyndication.com", "googleadservices.com",
    "facebook.com/tr", "amazon-adsystem.com", "adnxs.com", "outbrain.com",
    "taboola.com", "criteo.com", "adsrvr.org", "rubiconproject.com",
    "pubmatic.com", "advertising.com", "adroll.com", "mathtag.com",
    "bidswitch.net", "sharethis.com", "addthis.com",
])

# Image file extensions recognised as valid
IMAGE_EXT_RE = re.compile(r"\.(jpe?g|png|gif|webp|svg|bmp|avif)(\?.*)?$", re.IGNORECASE)


async def parse_rss_feed(xml_content: str, source: dict, env=None) -> dict:
    """
    Parse an RSS/Atom feed and return structured articles.

    Args:
        xml_content: Raw XML string of the feed
        source: Source metadata dict with keys: id, name, category, country_id
        env: Cloudflare env bindings (for future D1 trusted-domain lookups)

    Returns:
        {"articles": [...], "feed_title": str, "item_count": int}
    """
    if not xml_content or not xml_content.strip():
        return {"articles": [], "feed_title": "", "item_count": 0, "error": "Empty feed content"}

    # feedparser handles RSS 2.0, Atom, RDF, CDF, and malformed feeds
    feed = feedparser.parse(xml_content)

    if feed.bozo and not feed.entries:
        # bozo = feed had issues; if we still got entries, that's ok
        return {
            "articles": [],
            "feed_title": "",
            "item_count": 0,
            "error": f"Feed parse error: {feed.bozo_exception}",
        }

    articles = []
    for entry in feed.entries[:20]:  # Limit to 20 most recent (matches TS)
        article = _parse_entry(entry, source)
        if article:
            articles.append(article)

    return {
        "articles": articles,
        "feed_title": feed.feed.get("title", ""),
        "item_count": len(feed.entries),
    }


def _parse_entry(entry: dict, source: dict) -> dict | None:
    """
    Parse a single feedparser entry into an article dict.

    Matches the shape returned by SimpleRSSService.parseItem()
    """
    title = entry.get("title", "").strip()
    if not title:
        return None

    link = entry.get("link", "")
    if not link:
        # Fall back to entry id (GUID)
        link = entry.get("id", "")
    if not link:
        return None

    # Description — cleaned from HTML
    description = _clean_summary(entry.get("summary", ""))

    # Full content — prefer content:encoded (WordPress), fall back to summary
    content = ""
    if entry.get("content"):
        # feedparser normalises content:encoded into entry.content list
        content = entry.content[0].get("value", "")
    if not content:
        content = entry.get("summary", "")

    # Author
    author = entry.get("author", "")

    # Published date
    published = entry.get("published", "") or entry.get("updated", "")

    # Image extraction — feedparser understands media namespaces
    image_url = _extract_image(entry)

    # GUID for deduplication
    guid = entry.get("id", "") or link

    # Slug from title
    slug = _generate_slug(title)

    return {
        "title": _clean_text(title),
        "description": _clean_text(description[:500]) if description else None,
        "content": content,  # TODO: convert HTML→Markdown via content_cleaner
        "author": _clean_text(author) if author else None,
        "source": source.get("name", ""),
        "source_id": source.get("id"),
        "category_id": source.get("category"),  # TODO: delegate to CategoryManager via env.DB
        "country_id": source.get("country_id"),
        "published_at": published,
        "image_url": image_url,
        "original_url": link,
        "rss_guid": guid,
        "slug": slug,
    }


def _extract_image(entry: dict) -> str | None:
    """
    Extract the best image URL from a feedparser entry.

    Replaces SimpleRSSService.extractImage() — 8 regex patterns reduced to
    feedparser's built-in media support + one bs4 fallback.
    """
    # 1. media:thumbnail (feedparser normalises to media_thumbnail)
    thumbnails = entry.get("media_thumbnail", [])
    if thumbnails and isinstance(thumbnails, list):
        url = thumbnails[0].get("url", "")
        if _is_valid_image_url(url):
            return url

    # 2. media:content (feedparser normalises to media_content)
    media = entry.get("media_content", [])
    if media and isinstance(media, list):
        for m in media:
            url = m.get("url", "")
            mtype = m.get("type", "")
            if "image" in mtype or _is_valid_image_url(url):
                return url

    # 3. Enclosures (RSS 2.0 enclosure tag)
    enclosures = entry.get("enclosures", [])
    if enclosures and isinstance(enclosures, list):
        for enc in enclosures:
            if "image" in enc.get("type", ""):
                url = enc.get("href", "")
                if _is_valid_image_url(url):
                    return url

    # 4. Entry image (some feeds)
    if entry.get("image"):
        img = entry["image"]
        url = img.get("href", "") if isinstance(img, dict) else str(img)
        if _is_valid_image_url(url):
            return url

    # 5. Fallback: extract from summary/content HTML with bs4
    for html_field in [entry.get("summary", ""), _get_content_html(entry)]:
        if not html_field:
            continue
        soup = BeautifulSoup(html_field, "html.parser")
        img_tag = soup.find("img", src=True)
        if img_tag:
            url = img_tag["src"]
            # Handle protocol-relative URLs
            if url.startswith("//"):
                url = f"https:{url}"
            if _is_valid_image_url(url):
                return url

    return None


def _get_content_html(entry: dict) -> str:
    """Get raw HTML content from feedparser entry."""
    if entry.get("content"):
        return entry.content[0].get("value", "")
    return ""


def _clean_summary(html: str) -> str:
    """
    Clean HTML summary to plain text using bs4.
    Replaces 3-pass regex loop + manual entity map.
    """
    if not html:
        return ""
    soup = BeautifulSoup(html, "html.parser")
    # Remove scripts, styles, iframes
    for tag in soup(["script", "style", "iframe"]):
        tag.decompose()
    return soup.get_text(separator=" ", strip=True)


def _clean_text(text: str) -> str:
    """Normalise whitespace and trim."""
    if not text:
        return ""
    return re.sub(r"\s+", " ", text).strip()


def _generate_slug(title: str) -> str:
    """
    Generate URL-friendly slug from title.
    Matches SimpleRSSService.generateSlug()
    """
    slug = title.lower()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s]+", "-", slug)
    slug = re.sub(r"-{2,}", "-", slug)
    slug = slug.strip("-")
    return slug[:80]


def _is_valid_image_url(url: str) -> bool:
    """Check if URL looks like a valid image."""
    if not url or not isinstance(url, str):
        return False
    url = url.strip()
    if not url.startswith(("http://", "https://")):
        return False
    # Filter ad domains
    for domain in AD_DOMAINS:
        if domain in url.lower():
            return False
    return True
