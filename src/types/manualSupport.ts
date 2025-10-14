/**
 * @fileoverview TypeScript types for manual support messages workflow
 */

export type SupportMessageStatus = 'active' | 'in_progress' | 'completed';
export type SupportMessagePriority = 'low' | 'normal' | 'high' | 'urgent';

export interface ManualSupportMessage {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  subject: string;
  message: string;
  status: SupportMessageStatus;
  priority: SupportMessagePriority;
  admin_response: string | null;
  admin_id: string | null;
  admin_responded_at: string | null;
  viewed_by_user: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateManualSupportMessage {
  subject: string;
  message: string;
  priority?: SupportMessagePriority;
}

export interface UpdateManualSupportMessage {
  admin_response: string;
  status: 'completed';
}

