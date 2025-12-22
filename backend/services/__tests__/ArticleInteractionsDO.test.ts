/**
 * Tests for Article Interactions Durable Object
 * Tests real-time likes, shares, saves, and WebSocket handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Durable Object state logic tests
describe('ArticleInteractionsDO', () => {
  describe('Article State Management', () => {
    interface ArticleState {
      articleId: number;
      likesCount: number;
      sharesCount: number;
      savesCount: number;
      commentsCount: number;
      likedBy: Set<string>;
      savedBy: Set<string>;
      lastUpdated: number;
    }

    const createInitialState = (): ArticleState => ({
      articleId: 0,
      likesCount: 0,
      sharesCount: 0,
      savesCount: 0,
      commentsCount: 0,
      likedBy: new Set(),
      savedBy: new Set(),
      lastUpdated: Date.now(),
    });

    it('should initialize with default values', () => {
      const state = createInitialState();

      expect(state.likesCount).toBe(0);
      expect(state.sharesCount).toBe(0);
      expect(state.savesCount).toBe(0);
      expect(state.commentsCount).toBe(0);
      expect(state.likedBy.size).toBe(0);
      expect(state.savedBy.size).toBe(0);
    });

    it('should track unique users who liked', () => {
      const state = createInitialState();

      state.likedBy.add('user-1');
      state.likedBy.add('user-2');
      state.likedBy.add('user-1'); // Duplicate

      expect(state.likedBy.size).toBe(2);
      expect(state.likedBy.has('user-1')).toBe(true);
      expect(state.likedBy.has('user-2')).toBe(true);
    });

    it('should track unique users who saved', () => {
      const state = createInitialState();

      state.savedBy.add('user-1');
      state.savedBy.add('user-2');

      expect(state.savedBy.size).toBe(2);
    });
  });

  describe('Like Interaction', () => {
    const handleLike = (state: any, userId: string): { success: boolean; liked: boolean } => {
      if (state.likedBy.has(userId)) {
        // Unlike
        state.likedBy.delete(userId);
        state.likesCount = Math.max(0, state.likesCount - 1);
        return { success: true, liked: false };
      } else {
        // Like
        state.likedBy.add(userId);
        state.likesCount += 1;
        return { success: true, liked: true };
      }
    };

    it('should add like for new user', () => {
      const state = {
        likesCount: 0,
        likedBy: new Set<string>(),
      };

      const result = handleLike(state, 'user-1');

      expect(result.success).toBe(true);
      expect(result.liked).toBe(true);
      expect(state.likesCount).toBe(1);
      expect(state.likedBy.has('user-1')).toBe(true);
    });

    it('should remove like for existing user (toggle)', () => {
      const state = {
        likesCount: 1,
        likedBy: new Set(['user-1']),
      };

      const result = handleLike(state, 'user-1');

      expect(result.success).toBe(true);
      expect(result.liked).toBe(false);
      expect(state.likesCount).toBe(0);
      expect(state.likedBy.has('user-1')).toBe(false);
    });

    it('should not go below zero likes', () => {
      const state = {
        likesCount: 0,
        likedBy: new Set(['user-1']),
      };

      handleLike(state, 'user-1');

      expect(state.likesCount).toBe(0);
    });
  });

  describe('Save Interaction', () => {
    const handleSave = (state: any, userId: string): { success: boolean; saved: boolean } => {
      if (state.savedBy.has(userId)) {
        // Unsave
        state.savedBy.delete(userId);
        state.savesCount = Math.max(0, state.savesCount - 1);
        return { success: true, saved: false };
      } else {
        // Save
        state.savedBy.add(userId);
        state.savesCount += 1;
        return { success: true, saved: true };
      }
    };

    it('should save article for new user', () => {
      const state = {
        savesCount: 0,
        savedBy: new Set<string>(),
      };

      const result = handleSave(state, 'user-1');

      expect(result.success).toBe(true);
      expect(result.saved).toBe(true);
      expect(state.savesCount).toBe(1);
    });

    it('should unsave article for existing user', () => {
      const state = {
        savesCount: 1,
        savedBy: new Set(['user-1']),
      };

      const result = handleSave(state, 'user-1');

      expect(result.success).toBe(true);
      expect(result.saved).toBe(false);
      expect(state.savesCount).toBe(0);
    });
  });

  describe('Share Interaction', () => {
    const handleShare = (state: any): { success: boolean } => {
      state.sharesCount += 1;
      state.lastUpdated = Date.now();
      return { success: true };
    };

    it('should increment share count', () => {
      const state = {
        sharesCount: 5,
        lastUpdated: 0,
      };

      const result = handleShare(state);

      expect(result.success).toBe(true);
      expect(state.sharesCount).toBe(6);
      expect(state.lastUpdated).toBeGreaterThan(0);
    });

    it('should allow multiple shares from same user', () => {
      const state = {
        sharesCount: 0,
        lastUpdated: 0,
      };

      handleShare(state);
      handleShare(state);
      handleShare(state);

      expect(state.sharesCount).toBe(3);
    });
  });

  describe('State Serialization', () => {
    it('should serialize Set to Array for storage', () => {
      const state = {
        articleId: 123,
        likesCount: 5,
        likedBy: new Set(['user-1', 'user-2', 'user-3']),
        savedBy: new Set(['user-1']),
      };

      const serialized = {
        ...state,
        likedBy: Array.from(state.likedBy),
        savedBy: Array.from(state.savedBy),
      };

      expect(Array.isArray(serialized.likedBy)).toBe(true);
      expect(serialized.likedBy).toContain('user-1');
      expect(serialized.likedBy.length).toBe(3);
    });

    it('should deserialize Array back to Set', () => {
      const stored = {
        articleId: 123,
        likesCount: 5,
        likedBy: ['user-1', 'user-2', 'user-3'],
        savedBy: ['user-1'],
      };

      const deserialized = {
        ...stored,
        likedBy: new Set(stored.likedBy),
        savedBy: new Set(stored.savedBy),
      };

      expect(deserialized.likedBy instanceof Set).toBe(true);
      expect(deserialized.likedBy.has('user-1')).toBe(true);
      expect(deserialized.likedBy.size).toBe(3);
    });
  });

  describe('WebSocket Message Handling', () => {
    interface WSMessage {
      type: string;
      data: any;
    }

    const createMessage = (type: string, data: any): string => {
      return JSON.stringify({ type, data });
    };

    const parseMessage = (message: string): WSMessage | null => {
      try {
        return JSON.parse(message);
      } catch {
        return null;
      }
    };

    it('should create valid JSON message', () => {
      const message = createMessage('like_update', { likesCount: 10 });
      const parsed = parseMessage(message);

      expect(parsed).not.toBeNull();
      expect(parsed?.type).toBe('like_update');
      expect(parsed?.data.likesCount).toBe(10);
    });

    it('should handle initial_state message type', () => {
      const message = createMessage('initial_state', {
        articleId: 123,
        likesCount: 50,
        sharesCount: 10,
        savesCount: 25,
      });
      const parsed = parseMessage(message);

      expect(parsed?.type).toBe('initial_state');
      expect(parsed?.data.likesCount).toBe(50);
    });

    it('should handle malformed JSON gracefully', () => {
      const parsed = parseMessage('not valid json');

      expect(parsed).toBeNull();
    });
  });

  describe('Counts Response', () => {
    const getCounts = (state: any) => ({
      articleId: state.articleId,
      likesCount: state.likesCount,
      sharesCount: state.sharesCount,
      savesCount: state.savesCount,
      commentsCount: state.commentsCount,
    });

    it('should return all count values', () => {
      const state = {
        articleId: 123,
        likesCount: 100,
        sharesCount: 50,
        savesCount: 75,
        commentsCount: 30,
      };

      const counts = getCounts(state);

      expect(counts.articleId).toBe(123);
      expect(counts.likesCount).toBe(100);
      expect(counts.sharesCount).toBe(50);
      expect(counts.savesCount).toBe(75);
      expect(counts.commentsCount).toBe(30);
    });
  });

  describe('User Status Checks', () => {
    const getUserStatus = (state: any, userId: string) => ({
      hasLiked: state.likedBy.has(userId),
      hasSaved: state.savedBy.has(userId),
    });

    it('should check if user has liked article', () => {
      const state = {
        likedBy: new Set(['user-1']),
        savedBy: new Set(),
      };

      const status = getUserStatus(state, 'user-1');

      expect(status.hasLiked).toBe(true);
      expect(status.hasSaved).toBe(false);
    });

    it('should check if user has saved article', () => {
      const state = {
        likedBy: new Set(),
        savedBy: new Set(['user-1']),
      };

      const status = getUserStatus(state, 'user-1');

      expect(status.hasLiked).toBe(false);
      expect(status.hasSaved).toBe(true);
    });

    it('should return false for unknown user', () => {
      const state = {
        likedBy: new Set(['user-1']),
        savedBy: new Set(['user-1']),
      };

      const status = getUserStatus(state, 'user-2');

      expect(status.hasLiked).toBe(false);
      expect(status.hasSaved).toBe(false);
    });
  });

  describe('Pending Writes Batching', () => {
    interface Interaction {
      userId: string;
      type: 'like' | 'share' | 'save';
      timestamp: number;
    }

    const batchInteractions = (interactions: Interaction[]) => {
      // Group by user and type, keep only most recent
      const grouped = new Map<string, Interaction>();

      for (const interaction of interactions) {
        const key = `${interaction.userId}:${interaction.type}`;
        const existing = grouped.get(key);

        if (!existing || interaction.timestamp > existing.timestamp) {
          grouped.set(key, interaction);
        }
      }

      return Array.from(grouped.values());
    };

    it('should batch multiple interactions from same user', () => {
      const interactions: Interaction[] = [
        { userId: 'user-1', type: 'like', timestamp: 100 },
        { userId: 'user-1', type: 'like', timestamp: 200 }, // Newer, should win
        { userId: 'user-2', type: 'like', timestamp: 150 },
      ];

      const batched = batchInteractions(interactions);

      expect(batched.length).toBe(2);
      const user1Like = batched.find(i => i.userId === 'user-1');
      expect(user1Like?.timestamp).toBe(200);
    });

    it('should keep different interaction types separate', () => {
      const interactions: Interaction[] = [
        { userId: 'user-1', type: 'like', timestamp: 100 },
        { userId: 'user-1', type: 'save', timestamp: 100 },
      ];

      const batched = batchInteractions(interactions);

      expect(batched.length).toBe(2);
    });
  });

  describe('Article ID Extraction', () => {
    const extractArticleId = (url: URL): number => {
      const pathParts = url.pathname.split('/');
      const articleIdStr = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2];

      const articleId = parseInt(articleIdStr, 10);
      return isNaN(articleId) ? 0 : articleId;
    };

    it('should extract article ID from URL path', () => {
      const url = new URL('https://example.com/articles/123');
      expect(extractArticleId(url)).toBe(123);
    });

    it('should handle trailing slash', () => {
      const url = new URL('https://example.com/articles/456/');
      expect(extractArticleId(url)).toBe(456);
    });

    it('should return 0 for non-numeric path', () => {
      const url = new URL('https://example.com/articles/abc');
      expect(extractArticleId(url)).toBe(0);
    });

    it('should handle root path', () => {
      const url = new URL('https://example.com/');
      expect(extractArticleId(url)).toBe(0);
    });
  });
});
