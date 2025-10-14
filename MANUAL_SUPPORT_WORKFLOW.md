# Manual Support Workflow Documentation

## Overview

Professional manual support system that allows users to submit support requests and admins to respond. The system includes automatic polling for updates and status tracking.

## Features

### User Features
- ✅ Submit **multiple** manual support requests simultaneously
- ✅ Professional modal interface (no dedicated page needed)
- ✅ Two-tab interface: "New Request" and "My Messages"
- ✅ View all requests with expandable message cards
- ✅ Automatic polling every 3 minutes for updates
- ✅ Receive admin responses when support is completed
- ✅ Automatic "viewed" marking when message is expanded
- ✅ Manual read/unread toggling with eye icon
- ✅ Visual indicators for new responses (animated badge)
- ✅ Statistics bar showing total, active, in progress, completed
- ✅ Beautiful gradient purple/pink theme
- ✅ Mobile-responsive design

### Admin Features
- ✅ View all manual support requests
- ✅ Filter by status (active, in_progress, completed)
- ✅ Search by subject, message, user email, or name
- ✅ Mark requests as "in progress"
- ✅ Respond to requests and mark as completed
- ✅ Automatic refresh every 30 seconds
- ✅ Mobile-responsive admin interface

## Database Schema

### Table: `manual_support_messages`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to auth.users |
| `user_email` | TEXT | User's email address |
| `user_name` | TEXT | User's display name |
| `subject` | TEXT | Support request subject |
| `message` | TEXT | Support request message |
| `status` | TEXT | Status: active, in_progress, completed |
| `priority` | TEXT | Priority: low, normal, high, urgent |
| `admin_response` | TEXT | Admin's response (nullable) |
| `admin_id` | UUID | Admin who responded (nullable) |
| `admin_responded_at` | TIMESTAMPTZ | When admin responded (nullable) |
| `viewed_by_user` | BOOLEAN | Whether user has viewed the response |
| `created_at` | TIMESTAMPTZ | When request was created |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

## User Workflow

### 1. Opening Manual Support Modal

1. User visits `/support` page
2. Clicks "Start Chat with Support" button
3. AI Support Chat Modal opens
4. Clicks "Manual Support" button (purple, left of "New Ticket")
5. Manual Support Modal opens

### 2. Submitting a Request

1. In Manual Support Modal, click "New Request" tab (if not already there)
2. Fill out the form:
   - Subject (required, max 200 chars)
   - Priority (low, normal, high, urgent)
   - Message (required, max 2000 chars)
3. Click "Submit Support Request"
4. Request is created with status "active"
5. Automatically switches to "My Messages" tab
6. Can submit **multiple requests** - no restrictions

### 3. Viewing Messages

- Click "My Messages" tab to see all requests
- Each message card shows:
  - Status badge (Active, In Progress, Completed)
  - Priority badge with color coding
  - "New Response" badge for unread completed messages
  - Subject line
  - Timestamp
  - Eye/Eye-off icon to mark read/unread
- Click anywhere on card to expand/collapse
- Expanded view shows:
  - Full original message in styled box
  - Status alert (Active = green, In Progress = yellow)
  - Admin response in purple gradient box (if completed)
  - Response timestamp

### 4. Auto-Viewing & Management

- System polls every 3 minutes for updates
- When message is **expanded**, automatically marks as viewed
- Can manually toggle read/unread with eye icon
- Unread count badge in header (animated pulse)
- Statistics bar shows: Total, Active, In Progress, Completed
- No limit on number of open requests

## Admin Workflow

### 1. Viewing Requests

1. Admin visits `/admin/support` page
2. Selects "Manual Support" tab
3. Sees all support requests with:
   - Status badges (Active, In Progress, Completed)
   - Priority badges (LOW, NORMAL, HIGH, URGENT)
   - User information (name/email)
   - Submission timestamp

### 2. Working on Request

1. Admin can click "Start Working" button
2. Status changes from "active" to "in_progress"
3. Request is assigned to the admin
4. Other admins see it's being worked on

### 3. Responding to Request

1. Admin clicks "Respond" button
2. Dialog opens showing:
   - User's original request
   - Response text area (max 2000 chars)
   - Warning about marking as completed
3. Admin types response and clicks "Send Response"
4. Request status changes to "completed"
5. Response is sent to user
6. User is notified on next poll (within 3 minutes)

## Polling Mechanism

### User-Side Polling
- **Frequency**: Every 3 minutes (180,000ms)
- **Condition**: Only when user has active or in_progress message
- **Action**: Fetches latest message status
- **Stops**: When status changes to "completed"
- **Notification**: Toast notification when response received

### Admin-Side Polling
- **Frequency**: Every 30 seconds (30,000ms)
- **Condition**: Always active on admin panel
- **Action**: Refetches all messages
- **Purpose**: Real-time updates for new requests

## File Structure

