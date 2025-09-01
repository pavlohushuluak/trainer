# Analytics Tracking System

This directory contains the analytics tracking components and hooks for the TierTrainer application.

## Overview

The analytics system automatically tracks page views and user interactions, storing them in the `analytics_events` table in Supabase.

## Components

### PageViewTracker

A React component that automatically tracks page views when routes change. It's mounted at the app level in `App.tsx` and tracks all navigation automatically.

**Features:**
- Automatic page view tracking on route changes
- Smart event type detection based on current path
- Rich metadata collection (timestamp, referrer, user agent, viewport)
- No visible UI (renders null)

**Event Types:**
- `homepage_view` - When user visits the homepage (/)
- `mainpage_view` - When user visits the main training page (/mein-tiertraining)
- `page_view` - For all other pages

## Hooks

### useAnalytics

Provides analytics tracking functionality throughout the application.

**Functions:**
- `trackEvent(eventType, metadata?)` - Track custom events
- `trackPageView(metadata?)` - Smart page view tracking

**Supported Event Types:**
- `homepage_view` - Homepage visits
- `mainpage_view` - Main training page visits
- `page_view` - Generic page views
- `chat_started` - Chat sessions started
- `subscription_created` - New subscriptions
- `trial_started` - Trial subscriptions started
- `auth_required_for_chat` - Authentication required for chat
- Performance metrics: `performance_lcp`, `performance_cls`, `performance_fid`, `performance_ttfb`, `performance_load_time`

## Database Schema

Events are stored in the `analytics_events` table with the following structure:

```sql
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  page_path TEXT,
  session_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Usage

### Automatic Tracking

Page views are automatically tracked when the `PageViewTracker` component is mounted (already done in `App.tsx`).

### Manual Tracking

```tsx
import { useAnalytics } from '@/hooks/useAnalytics';

const MyComponent = () => {
  const { trackEvent, trackPageView } = useAnalytics();

  const handleButtonClick = () => {
    trackEvent('button_clicked', { buttonId: 'submit' });
  };

  const handlePageView = () => {
    trackPageView({ customData: 'value' });
  };

  return <button onClick={handleButtonClick}>Click me</button>;
};
```

## Configuration

### Development vs Production

- **Development**: Analytics are disabled when `window.location.hostname === 'localhost'`
- **Production**: Analytics are only tracked for authenticated users
- **Admin Pages**: Analytics are completely disabled on admin pages to prevent database flooding

### Error Handling

The system includes robust error handling:
- Failed analytics requests don't crash the application
- Connection failures are cached to prevent repeated failed requests
- All errors are logged to console for debugging

## Testing

Test files are included:
- `PageViewTracker.test.tsx` - Tests for the PageViewTracker component
- `useAnalytics.test.tsx` - Tests for the useAnalytics hook

Run tests with:
```bash
npm test
```

## Performance Considerations

- Analytics tracking is asynchronous and non-blocking
- Failed requests don't retry to prevent performance impact
- Admin page tracking is completely disabled to prevent database flooding
- Connection failures are cached to prevent repeated failed requests
