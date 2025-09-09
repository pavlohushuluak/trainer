# Google Tag Manager Implementation

This document describes the complete Google Tag Manager (GTM) implementation for TierTrainer24.

## Overview

The GTM implementation includes:
- Proper initialization in HTML
- TypeScript types for type safety
- Cookie consent integration
- Standardized event tracking
- Development/production environment handling

## Architecture

### 1. HTML Initialization (`index.html`)
```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TVRLCS6X');</script>
<!-- End Google Tag Manager -->

<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TVRLCS6X"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

### 2. TypeScript Types (`src/types/gtm.d.ts`)
- `GTMEvent`: Base event interface
- `GTMPageViewEvent`: Page view tracking
- `GTMEcommerceEvent`: E-commerce events (purchase, add_to_cart, etc.)
- `GTMAuthEvent`: Authentication events (sign_up, login, logout)
- `GTMDataLayer`: Properly typed dataLayer interface

### 3. Core Hook (`src/hooks/useGTM.tsx`)
Provides standardized tracking functions:
- `trackEvent(event: GTMEvent)`: Generic event tracking
- `trackPageView(pagePath: string, pageTitle?: string)`: Page view tracking
- `trackSignUp(method?: string)`: User registration tracking
- `trackLogin(method?: string)`: User login tracking
- `trackAddToCart(amount: number, planType?: string)`: E-commerce tracking
- `trackPaymentSuccess(amount: number, transactionId?: string)`: Purchase tracking
- `trackChatStart()`: Chat engagement tracking

### 4. Context Provider (`src/components/analytics/GTMProvider.tsx`)
- Centralized GTM state management
- Consent status tracking
- Environment-based enablement
- Conditional tracking based on consent

### 5. Cookie Consent Integration (`src/utils/cookieConsent.ts`)
- Respects user privacy preferences
- Only tracks when analytics consent is given
- Sends consent updates to GTM

## Usage Examples

### Basic Event Tracking
```typescript
import { useGTM } from '@/hooks/useGTM';

const MyComponent = () => {
  const { trackEvent } = useGTM();
  
  const handleClick = () => {
    trackEvent({
      event: 'button_click',
      event_category: 'engagement',
      event_label: 'cta_button',
      value: 1
    });
  };
};
```

### Using the Context Provider
```typescript
import { useGTMContext } from '@/components/analytics/GTMProvider';

const MyComponent = () => {
  const { trackEvent, hasConsent, isGTMEnabled } = useGTMContext();
  
  const handleAction = () => {
    if (hasConsent && isGTMEnabled) {
      trackEvent({
        event: 'custom_action',
        event_category: 'user_interaction'
      });
    }
  };
};
```

### Conditional Tracking
```typescript
import { useConditionalGTM } from '@/components/analytics/GTMProvider';

const MyComponent = () => {
  const { trackEvent } = useConditionalGTM();
  
  // This will automatically check consent and GTM status
  const handleAction = () => {
    trackEvent({
      event: 'action_performed',
      event_category: 'engagement'
    });
  };
};
```

## Event Structure

### Standard Event Properties
- `event`: Event name (required)
- `event_category`: Category for grouping events
- `event_label`: Additional context
- `value`: Numeric value (for e-commerce events)
- `currency`: Currency code (for e-commerce events)

### E-commerce Events
```typescript
// Add to Cart
{
  event: 'add_to_cart',
  value: 9.99,
  currency: 'EUR',
  event_category: 'ecommerce',
  event_label: 'plan1-monthly'
}

// Purchase
{
  event: 'purchase',
  value: 9.99,
  currency: 'EUR',
  transaction_id: 'txn_123456',
  event_category: 'ecommerce'
}
```

### Authentication Events
```typescript
// Sign Up
{
  event: 'sign_up',
  method: 'email',
  event_category: 'auth'
}

// Login
{
  event: 'login',
  method: 'google',
  event_category: 'auth'
}
```

## Environment Configuration

### Development
- GTM is disabled by default
- Set `VITE_ENABLE_GTM=true` to enable in development
- Mock dataLayer is created when disabled

### Production
- GTM is always enabled
- Full tracking functionality available

## Cookie Consent Integration

The implementation respects user privacy:

1. **No Consent**: No tracking occurs
2. **Analytics Consent**: Basic analytics tracking enabled
3. **Marketing Consent**: Full tracking including marketing events

Consent updates are sent to GTM:
```typescript
window.dataLayer.push({
  event: 'consent_update',
  analytics_consent: true,
  marketing_consent: false
});
```

## Best Practices

1. **Always check consent** before tracking
2. **Use typed events** for better development experience
3. **Include meaningful event categories** for better analytics
4. **Test in development** with `VITE_ENABLE_GTM=true`
5. **Monitor console logs** for tracking confirmation

## Troubleshooting

### GTM Not Loading
- Check browser console for errors
- Verify GTM ID is correct
- Ensure no ad blockers are interfering

### Events Not Tracking
- Check if user has given consent
- Verify event structure matches GTM configuration
- Check browser console for tracking logs

### Development Issues
- Set `VITE_ENABLE_GTM=true` in `.env.local`
- Check that dataLayer is properly initialized
- Verify TypeScript types are correct

## GTM Container Configuration

The GTM container (`GTM-TVRLCS6X`) should be configured with:

1. **Google Analytics 4** tag
2. **Custom event triggers** for all tracked events
3. **E-commerce tracking** for purchase events
4. **Conversion tracking** for sign-ups and purchases
5. **Custom dimensions** for user properties

## Security Considerations

- GTM ID is public and safe to expose
- No sensitive data is sent in events
- User consent is always respected
- Development mode prevents accidental tracking
