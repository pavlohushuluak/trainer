import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PageViewTracker } from '../PageViewTracker';
import { useAnalytics } from '@/hooks/useAnalytics';

// Mock the useAnalytics hook
jest.mock('@/hooks/useAnalytics');
const mockTrackPageView = jest.fn();

describe('PageViewTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAnalytics as jest.Mock).mockReturnValue({
      trackPageView: mockTrackPageView
    });
  });

  it('should track page view when component mounts', () => {
    render(
      <BrowserRouter>
        <PageViewTracker />
      </BrowserRouter>
    );

    expect(mockTrackPageView).toHaveBeenCalledWith({
      timestamp: expect.any(String),
      referrer: expect.any(String),
      userAgent: expect.any(String),
      viewport: {
        width: expect.any(Number),
        height: expect.any(Number)
      }
    });
  });

  it('should not render any visible content', () => {
    const { container } = render(
      <BrowserRouter>
        <PageViewTracker />
      </BrowserRouter>
    );

    expect(container.firstChild).toBeNull();
  });
});
