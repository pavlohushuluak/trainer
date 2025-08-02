# 🌐 Multi-Language Email System

## Overview

The TierTrainer24 application now features a comprehensive multi-language email system that automatically detects and uses each user's language preference for all email communications. This system ensures that users receive emails in their preferred language (German or English) while maintaining professional quality and consistency.

## 🏗️ Architecture

### Database Schema

#### 1. Profiles Table Enhancement
```sql
-- Added language field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN language TEXT DEFAULT 'de' CHECK (language IN ('de', 'en'));
```

#### 2. Email Templates Table
```sql
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'de',
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(template_key, language)
);
```

### Database Functions

#### 1. Get User Language
```sql
CREATE OR REPLACE FUNCTION public.get_user_language(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  user_language TEXT;
BEGIN
  SELECT language INTO user_language
  FROM public.profiles
  WHERE email = user_email;
  
  RETURN COALESCE(user_language, 'de');
END;
$function$;
```

#### 2. Get Email Template
```sql
CREATE OR REPLACE FUNCTION public.get_email_template(template_key TEXT, user_email TEXT)
RETURNS TABLE(subject TEXT, html_content TEXT)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  user_language TEXT;
BEGIN
  -- Get user language preference
  SELECT public.get_user_language(user_email) INTO user_language;
  
  -- Return template in user's language, fallback to German
  RETURN QUERY
  SELECT et.subject, et.html_content
  FROM public.email_templates et
  WHERE et.template_key = $1 
    AND et.language = user_language
  UNION ALL
  SELECT et.subject, et.html_content
  FROM public.email_templates et
  WHERE et.template_key = $1 
    AND et.language = 'de'
  LIMIT 1;
END;
$function$;
```

## 🔧 Implementation

### 1. Multi-Language Email Service

**File**: `supabase/functions/send-welcome-email/utils/multiLanguageEmailService.ts`

The core service that handles:
- User language preference detection
- Template retrieval with fallback
- Variable replacement
- Email formatting and styling

#### Key Methods:
- `getUserLanguage(userEmail)`: Retrieves user's language preference
- `getEmailTemplate(templateKey, userEmail)`: Gets template in user's language
- `createEmailTemplate(emailType, data)`: Creates complete email with variables
- `logEmailSending()`: Logs email sending with language information

### 2. Updated Edge Functions

#### Send Welcome Email
**File**: `supabase/functions/send-welcome-email/index.ts`

Updated to use the new multi-language service:
- Detects user language from profile
- Uses language-specific templates
- Logs language information
- Provides fallback to German

#### Send Cancellation Email
**File**: `supabase/functions/send-cancellation-email/index.ts`

Updated to use the new multi-language service:
- Replaced React email templates with database templates
- Added language detection and logging
- Improved error handling

### 3. Frontend Language Management

#### Language Preference Manager
**File**: `src/components/LanguagePreferenceManager.tsx`

Component that allows users to:
- View current language preference
- Change language preference
- See immediate UI updates
- Persist changes to database

## 📧 Email Templates

### Available Templates

1. **Welcome Email** (`welcome`)
   - German: "🎉 Willkommen bei TierTrainer24, {{name}}!"
   - English: "🎉 Welcome to TierTrainer24, {{name}}!"

2. **Checkout Confirmation** (`checkout-confirmation`)
   - German: "✅ Bestellung bestätigt - TierTrainer24 {{planName}}"
   - English: "✅ Order confirmed - TierTrainer24 {{planName}}"

3. **Magic Link** (`magic-link`)
   - German: "🔗 Anmeldelink - TierTrainer24"
   - English: "🔗 Login Link - TierTrainer24"

4. **Password Reset** (`password-reset`)
   - German: "🔐 Passwort zurücksetzen - TierTrainer24"
   - English: "🔐 Reset Password - TierTrainer24"

5. **Trial Reminder** (`trial-reminder`)
   - German: "⏰ Testphase läuft ab - TierTrainer24"
   - English: "⏰ Trial Expiring - TierTrainer24"

6. **Subscription Cancelled** (`subscription-cancelled`)
   - German: "📅 Kündigung bestätigt - TierTrainer24"
   - English: "📅 Cancellation Confirmed - TierTrainer24"

7. **Payment Failed** (`payment-failed`)
   - German: "❌ Zahlung fehlgeschlagen - TierTrainer24"
   - English: "❌ Payment Failed - TierTrainer24"

### Template Variables

All templates support these variables:
- `{{name}}`: User's first name
- `{{planName}}`: Subscription plan name
- `{{amount}}`: Payment amount
- `{{interval}}`: Billing interval
- `{{trialEndDate}}`: Trial end date
- `{{dashboardUrl}}`: Dashboard URL
- `{{magicLink}}`: Magic link URL
- `{{confirmationLink}}`: Confirmation link URL
- `{{inviteLink}}`: Invite link URL
- `{{invitedBy}}`: Inviter name

## 🌍 Language Detection Flow

### 1. User Registration
- Default language: German (`de`)
- Can be changed via frontend settings

### 2. Email Sending Process
1. **Language Detection**: Query user's language preference from `profiles` table
2. **Template Selection**: Get template in user's language
3. **Fallback**: If template not found in user's language, fallback to German
4. **Variable Replacement**: Replace template variables with actual data
5. **Email Sending**: Send email with language-specific content
6. **Logging**: Log email sending with language information

