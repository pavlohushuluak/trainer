# Send Verification Code Edge Function

A Supabase Edge Function that sends 6-digit verification codes via email for password change verification. This function now supports multi-language email templates in English and German.

## Features

- **Multi-language Support**: Automatically detects user language preference and sends emails in English or German
- **Professional Email Templates**: Beautiful, responsive HTML email templates with consistent branding
- **Secure Code Generation**: Generates 6-digit random verification codes
- **Retry Logic**: Robust language detection with retry mechanism for database queries
- **Comprehensive Logging**: Detailed logging for debugging and monitoring

## Environment Variables

```bash
# Resend Email Service Configuration
RESEND_API_KEY=your_resend_api_key_here  # Get from https://resend.com

# Supabase Configuration (automatically detected)
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## API Usage

### Request

```typescript
POST /functions/v1/send-verification-code
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456",
  "type": "password-change"
}
```

### Response

```typescript
{
  "success": true,
  "message": "Verification code sent successfully",
  "emailId": "email_id_from_resend",
  "language": "en" // or "de"
}
```

## Multi-language Support

The function automatically detects the user's language preference from their profile and sends emails in the appropriate language:

### English Template
- Subject: "🔐 TierTrainer24 - Password Change Verification Code"
- Professional, clear instructions
- Security notices and best practices

### German Template
- Subject: "🔐 TierTrainer24 - Passwort-Änderung Bestätigungscode"
- German language content
- Same professional styling and security information

## Language Detection

The function uses the `get_language_support` RPC function to retrieve the user's preferred language:

1. **Database Query**: Queries user language preference from profiles table
2. **Retry Logic**: Implements retry mechanism for database connection issues
3. **Fallback**: Defaults to German if language detection fails
4. **Logging**: Comprehensive logging for debugging language detection issues

## Email Template Features

- **Responsive Design**: Mobile-friendly HTML templates
- **Brand Consistency**: TierTrainer24 branding and color scheme
- **Security Information**: Clear security notices and best practices
- **Professional Styling**: Gradient headers, clean typography, and visual hierarchy

## Dependencies

- Deno standard library
- Resend email service for reliable email delivery
- Supabase client for database queries
- CORS support for web requests

## Troubleshooting

1. **Resend API Key Issues**
   - Verify RESEND_API_KEY is set correctly
   - Check if the API key has proper permissions
   - Ensure the API key is valid and not expired

2. **Language Detection Issues**
   - Check Supabase logs for database connection errors
   - Verify the `get_language_support` RPC function exists
   - Check user profile language preferences

3. **Email Delivery Issues**
   - Review Resend dashboard for delivery status
   - Check Resend logs for any errors
   - Verify sender email domain is configured in Resend

## Development

To test locally:

```bash
# Install Supabase CLI
npm install -g supabase

# Start local development
supabase start

# Deploy function
supabase functions deploy send-verification-code
```

## Security Notes

- Verification codes are single-use only
- Codes expire immediately after use
- Never log actual verification codes in production
- Use HTTPS for all API calls
- Implement rate limiting on the client side
