/**
 * FaviconService - News Source Favicon and Branding Service
 *
 * Uses Google's Favicon API as the primary source for favicons.
 * Provides fallback to initials with brand colors for display.
 */

// Zimbabwe news source profiles with domain and branding data
const SOURCE_PROFILES = {
  // Major Media Houses
  'The Herald': {
    name: 'The Herald',
    shortName: 'Herald',
    domain: 'herald.co.zw',
    colors: { primary: '#0066cc', secondary: '#003366' },
    initials: 'TH',
  },
  'Herald Zimbabwe': {
    name: 'Herald Zimbabwe',
    shortName: 'Herald',
    domain: 'herald.co.zw',
    colors: { primary: '#0066cc', secondary: '#003366' },
    initials: 'TH',
  },
  'NewsDay': {
    name: 'NewsDay',
    shortName: 'NewsDay',
    domain: 'newsday.co.zw',
    colors: { primary: '#f39c12', secondary: '#e67e22' },
    initials: 'ND',
  },
  'The Chronicle': {
    name: 'The Chronicle',
    shortName: 'Chronicle',
    domain: 'chronicle.co.zw',
    colors: { primary: '#8e44ad', secondary: '#732d91' },
    initials: 'TC',
  },
  'Chronicle': {
    name: 'Chronicle',
    shortName: 'Chronicle',
    domain: 'chronicle.co.zw',
    colors: { primary: '#8e44ad', secondary: '#732d91' },
    initials: 'TC',
  },

  // Key Online Publications
  'ZimLive': {
    name: 'ZimLive',
    shortName: 'ZimLive',
    domain: 'zimlive.com',
    colors: { primary: '#e74c3c', secondary: '#c0392b' },
    initials: 'ZL',
  },
  'The Standard': {
    name: 'The Standard',
    shortName: 'Standard',
    domain: 'thestandard.co.zw',
    colors: { primary: '#2c3e50', secondary: '#34495e' },
    initials: 'TS',
  },
  '263Chat': {
    name: '263Chat',
    shortName: '263Chat',
    domain: '263chat.com',
    colors: { primary: '#3498db', secondary: '#2980b9' },
    initials: '263',
  },

  // Regional & Alternative Media
  'The Zimbabwean': {
    name: 'The Zimbabwean',
    shortName: 'TheZim',
    domain: 'thezimbabwean.co',
    colors: { primary: '#27ae60', secondary: '#1e8449' },
    initials: 'TZ',
  },
  'ZimEye': {
    name: 'ZimEye',
    shortName: 'ZimEye',
    domain: 'zimeye.net',
    colors: { primary: '#e91e63', secondary: '#c2185b' },
    initials: 'ZE',
  },
  'MyZimbabwe': {
    name: 'MyZimbabwe',
    shortName: 'MyZim',
    domain: 'myzimbabwe.co.zw',
    colors: { primary: '#00a651', secondary: '#008c44' },
    initials: 'MZ',
  },
  'New Zimbabwe': {
    name: 'New Zimbabwe',
    shortName: 'NewZim',
    domain: 'newzimbabwe.com',
    colors: { primary: '#c41e3a', secondary: '#a01830' },
    initials: 'NZ',
  },
  'NewZimbabwe': {
    name: 'NewZimbabwe',
    shortName: 'NewZim',
    domain: 'newzimbabwe.com',
    colors: { primary: '#c41e3a', secondary: '#a01830' },
    initials: 'NZ',
  },
  'ZimFact': {
    name: 'ZimFact',
    shortName: 'ZimFact',
    domain: 'zimfact.org',
    colors: { primary: '#16a085', secondary: '#1abc9c' },
    initials: 'ZF',
  },
  'Nehanda Radio': {
    name: 'Nehanda Radio',
    shortName: 'Nehanda',
    domain: 'nehandaradio.com',
    colors: { primary: '#e74c3c', secondary: '#c0392b' },
    initials: 'NR',
  },
  'Pindula News': {
    name: 'Pindula News',
    shortName: 'Pindula',
    domain: 'news.pindula.co.zw',
    colors: { primary: '#2ecc71', secondary: '#27ae60' },
    initials: 'PN',
  },
  'Pindula': {
    name: 'Pindula',
    shortName: 'Pindula',
    domain: 'news.pindula.co.zw',
    colors: { primary: '#2ecc71', secondary: '#27ae60' },
    initials: 'PN',
  },

  // Business & Finance
  'Financial Gazette': {
    name: 'Financial Gazette',
    shortName: 'FinGaz',
    domain: 'fingaz.co.zw',
    colors: { primary: '#2980b9', secondary: '#1a5276' },
    initials: 'FG',
  },
  'Zimbabwe Independent': {
    name: 'Zimbabwe Independent',
    shortName: 'ZimInd',
    domain: 'theindependent.co.zw',
    colors: { primary: '#34495e', secondary: '#2c3e50' },
    initials: 'ZI',
  },
  'Business Weekly': {
    name: 'Business Weekly',
    shortName: 'BizWeek',
    domain: 'businessweekly.co.zw',
    colors: { primary: '#1f618d', secondary: '#154360' },
    initials: 'BW',
  },
  'The Source': {
    name: 'The Source',
    shortName: 'Source',
    domain: 'thesource.co.zw',
    colors: { primary: '#117a65', secondary: '#0e6655' },
    initials: 'TS',
  },

  // Technology & Innovation
  'Techzim': {
    name: 'Techzim',
    shortName: 'Techzim',
    domain: 'techzim.co.zw',
    colors: { primary: '#9b59b6', secondary: '#8e44ad' },
    initials: 'TZ',
  },
  'TechnoMag': {
    name: 'TechnoMag',
    shortName: 'TechMag',
    domain: 'technomag.co.zw',
    colors: { primary: '#5dade2', secondary: '#3498db' },
    initials: 'TM',
  },

  // Broadcasting & Media
  'ZBC News Online': {
    name: 'ZBC News Online',
    shortName: 'ZBC',
    domain: 'zbc.co.zw',
    colors: { primary: '#00a651', secondary: '#008c44' },
    initials: 'ZBC',
  },
  'ZBC': {
    name: 'ZBC',
    shortName: 'ZBC',
    domain: 'zbc.co.zw',
    colors: { primary: '#00a651', secondary: '#008c44' },
    initials: 'ZBC',
  },
  'Star FM': {
    name: 'Star FM',
    shortName: 'StarFM',
    domain: 'starfm.co.zw',
    colors: { primary: '#f1c40f', secondary: '#f39c12' },
    initials: 'SF',
  },
  'ZiFM Stereo': {
    name: 'ZiFM Stereo',
    shortName: 'ZiFM',
    domain: 'zifmstereo.co.zw',
    colors: { primary: '#e67e22', secondary: '#d35400' },
    initials: 'ZFM',
  },

  // Sports
  'The Sports Hub': {
    name: 'The Sports Hub',
    shortName: 'SportsHub',
    domain: 'thesportshub.co.zw',
    colors: { primary: '#27ae60', secondary: '#1e8449' },
    initials: 'SH',
  },
  'Soccer24': {
    name: 'Soccer24',
    shortName: 'Soccer24',
    domain: 'soccer24.co.zw',
    colors: { primary: '#2ecc71', secondary: '#27ae60' },
    initials: 'S24',
  },
  'Zimbabwe Cricket': {
    name: 'Zimbabwe Cricket',
    shortName: 'ZimCricket',
    domain: 'zimcricket.org',
    colors: { primary: '#e74c3c', secondary: '#c0392b' },
    initials: 'ZC',
  },

  // Education
  'University of Zimbabwe': {
    name: 'University of Zimbabwe',
    shortName: 'UZ',
    domain: 'uz.ac.zw',
    colors: { primary: '#1a5276', secondary: '#154360' },
    initials: 'UZ',
  },

  // Tourism & Travel
  'Zimbabwe Tourism Authority': {
    name: 'Zimbabwe Tourism Authority',
    shortName: 'ZimTour',
    domain: 'zimbabwetourism.net',
    colors: { primary: '#00a651', secondary: '#008c44' },
    initials: 'ZTA',
  },
  'Victoria Falls Guide': {
    name: 'Victoria Falls Guide',
    shortName: 'VicFalls',
    domain: 'victoriafallsguide.net',
    colors: { primary: '#3498db', secondary: '#2980b9' },
    initials: 'VF',
  },

  // Health
  'Ministry of Health Zimbabwe': {
    name: 'Ministry of Health Zimbabwe',
    shortName: 'MOH',
    domain: 'mohcc.gov.zw',
    colors: { primary: '#16a085', secondary: '#1abc9c' },
    initials: 'MOH',
  },

  // International
  'BBC': {
    name: 'BBC',
    shortName: 'BBC',
    domain: 'bbc.com',
    colors: { primary: '#bb1919', secondary: '#8b0000' },
    initials: 'BBC',
  },
  'Reuters': {
    name: 'Reuters',
    shortName: 'Reuters',
    domain: 'reuters.com',
    colors: { primary: '#ff8000', secondary: '#cc6600' },
    initials: 'R',
  },
  'Al Jazeera': {
    name: 'Al Jazeera',
    shortName: 'AJ',
    domain: 'aljazeera.com',
    colors: { primary: '#d2911c', secondary: '#b87a14' },
    initials: 'AJ',
  },
};

