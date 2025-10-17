# Trial Expiration System Documentation

## Overview
The trial expiration system automatically detects when a 7-day free trial has ended and reverts users back to the free plan. This is handled both on the frontend and backend for maximum reliability.

---

## How It Works

### 1. Frontend Detection (Immediate)
**File**: `src/hooks/useSubscriptionStatus.tsx`

The `useSubscriptionStatus` hook checks trial expiration on every load:

```typescript
// For trialing subscriptions, check trial_end (not subscription_end)
if (subscription.subscription_status === 'trialing') {
  const trialEnd = subscription.trial_end ? new Date(subscription.trial_end) : null;
  const isTrialExpired = trialEnd ? trialEnd < now : false;
  
  if (isTrialExpired) {
    return 'trial_expired';
  }
  return 'trial';
}
```

When a trial is detected as expired:
1. ✅ Returns `subscriptionMode = 'trial_expired'`
2. ✅ Triggers automatic database update via `useEffect`
3. ✅ Updates database fields:
   - `subscribed` = false
   - `subscription_status` = 'inactive'
   - `subscription_tier` = null
4. ✅ Refreshes subscription data
5. ✅ User is now on free plan

### 2. Backend Cleanup (Scheduled)
**File**: `supabase/functions/expire-trials/index.ts`

A serverless function that can be called manually or via cron job to expire trials:

**What it does:**
- Queries all subscribers with:
  - `subscription_status = 'trialing'`
  - `subscribed = true`
  - `trial_end < current_time`
- Updates all expired trials in batch:
  - `subscribed` = false
  - `subscription_status` = 'inactive'
  - `subscription_tier` = null
- Tracks analytics events for expired trials

**Call it manually:**
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/expire-trials" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Setup as cron job** (recommended):
Use Supabase Edge Functions with pg_cron or external cron service to run daily:
```sql
-- Run every day at midnight
SELECT cron.schedule(
  'expire-trials-daily',
  '0 0 * * *',
  $$ SELECT net.http_post(
      url:='https://your-project.supabase.co/functions/v1/expire-trials',
      headers:='{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  ) $$
);
```

---

## Database Schema

### Trial Fields in `subscribers` Table:
```sql
trial_start    TIMESTAMPTZ  -- When trial started
trial_end      TIMESTAMPTZ  -- When trial ends (trial_start + 7 days)
trial_used     BOOLEAN      -- Whether user has used their trial
```

### Status Transitions:

```
Free User (trial_used = false)
    ↓ [Starts Trial]
Active Trial (subscription_status = 'trialing', subscribed = true)
    ↓ [trial_end passes]
Trial Expired (subscriptionMode = 'trial_expired')
    ↓ [Auto Update]
Free User (subscription_status = 'inactive', subscribed = false)
```

---

## Key Features

### ✅ Dual Detection System
- **Frontend**: Immediate detection on every page load
- **Backend**: Scheduled cleanup for reliability

### ✅ Automatic Database Updates
- Frontend automatically updates expired trials
- Backend can clean up any missed trials

### ✅ Correct Date Checking
- **Trials**: Check `trial_end` field
- **Paid Subscriptions**: Check `subscription_end` field

### ✅ Analytics Tracking
- Tracks `trial_expired` events
- Includes trial start/end dates
- Useful for conversion analysis

### ✅ Modal Prevention
- Free trial modal won't show to users with expired trials
- Prevents confusion and bad UX

---

## Testing the System

### Test 1: Manual Trial Expiration Test
```sql
-- 1. Start a trial for a test user
-- 2. Manually set trial_end to the past
UPDATE subscribers
SET trial_end = NOW() - INTERVAL '1 day'
WHERE email = 'test@example.com';

-- 3. Refresh the page
-- Expected: User should be on free plan within seconds
```

### Test 2: Check Subscription Mode
```javascript
// In browser console on /mein-tiertraining
// Look for: "🔍 Trial expiration check"
// Should show:
// - trial_end: (past date)
// - now: (current date)
// - isTrialExpired: true
```

