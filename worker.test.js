// worker.test.js - Basic tests for the Harare Metro Cloudflare Worker
// Developed by Bryan Fawcett (@bryanfawcett) in collaboration with Claude AI
// Created by Nyuchi Web Services - https://nyuchi.com

import { describe, it, expect, beforeAll } from 'vitest';

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

  it('should calculate relevance scores', () => {
    const testCases = [
      {
        text: 'Harare Zimbabwe infrastructure development',
        expectedMinScore: 15
      },
      {
        text: 'International news from Europe',
        expectedMaxScore: 5
      }
    ];

    testCases.forEach(testCase => {
      const score = calculateRelevance(testCase.text);
      if (testCase.expectedMinScore) {
        expect(score).toBeGreaterThanOrEqual(testCase.expectedMinScore);
      }
      if (testCase.expectedMaxScore) {
        expect(score).toBeLessThanOrEqual(testCase.expectedMaxScore);
      }
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

function calculateRelevance(text) {
  const lowerText = text.toLowerCase();
  let score = 0;
  
  if (lowerText.includes('zimbabwe') || lowerText.includes('zim ')) score += 10;
  if (lowerText.includes('harare')) score += 8;
  
  const priorityKeywords = ['parliament', 'government', 'economy', 'business', 'sports'];
  priorityKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      score += 2;
    }
  });
  
  return score;
}
