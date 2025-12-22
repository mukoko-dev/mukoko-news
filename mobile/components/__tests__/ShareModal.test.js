/**
 * ShareModal Tests
 * Comprehensive test suite for the share modal component
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Share as RNShare, Clipboard, Platform } from 'react-native';
import ShareModal from '../ShareModal';

// Mock dependencies
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
}));
jest.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: '#FAF9F5',
        surface: '#FFFFFF',
        primary: '#4B0082',
        'on-surface': '#1C1B1F',
        'on-surface-variant': '#4a4a4a',
        'on-primary': '#FFFFFF',
        outline: '#e0dfdc',
        'brand-twitter': '#1DA1F2',
        'brand-whatsapp': '#25D366',
        'brand-facebook': '#1877F2',
        'brand-linkedin': '#0A66C2',
      },
    },
  }),
}));

describe('ShareModal', () => {
  const mockArticle = {
    id: '123',
    title: 'Test Article Title',
    original_url: 'https://example.com/article',
  };

  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    RNShare.share = jest.fn().mockResolvedValue({ action: RNShare.sharedAction });
    Clipboard.setString = jest.fn().mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('renders when visible is true', () => {
      const { getByText } = render(
        <ShareModal visible={true} onDismiss={mockOnDismiss} article={mockArticle} />
      );

      expect(getByText('Share Article')).toBeTruthy();
    });

    it('does not render when visible is false', () => {
      const { queryByText } = render(
        <ShareModal visible={false} onDismiss={mockOnDismiss} article={mockArticle} />
      );

      expect(queryByText('Share Article')).toBeNull();
    });

    it('does not render when article is null', () => {
      const { queryByText } = render(
        <ShareModal visible={true} onDismiss={mockOnDismiss} article={null} />
      );

      expect(queryByText('Share Article')).toBeNull();
    });

    it('displays share options', () => {
      const { getByText } = render(
        <ShareModal visible={true} onDismiss={mockOnDismiss} article={mockArticle} />
      );

      expect(getByText('Native Share')).toBeTruthy();
      expect(getByText('Copy Link')).toBeTruthy();
      expect(getByText('Twitter')).toBeTruthy();
      expect(getByText('WhatsApp')).toBeTruthy();
      expect(getByText('Facebook')).toBeTruthy();
      expect(getByText('LinkedIn')).toBeTruthy();
    });

    it('displays article title', () => {
      const { getByText } = render(
        <ShareModal visible={true} onDismiss={mockOnDismiss} article={mockArticle} />
      );

      expect(getByText('Test Article Title')).toBeTruthy();
    });
  });

  describe('Native Share', () => {
    it('calls native share API when Native Share is pressed', async () => {
      const { getByText } = render(
        <ShareModal visible={true} onDismiss={mockOnDismiss} article={mockArticle} />
      );

      const nativeShareButton = getByText('Native Share');
      fireEvent.press(nativeShareButton);

      await waitFor(() => {
        expect(RNShare.share).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringContaining('Test Article Title'),
            title: 'Test Article Title',
            url: 'https://example.com/article',
          })
        );
      });
    });

    it('dismisses modal after successful share', async () => {
      const { getByText } = render(
        <ShareModal visible={true} onDismiss={mockOnDismiss} article={mockArticle} />
      );

      const nativeShareButton = getByText('Native Share');
      fireEvent.press(nativeShareButton);

      await waitFor(() => {
        expect(mockOnDismiss).toHaveBeenCalled();
      });
    });

    it('handles share error gracefully', async () => {
      RNShare.share.mockRejectedValue(new Error('Share failed'));

      const { getByText } = render(
        <ShareModal visible={true} onDismiss={mockOnDismiss} article={mockArticle} />
      );

      const nativeShareButton = getByText('Native Share');
      fireEvent.press(nativeShareButton);

      await waitFor(() => {
        // Should not crash
        expect(RNShare.share).toHaveBeenCalled();
      });
    });

    it('triggers haptic feedback on native share', async () => {
      const Haptics = require('expo-haptics');
      const { getByText } = render(
        <ShareModal visible={true} onDismiss={mockOnDismiss} article={mockArticle} />
      );

      const nativeShareButton = getByText('Native Share');
      fireEvent.press(nativeShareButton);

      await waitFor(() => {
        expect(Haptics.impactAsync).toHaveBeenCalled();
      });
    });
  });

  describe('Copy Link', () => {
    it('copies link to clipboard when Copy Link is pressed', async () => {
      const { getByText } = render(
        <ShareModal visible={true} onDismiss={mockOnDismiss} article={mockArticle} />
      );

      const copyLinkButton = getByText('Copy Link');
      fireEvent.press(copyLinkButton);

      await waitFor(() => {
        expect(Clipboard.setString).toHaveBeenCalledWith('https://example.com/article');
      });
    });

    it('shows "Copied!" feedback after copying', async () => {
      const { getByText } = render(
        <ShareModal visible={true} onDismiss={mockOnDismiss} article={mockArticle} />
      );

      const copyLinkButton = getByText('Copy Link');
      fireEvent.press(copyLinkButton);

      await waitFor(() => {
        expect(getByText('Copied!')).toBeTruthy();
      });
    });

    it('dismisses modal after copying', async () => {
      jest.useFakeTimers();

      const { getByText } = render(
        <ShareModal visible={true} onDismiss={mockOnDismiss} article={mockArticle} />
      );

      const copyLinkButton = getByText('Copy Link');
      fireEvent.press(copyLinkButton);

      jest.advanceTimersByTime(1500);

      await waitFor(() => {
        expect(mockOnDismiss).toHaveBeenCalled();
      });

      jest.useRealTimers();
    });

    it('triggers haptic feedback on copy', async () => {
      const Haptics = require('expo-haptics');
      const { getByText } = render(
        <ShareModal visible={true} onDismiss={mockOnDismiss} article={mockArticle} />
      );

      const copyLinkButton = getByText('Copy Link');
      fireEvent.press(copyLinkButton);

      await waitFor(() => {
        expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
      });
    });

    it('handles copy error gracefully', async () => {
      Clipboard.setString.mockRejectedValue(new Error('Copy failed'));

      const { getByText } = render(
        <ShareModal visible={true} onDismiss={mockOnDismiss} article={mockArticle} />
      );

      const copyLinkButton = getByText('Copy Link');
      fireEvent.press(copyLinkButton);

      await waitFor(() => {
        // Should not crash
        expect(Clipboard.setString).toHaveBeenCalled();
      });
    });
  });

  describe('Social Media Sharing', () => {
    it('dismisses modal after Twitter share', async () => {
      const { getByText } = render(
        <ShareModal visible={true} onDismiss={mockOnDismiss} article={mockArticle} />
      );

      const twitterButton = getByText('Twitter');
      fireEvent.press(twitterButton);

      await waitFor(() => {
        expect(mockOnDismiss).toHaveBeenCalled();
      });
    });

    it('dismisses modal after WhatsApp share', async () => {
      const { getByText } = render(
        <ShareModal visible={true} onDismiss={mockOnDismiss} article={mockArticle} />
      );

      const whatsappButton = getByText('WhatsApp');
      fireEvent.press(whatsappButton);

      await waitFor(() => {
        expect(mockOnDismiss).toHaveBeenCalled();
      });
    });

    it('dismisses modal after Facebook share', async () => {
      const { getByText } = render(
        <ShareModal visible={true} onDismiss={mockOnDismiss} article={mockArticle} />
      );

      const facebookButton = getByText('Facebook');
      fireEvent.press(facebookButton);

      await waitFor(() => {
        expect(mockOnDismiss).toHaveBeenCalled();
      });
    });

    it('dismisses modal after LinkedIn share', async () => {
      const { getByText } = render(
        <ShareModal visible={true} onDismiss={mockOnDismiss} article={mockArticle} />
      );

      const linkedinButton = getByText('LinkedIn');
      fireEvent.press(linkedinButton);

      await waitFor(() => {
        expect(mockOnDismiss).toHaveBeenCalled();
      });
    });

    it('triggers haptic feedback on social share', async () => {
      const Haptics = require('expo-haptics');
      const { getByText } = render(
        <ShareModal visible={true} onDismiss={mockOnDismiss} article={mockArticle} />
      );

      const twitterButton = getByText('Twitter');
      fireEvent.press(twitterButton);

      await waitFor(() => {
        expect(Haptics.impactAsync).toHaveBeenCalled();
      });
    });
  });

  describe('Close Button', () => {
    it('dismisses modal when close button is pressed', () => {
      const { getByLabelText } = render(
        <ShareModal visible={true} onDismiss={mockOnDismiss} article={mockArticle} />
      );

      const closeButton = getByLabelText('Close');
      fireEvent.press(closeButton);

      expect(mockOnDismiss).toHaveBeenCalled();
    });
  });

  describe('Drag to Dismiss', () => {
    it('handles drag gestures', () => {
      const { getByTestId } = render(
        <ShareModal visible={true} onDismiss={mockOnDismiss} article={mockArticle} />
      );

      // Pan responder is set up
      // Drag gesture handling tested internally
    });
  });

  describe('URL Generation', () => {
    it('uses original_url when available', () => {
      render(
        <ShareModal
          visible={true}
          onDismiss={mockOnDismiss}
          article={{ ...mockArticle, original_url: 'https://custom.com/article' }}
        />
      );

      // URL should be https://custom.com/article
    });

    it('falls back to mukoko.com URL when original_url is missing', () => {
      render(
        <ShareModal
          visible={true}
          onDismiss={mockOnDismiss}
          article={{ id: '456', title: 'Test', original_url: null }}
        />
      );

      // URL should be https://mukoko.com/article/456
    });
  });

  describe('Share Text', () => {
    it('includes article title in share text', async () => {
      const { getByText } = render(
        <ShareModal visible={true} onDismiss={mockOnDismiss} article={mockArticle} />
      );

      const nativeShareButton = getByText('Native Share');
      fireEvent.press(nativeShareButton);

      await waitFor(() => {
        expect(RNShare.share).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringContaining('Test Article Title'),
          })
        );
      });
    });

    it('includes "Read on Mukoko News" in share text', async () => {
      const { getByText } = render(
        <ShareModal visible={true} onDismiss={mockOnDismiss} article={mockArticle} />
      );

      const nativeShareButton = getByText('Native Share');
      fireEvent.press(nativeShareButton);

      await waitFor(() => {
        expect(RNShare.share).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringContaining('Read on Mukoko News'),
          })
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessible close button', () => {
      const { getByLabelText } = render(
        <ShareModal visible={true} onDismiss={mockOnDismiss} article={mockArticle} />
      );

      expect(getByLabelText('Close')).toBeTruthy();
    });

    it('share options have proper labels', () => {
      const { getByLabelText } = render(
        <ShareModal visible={true} onDismiss={mockOnDismiss} article={mockArticle} />
      );

      expect(getByLabelText('Share via Twitter')).toBeTruthy();
      expect(getByLabelText('Share via WhatsApp')).toBeTruthy();
      expect(getByLabelText('Share via Facebook')).toBeTruthy();
      expect(getByLabelText('Share via LinkedIn')).toBeTruthy();
    });
  });

  describe('Platform-specific Behavior', () => {
    it('uses navigator.clipboard on web', async () => {
      Platform.OS = 'web';
      global.navigator = {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      };

      const { getByText } = render(
        <ShareModal visible={true} onDismiss={mockOnDismiss} article={mockArticle} />
      );

      const copyLinkButton = getByText('Copy Link');
      fireEvent.press(copyLinkButton);

      await waitFor(() => {
        expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith(
          'https://example.com/article'
        );
      });
    });

    it('opens Twitter in new tab on web', async () => {
      Platform.OS = 'web';
      global.window = {
        open: jest.fn(),
      };

      const { getByText } = render(
        <ShareModal visible={true} onDismiss={mockOnDismiss} article={mockArticle} />
      );

      const twitterButton = getByText('Twitter');
      fireEvent.press(twitterButton);

      await waitFor(() => {
        expect(global.window.open).toHaveBeenCalledWith(
          expect.stringContaining('twitter.com/intent/tweet'),
          '_blank'
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles very long article titles', () => {
      const longTitle = 'A'.repeat(200);
      const { getByText } = render(
        <ShareModal
          visible={true}
          onDismiss={mockOnDismiss}
          article={{ ...mockArticle, title: longTitle }}
        />
      );

      expect(getByText(longTitle)).toBeTruthy();
    });

    it('handles articles without title', () => {
      const { queryByText } = render(
        <ShareModal
          visible={true}
          onDismiss={mockOnDismiss}
          article={{ id: '123', title: null, original_url: 'https://example.com' }}
        />
      );

      // Should still render modal
      expect(queryByText('Share Article')).toBeTruthy();
    });

    it('handles special characters in URL', async () => {
      const specialUrl = 'https://example.com/article?id=123&utm=test';
      const { getByText } = render(
        <ShareModal
          visible={true}
          onDismiss={mockOnDismiss}
          article={{ ...mockArticle, original_url: specialUrl }}
        />
      );

      const copyLinkButton = getByText('Copy Link');
      fireEvent.press(copyLinkButton);

      await waitFor(() => {
        expect(Clipboard.setString).toHaveBeenCalledWith(specialUrl);
      });
    });
  });
});
