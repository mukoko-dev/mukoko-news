-- Pan-African Countries Migration
-- Adds countries table and seeds initial African countries with news sources

-- ================================================
-- COUNTRIES
-- ================================================

INSERT OR IGNORE INTO countries (id, name, code, emoji, language, timezone, enabled, priority, keywords) VALUES
-- Initial launch countries (highest priority)
('ZW', 'Zimbabwe', 'ZW', '🇿🇼', 'en', 'Africa/Harare', 1, 100, '["zimbabwe", "harare", "bulawayo", "mutare", "gweru", "kwekwe", "masvingo", "chinhoyi", "victoria falls"]'),
('ZA', 'South Africa', 'ZA', '🇿🇦', 'en', 'Africa/Johannesburg', 1, 95, '["south africa", "johannesburg", "cape town", "durban", "pretoria", "gauteng", "soweto"]'),
('KE', 'Kenya', 'KE', '🇰🇪', 'en', 'Africa/Nairobi', 1, 90, '["kenya", "nairobi", "mombasa", "kisumu", "nakuru"]'),
('NG', 'Nigeria', 'NG', '🇳🇬', 'en', 'Africa/Lagos', 1, 85, '["nigeria", "lagos", "abuja", "kano", "ibadan", "port harcourt"]'),
('GH', 'Ghana', 'GH', '🇬🇭', 'en', 'Africa/Accra', 1, 80, '["ghana", "accra", "kumasi", "tamale"]'),

-- Southern Africa
('BW', 'Botswana', 'BW', '🇧🇼', 'en', 'Africa/Gaborone', 1, 70, '["botswana", "gaborone", "francistown"]'),
('ZM', 'Zambia', 'ZM', '🇿🇲', 'en', 'Africa/Lusaka', 1, 70, '["zambia", "lusaka", "kitwe", "ndola", "livingstone"]'),
('MW', 'Malawi', 'MW', '🇲🇼', 'en', 'Africa/Blantyre', 1, 65, '["malawi", "lilongwe", "blantyre"]'),
('MZ', 'Mozambique', 'MZ', '🇲🇿', 'pt', 'Africa/Maputo', 1, 60, '["mozambique", "maputo", "beira", "nampula"]'),
('NA', 'Namibia', 'NA', '🇳🇦', 'en', 'Africa/Windhoek', 1, 60, '["namibia", "windhoek", "walvis bay"]'),
('LS', 'Lesotho', 'LS', '🇱🇸', 'en', 'Africa/Maseru', 1, 55, '["lesotho", "maseru"]'),
('SZ', 'Eswatini', 'SZ', '🇸🇿', 'en', 'Africa/Mbabane', 1, 55, '["eswatini", "swaziland", "mbabane"]'),

-- East Africa
('TZ', 'Tanzania', 'TZ', '🇹🇿', 'sw', 'Africa/Dar_es_Salaam', 1, 75, '["tanzania", "dar es salaam", "dodoma", "zanzibar"]'),
('UG', 'Uganda', 'UG', '🇺🇬', 'en', 'Africa/Kampala', 1, 75, '["uganda", "kampala", "entebbe"]'),
('RW', 'Rwanda', 'RW', '🇷🇼', 'en', 'Africa/Kigali', 1, 70, '["rwanda", "kigali"]'),
('ET', 'Ethiopia', 'ET', '🇪🇹', 'am', 'Africa/Addis_Ababa', 1, 65, '["ethiopia", "addis ababa"]'),

-- West Africa
('SN', 'Senegal', 'SN', '🇸🇳', 'fr', 'Africa/Dakar', 1, 65, '["senegal", "dakar"]'),
('CI', 'Ivory Coast', 'CI', '🇨🇮', 'fr', 'Africa/Abidjan', 1, 65, '["ivory coast", "cote d''ivoire", "abidjan"]'),
('CM', 'Cameroon', 'CM', '🇨🇲', 'fr', 'Africa/Douala', 1, 60, '["cameroon", "douala", "yaounde"]'),

