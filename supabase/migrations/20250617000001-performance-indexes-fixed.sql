
-- Performance optimizations: Add database indexes for better query performance
-- Fixed version that handles trigram extension correctly

-- First enable the trigram extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Analytics queries optimization
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_created ON analytics_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created ON analytics_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- User management optimization (now with correct trigram index)
CREATE INDEX IF NOT EXISTS idx_profiles_email_gin ON profiles USING gin(email gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- Subscription queries optimization
CREATE INDEX IF NOT EXISTS idx_subscribers_status_created ON subscribers(subscription_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscribers_user_subscribed ON subscribers(user_id, subscribed) WHERE subscribed = true;
CREATE INDEX IF NOT EXISTS idx_subscribers_trial_end ON subscribers(trial_end) WHERE trial_end IS NOT NULL;

-- Chat performance optimization
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_updated ON chat_sessions(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created ON chat_messages(session_id, created_at DESC);

-- Support tickets optimization
CREATE INDEX IF NOT EXISTS idx_support_tickets_status_created ON support_tickets(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_status ON support_tickets(user_id, status);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_created ON support_messages(ticket_id, created_at ASC);

-- Training plans optimization
CREATE INDEX IF NOT EXISTS idx_training_plans_user_status ON training_plans(user_id, status);
CREATE INDEX IF NOT EXISTS idx_training_steps_plan_number ON training_steps(training_plan_id, step_number);

-- Additional performance indexes for common queries
CREATE INDEX IF NOT EXISTS idx_subscribers_email_status ON subscribers(email, subscription_status);
CREATE INDEX IF NOT EXISTS idx_pet_profiles_user_created ON pet_profiles(user_id, created_at DESC);
