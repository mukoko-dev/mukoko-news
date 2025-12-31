-- Migration: Link trusted domains to news sources
-- Allows managing image domains per source in admin
-- Note: No foreign key constraint to allow flexibility with source creation

-- Add source_id to trusted_domains to link domains to specific sources
-- Using TEXT without foreign key to allow orphan domains until sources are created
ALTER TABLE trusted_domains ADD COLUMN source_id TEXT;

-- Add description for admin clarity
ALTER TABLE trusted_domains ADD COLUMN description TEXT;

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_trusted_domains_source_id ON trusted_domains(source_id);

-- ================================================
-- AUTO-LINK EXISTING DOMAINS TO SOURCES
-- Match domains to sources based on domain patterns
-- Only Zimbabwe sources exist currently - others will be linked when added
-- ================================================

-- Zimbabwe sources (these exist in the database)
UPDATE trusted_domains SET source_id = 'herald-zimbabwe', description = 'Herald Zimbabwe main domain' WHERE domain LIKE '%herald.co.zw%';
UPDATE trusted_domains SET source_id = 'newsday-zimbabwe', description = 'NewsDay Zimbabwe main domain' WHERE domain LIKE '%newsday.co.zw%';
UPDATE trusted_domains SET source_id = 'chronicle-zimbabwe', description = 'Chronicle Zimbabwe main domain' WHERE domain LIKE '%chronicle.co.zw%';
UPDATE trusted_domains SET source_id = 'zbc-news', description = 'ZBC News main domain' WHERE domain LIKE '%zbc.co.zw%';
UPDATE trusted_domains SET source_id = 'business-weekly', description = 'Business Weekly main domain' WHERE domain LIKE '%businessweekly.co.zw%';
UPDATE trusted_domains SET source_id = 'techzim', description = 'TechZim main domain' WHERE domain LIKE '%techzim.co.zw%';
UPDATE trusted_domains SET source_id = 'the-standard', description = 'The Standard main domain' WHERE domain LIKE '%thestandard.co.zw%';
UPDATE trusted_domains SET source_id = 'zimlive', description = 'ZimLive main domain' WHERE domain LIKE '%zimlive.com%';
UPDATE trusted_domains SET source_id = 'new-zimbabwe', description = 'New Zimbabwe main domain' WHERE domain LIKE '%newzimbabwe.com%';
UPDATE trusted_domains SET source_id = 'the-independent', description = 'The Independent main domain' WHERE domain LIKE '%theindependent.co.zw%';
UPDATE trusted_domains SET source_id = 'sunday-mail', description = 'Sunday Mail main domain' WHERE domain LIKE '%sundaymail.co.zw%';
UPDATE trusted_domains SET source_id = '263chat', description = '263Chat main domain' WHERE domain LIKE '%263chat.com%';
UPDATE trusted_domains SET source_id = 'daily-news', description = 'Daily News main domain' WHERE domain LIKE '%dailynews.co.zw%';
UPDATE trusted_domains SET source_id = 'zimeye', description = 'ZimEye main domain' WHERE domain LIKE '%zimeye.net%';
UPDATE trusted_domains SET source_id = 'pindula-news', description = 'Pindula News main domain' WHERE domain LIKE '%pindula.co.zw%';
UPDATE trusted_domains SET source_id = 'zimbabwe-situation', description = 'Zimbabwe Situation main domain' WHERE domain LIKE '%zimbabwesituation.com%';
UPDATE trusted_domains SET source_id = 'nehanda-radio', description = 'Nehanda Radio main domain' WHERE domain LIKE '%nehandaradio.com%';
UPDATE trusted_domains SET source_id = 'open-news-zimbabwe', description = 'Open News Zimbabwe main domain' WHERE domain LIKE '%opennews.co.zw%';
UPDATE trusted_domains SET source_id = 'financial-gazette', description = 'Financial Gazette main domain' WHERE domain LIKE '%fingaz.co.zw%';
UPDATE trusted_domains SET source_id = 'manica-post', description = 'Manica Post main domain' WHERE domain LIKE '%manicapost.co.zw%';
UPDATE trusted_domains SET source_id = 'southern-eye', description = 'Southern Eye main domain' WHERE domain LIKE '%southerneye.co.zw%';

