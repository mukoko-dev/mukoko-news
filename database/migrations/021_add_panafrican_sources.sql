-- Migration: Add Pan-African news sources
-- Adds RSS sources for all enabled African countries

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
('ewn-sa', 'Eyewitness News', 'https://ewn.co.za/RSS%20Feeds/Latest%20News', 'general', 'ZA', 1, 4),
('businesstech-sa', 'BusinessTech', 'https://businesstech.co.za/news/feed/', 'business', 'ZA', 1, 4),
('mg-sa', 'Mail & Guardian', 'https://mg.co.za/feed/', 'general', 'ZA', 1, 4);

INSERT OR IGNORE INTO news_sources (id, name, rss_feed_url, country, enabled) VALUES
('news24-sa', 'News24', 'https://feeds.news24.com/articles/News24/TopStories/rss', 'South Africa', 1),
('iol-sa', 'IOL News', 'https://www.iol.co.za/cmlink/1.640', 'South Africa', 1),
('timeslive-sa', 'TimesLive', 'https://www.timeslive.co.za/rss/', 'South Africa', 1),
('citizen-sa', 'The Citizen', 'https://www.citizen.co.za/feed/', 'South Africa', 1),
('dailymaverick-sa', 'Daily Maverick', 'https://www.dailymaverick.co.za/feed/', 'South Africa', 1),
('mybroadband-sa', 'MyBroadband', 'https://mybroadband.co.za/news/feed', 'South Africa', 1),
('ewn-sa', 'Eyewitness News', 'https://ewn.co.za/RSS%20Feeds/Latest%20News', 'South Africa', 1),
('businesstech-sa', 'BusinessTech', 'https://businesstech.co.za/news/feed/', 'South Africa', 1),
('mg-sa', 'Mail & Guardian', 'https://mg.co.za/feed/', 'South Africa', 1);

-- ================================================
-- KENYA NEWS SOURCES
-- ================================================

INSERT OR IGNORE INTO rss_sources (id, name, url, category, country_id, enabled, priority) VALUES
('nation-ke', 'Daily Nation', 'https://nation.africa/kenya/rss.xml', 'general', 'KE', 1, 5),
('standardmedia-ke', 'The Standard', 'https://www.standardmedia.co.ke/rss/headlines.php', 'general', 'KE', 1, 5),
('star-ke', 'The Star Kenya', 'https://www.the-star.co.ke/rss', 'general', 'KE', 1, 4),
('capitalfm-ke', 'Capital FM', 'https://www.capitalfm.co.ke/news/feed/', 'general', 'KE', 1, 4),
('businessdaily-ke', 'Business Daily', 'https://www.businessdailyafrica.com/bd/rss.xml', 'business', 'KE', 1, 4),
('citizen-ke', 'Citizen Digital', 'https://www.citizen.digital/rss', 'general', 'KE', 1, 4),
('kbc-ke', 'KBC News', 'https://www.kbc.co.ke/feed/', 'general', 'KE', 1, 3),
('tuko-ke', 'Tuko News', 'https://www.tuko.co.ke/rss', 'general', 'KE', 1, 3);

INSERT OR IGNORE INTO news_sources (id, name, rss_feed_url, country, enabled) VALUES
('nation-ke', 'Daily Nation', 'https://nation.africa/kenya/rss.xml', 'Kenya', 1),
('standardmedia-ke', 'The Standard', 'https://www.standardmedia.co.ke/rss/headlines.php', 'Kenya', 1),
('star-ke', 'The Star Kenya', 'https://www.the-star.co.ke/rss', 'Kenya', 1),
('capitalfm-ke', 'Capital FM', 'https://www.capitalfm.co.ke/news/feed/', 'Kenya', 1),
('businessdaily-ke', 'Business Daily', 'https://www.businessdailyafrica.com/bd/rss.xml', 'Kenya', 1),
('citizen-ke', 'Citizen Digital', 'https://www.citizen.digital/rss', 'Kenya', 1),
('kbc-ke', 'KBC News', 'https://www.kbc.co.ke/feed/', 'Kenya', 1),
('tuko-ke', 'Tuko News', 'https://www.tuko.co.ke/rss', 'Kenya', 1);

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