### Test 3: Backend Function Test
```bash
# Call expire-trials function
curl -X POST "https://your-project.supabase.co/functions/v1/expire-trials" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Expected response:
{
  "success": true,
  "message": "Successfully expired 1 trial(s)",
  "processed": 1,
  "users": [
    {
      "email": "test@example.com",
      "trial_end": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### Test 4: Analytics Verification
```sql
-- Check if trial_expired event was tracked
SELECT * FROM analytics_events
WHERE event_type = 'trial_expired'
ORDER BY created_at DESC
LIMIT 10;
```

---

## Monitoring & Logs

### Frontend Logs
Look for these console messages:
```
🔍 Trial expiration check: { trial_end, now, isTrialExpired }
🔄 Trial expired, updating database to free plan...
✅ Expired trial updated successfully, refreshing subscription data...
```

### Backend Logs
In Supabase Edge Functions logs:
```
[EXPIRE-TRIALS] Function started
[EXPIRE-TRIALS] Found expired trials - {"count":3}
[EXPIRE-TRIALS] Expiring trials for users - {"userIds":[...]}
[EXPIRE-TRIALS] Successfully expired trials - {"count":3}
```

---

## Common Issues & Solutions

### Issue 1: Trial Not Expiring
**Symptoms**: User still has access after trial_end passed

**Checks**:
1. Check `trial_end` date:
   ```sql
   SELECT email, trial_end, NOW() as current_time,
          trial_end < NOW() as should_be_expired
   FROM subscribers WHERE email = 'user@example.com';
   ```

2. Check subscription_status:
   ```sql
   SELECT email, subscription_status, subscribed
   FROM subscribers WHERE email = 'user@example.com';
   ```

3. Clear frontend cache:
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   // Refresh page
   ```

### Issue 2: Modal Still Showing After Expiration
**Cause**: Frontend not detecting `trial_expired` mode

**Solution**: Check the modal condition in MyPetTraining.tsx:
```typescript
// Should NOT show if trial expired
if (isFreeUser && hasNotUsedTrial && !isTrialExpired) {
  // Show modal
}
```

### Issue 3: Database Not Updating
**Symptoms**: subscriptionMode shows 'trial_expired' but database unchanged

**Checks**:
1. Check browser console for errors
2. Verify RLS policies allow updates
3. Manually run expire-trials function

---

## Deployment Checklist

### 1. Deploy Edge Function
```bash
supabase functions deploy expire-trials
```

### 2. Test Edge Function
```bash
# Call with anon key
curl -X POST "https://your-project.supabase.co/functions/v1/expire-trials" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### 3. Setup Cron Job (Optional but Recommended)
- Use Supabase pg_cron or external service
- Run daily at midnight
- Monitor for failures

### 4. Monitor Logs
- Check Supabase Edge Functions logs
- Monitor analytics_events for `trial_expired`
- Track conversion rates

### 5. Test User Flow
1. Create test user
2. Start trial
3. Manually expire trial (set trial_end to past)
4. Verify user returns to free plan
5. Verify modal doesn't show again

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER LOADS PAGE                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│     useSubscriptionStatus Hook Checks Trial Status          │
│  - Fetches subscription data from subscribers table         │
│  - Checks if subscription_status = 'trialing'               │
│  - Compares trial_end with current time                     │
└────────────────────┬────────────────────────────────────────┘
                     │
            ┌────────┴─────────┐
            │                  │
    [Trial Active]      [Trial Expired]
            │                  │
            ▼                  ▼
    Return 'trial'    Return 'trial_expired'
                              │
                              ▼
                ┌──────────────────────────────┐
                │  useEffect Triggers Update   │
                │  - Set subscribed = false    │
                │  - Set status = 'inactive'   │
                │  - Set tier = null           │
                │  - Refresh subscription      │
                └──────────────────────────────┘
                              │
                              ▼
                ┌──────────────────────────────┐
                │   User Now on Free Plan      │
                │   - No premium features      │
                │   - Can start new paid plan  │
                │   - Cannot start trial again │
                └──────────────────────────────┘

PARALLEL PROCESS (Cron Job):
┌─────────────────────────────────────────────────────────────┐
│              expire-trials Function (Cron)                  │
│  - Runs daily at midnight                                   │
│  - Finds all expired trials                                 │
│  - Batch updates to free plan                               │
│  - Tracks analytics events                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Files Modified/Created

### Modified:
1. `src/hooks/useSubscriptionStatus.tsx`
   - Added trial_end checking logic
   - Added automatic expiration handling
   - Added useEffect to update database

2. `src/pages/MyPetTraining.tsx`
   - Updated trial modal condition
   - Added trial_expired check

### Created:
1. `supabase/functions/expire-trials/index.ts`
   - Serverless function for batch expiration
   - Can be called manually or via cron

2. `TRIAL_EXPIRATION_SYSTEM.md` (this file)
   - Complete documentation
   - Testing procedures
   - Troubleshooting guide

---

## Summary

The trial expiration system is **fully automatic** and **highly reliable**:

1. ✅ **Frontend** detects expiration immediately on page load
2. ✅ **Backend** provides scheduled cleanup for reliability  
3. ✅ **Database** is automatically updated when trial expires
4. ✅ **User** seamlessly returns to free plan
5. ✅ **Analytics** track all trial expirations for insights

**No manual intervention required** - the system handles everything automatically!

---

**Last Updated**: October 17, 2025  
**Version**: 2.0  
**Status**: Production Ready ✅

