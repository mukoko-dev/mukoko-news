-- Mukoko News Database Seed Data
-- Zimbabwe News Sources, Categories, and Configuration

-- ================================================
-- CATEGORIES
-- ================================================

INSERT OR IGNORE INTO categories (id, name, description, emoji, color, keywords, enabled, sort_order) VALUES
('all', 'All News', 'All news articles from all sources', '📰', '#6B7280', '[]', 1, 0),
('politics', 'Politics', 'Political news and government affairs', '🏛️', '#DC2626', '["politics", "government", "election", "vote", "parliament", "minister", "president", "policy", "law", "legislation", "democracy", "party", "campaign", "senate", "congress", "political", "governance", "reform", "zanu-pf", "mdc", "ccc", "emmerson mnangagwa", "nelson chamisa"]', 1, 1),
('economy', 'Economy', 'Economic news, business, and finance', '💰', '#059669', '["economy", "business", "finance", "banking", "investment", "market", "economic", "financial", "money", "currency", "inflation", "gdp", "trade", "export", "import", "stock", "bond", "forex", "dollar", "zimbabwe dollar", "usd", "bond notes", "rtgs", "mining", "agriculture", "tobacco", "gold", "platinum", "diamonds", "reserve bank"]', 1, 2),
('technology', 'Technology', 'Technology, innovation, and digital news', '💻', '#2563EB', '["technology", "tech", "digital", "innovation", "startup", "internet", "mobile", "app", "software", "hardware", "computer", "ai", "blockchain", "cryptocurrency", "fintech", "ecocash", "telecash", "onewallett", "econet", "netone", "telecel", "zimbabwe online", "ict", "innovation hub"]', 1, 3),
('sports', 'Sports', 'Sports news and events', '⚽', '#DC2626', '["sports", "football", "soccer", "cricket", "rugby", "tennis", "athletics", "olympics", "world cup", "premier league", "psl", "zimbabwe national team", "warriors", "chevrons", "sables", "dynamos", "caps united", "highlanders", "chicken inn", "fc platinum", "ngezi platinum", "manica diamonds"]', 1, 4),
('health', 'Health', 'Health, medical, and wellness news', '🏥', '#059669', '["health", "medical", "hospital", "doctor", "medicine", "healthcare", "covid", "pandemic", "vaccine", "disease", "treatment", "wellness", "mental health", "public health", "clinic", "nursing", "pharmacy", "medical aid", "psmas", "cimas", "premier medical aid"]', 1, 5),
('education', 'Education', 'Education news and academic affairs', '📚', '#7C3AED', '["education", "school", "university", "student", "teacher", "learning", "academic", "examination", "zimsec", "o level", "a level", "degree", "uz", "msu", "nust", "cut", "buse", "great zimbabwe university", "africa university", "lupane state university", "hit"]', 1, 6),
('entertainment', 'Entertainment', 'Entertainment, arts, and culture', '🎬', '#EC4899', '["entertainment", "music", "movie", "film", "celebrity", "artist", "culture", "arts", "theatre", "concert", "festival", "book", "literature", "zimbo", "zim dancehall", "sungura", "gospel", "winky d", "jah prayzah", "ammara brown", "takura", "holy ten"]', 1, 7),
('international', 'International', 'International and world news', '🌍', '#0891B2', '["international", "world", "global", "foreign", "africa", "sadc", "south africa", "botswana", "zambia", "malawi", "mozambique", "usa", "uk", "china", "europe", "brexit", "trump", "biden", "putin", "ukraine", "russia", "middle east", "israel", "palestine"]', 1, 8),
('general', 'General', 'General news and updates', '📰', '#66bb6a', '["news", "zimbabwe", "africa", "breaking", "latest", "update", "report", "story"]', 1, 9),
('harare', 'Harare', 'Harare city news and updates', '🏙️', '#8bc34a', '["harare", "capital", "city", "urban", "metropolitan", "avondale", "borrowdale", "eastlea", "highlands", "kopje", "mbare", "waterfalls", "westgate"]', 1, 10),
('agriculture', 'Agriculture', 'Agricultural news and farming', '🌾', '#81c784', '["agriculture", "farming", "crop", "livestock", "tobacco", "maize", "cotton", "farmer", "harvest", "irrigation", "land", "rural", "commercial farming"]', 1, 11),
('crime', 'Crime', 'Crime and law enforcement news', '🚔', '#e57373', '["crime", "police", "arrest", "court", "justice", "theft", "murder", "robbery", "investigation", "criminal", "law enforcement", "prison", "sentence"]', 1, 12),
('environment', 'Environment', 'Environmental news and conservation', '🌍', '#81c784', '["environment", "climate", "conservation", "pollution", "wildlife", "deforestation", "recycling", "renewable energy", "sustainability", "ecosystem", "biodiversity"]', 1, 13);