INSERT OR IGNORE INTO news_sources (id, name, rss_feed_url, country, enabled) VALUES
('punch-ng', 'Punch Nigeria', 'https://punchng.com/feed/', 'Nigeria', 1),
('guardian-ng', 'The Guardian Nigeria', 'https://guardian.ng/feed/', 'Nigeria', 1),
('premiumtimes-ng', 'Premium Times', 'https://www.premiumtimesng.com/feed', 'Nigeria', 1),
('vanguard-ng', 'Vanguard Nigeria', 'https://www.vanguardngr.com/feed/', 'Nigeria', 1),
('thisday-ng', 'ThisDay', 'https://www.thisdaylive.com/feed/', 'Nigeria', 1),
('dailytrust-ng', 'Daily Trust', 'https://dailytrust.com/feed/', 'Nigeria', 1),
('businessday-ng', 'BusinessDay', 'https://businessday.ng/feed/', 'Nigeria', 1),
('techcabal-ng', 'TechCabal', 'https://techcabal.com/feed/', 'Nigeria', 1),
('nairametrics-ng', 'Nairametrics', 'https://nairametrics.com/feed/', 'Nigeria', 1),
('channels-ng', 'Channels TV', 'https://www.channelstv.com/feed/', 'Nigeria', 1);

-- ================================================
-- GHANA NEWS SOURCES
-- ================================================

INSERT OR IGNORE INTO rss_sources (id, name, url, category, country_id, enabled, priority) VALUES
('myjoyonline-gh', 'Joy Online', 'https://www.myjoyonline.com/feed/', 'general', 'GH', 1, 5),
('citinewsroom-gh', 'Citi Newsroom', 'https://citinewsroom.com/feed/', 'general', 'GH', 1, 4),
('graphic-gh', 'Graphic Online', 'https://www.graphic.com.gh/feed/', 'general', 'GH', 1, 4),
('ghanaweb-gh', 'GhanaWeb', 'https://www.ghanaweb.com/GhanaHomePage/rss/', 'general', 'GH', 1, 4),
('peacefm-gh', 'Peace FM', 'https://www.peacefmonline.com/feed/', 'general', 'GH', 1, 3);

INSERT OR IGNORE INTO news_sources (id, name, rss_feed_url, country, enabled) VALUES
('myjoyonline-gh', 'Joy Online', 'https://www.myjoyonline.com/feed/', 'Ghana', 1),
('citinewsroom-gh', 'Citi Newsroom', 'https://citinewsroom.com/feed/', 'Ghana', 1),
('graphic-gh', 'Graphic Online', 'https://www.graphic.com.gh/feed/', 'Ghana', 1),
('ghanaweb-gh', 'GhanaWeb', 'https://www.ghanaweb.com/GhanaHomePage/rss/', 'Ghana', 1),
('peacefm-gh', 'Peace FM', 'https://www.peacefmonline.com/feed/', 'Ghana', 1);

-- ================================================
-- EAST AFRICA NEWS SOURCES (Tanzania, Uganda, Rwanda)
-- ================================================

INSERT OR IGNORE INTO rss_sources (id, name, url, category, country_id, enabled, priority) VALUES
-- Tanzania
('citizen-tz', 'The Citizen Tanzania', 'https://www.thecitizen.co.tz/tanzania/rss.xml', 'general', 'TZ', 1, 4),
('dailynews-tz', 'Daily News Tanzania', 'https://dailynews.co.tz/feed/', 'general', 'TZ', 1, 4),
-- Uganda
('monitor-ug', 'Daily Monitor', 'https://www.monitor.co.ug/uganda/rss.xml', 'general', 'UG', 1, 5),
('newvision-ug', 'New Vision', 'https://www.newvision.co.ug/feed/', 'general', 'UG', 1, 4),
-- Rwanda
('newtimes-rw', 'The New Times Rwanda', 'https://www.newtimes.co.rw/rssFeed/192/191/rss.xml', 'general', 'RW', 1, 4);