// Default colors for unknown sources (Zimbabwe flag inspired)
const DEFAULT_COLORS = [
  { primary: '#00a651', secondary: '#008c44' }, // Green
  { primary: '#fdd116', secondary: '#d4a800' }, // Yellow
  { primary: '#ef3340', secondary: '#c02030' }, // Red
  { primary: '#000000', secondary: '#333333' }, // Black
  { primary: '#3498db', secondary: '#2980b9' }, // Blue
  { primary: '#9b59b6', secondary: '#8e44ad' }, // Purple
  { primary: '#e67e22', secondary: '#d35400' }, // Orange
  { primary: '#1abc9c', secondary: '#16a085' }, // Teal
];

/**
 * Generate a consistent color for a source name
 */
const getColorForSource = (sourceName) => {
  if (!sourceName) return DEFAULT_COLORS[0];

  let hash = 0;
  for (let i = 0; i < sourceName.length; i++) {
    hash = sourceName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % DEFAULT_COLORS.length;
  return DEFAULT_COLORS[index];
};

/**
 * Generate initials from source name
 */
const generateInitials = (sourceName) => {
  if (!sourceName) return '?';

  const words = sourceName.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return words
    .slice(0, 3)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
};

/**
 * Get source profile by name (case-insensitive matching)
 */
export const getSourceProfile = (sourceName) => {
  if (!sourceName) {
    return createFallbackProfile('Unknown');
  }

  // Try exact match first
  if (SOURCE_PROFILES[sourceName]) {
    return SOURCE_PROFILES[sourceName];
  }

  // Try case-insensitive match
  const normalizedName = sourceName.toLowerCase();
  for (const [key, profile] of Object.entries(SOURCE_PROFILES)) {
    if (key.toLowerCase() === normalizedName) {
      return profile;
    }
  }

  // Try partial match
  for (const [key, profile] of Object.entries(SOURCE_PROFILES)) {
    if (
      key.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(key.toLowerCase())
    ) {
      return profile;
    }
  }

  return createFallbackProfile(sourceName);
};

/**
 * Create a fallback profile for unknown sources
 */
const createFallbackProfile = (sourceName) => {
  const colors = getColorForSource(sourceName);
  const initials = generateInitials(sourceName);

  return {
    name: sourceName || 'Unknown Source',
    shortName: sourceName || 'Unknown',
    domain: null,
    colors,
    initials,
    isFallback: true,
  };
};

/**
 * Get Google Favicon API URL
 * This is the most reliable method for fetching favicons
 * @param {string} sourceName - Name of the source
 * @param {number} size - Icon size (16, 32, 64, 128, 256)
 */
export const getFaviconUrl = (sourceName, size = 32) => {
  const profile = getSourceProfile(sourceName);
  if (profile.domain) {
    return `https://www.google.com/s2/favicons?domain=${profile.domain}&sz=${size}`;
  }
  return null;
};

/**
 * Get DuckDuckGo Favicon URL as alternative
 * @param {string} sourceName - Name of the source
 */
export const getDuckDuckGoFaviconUrl = (sourceName) => {
  const profile = getSourceProfile(sourceName);
  if (profile.domain) {
    return `https://icons.duckduckgo.com/ip3/${profile.domain}.ico`;
  }
  return null;
};

/**
 * Get brand colors for a source
 */
export const getSourceColors = (sourceName) => {
  const profile = getSourceProfile(sourceName);
  return profile.colors;
};

/**
 * Get initials for a source
 */
export const getSourceInitials = (sourceName) => {
  const profile = getSourceProfile(sourceName);
  return profile.initials;
};

/**
 * Get domain for a source
 */
export const getSourceDomain = (sourceName) => {
  const profile = getSourceProfile(sourceName);
  return profile.domain;
};

/**
 * Check if a source has a known profile
 */
export const isKnownSource = (sourceName) => {
  const profile = getSourceProfile(sourceName);
  return !profile.isFallback;
};

/**
 * Get all available source profiles
 */
export const getAllSourceProfiles = () => {
  return { ...SOURCE_PROFILES };
};

export default {
  getSourceProfile,
  getFaviconUrl,
  getDuckDuckGoFaviconUrl,
  getSourceColors,
  getSourceInitials,
  getSourceDomain,
  isKnownSource,
  getAllSourceProfiles,
};