-- North Africa
('EG', 'Egypt', 'EG', '🇪🇬', 'ar', 'Africa/Cairo', 1, 70, '["egypt", "cairo", "alexandria"]'),
('MA', 'Morocco', 'MA', '🇲🇦', 'ar', 'Africa/Casablanca', 1, 65, '["morocco", "casablanca", "rabat", "marrakech"]');

-- ================================================
-- UPDATE EXISTING ZIMBABWE SOURCES WITH COUNTRY_ID
-- ================================================

UPDATE rss_sources SET country_id = 'ZW' WHERE country_id IS NULL OR country_id = '';
UPDATE news_sources SET country_id = 'ZW' WHERE country_id IS NULL OR country_id = '';
UPDATE articles SET country_id = 'ZW' WHERE country_id IS NULL OR country_id = '';

-- ================================================
-- SOUTH AFRICA NEWS SOURCES
-- ================================================

INSERT OR IGNORE INTO rss_sources (id, name, url, category, country_id, enabled, priority) VALUES
('news24-sa', 'News24', 'https://feeds.news24.com/articles/News24/TopStories/rss', 'general', 'ZA', 1, 5),
('iol-sa', 'IOL News', 'https://www.iol.co.za/cmlink/1.640', 'general', 'ZA', 1, 5),
('timeslive-sa', 'TimesLive', 'https://www.timeslive.co.za/rss/', 'general', 'ZA', 1, 4),
('citizen-sa', 'The Citizen', 'https://www.citizen.co.za/feed/', 'general', 'ZA', 1, 4),
('dailymaverick-sa', 'Daily Maverick', 'https://www.dailymaverick.co.za/feed/', 'general', 'ZA', 1, 5),
('mybroadband-sa', 'MyBroadband', 'https://mybroadband.co.za/news/feed', 'technology', 'ZA', 1, 4),
('ewn-sa', 'Eyewitness News', 'https://ewn.co.za/RSS Feeds/Latest News', 'general', 'ZA', 1, 4),
('businesstech-sa', 'BusinessTech', 'https://businesstech.co.za/news/feed/', 'business', 'ZA', 1, 4),
('mg-sa', 'Mail & Guardian', 'https://mg.co.za/feed/', 'general', 'ZA', 1, 4),
('sunday-times-sa', 'Sunday Times', 'https://www.timeslive.co.za/sunday-times/rss/', 'general', 'ZA', 1, 3);

-- Sync to news_sources
INSERT OR IGNORE INTO news_sources (id, name, rss_feed_url, country_id)
SELECT id, name, url, country_id FROM rss_sources WHERE country_id = 'ZA';

-- ================================================
-- KENYA NEWS SOURCES
-- ================================================

INSERT OR IGNORE INTO rss_sources (id, name, url, category, country_id, enabled, priority) VALUES
('nation-ke', 'Daily Nation', 'https://nation.africa/kenya/feed', 'general', 'KE', 1, 5),
('standardmedia-ke', 'The Standard', 'https://www.standardmedia.co.ke/rss/headlines.php', 'general', 'KE', 1, 5),
('star-ke', 'The Star Kenya', 'https://www.the-star.co.ke/rss', 'general', 'KE', 1, 4),
('capitalfm-ke', 'Capital FM', 'https://www.capitalfm.co.ke/news/feed/', 'general', 'KE', 1, 4),
('businessdaily-ke', 'Business Daily', 'https://www.businessdailyafrica.com/bd/feed', 'business', 'KE', 1, 4),
('citizen-ke', 'Citizen Digital', 'https://www.citizen.digital/rss', 'general', 'KE', 1, 4),
('kbc-ke', 'KBC News', 'https://www.kbc.co.ke/feed/', 'general', 'KE', 1, 3),
('tuko-ke', 'Tuko News', 'https://www.tuko.co.ke/rss', 'general', 'KE', 1, 3);