INSERT OR IGNORE INTO news_sources (id, name, rss_feed_url, country, enabled) VALUES
('citizen-tz', 'The Citizen Tanzania', 'https://www.thecitizen.co.tz/tanzania/rss.xml', 'Tanzania', 1),
('dailynews-tz', 'Daily News Tanzania', 'https://dailynews.co.tz/feed/', 'Tanzania', 1),
('monitor-ug', 'Daily Monitor', 'https://www.monitor.co.ug/uganda/rss.xml', 'Uganda', 1),
('newvision-ug', 'New Vision', 'https://www.newvision.co.ug/feed/', 'Uganda', 1),
('newtimes-rw', 'The New Times Rwanda', 'https://www.newtimes.co.rw/rssFeed/192/191/rss.xml', 'Rwanda', 1);

-- ================================================
-- SOUTHERN AFRICA NEWS SOURCES (Zambia, Botswana, Malawi, Namibia)
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

INSERT OR IGNORE INTO news_sources (id, name, rss_feed_url, country, enabled) VALUES
('zambiareports-zm', 'Zambia Reports', 'https://zambiareports.com/feed/', 'Zambia', 1),
('lusakatimes-zm', 'Lusaka Times', 'https://www.lusakatimes.com/feed/', 'Zambia', 1),
('mmegi-bw', 'Mmegi Online', 'https://www.mmegi.bw/feed/', 'Botswana', 1),
('sundaystandard-bw', 'Sunday Standard', 'https://www.sundaystandard.info/feed/', 'Botswana', 1),
('nyasatimes-mw', 'Nyasa Times', 'https://www.nyasatimes.com/feed/', 'Malawi', 1),
('malawivoice-mw', 'Malawi Voice', 'https://www.malawivoice.com/feed/', 'Malawi', 1),
('namibian-na', 'The Namibian', 'https://www.namibian.com.na/feed/', 'Namibia', 1);

-- ================================================
-- NORTH AFRICA NEWS SOURCES (Egypt)
-- ================================================

INSERT OR IGNORE INTO rss_sources (id, name, url, category, country_id, enabled, priority) VALUES
('egypttoday-eg', 'Egypt Today', 'https://www.egypttoday.com/RSS/11', 'general', 'EG', 1, 4),
('dailynewsegypt-eg', 'Daily News Egypt', 'https://dailynewsegypt.com/feed/', 'general', 'EG', 1, 4),
('ahram-eg', 'Al-Ahram Weekly', 'https://english.ahram.org.eg/Feed/4.aspx', 'general', 'EG', 1, 5);

INSERT OR IGNORE INTO news_sources (id, name, rss_feed_url, country, enabled) VALUES
('egypttoday-eg', 'Egypt Today', 'https://www.egypttoday.com/RSS/11', 'Egypt', 1),
('dailynewsegypt-eg', 'Daily News Egypt', 'https://dailynewsegypt.com/feed/', 'Egypt', 1),
('ahram-eg', 'Al-Ahram Weekly', 'https://english.ahram.org.eg/Feed/4.aspx', 'Egypt', 1);

-- ================================================
-- LINK DOMAINS TO NEW SOURCES
-- ================================================

-- South Africa
UPDATE trusted_domains SET source_id = 'news24-sa' WHERE domain LIKE '%news24.com%' OR domain LIKE '%24.co.za%';
UPDATE trusted_domains SET source_id = 'iol-sa' WHERE domain LIKE '%iol.co.za%';
UPDATE trusted_domains SET source_id = 'timeslive-sa' WHERE domain LIKE '%timeslive.co.za%';
UPDATE trusted_domains SET source_id = 'citizen-sa' WHERE domain LIKE '%citizen.co.za%';
UPDATE trusted_domains SET source_id = 'dailymaverick-sa' WHERE domain LIKE '%dailymaverick.co.za%';
UPDATE trusted_domains SET source_id = 'mybroadband-sa' WHERE domain LIKE '%mybroadband.co.za%';
UPDATE trusted_domains SET source_id = 'ewn-sa' WHERE domain LIKE '%ewn.co.za%';
UPDATE trusted_domains SET source_id = 'businesstech-sa' WHERE domain LIKE '%businesstech.co.za%';
UPDATE trusted_domains SET source_id = 'mg-sa' WHERE domain LIKE '%mg.co.za%';