```
src/
├── types/
│   └── manualSupport.ts                    # TypeScript types
├── components/
│   ├── support/
│   │   ├── SupportChat.tsx                 # AI chat modal (includes manual support button)
│   │   └── ManualSupportModal.tsx          # Manual support modal
│   └── admin/
│       ├── ManualSupportManagement.tsx     # Admin management component
│       └── SupportManagement.tsx           # Admin support page with tabs
├── pages/
│   └── Support.tsx                         # Main support page
supabase/
└── migrations/
    ├── 20250114000000_create_manual_support_messages.sql
    └── 20250114000001_add_viewed_status_to_manual_support.sql
```

## Security

### Row Level Security (RLS)
- ✅ Users can only view their own messages
- ✅ Users can only create messages for themselves
- ✅ Admins can view all messages
- ✅ Admins can update messages (for responses)
- ✅ Automatic user_id validation

### Input Validation
- ✅ Subject: Max 200 characters, required
- ✅ Message: Max 2000 characters, required
- ✅ Admin Response: Max 2000 characters, required
- ✅ Status: Enum constraint (active, in_progress, completed)
- ✅ Priority: Enum constraint (low, normal, high, urgent)

## Mobile Responsiveness

All components follow consistent mobile-first design:
- Responsive padding: `px-3 sm:px-4 lg:px-6`
- Responsive text: `text-xs sm:text-sm lg:text-base`
- Touch targets: Minimum 44px height
- Touch optimization: `touch-manipulation` class
- Truncation: Proper text overflow handling
- Flexible layouts: Stack on mobile, horizontal on desktop

## Usage Examples

### User Creates Request
```typescript
// Automatic - handled by ManualSupportForm component
// User fills form → clicks submit → status: active → polling starts
```

### Admin Responds
```typescript
// Admin panel → Manual Support tab → Click "Respond"
// Enter response → Click "Send Response" → status: completed → user notified
```

## Pages and Routes

### User Pages

#### `/support` - Main Support Page
- Overview of all support options:
  - **AI Chat Support** - Opens AI support chat modal
  - **FAQ Section** - Links to FAQ on homepage
- Opens manual support via "Manual Support" button in AI chat modal
- Ticket history display
- Motivational section

### Support Modals

#### **AI Support Chat Modal**
- Accessed from support page
- Contains "Manual Support" button (left of "New Ticket")
- Click to switch to Manual Support Modal
- Instant AI responses
- Ticket creation and tracking

#### **Manual Support Modal** (NEW) - Professional Design
- Accessed via "Manual Support" button in AI chat modal
- **Beautiful Purple/Pink Gradient Theme**
- **Header Section**:
  - Gradient icon with shadow
  - Statistics bar (Total, Active, In Progress, Completed)
  - Unread count badge (animated pulse)
- **Two Tabs**:
  
  **Tab 1: New Request**
  - Professional form card with gradient background
  - Subject input (200 char max)
  - Priority selector (Low, Normal, High, Urgent)
  - Message textarea (2000 char max)
  - Character counter
  - Submit button with gradient (purple to pink)
  - No restrictions - can submit multiple requests
  
  **Tab 2: My Messages**
  - All support requests in expandable cards
  - Each card shows:
    - Status badge (Active/In Progress/Completed)
    - Priority badge with icon
    - "New Response" animated badge for unread
    - Subject and timestamp
    - Eye icon to toggle read/unread
    - Chevron to expand/collapse
  - Expanded card reveals:
    - Full message in styled box
    - Status-specific alerts (green for active, yellow for in progress)
    - Admin response in beautiful purple gradient box
    - Response timestamp
  - Auto-marks as viewed when expanded
  - Empty state with CTA to create first request

### Admin Pages

#### `/admin/support` - Support Management
- **Two Tabs**:
  1. **Manual Support**: View and respond to user requests
  2. **System Notifications**: Existing notification system
- Auto-refresh every 30 seconds
- Filter by status (all, active, in_progress, completed)
- Search by subject, message, user email, or name
- Start working on requests
- Respond to requests and mark as completed

## Testing Checklist

- [ ] Database migrations applied successfully
- [ ] User can submit manual support request
- [ ] Request shows as "active" immediately
- [ ] Admin sees request in admin panel
- [ ] Admin can mark as "in progress"
- [ ] Admin can respond and mark as "completed"
- [ ] User sees admin response (within 3 minutes)
- [ ] User can submit another request
- [ ] Polling works correctly (3 min intervals)
- [ ] View/unview status works correctly
- [ ] Unread badge shows on history tab
- [ ] Mark all as read functionality works
- [ ] Filters work correctly (status, view, search)
- [ ] Statistics cards show correct counts
- [ ] Mobile responsiveness verified on all pages
- [ ] RLS policies working correctly
- [ ] Auto-refresh works on both user and admin sides

## Future Enhancements

- Email notifications when admin responds
- Real-time updates using Supabase Realtime
- Support request categories
- File attachments
- Support request history page
- SLA tracking and automatic escalation
- Multi-message conversation threads

---

**Last Updated**: October 14, 2025  
**Version**: 1.0  
**Migration**: `20250114000000_create_manual_support_messages.sql`

