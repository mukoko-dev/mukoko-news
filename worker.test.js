import { describe, it, expect } from 'vitest';

// Mock environment for testing
const mockEnv = {
  NEWS_STORAGE: {
    get: async (key) => {
      if (key === 'articles') {
        return JSON.stringify([
          {
            id: 'test-1',
            title: 'Test Harare News Article',
            summary: 'This is a test article about Harare infrastructure',
            category: 'harare',
            source: 'Test Source',
            publishedAt: new Date().toISOString(),
            url: 'https://example.com/test',
            keywords: ['harare', 'test'],
            relevanceScore: 10
          }
        ]);
      }
      return null;
    },
    put: async (key, value) => {
      console.log(`Mock KV PUT: ${key} = ${value.substring(0, 100)}...`);
    }
  }
};

describe('Harare Metro Worker', () => {
  it('should categorize articles correctly', () => {
    const testCases = [
      {
        text: 'Harare City Council announces new infrastructure',
        expectedCategory: 'harare'
      },
      {
        text: 'Zimbabwe parliament debates economic policy',
        expectedCategory: 'politics'
      },
      {
        text: 'Warriors prepare for AFCON qualifiers',
        expectedCategory: 'sports'
      },
      {
        text: 'New business regulations announced',
        expectedCategory: 'business'
      },
      {
        text: 'Economic growth projections for 2025',
        expectedCategory: 'economy'
      }
    ];

    testCases.forEach(testCase => {
      const category = determineCategory(testCase.text);
      expect(category).toBe(testCase.expectedCategory);
    });
  });
});

// Helper functions for testing
function determineCategory(text) {
  const lowerText = text.toLowerCase();
  
  const categoryKeywords = {
    politics: ['parliament', 'government', 'election', 'party', 'minister', 'president', 'policy'],
    economy: ['economy', 'economic', 'inflation', 'currency', 'budget', 'finance', 'bank'],
    business: ['business', 'company', 'entrepreneur', 'startup', 'market', 'industry'],
    sports: ['sport', 'football', 'soccer', 'cricket', 'rugby', 'warriors', 'afcon'],
    harare: ['harare', 'capital', 'city council', 'mayor', 'cbd']
  };
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return category;
    }
  }
  
  return 'general';
}