-- Sync to news_sources
INSERT OR IGNORE INTO news_sources (id, name, rss_feed_url, country_id)
SELECT id, name, url, country_id FROM rss_sources WHERE country_id = 'KE';

-- ================================================
-- NIGERIA NEWS SOURCES
-- ================================================

INSERT OR IGNORE INTO rss_sources (id, name, url, category, country_id, enabled, priority) VALUES
('punch-ng', 'Punch Nigeria', 'https://punchng.com/feed/', 'general', 'NG', 1, 5),
('guardian-ng', 'The Guardian Nigeria', 'https://guardian.ng/feed/', 'general', 'NG', 1, 5),
('premiumtimes-ng', 'Premium Times', 'https://www.premiumtimesng.com/feed', 'general', 'NG', 1, 5),
('vanguard-ng', 'Vanguard Nigeria', 'https://www.vanguardngr.com/feed/', 'general', 'NG', 1, 4),
('thisday-ng', 'ThisDay', 'https://www.thisdaylive.com/feed/', 'general', 'NG', 1, 4),
('dailytrust-ng', 'Daily Trust', 'https://dailytrust.com/feed/', 'general', 'NG', 1, 4),
('businessday-ng', 'BusinessDay', 'https://businessday.ng/feed/', 'business', 'NG', 1, 4),
('techcabal-ng', 'TechCabal', 'https://techcabal.com/feed/', 'technology', 'NG', 1, 4),
('nairametrics-ng', 'Nairametrics', 'https://nairametrics.com/feed/', 'business', 'NG', 1, 4),
('channels-ng', 'Channels TV', 'https://www.channelstv.com/feed/', 'general', 'NG', 1, 4);

-- Sync to news_sources
INSERT OR IGNORE INTO news_sources (id, name, rss_feed_url, country_id)
SELECT id, name, url, country_id FROM rss_sources WHERE country_id = 'NG';

-- ================================================
-- GHANA NEWS SOURCES
-- ================================================

INSERT OR IGNORE INTO rss_sources (id, name, url, category, country_id, enabled, priority) VALUES
('myjoyonline-gh', 'Joy Online', 'https://www.myjoyonline.com/feed/', 'general', 'GH', 1, 5),
('citinewsroom-gh', 'Citi Newsroom', 'https://citinewsroom.com/feed/', 'general', 'GH', 1, 4),
('graphic-gh', 'Graphic Online', 'https://www.graphic.com.gh/feed/', 'general', 'GH', 1, 4),
('ghanaweb-gh', 'GhanaWeb', 'https://www.ghanaweb.com/GhanaHomePage/rss/', 'general', 'GH', 1, 4),
('peacefm-gh', 'Peace FM', 'https://www.peacefmonline.com/feed/', 'general', 'GH', 1, 3);

-- Sync to news_sources
INSERT OR IGNORE INTO news_sources (id, name, rss_feed_url, country_id)
SELECT id, name, url, country_id FROM rss_sources WHERE country_id = 'GH';

-- ================================================
-- EAST AFRICA NEWS SOURCES
-- ================================================

INSERT OR IGNORE INTO rss_sources (id, name, url, category, country_id, enabled, priority) VALUES
-- Tanzania
('citizen-tz', 'The Citizen Tanzania', 'https://www.thecitizen.co.tz/tanzania/feed', 'general', 'TZ', 1, 4),
('dailynews-tz', 'Daily News Tanzania', 'https://dailynews.co.tz/feed/', 'general', 'TZ', 1, 4),
-- Uganda
('monitor-ug', 'Daily Monitor', 'https://www.monitor.co.ug/uganda/feed', 'general', 'UG', 1, 5),
('newvision-ug', 'New Vision', 'https://www.newvision.co.ug/feed/', 'general', 'UG', 1, 4),
-- Rwanda
('newtimes-rw', 'The New Times Rwanda', 'https://www.newtimes.co.rw/feed', 'general', 'RW', 1, 4);

