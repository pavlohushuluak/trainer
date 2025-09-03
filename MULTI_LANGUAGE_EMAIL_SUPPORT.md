# Multi-Language Email Support for TierTrainer24

This document outlines the comprehensive multi-language support implemented across all email functions in the TierTrainer24 platform.

## Overview

All email functions now support both German (de) and English (en) languages, automatically detecting user preferences and delivering emails in the appropriate language. The system defaults to German if no language preference is detected.

## Supported Languages

- **German (de)** - Default language
- **English (en)** - Secondary language

## Language Detection

The system uses multiple methods to determine user language preference:

1. **User Metadata**: Checks `preferred_language` in user profile
2. **Database Lookup**: Queries `language_support` table for stored preferences
3. **Browser Headers**: Falls back to `Accept-Language` header analysis
4. **Default Fallback**: German (de) if no preference is found

## Email Functions with Multi-Language Support

### 1. Auth Email Handler (`auth-email-handler`)

**Purpose**: Handles all authentication-related emails
**Supported Email Types**:
- Signup confirmation
- Magic link login
- Password reset
- Email change confirmation
- User invitations
- Re-authentication requests

**Language Features**:
- Automatic language detection for new signups
- Language preference storage in database
- Retry logic for language queries
- Fallback to German if language detection fails

### 2. Welcome Email (`send-welcome-email`)

**Purpose**: Sends welcome emails to new subscribers
**Language Features**:
- Personalized greeting in user's language
- Plan information in appropriate language
- Trial period details localized
- Dashboard access instructions localized

### 3. Cancellation Email (`send-cancellation-email`)

**Purpose**: Sends cancellation confirmation emails
**Language Features**:
- Cancellation details in user's language
- Refund information if applicable
- Next steps and support contact localized
- Professional tone maintained in both languages

### 4. Payment Notification (`send-payment-notification`)

**Purpose**: Sends payment-related notifications
**Supported Types**:
- Payment failed
- Payment retry
- Payment method update required

**Language Features**:
- React-based email templates
- Dynamic content based on language
- Payment details localized
- Action buttons and instructions in user's language

### 5. Support Notification (`send-support-notification`)

**Purpose**: Sends support ticket updates
**Supported Types**:
- Ticket created
- Ticket response
- Ticket resolved

**Language Features**:
- React-based email templates
- Ticket details in user's language
- Support instructions localized
- Professional support communication

### 6. Verification Code (`send-verification-code`)

**Purpose**: Sends verification codes for password changes
**Language Features**:
- Security instructions in user's language
- Code display with localized formatting
- Important notices and warnings localized
- Professional security communication

### 7. Daily System Report (`send-daily-system-report`)

**Purpose**: Sends automated system health reports
**Language Features**:
- System status in admin's preferred language
- Test results and metrics localized
- Summary information in appropriate language
- Technical details accessible in both languages

### 8. Test Email (`send-test-email`)

**Purpose**: Sends test emails for configuration verification
**Language Features**:
- Test details in recipient's language
- Configuration information localized
- Success messages in appropriate language
- Professional testing communication

## Implementation Details

### Language Storage

All user language preferences are stored in the `language_support` table using the `upsert_language_support` RPC function.

### Email Template Structure

Each email function follows a consistent pattern:

1. **Language Detection**: Query user's language preference
2. **Content Generation**: Create language-specific content objects
3. **Template Rendering**: Apply content to HTML templates
4. **Email Sending**: Send via Resend with appropriate language

### Content Localization

Email content is structured as language-specific objects:

```typescript
const content = language === 'en' ? {
  // English content
  subject: 'English Subject',
  greeting: 'Hello',
  // ... more content
} : {
  // German content
  subject: 'Deutscher Betreff',
  greeting: 'Hallo',
  // ... more content
};
```

### Fallback Handling

- **Primary**: User metadata preference
- **Secondary**: Database stored preference
- **Tertiary**: Browser language detection
- **Final**: German (de) default

## Benefits

1. **User Experience**: Users receive emails in their preferred language
2. **Professional Communication**: Maintains brand consistency across languages
3. **Accessibility**: Makes platform accessible to international users
4. **Compliance**: Supports multilingual business requirements
5. **Scalability**: Easy to add new languages in the future

## Future Enhancements

- Support for additional languages (French, Spanish, etc.)
- Dynamic language switching based on user actions
- Localized email templates for different regions
- A/B testing for language-specific content optimization

## Technical Notes

- All email functions use the `get_language_support` RPC function
- Language detection includes retry logic for database reliability
- Email templates are optimized for both languages
- Consistent styling and branding across all languages
- Professional tone maintained in both German and English

## Maintenance

- Language content is centralized in each function
- Easy to update or modify language-specific text
- Consistent structure across all email functions
- Clear separation of content and presentation logic
