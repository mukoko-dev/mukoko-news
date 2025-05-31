import { fetchFeed } from '../src/handlers/feedHandler';

describe('Feed Aggregator Tests', () => {
    test('fetchFeed should return a valid response', async () => {
        const response = await fetchFeed('https://example.com/feed');
        expect(response).toBeDefined();
        expect(response).toHaveProperty('items');
        expect(Array.isArray(response.items)).toBe(true);
    });

    test('fetchFeed should handle errors gracefully', async () => {
        const response = await fetchFeed('https://invalid-url');
        expect(response).toBeNull();
    });
});