-- Sync to news_sources
INSERT OR IGNORE INTO news_sources (id, name, rss_feed_url, country_id)
SELECT id, name, url, country_id FROM rss_sources WHERE country_id IN ('TZ', 'UG', 'RW');

-- ================================================
-- SOUTHERN AFRICA NEWS SOURCES
-- ================================================

INSERT OR IGNORE INTO rss_sources (id, name, url, category, country_id, enabled, priority) VALUES
-- Zambia
('zambiareports-zm', 'Zambia Reports', 'https://zambiareports.com/feed/', 'general', 'ZM', 1, 4),
('lusakatimes-zm', 'Lusaka Times', 'https://www.lusakatimes.com/feed/', 'general', 'ZM', 1, 4),
-- Botswana
('mmegi-bw', 'Mmegi Online', 'https://www.mmegi.bw/feed/', 'general', 'BW', 1, 4),
('sundaystandard-bw', 'Sunday Standard', 'https://www.sundaystandard.info/feed/', 'general', 'BW', 1, 3),
-- Malawi
('nyasatimes-mw', 'Nyasa Times', 'https://www.nyasatimes.com/feed/', 'general', 'MW', 1, 4),
('malawivoice-mw', 'Malawi Voice', 'https://www.malawivoice.com/feed/', 'general', 'MW', 1, 3),
-- Namibia
('namibian-na', 'The Namibian', 'https://www.namibian.com.na/feed/', 'general', 'NA', 1, 4);

-- Sync to news_sources
INSERT OR IGNORE INTO news_sources (id, name, rss_feed_url, country_id)
SELECT id, name, url, country_id FROM rss_sources WHERE country_id IN ('ZM', 'BW', 'MW', 'NA');

-- ================================================
-- TRUSTED IMAGE DOMAINS (NEW SOURCES)
-- ================================================

INSERT OR IGNORE INTO trusted_domains (domain, type, enabled) VALUES
-- South Africa
('news24.com', 'image', 1),
('cdn.24.co.za', 'image', 1),
('iol.co.za', 'image', 1),
('timeslive.co.za', 'image', 1),
('citizen.co.za', 'image', 1),
('dailymaverick.co.za', 'image', 1),
('mybroadband.co.za', 'image', 1),
('ewn.co.za', 'image', 1),
('businesstech.co.za', 'image', 1),
-- Kenya
('nation.africa', 'image', 1),
('standardmedia.co.ke', 'image', 1),
('the-star.co.ke', 'image', 1),
('capitalfm.co.ke', 'image', 1),
('businessdailyafrica.com', 'image', 1),
('citizen.digital', 'image', 1),
('kbc.co.ke', 'image', 1),
('tuko.co.ke', 'image', 1),
-- Nigeria
('punchng.com', 'image', 1),
('guardian.ng', 'image', 1),
('premiumtimesng.com', 'image', 1),
('vanguardngr.com', 'image', 1),
('thisdaylive.com', 'image', 1),
('dailytrust.com', 'image', 1),
('businessday.ng', 'image', 1),
('techcabal.com', 'image', 1),
('nairametrics.com', 'image', 1),
('channelstv.com', 'image', 1),
-- Ghana
('myjoyonline.com', 'image', 1),
('citinewsroom.com', 'image', 1),
('graphic.com.gh', 'image', 1),
('ghanaweb.com', 'image', 1),
('peacefmonline.com', 'image', 1),
-- East Africa
('thecitizen.co.tz', 'image', 1),
('dailynews.co.tz', 'image', 1),
('monitor.co.ug', 'image', 1),
('newvision.co.ug', 'image', 1),
('newtimes.co.rw', 'image', 1),
-- Southern Africa
('zambiareports.com', 'image', 1),
('lusakatimes.com', 'image', 1),
('mmegi.bw', 'image', 1),
('sundaystandard.info', 'image', 1),
('nyasatimes.com', 'image', 1),
('malawivoice.com', 'image', 1),
('namibian.com.na', 'image', 1);