-- Pan-African source domains (sources will be created via 014_pan_african_countries.sql)
-- These domains will be linked when the sources are added
UPDATE trusted_domains SET description = 'News24 South Africa' WHERE domain LIKE '%news24.com%' OR domain LIKE '%24.co.za%';
UPDATE trusted_domains SET description = 'IOL South Africa' WHERE domain LIKE '%iol.co.za%';
UPDATE trusted_domains SET description = 'TimesLive South Africa' WHERE domain LIKE '%timeslive.co.za%';
UPDATE trusted_domains SET description = 'The Citizen South Africa' WHERE domain LIKE '%citizen.co.za%';
UPDATE trusted_domains SET description = 'Daily Maverick South Africa' WHERE domain LIKE '%dailymaverick.co.za%';
UPDATE trusted_domains SET description = 'MyBroadband South Africa' WHERE domain LIKE '%mybroadband.co.za%';
UPDATE trusted_domains SET description = 'Eyewitness News South Africa' WHERE domain LIKE '%ewn.co.za%';
UPDATE trusted_domains SET description = 'BusinessTech South Africa' WHERE domain LIKE '%businesstech.co.za%';
UPDATE trusted_domains SET description = 'Mail & Guardian South Africa' WHERE domain LIKE '%mg.co.za%';
UPDATE trusted_domains SET description = 'Daily Nation Kenya' WHERE domain LIKE '%nation.africa%';
UPDATE trusted_domains SET description = 'Standard Media Kenya' WHERE domain LIKE '%standardmedia.co.ke%';
UPDATE trusted_domains SET description = 'The Star Kenya' WHERE domain LIKE '%the-star.co.ke%';
UPDATE trusted_domains SET description = 'Capital FM Kenya' WHERE domain LIKE '%capitalfm.co.ke%';
UPDATE trusted_domains SET description = 'Business Daily Kenya' WHERE domain LIKE '%businessdailyafrica.com%';
UPDATE trusted_domains SET description = 'Citizen Digital Kenya' WHERE domain LIKE '%citizen.digital%';
UPDATE trusted_domains SET description = 'Punch Nigeria' WHERE domain LIKE '%punchng.com%';
UPDATE trusted_domains SET description = 'Guardian Nigeria' WHERE domain LIKE '%guardian.ng%';
UPDATE trusted_domains SET description = 'Premium Times Nigeria' WHERE domain LIKE '%premiumtimesng.com%';
UPDATE trusted_domains SET description = 'Vanguard Nigeria' WHERE domain LIKE '%vanguardngr.com%';
UPDATE trusted_domains SET description = 'ThisDay Nigeria' WHERE domain LIKE '%thisdaylive.com%';
UPDATE trusted_domains SET description = 'TechCabal Nigeria' WHERE domain LIKE '%techcabal.com%';
UPDATE trusted_domains SET description = 'Joy Online Ghana' WHERE domain LIKE '%myjoyonline.com%';
UPDATE trusted_domains SET description = 'Citi Newsroom Ghana' WHERE domain LIKE '%citinewsroom.com%';
UPDATE trusted_domains SET description = 'Graphic Online Ghana' WHERE domain LIKE '%graphic.com.gh%';
UPDATE trusted_domains SET description = 'GhanaWeb' WHERE domain LIKE '%ghanaweb.com%';

-- Mark CDN/generic domains as shared (no source_id)
UPDATE trusted_domains SET description = 'WordPress CDN - Shared' WHERE domain LIKE '%wp.com%' OR domain LIKE '%wordpress.com%';
UPDATE trusted_domains SET description = 'Cloudinary CDN - Shared' WHERE domain LIKE '%cloudinary.com%';
UPDATE trusted_domains SET description = 'AWS S3/CloudFront - Shared' WHERE domain LIKE '%amazonaws.com%' OR domain LIKE '%cloudfront.net%';
UPDATE trusted_domains SET description = 'Google Services - Shared' WHERE domain LIKE '%googleusercontent.com%';
UPDATE trusted_domains SET description = 'Social Media - Shared' WHERE domain LIKE '%fbcdn.net%' OR domain LIKE '%twimg.com%' OR domain LIKE '%instagram.com%';
UPDATE trusted_domains SET description = 'News Agency - Shared' WHERE domain LIKE '%reuters.com%' OR domain LIKE '%apnews.com%' OR domain LIKE '%bbc%';
UPDATE trusted_domains SET description = 'Stock Photos - Shared' WHERE domain LIKE '%unsplash.com%' OR domain LIKE '%pexels.com%';
