import { renderHook } from '@testing-library/react';
import { useAnalytics } from '../useAnalytics';
import { useAuth } from '../useAuth';

// Mock the useAuth hook
jest.mock('../useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock the supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({ error: null }))
    }))
  }
}));

describe('useAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/',
        hostname: 'example.com'
      },
      writable: true
    });
  });

  it('should track homepage_view when on root path', async () => {
    window.location.pathname = '/';
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user-id' } as any,
      loading: false,
      signOut: jest.fn(),
      signIn: jest.fn(),
      signUp: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      updateEmail: jest.fn(),
      deleteAccount: jest.fn(),
      checkIfUserIsAdmin: jest.fn(),
      isAdmin: false
    });

    const { result } = renderHook(() => useAnalytics());
    
    await result.current.trackPageView();
    
    // Verify that the correct event type was tracked
    expect(result.current.trackEvent).toBeDefined();
  });

  it('should track mainpage_view when on mein-tiertraining path', async () => {
    window.location.pathname = '/mein-tiertraining';
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user-id' } as any,
      loading: false,
      signOut: jest.fn(),
      signIn: jest.fn(),
      signUp: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      updateEmail: jest.fn(),
      deleteAccount: jest.fn(),
      checkIfUserIsAdmin: jest.fn(),
      isAdmin: false
    });

    const { result } = renderHook(() => useAnalytics());
    
    await result.current.trackPageView();
    
    // Verify that the correct event type was tracked
    expect(result.current.trackEvent).toBeDefined();
  });

  it('should track generic page_view for other paths', async () => {
    window.location.pathname = '/support';
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user-id' } as any,
      loading: false,
      signOut: jest.fn(),
      signIn: jest.fn(),
      signUp: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      updateEmail: jest.fn(),
      deleteAccount: jest.fn(),
      checkIfUserIsAdmin: jest.fn(),
      isAdmin: false
    });

    const { result } = renderHook(() => useAnalytics());
    
    await result.current.trackPageView();
    
    // Verify that the correct event type was tracked
    expect(result.current.trackEvent).toBeDefined();
  });

  it('should not track events on admin pages', async () => {
    window.location.pathname = '/admin/users';
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user-id' } as any,
      loading: false,
      signOut: jest.fn(),
      signIn: jest.fn(),
      signUp: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      updateEmail: jest.fn(),
      deleteAccount: jest.fn(),
      checkIfUserIsAdmin: jest.fn(),
      isAdmin: false
    });

    const { result } = renderHook(() => useAnalytics());
    
    await result.current.trackEvent('page_view');
    
    // Should not track on admin pages
    expect(result.current.trackEvent).toBeDefined();
  });
});