-- ================================================
-- RSS SOURCES (Zimbabwe News)
-- ================================================

INSERT OR IGNORE INTO rss_sources (id, name, url, category, enabled, priority) VALUES
('herald-zimbabwe', 'Herald Zimbabwe', 'https://www.herald.co.zw/feed/', 'general', 1, 5),
('newsday-zimbabwe', 'NewsDay Zimbabwe', 'https://www.newsday.co.zw/feed/', 'general', 1, 5),
('chronicle-zimbabwe', 'Chronicle Zimbabwe', 'https://www.chronicle.co.zw/feed/', 'general', 1, 5),
('zbc-news', 'ZBC News', 'https://www.zbc.co.zw/feed/', 'news', 1, 4),
('business-weekly', 'Business Weekly', 'https://businessweekly.co.zw/feed/', 'business', 1, 4),
('techzim', 'Techzim', 'https://www.techzim.co.zw/feed/', 'technology', 1, 4),
('the-standard', 'The Standard', 'https://www.thestandard.co.zw/feed/', 'general', 1, 4),
('zimlive', 'ZimLive', 'https://www.zimlive.com/feed/', 'general', 1, 4),
('new-zimbabwe', 'New Zimbabwe', 'https://www.newzimbabwe.com/feed/', 'general', 1, 4),
('the-independent', 'The Independent', 'https://www.theindependent.co.zw/feed/', 'general', 1, 4),
('sunday-mail', 'Sunday Mail', 'https://www.sundaymail.co.zw/feed/', 'general', 1, 3),
('263chat', '263Chat', 'https://263chat.com/feed/', 'general', 1, 4),
('daily-news', 'Daily News', 'https://www.dailynews.co.zw/feed/', 'general', 1, 4),
('zimeye', 'ZimEye', 'https://zimeye.net/feed/', 'general', 1, 3),
('pindula-news', 'Pindula News', 'https://news.pindula.co.zw/feed/', 'general', 1, 3),
('zimbabwe-situation', 'Zimbabwe Situation', 'https://zimbabwesituation.com/feed/', 'general', 1, 3),
('nehanda-radio', 'Nehanda Radio', 'https://nehandaradio.com/feed/', 'general', 1, 3),
('open-news-zimbabwe', 'Open News Zimbabwe', 'https://opennews.co.zw/feed/', 'general', 1, 3),
('financial-gazette', 'Financial Gazette', 'https://fingaz.co.zw/feed/', 'business', 1, 4),
('manica-post', 'Manica Post', 'https://manicapost.co.zw/feed/', 'general', 1, 3),
('southern-eye', 'Southern Eye', 'https://southerneye.co.zw/feed/', 'general', 1, 3);

-- Sync news_sources from rss_sources (required for foreign key constraints)
INSERT OR IGNORE INTO news_sources (id, name, rss_feed_url)
SELECT id, name, url FROM rss_sources;

-- ================================================
-- TRUSTED IMAGE DOMAINS
-- ================================================