### 3. Frontend Language Sync
1. **Load Preference**: Load user's language preference on login
2. **Update i18n**: Update frontend i18n language
3. **Persist Changes**: Save language changes to database
4. **Immediate Update**: Update UI immediately

## 🔄 Migration Process

### 1. Database Migration
Run the migration file: `supabase/migrations/20250725000000-add-language-support.sql`

This will:
- Add language field to profiles table
- Create email_templates table
- Insert German and English templates
- Create helper functions
- Add indexes for performance

### 2. Update Edge Functions
Deploy updated edge functions:
- `send-welcome-email`
- `send-cancellation-email`

### 3. Frontend Integration
Add the `LanguagePreferenceManager` component to user settings pages.

## 📊 Monitoring and Analytics

### Email Logging
All emails are logged with language information:
```sql
INSERT INTO system_notifications (
  type, title, message, user_id, status, metadata
) VALUES (
  'welcome_email',
  'Email Subject',
  'E-Mail versendet an user@example.com (de)',
  NULL,
  'sent',
  '{"language": "de", "recipient": "user@example.com"}'
);
```

### Language Statistics
Query language distribution:
```sql
SELECT 
  language,
  COUNT(*) as user_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM profiles 
GROUP BY language;
```

## 🛠️ Development and Testing

### Adding New Email Templates

1. **Add to Database**:
```sql
INSERT INTO public.email_templates (template_key, language, subject, html_content) VALUES
('new-template', 'de', 'German Subject', '<div>German HTML content</div>'),
('new-template', 'en', 'English Subject', '<div>English HTML content</div>');
```

2. **Add to TypeScript Types**:
```typescript
export type EmailType = 
  | 'welcome'
  | 'new-template'  // Add here
  // ... other types
```

3. **Update Email Service**:
Add template key to the service if needed.

### Testing Multi-Language Emails

1. **Test with Different Languages**:
```javascript
// Test German user
await fetch('/functions/v1/send-welcome-email', {
  method: 'POST',
  body: JSON.stringify({
    emailType: 'welcome',
    userEmail: 'german@example.com',
    userName: 'Hans'
  })
});

// Test English user
await fetch('/functions/v1/send-welcome-email', {
  method: 'POST',
  body: JSON.stringify({
    emailType: 'welcome',
    userEmail: 'english@example.com',
    userName: 'John'
  })
});
```

2. **Verify Language Detection**:
Check that emails are sent in the correct language based on user preference.

## 🔒 Security Considerations

### Database Security
- All functions use `SECURITY DEFINER` with empty search path
- Row Level Security (RLS) enabled on email_templates
- Read-only access for authenticated users

### Email Security
- Consistent sender domain: `noreply@mail.tiertrainer24.com`
- Template injection protection through variable replacement
- No user input directly embedded in templates

## 🚀 Performance Optimizations

### Database Indexes
```sql
CREATE INDEX idx_email_templates_key_lang ON public.email_templates(template_key, language);
CREATE INDEX idx_profiles_language ON public.profiles(language);
```

### Caching Strategy
- Templates are cached in memory during function execution
- User language preferences cached in frontend localStorage
- Database queries optimized with proper indexing

## 📈 Future Enhancements

### Planned Features
1. **Additional Languages**: Support for more languages (French, Spanish, etc.)
2. **Template Versioning**: Version control for email templates
3. **A/B Testing**: Test different email templates
4. **Analytics Dashboard**: Email performance by language
5. **Dynamic Content**: Personalized content based on user behavior

### Scalability Considerations
- Template caching at CDN level
- Database read replicas for template queries
- Email queue system for high-volume sending
- Template management interface for non-technical users

## 🐛 Troubleshooting

### Common Issues

1. **Template Not Found**:
   - Check if template exists in database
   - Verify template_key spelling
   - Ensure language code is correct

2. **Language Not Detected**:
   - Check user profile for language field
   - Verify default fallback to German
   - Check database connection

3. **Variables Not Replaced**:
   - Verify variable syntax: `{{variableName}}`
   - Check data object structure
   - Ensure all required variables are provided

### Debug Logging
All email functions include comprehensive logging:
- User language detection
- Template selection process
- Variable replacement
- Email sending status
- Error details

## 📝 API Reference

### Send Welcome Email
```typescript
POST /functions/v1/send-welcome-email
{
  "emailType": "welcome",
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "planName": "Premium",
  "trialEndDate": "in 7 Tagen",
  "bypassTestMode": false
}
```

### Send Cancellation Email
```typescript
POST /functions/v1/send-cancellation-email
{
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "isRefund": false,
  "subscriptionEnd": "2025-08-01T00:00:00Z",
  "cancellationReason": "Nutzerwunsch"
}
```

## 🎯 Best Practices

1. **Always provide fallback**: German templates as default
2. **Test both languages**: Verify emails in German and English
3. **Monitor language distribution**: Track user language preferences
4. **Keep templates consistent**: Maintain same structure across languages
5. **Use professional translations**: Ensure high-quality translations
6. **Log language information**: Track email language for analytics
7. **Handle edge cases**: Graceful fallback for missing templates

---

This multi-language email system provides a professional, scalable solution for international user communication while maintaining code quality and security standards. 