-- Kenya
UPDATE trusted_domains SET source_id = 'nation-ke' WHERE domain LIKE '%nation.africa%';
UPDATE trusted_domains SET source_id = 'standardmedia-ke' WHERE domain LIKE '%standardmedia.co.ke%';
UPDATE trusted_domains SET source_id = 'star-ke' WHERE domain LIKE '%the-star.co.ke%';
UPDATE trusted_domains SET source_id = 'capitalfm-ke' WHERE domain LIKE '%capitalfm.co.ke%';
UPDATE trusted_domains SET source_id = 'businessdaily-ke' WHERE domain LIKE '%businessdailyafrica.com%';
UPDATE trusted_domains SET source_id = 'citizen-ke' WHERE domain LIKE '%citizen.digital%';
UPDATE trusted_domains SET source_id = 'kbc-ke' WHERE domain LIKE '%kbc.co.ke%';
UPDATE trusted_domains SET source_id = 'tuko-ke' WHERE domain LIKE '%tuko.co.ke%';

-- Nigeria
UPDATE trusted_domains SET source_id = 'punch-ng' WHERE domain LIKE '%punchng.com%';
UPDATE trusted_domains SET source_id = 'guardian-ng' WHERE domain LIKE '%guardian.ng%';
UPDATE trusted_domains SET source_id = 'premiumtimes-ng' WHERE domain LIKE '%premiumtimesng.com%';
UPDATE trusted_domains SET source_id = 'vanguard-ng' WHERE domain LIKE '%vanguardngr.com%';
UPDATE trusted_domains SET source_id = 'thisday-ng' WHERE domain LIKE '%thisdaylive.com%';
UPDATE trusted_domains SET source_id = 'dailytrust-ng' WHERE domain LIKE '%dailytrust.com%';
UPDATE trusted_domains SET source_id = 'businessday-ng' WHERE domain LIKE '%businessday.ng%';
UPDATE trusted_domains SET source_id = 'techcabal-ng' WHERE domain LIKE '%techcabal.com%';
UPDATE trusted_domains SET source_id = 'nairametrics-ng' WHERE domain LIKE '%nairametrics.com%';
UPDATE trusted_domains SET source_id = 'channels-ng' WHERE domain LIKE '%channelstv.com%';

-- Ghana
UPDATE trusted_domains SET source_id = 'myjoyonline-gh' WHERE domain LIKE '%myjoyonline.com%';
UPDATE trusted_domains SET source_id = 'citinewsroom-gh' WHERE domain LIKE '%citinewsroom.com%';
UPDATE trusted_domains SET source_id = 'graphic-gh' WHERE domain LIKE '%graphic.com.gh%';
UPDATE trusted_domains SET source_id = 'ghanaweb-gh' WHERE domain LIKE '%ghanaweb.com%';
UPDATE trusted_domains SET source_id = 'peacefm-gh' WHERE domain LIKE '%peacefmonline.com%';

-- East Africa
UPDATE trusted_domains SET source_id = 'citizen-tz' WHERE domain LIKE '%thecitizen.co.tz%';
UPDATE trusted_domains SET source_id = 'dailynews-tz' WHERE domain LIKE '%dailynews.co.tz%';
UPDATE trusted_domains SET source_id = 'monitor-ug' WHERE domain LIKE '%monitor.co.ug%';
UPDATE trusted_domains SET source_id = 'newvision-ug' WHERE domain LIKE '%newvision.co.ug%';
UPDATE trusted_domains SET source_id = 'newtimes-rw' WHERE domain LIKE '%newtimes.co.rw%';

-- Southern Africa
UPDATE trusted_domains SET source_id = 'zambiareports-zm' WHERE domain LIKE '%zambiareports.com%';
UPDATE trusted_domains SET source_id = 'lusakatimes-zm' WHERE domain LIKE '%lusakatimes.com%';
UPDATE trusted_domains SET source_id = 'mmegi-bw' WHERE domain LIKE '%mmegi.bw%';
UPDATE trusted_domains SET source_id = 'sundaystandard-bw' WHERE domain LIKE '%sundaystandard.info%';
UPDATE trusted_domains SET source_id = 'nyasatimes-mw' WHERE domain LIKE '%nyasatimes.com%';
UPDATE trusted_domains SET source_id = 'malawivoice-mw' WHERE domain LIKE '%malawivoice.com%';
UPDATE trusted_domains SET source_id = 'namibian-na' WHERE domain LIKE '%namibian.com.na%';