INSERT OR IGNORE INTO trusted_domains (domain, type, enabled) VALUES
-- Zimbabwe news sites
('herald.co.zw', 'image', 1),
('heraldonline.co.zw', 'image', 1),
('newsday.co.zw', 'image', 1),
('chronicle.co.zw', 'image', 1),
('techzim.co.zw', 'image', 1),
('zbc.co.zw', 'image', 1),
('businessweekly.co.zw', 'image', 1),
('thestandard.co.zw', 'image', 1),
('zimlive.com', 'image', 1),
('newzimbabwe.com', 'image', 1),
('theindependent.co.zw', 'image', 1),
('sundaymail.co.zw', 'image', 1),
('263chat.com', 'image', 1),
('dailynews.co.zw', 'image', 1),
('zimeye.net', 'image', 1),
('pindula.co.zw', 'image', 1),
('zimbabwesituation.com', 'image', 1),
('nehandaradio.com', 'image', 1),
('opennews.co.zw', 'image', 1),
('fingaz.co.zw', 'image', 1),
('manicapost.co.zw', 'image', 1),
('southerneye.co.zw', 'image', 1),
-- CDN and image hosting
('wp.com', 'image', 1),
('wordpress.com', 'image', 1),
('files.wordpress.com', 'image', 1),
('i0.wp.com', 'image', 1),
('i1.wp.com', 'image', 1),
('i2.wp.com', 'image', 1),
('i3.wp.com', 'image', 1),
('cloudinary.com', 'image', 1),
('res.cloudinary.com', 'image', 1),
('imgur.com', 'image', 1),
('i.imgur.com', 'image', 1),
('gravatar.com', 'image', 1),
('secure.gravatar.com', 'image', 1),
('amazonaws.com', 'image', 1),
('s3.amazonaws.com', 'image', 1),
('cloudfront.net', 'image', 1),
('unsplash.com', 'image', 1),
('images.unsplash.com', 'image', 1),
('pexels.com', 'image', 1),
('images.pexels.com', 'image', 1),
-- Google services
('googleusercontent.com', 'image', 1),
('lh3.googleusercontent.com', 'image', 1),
('lh4.googleusercontent.com', 'image', 1),
('lh5.googleusercontent.com', 'image', 1),
('blogger.googleusercontent.com', 'image', 1),
('drive.google.com', 'image', 1),
-- Social media
('fbcdn.net', 'image', 1),
('scontent.fhre1-1.fna.fbcdn.net', 'image', 1),
('pbs.twimg.com', 'image', 1),
('abs.twimg.com', 'image', 1),
('instagram.com', 'image', 1),
-- International news agencies
('ap.org', 'image', 1),
('apnews.com', 'image', 1),
('reuters.com', 'image', 1),
('bbci.co.uk', 'image', 1),
('bbc.co.uk', 'image', 1),
('cnn.com', 'image', 1),
('media.cnn.com', 'image', 1),
('africanews.com', 'image', 1),
-- South African news
('mg.co.za', 'image', 1),
('news24.com', 'image', 1),
('timeslive.co.za', 'image', 1),
('iol.co.za', 'image', 1),
('citizen.co.za', 'image', 1),
-- Other
('photobucket.com', 'image', 1),
('flickr.com', 'image', 1),
('staticflickr.com', 'image', 1),
('wikimedia.org', 'image', 1),
('upload.wikimedia.org', 'image', 1);

-- ================================================
-- SYSTEM CONFIGURATION
-- ================================================

INSERT OR IGNORE INTO system_config (key, value, description) VALUES
('site_name', '"Mukoko News"', 'Site name'),
('max_articles_per_source', '500', 'Maximum articles to cache per RSS source'),
('max_total_articles', '40000', 'Maximum total articles to cache'),
('article_content_limit', '1000000', 'Maximum character limit per article'),
('refresh_interval_minutes', '60', 'How often to refresh RSS feeds'),
('pagination_initial_load', '24', 'Articles to load on initial page load'),
('pagination_page_size', '12', 'Articles per page for subsequent loads'),
('pagination_preload_next_page', 'true', 'Preload next page in background'),
('pagination_cache_pages', '3', 'Keep 3 pages cached'),
('enable_analytics', 'true', 'Enable analytics tracking'),
('enable_cloudflare_images', 'true', 'Enable Cloudflare Images optimization'),
('cache_strategy_ttl', '14', 'Cache TTL in days'),
('cache_strategy_refresh_interval', '60', 'Background refresh every 60 minutes'),
('data_optimization_compress_images', 'true', 'Always compress images'),
('data_optimization_lazy_load', 'true', 'Load images only when needed'),
('data_optimization_text_first', 'true', 'Load text before images'),
('rss_timeout', '10000', 'RSS fetch timeout in milliseconds'),
('roles_enabled', 'true', 'Enable role-based access control'),
('default_role', '"creator"', 'Default user role'),
('admin_roles', '["admin", "super_admin", "moderator"]', 'Admin roles list'),
('creator_roles', '["creator", "business-creator", "author"]', 'Creator roles list');
