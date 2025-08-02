
-- Support-Tickets Tabelle
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  subject TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_user', 'resolved', 'closed')),
  satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
  is_resolved_by_ai BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES admin_users(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  last_response_at TIMESTAMP WITH TIME ZONE
);

-- Support-Nachrichten Tabelle
CREATE TABLE public.support_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'ai', 'admin')),
  sender_id UUID, -- user_id or admin_id
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'satisfaction_request')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Zufriedenheits-Feedback Tabelle
CREATE TABLE public.support_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback_text TEXT,
  resolved_by TEXT CHECK (resolved_by IN ('ai', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Support-Kategorien für bessere Organisation
CREATE TABLE public.support_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6B7280',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Standard-Kategorien einfügen
INSERT INTO public.support_categories (name, description, color) VALUES
('technisch', 'Technische Probleme und Bugs', '#EF4444'),
('abo', 'Abonnement und Bezahlung', '#10B981'),
('funktion', 'Fragen zu Funktionen', '#3B82F6'),
('training', 'Tiertraining-Beratung', '#8B5CF6'),
('allgemein', 'Allgemeine Fragen', '#6B7280');

-- RLS Policies für Support-Tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Benutzer können ihre eigenen Tickets sehen" 
  ON public.support_tickets 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Benutzer können eigene Tickets erstellen" 
  ON public.support_tickets 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Benutzer können eigene Tickets aktualisieren" 
  ON public.support_tickets 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins können alle Tickets verwalten" 
  ON public.support_tickets 
  FOR ALL 
  USING (public.is_admin(auth.uid()));

-- RLS Policies für Support-Nachrichten
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Benutzer können Nachrichten ihrer Tickets sehen" 
  ON public.support_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = support_messages.ticket_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Benutzer können Nachrichten zu ihren Tickets erstellen" 
  ON public.support_messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = support_messages.ticket_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins können alle Support-Nachrichten verwalten" 
  ON public.support_messages 
  FOR ALL 
  USING (public.is_admin(auth.uid()));

-- RLS Policies für Support-Feedback
ALTER TABLE public.support_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Benutzer können ihr eigenes Feedback sehen" 
  ON public.support_feedback 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Benutzer können eigenes Feedback erstellen" 
  ON public.support_feedback 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins können alle Feedbacks verwalten" 
  ON public.support_feedback 
  FOR ALL 
  USING (public.is_admin(auth.uid()));

-- RLS Policies für Support-Kategorien (öffentlich lesbar)
ALTER TABLE public.support_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jeder kann Kategorien lesen" 
  ON public.support_categories 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins können Kategorien verwalten" 
  ON public.support_categories 
  FOR ALL 
  USING (public.is_admin(auth.uid()));

-- Trigger für updated_at
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index für bessere Performance
CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_assigned_to ON public.support_tickets(assigned_to);
CREATE INDEX idx_support_messages_ticket_id ON public.support_messages(ticket_id);
CREATE INDEX idx_support_feedback_ticket_id ON public.support_feedback(ticket_id);
