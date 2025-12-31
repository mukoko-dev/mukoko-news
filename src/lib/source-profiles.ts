/**
 * News Source Profiles and Favicon Service
 * Uses Google's Favicon API for reliable icon fetching
 */

interface SourceProfile {
  name: string;
  shortName: string;
  domain: string | null;
  colors: { primary: string; secondary: string };
  initials: string;
  isFallback?: boolean;
}

// Zimbabwe and Pan-African news source profiles
const SOURCE_PROFILES: Record<string, SourceProfile> = {
  // Major Zimbabwe Media
  'The Herald': {
    name: 'The Herald',
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
  'New Zimbabwe': {
    name: 'New Zimbabwe',
    shortName: 'NewZim',
    domain: 'newzimbabwe.com',
    colors: { primary: '#c41e3a', secondary: '#a01830' },
    initials: 'NZ',
  },
  'Pindula News': {
    name: 'Pindula News',
    shortName: 'Pindula',
    domain: 'news.pindula.co.zw',
    colors: { primary: '#2ecc71', secondary: '#27ae60' },
    initials: 'PN',
  },
  'Techzim': {
    name: 'Techzim',
    shortName: 'Techzim',
    domain: 'techzim.co.zw',
    colors: { primary: '#9b59b6', secondary: '#8e44ad' },
    initials: 'TZ',
  },
  'ZBC': {
    name: 'ZBC',
    shortName: 'ZBC',
    domain: 'zbc.co.zw',
    colors: { primary: '#00a651', secondary: '#008c44' },
    initials: 'ZBC',
  },
  'Nehanda Radio': {
    name: 'Nehanda Radio',
    shortName: 'Nehanda',
    domain: 'nehandaradio.com',
    colors: { primary: '#e74c3c', secondary: '#c0392b' },
    initials: 'NR',
  },
  // South Africa
  'News24': {
    name: 'News24',
    shortName: 'News24',
    domain: 'news24.com',
    colors: { primary: '#e74c3c', secondary: '#c0392b' },
    initials: 'N24',
  },
  'Daily Maverick': {
    name: 'Daily Maverick',
    shortName: 'Maverick',
    domain: 'dailymaverick.co.za',
    colors: { primary: '#1a1a2e', secondary: '#16213e' },
    initials: 'DM',
  },
  'IOL': {
    name: 'IOL',
    shortName: 'IOL',
    domain: 'iol.co.za',
    colors: { primary: '#0066cc', secondary: '#004c99' },
    initials: 'IOL',
  },
  // Kenya
  'Nation': {
    name: 'Nation',
    shortName: 'Nation',
    domain: 'nation.africa',
    colors: { primary: '#d32f2f', secondary: '#b71c1c' },
    initials: 'N',
  },
  'The Star Kenya': {
    name: 'The Star Kenya',
    shortName: 'Star',
    domain: 'the-star.co.ke',
    colors: { primary: '#ff9800', secondary: '#f57c00' },
    initials: 'TS',
  },
  // Nigeria
  'Punch': {
    name: 'Punch',
    shortName: 'Punch',
    domain: 'punchng.com',
    colors: { primary: '#1565c0', secondary: '#0d47a1' },
    initials: 'P',
  },
  'Vanguard': {
    name: 'Vanguard',
    shortName: 'Vanguard',
    domain: 'vanguardngr.com',
    colors: { primary: '#2e7d32', secondary: '#1b5e20' },
    initials: 'V',
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

// Default colors (Zimbabwe flag inspired)
const DEFAULT_COLORS = [
  { primary: '#00a651', secondary: '#008c44' },
  { primary: '#fdd116', secondary: '#d4a800' },
  { primary: '#ef3340', secondary: '#c02030' },
  { primary: '#3498db', secondary: '#2980b9' },
  { primary: '#9b59b6', secondary: '#8e44ad' },
  { primary: '#e67e22', secondary: '#d35400' },
  { primary: '#1abc9c', secondary: '#16a085' },
];

function getColorForSource(sourceName: string) {
  if (!sourceName) return DEFAULT_COLORS[0];
  let hash = 0;
  for (let i = 0; i < sourceName.length; i++) {
    hash = sourceName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return DEFAULT_COLORS[Math.abs(hash) % DEFAULT_COLORS.length];
}

function generateInitials(sourceName: string): string {
  if (!sourceName) return '?';
  const words = sourceName.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return words.slice(0, 3).map(w => w[0]).join('').toUpperCase();
}

export function getSourceProfile(sourceName: string): SourceProfile {
  if (!sourceName) {
    return {
      name: 'Unknown',
      shortName: 'Unknown',
      domain: null,
      colors: DEFAULT_COLORS[0],
      initials: '?',
      isFallback: true,
    };
  }

  // Try exact match
  if (SOURCE_PROFILES[sourceName]) {
    return SOURCE_PROFILES[sourceName];
  }

  // Try case-insensitive match
  const normalized = sourceName.toLowerCase();
  for (const [key, profile] of Object.entries(SOURCE_PROFILES)) {
    if (key.toLowerCase() === normalized) {
      return profile;
    }
  }

  // Try partial match
  for (const [key, profile] of Object.entries(SOURCE_PROFILES)) {
    if (key.toLowerCase().includes(normalized) || normalized.includes(key.toLowerCase())) {
      return profile;
    }
  }

  // Fallback
  return {
    name: sourceName,
    shortName: sourceName,
    domain: null,
    colors: getColorForSource(sourceName),
    initials: generateInitials(sourceName),
    isFallback: true,
  };
}

export function getFaviconUrl(sourceName: string, size = 32): string | null {
  const profile = getSourceProfile(sourceName);
  if (profile.domain) {
    return `https://www.google.com/s2/favicons?domain=${profile.domain}&sz=${size}`;
  }
  return null;
}

export function getSourceColors(sourceName: string) {
  return getSourceProfile(sourceName).colors;
}

export function getSourceInitials(sourceName: string) {
  return getSourceProfile(sourceName).initials;
}
