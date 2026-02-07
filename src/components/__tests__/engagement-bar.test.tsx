/**
 * Tests for EngagementBar and InlineEngagement components
 * Tests rendering, interactions, and count formatting
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EngagementBar, InlineEngagement } from '../ui/engagement-bar';

describe('EngagementBar', () => {
  describe('rendering', () => {
    it('should render like button when onLike is provided', () => {
      render(<EngagementBar onLike={() => {}} />);

      expect(screen.getByLabelText('Like')).toBeInTheDocument();
    });

    it('should render comment button when onComment is provided', () => {
      render(<EngagementBar onComment={() => {}} />);

      expect(screen.getByLabelText('Comments')).toBeInTheDocument();
    });

    it('should render share button when onShare is provided', () => {
      render(<EngagementBar onShare={() => {}} />);

      expect(screen.getByLabelText('Share')).toBeInTheDocument();
      expect(screen.getByText('Share')).toBeInTheDocument();
    });

    it('should render save button when onSave is provided', () => {
      render(<EngagementBar onSave={() => {}} />);

      expect(screen.getByLabelText('Save')).toBeInTheDocument();
    });

    it('should not render buttons when handlers not provided', () => {
      render(<EngagementBar />);

      expect(screen.queryByLabelText('Like')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Comments')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Share')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Save')).not.toBeInTheDocument();
    });
  });

  describe('like button', () => {
    it('should show "Unlike" label when liked', () => {
      render(<EngagementBar onLike={() => {}} isLiked={true} />);

      expect(screen.getByLabelText('Unlike')).toBeInTheDocument();
    });

    it('should call onLike when clicked', () => {
      const onLike = vi.fn();
      render(<EngagementBar onLike={onLike} />);

      fireEvent.click(screen.getByLabelText('Like'));

      expect(onLike).toHaveBeenCalledTimes(1);
    });

    it('should display likes count when greater than 0', () => {
      render(<EngagementBar onLike={() => {}} likesCount={42} />);

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should not display count when 0', () => {
      render(<EngagementBar onLike={() => {}} likesCount={0} />);

      // Only the button should be visible, no count
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  describe('comment button', () => {
    it('should call onComment when clicked', () => {
      const onComment = vi.fn();
      render(<EngagementBar onComment={onComment} />);

      fireEvent.click(screen.getByLabelText('Comments'));

      expect(onComment).toHaveBeenCalledTimes(1);
    });

    it('should display comments count when greater than 0', () => {
      render(<EngagementBar onComment={() => {}} commentsCount={15} />);

      expect(screen.getByText('15')).toBeInTheDocument();
    });
  });

  describe('share button', () => {
    it('should call onShare when clicked', () => {
      const onShare = vi.fn();
      render(<EngagementBar onShare={onShare} />);

      fireEvent.click(screen.getByLabelText('Share'));

      expect(onShare).toHaveBeenCalledTimes(1);
    });
  });

  describe('save button', () => {
    it('should show "Unsave" label when saved', () => {
      render(<EngagementBar onSave={() => {}} isSaved={true} />);

      expect(screen.getByLabelText('Unsave')).toBeInTheDocument();
    });

    it('should call onSave when clicked', () => {
      const onSave = vi.fn();
      render(<EngagementBar onSave={onSave} />);

      fireEvent.click(screen.getByLabelText('Save'));

      expect(onSave).toHaveBeenCalledTimes(1);
    });
  });

  describe('count formatting', () => {
    it('should format large numbers with k suffix', () => {
      render(<EngagementBar onLike={() => {}} likesCount={1500} />);

      expect(screen.getByText('1.5k')).toBeInTheDocument();
    });

    it('should format thousands correctly', () => {
      render(<EngagementBar onComment={() => {}} commentsCount={2000} />);

      expect(screen.getByText('2.0k')).toBeInTheDocument();
    });

    it('should not format numbers below 1000', () => {
      render(<EngagementBar onLike={() => {}} likesCount={999} />);

      expect(screen.getByText('999')).toBeInTheDocument();
    });
  });

  describe('layout variants', () => {
    it('should apply vertical layout class', () => {
      const { container } = render(
        <EngagementBar onLike={() => {}} layout="vertical" />
      );

      expect(container.firstChild).toHaveClass('flex-col');
    });

    it('should apply horizontal layout by default', () => {
      const { container } = render(<EngagementBar onLike={() => {}} />);

      expect(container.firstChild).not.toHaveClass('flex-col');
    });
  });

  describe('size variants', () => {
    it('should render smaller buttons with sm size', () => {
      const { container } = render(
        <EngagementBar onLike={() => {}} size="sm" />
      );

      // Check for smaller button size class
      const button = container.querySelector('.w-9');
      expect(button).toBeInTheDocument();
    });

    it('should render larger buttons with md size', () => {
      const { container } = render(
        <EngagementBar onLike={() => {}} size="md" />
      );

      // Check for larger button size class
      const button = container.querySelector('.w-11');
      expect(button).toBeInTheDocument();
    });
  });
});

describe('InlineEngagement', () => {
  describe('rendering', () => {
    it('should render likes count', () => {
      render(<InlineEngagement likesCount={10} />);

      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should render comments count', () => {
      render(<InlineEngagement commentsCount={5} />);

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should default counts to 0', () => {
      render(<InlineEngagement />);

      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('like button', () => {
    it('should show "Unlike" label when liked', () => {
      render(<InlineEngagement isLiked={true} />);

      expect(screen.getByLabelText('Unlike')).toBeInTheDocument();
    });

    it('should show "Like" label when not liked', () => {
      render(<InlineEngagement isLiked={false} />);

      expect(screen.getByLabelText('Like')).toBeInTheDocument();
    });

    it('should call onLike when clicked', () => {
      const onLike = vi.fn();
      render(<InlineEngagement onLike={onLike} />);

      fireEvent.click(screen.getByLabelText('Like'));

      expect(onLike).toHaveBeenCalledTimes(1);
    });
  });

  describe('custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <InlineEngagement className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
