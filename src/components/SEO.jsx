// src/components/SEO.jsx
import React from 'react'
import { Helmet } from 'react-helmet-async'

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url,
  type = 'website',
  article = null 
}) => {
  const siteTitle = 'Harare Metro - Zimbabwe News Aggregator'
  const defaultDescription = 'Stay informed with the latest news from Zimbabwe. Real-time aggregation from Herald, NewsDay, Chronicle, ZBC and more trusted local sources.'
  const defaultKeywords = 'Zimbabwe news, Harare news, Zimbabwe politics, Zimbabwe economy, Herald Zimbabwe, NewsDay, Chronicle, ZBC News, Zimbabwe sports, Zimbabwe business, Zimbabwe technology, Zimbabwe health, Zimbabwe education, Zimbabwe entertainment, Zimbabwe agriculture, Zimbabwe environment, Zimbabwe crime, Zimbabwe international, Zimbabwe lifestyle, Zimbabwe finance'
  const defaultImage = 'https://www.hararemetro.co.zw/og-image.png'
  const siteUrl = 'https://www.hararemetro.co.zw'
  
  const finalTitle = title ? `${title} | ${siteTitle}` : siteTitle
  const finalDescription = description || defaultDescription
  const finalKeywords = keywords || defaultKeywords
  const finalImage = image || defaultImage
  const finalUrl = url || siteUrl
  
  // Generate article-specific structured data
  const articleStructuredData = article ? {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.description || finalDescription,
    "datePublished": article.pubDate,
    "dateModified": article.pubDate,
    "author": {
      "@type": "Organization",
      "name": article.source
    },
    "publisher": {
      "@type": "Organization",
      "name": "Harare Metro",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.link
    },
    "keywords": `${article.category}, Zimbabwe news, ${article.source}`,
    "articleSection": article.category
  } : null
  
  // Generate website structured data
  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Harare Metro",
    "description": defaultDescription,
    "url": siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Harare Metro",
      "alternateName": "HM News",
      "url": siteUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`,
        "width": 512,
        "height": 512
      },
      "sameAs": [
        "https://twitter.com/hararemetro",
        "https://facebook.com/hararemetro"
      ]
    }
  }
  
  // Generate news aggregator structured data
  const newsAggregatorStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Zimbabwe News Aggregator",
    "description": "Real-time news aggregation from Zimbabwe's trusted sources",
    "url": siteUrl,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Harare Metro"
    },
    "about": {
      "@type": "Thing",
      "name": "Zimbabwe News"
    }
  }
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <link rel="canonical" href={finalUrl} />
      
      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:site_name" content="Harare Metro" />
      <meta property="og:locale" content="en_ZW" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      <meta name="twitter:site" content="@hararemetro" />
      <meta name="twitter:creator" content="@hararemetro" />
      
      {/* Article specific meta tags */}
      {article && (
        <>
          <meta property="article:published_time" content={article.pubDate} />
          <meta property="article:modified_time" content={article.pubDate} />
          <meta property="article:section" content={article.category} />
          <meta property="article:tag" content={article.category} />
          <meta property="article:tag" content="Zimbabwe" />
          <meta property="article:tag" content={article.source} />
        </>
      )}
      
      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="googlebot" content="index, follow" />
      <meta name="google" content="notranslate" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="HM News" />
      
      {/* Language and Region */}
      <meta property="og:locale:alternate" content="en_US" />
      <meta property="og:locale:alternate" content="en_GB" />
      <meta name="language" content="English" />
      <meta name="geo.region" content="ZW" />
      <meta name="geo.placename" content="Harare" />
      <meta name="geo.position" content="-17.8292;31.0522" />
      <meta name="ICBM" content="-17.8292, 31.0522" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(websiteStructuredData)}
      </script>
      
      <script type="application/ld+json">
        {JSON.stringify(newsAggregatorStructuredData)}
      </script>
      
      {article && (
        <script type="application/ld+json">
          {JSON.stringify(articleStructuredData)}
        </script>
      )}
      
      {/* Breadcrumb structured data */}
      {article && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": siteUrl
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": article.category.charAt(0).toUpperCase() + article.category.slice(1),
                "item": `${siteUrl}/?category=${article.category}`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": article.title,
                "item": article.link
              }
            ]
          })}
        </script>
      )}
    </Helmet>
  )
}

export default SEO