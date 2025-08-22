import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTranslations } from '@/hooks/useTranslations';
import { useTranslation } from 'react-i18next';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useFreeChatLimit } from '@/hooks/useFreeChatLimit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ThinkingAnimation } from '@/components/chat/ThinkingAnimation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Shield } from 'lucide-react';
import {
  MessageSquare,
  Plus,
  Send,
  Loader2,
  History,
  User,
  Bot,
  Calendar,
  Clock,
  ArrowLeft,
  Settings,
  Trash2,
  Menu,
  X,
  AlertTriangle,
  PawPrint,
  Globe,
  Check,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePetProfiles } from '@/hooks/usePetProfiles';
import { assignTrainerForSession } from '@/components/chat/utils/trainerTeam';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation as useI18n } from 'react-i18next';
import { AnimatedDots } from '@/components/ui/animated-dots';

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  pet_id?: string;
  pet_profiles?: {
    name: string;
    species: string;
  };
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export const ChatPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslations();
  const { toast } = useToast();
  const { pets } = usePetProfiles();
  const { i18n } = useI18n();
  const { hasActiveSubscription } = useSubscriptionStatus();
  const { usage, incrementUsage } = useFreeChatLimit();

  // State management
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [createPlanModalOpen, setCreatePlanModalOpen] = useState(false);
  const [planReason, setPlanReason] = useState('');
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedPet, setSelectedPet] = useState<string>('none');
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(null);
  const [petSelectionOpen, setPetSelectionOpen] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [isContinuingChat, setIsContinuingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat sessions on component mount
  useEffect(() => {
    if (user) {
      loadChatSessions();
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages when session is selected
  useEffect(() => {
    if (selectedSession) {
      loadChatMessages(selectedSession.id);
      // Reset chat state when selecting a new session
      setHasStartedChat(false);
      setMessages([]);
      // Set the pet profile based on the selected session
      setSelectedPet(selectedSession.pet_id || 'none');
      // Scroll to bottom after a short delay to ensure messages are loaded
      setTimeout(scrollToBottom, 100);
    }
  }, [selectedSession]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatSessions = async () => {
    if (!user) return;

    setIsLoadingSessions(true);
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select(`
          id,
          title,
          created_at,
          updated_at,
          pet_id,
          pet_profiles (
            name,
            species
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setSessions(data || []);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      toast({
        title: t('chat.page.error.loadingSessions.title'),
        description: t('chat.page.error.loadingSessions.description'),
        variant: 'destructive'
      });
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const loadChatMessages = async (sessionId: string) => {
    if (!sessionId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('id, role, content, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages((data || []).map(msg => ({
        ...msg,
        role: msg.role as 'user' | 'assistant'
      })));
    } catch (error) {
      console.error('Error loading chat messages:', error);
      toast({
        title: t('chat.page.error.loadingMessages.title'),
        description: t('chat.page.error.loadingMessages.description'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewSession = () => {
    if (pets.length === 0) {
      // If no pets, create session without pet
      createNewSession('none');
    } else if (pets.length === 1) {
      // If only one pet, auto-select it
      createNewSession(pets[0].id);
    } else {
      // If multiple pets, show selection modal
      setPetSelectionOpen(true);
    }
  };

  const continueChat = async () => {
    if (!selectedSession) return;

    // Check if free user has reached limit
    if (!hasActiveSubscription && usage.hasReachedLimit) {
      toast({
        title: t('chat.validation.freeTrialEnded.title'),
        description: t('chat.validation.freeTrialEnded.description'),
        variant: 'destructive'
      });
      return;
    }

    setIsContinuingChat(true);
    try {
      // Load the chat history for this session
      const { data: chatHistory, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', selectedSession.id)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      // Map database results to ChatMessage type
      const mappedHistory = (chatHistory || []).map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        created_at: msg.created_at,
      }));

      // Set the messages to show the history
      setMessages(mappedHistory);
      setHasStartedChat(true);

      // If there are existing messages, send a continuation message to AI
      if (mappedHistory.length > 0) {
        // Send continuation message to AI with full chat history
        const continuationMessage: ChatMessage = {
          id: `temp-${Date.now()}`,
          role: 'user',
          content: t('chat.page.continueChat.message'),
          created_at: new Date().toISOString(),
        };

        // Add the continuation message to the UI
        setMessages(prev => [...prev, continuationMessage]);

        // Add loading message
        const loadingMessage: ChatMessage = {
          id: `loading-${Date.now()}`,
          role: 'assistant',
          content: `💭 ${t('chat.thinking')}...`,
          created_at: new Date().toISOString(),
        };

        setMessages(prev => [...prev, loadingMessage]);

        // Send to AI with full chat history and pet data
        const response = await supabase.functions.invoke('chat-with-ai', {
          body: {
            message: t('chat.page.continueChat.message'),
            sessionId: selectedSession.id,
            petId: selectedSession.pet_id || 'none',
            chatHistory: mappedHistory, // Send the full chat history
            userLanguage: currentLanguage,
            // Include pet data for context
            petData: selectedSession.pet_profiles ? {
              name: selectedSession.pet_profiles.name,
              species: selectedSession.pet_profiles.species,
            } : null,
          },
        });

        if (response.error) {
          throw response.error;
        }

        // Remove loading message and add AI response
        setMessages(prev => {
          const withoutLoading = prev.filter(msg => msg.id !== loadingMessage.id);
          return [...withoutLoading, {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: response.data.response,
            created_at: new Date().toISOString(),
          }];
        });

        toast({
          title: t('chat.page.continueChat.success.title'),
          description: t('chat.page.continueChat.success.description'),
        });

        // Increment usage for free users only
        if (!hasActiveSubscription) {
          incrementUsage();
        }

        // Update session timestamp
        await supabase
          .from('chat_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', selectedSession.id);

        // Refresh sessions list to update order
        loadChatSessions();
      } else {
        // If no existing messages, send initial message to AI
        const initialMessage: ChatMessage = {
          id: `temp-${Date.now()}`,
          role: 'user',
          content: t('chat.page.continueChat.message'),
          created_at: new Date().toISOString(),
        };

        // Add the initial message to the UI
        setMessages(prev => [...prev, initialMessage]);

        // Add loading message
        const loadingMessage: ChatMessage = {
          id: `loading-${Date.now()}`,
          role: 'assistant',
          content: `💭 ${t('chat.thinking')}...`,
          created_at: new Date().toISOString(),
        };

        setMessages(prev => [...prev, loadingMessage]);

        // Send to AI with pet data
        const response = await supabase.functions.invoke('chat-with-ai', {
          body: {
            message: t('chat.page.continueChat.message'),
            sessionId: selectedSession.id,
            petId: selectedSession.pet_id || 'none',
            chatHistory: [], // Empty history for new sessions
            userLanguage: currentLanguage,
            // Include pet data for context
            petData: selectedSession.pet_profiles ? {
              name: selectedSession.pet_profiles.name,
              species: selectedSession.pet_profiles.species,
            } : null,
          },
        });

        if (response.error) {
          throw response.error;
        }

        // Remove loading message and add AI response
        setMessages(prev => {
          const withoutLoading = prev.filter(msg => msg.id !== loadingMessage.id);
          return [...withoutLoading, {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: response.data.response,
            created_at: new Date().toISOString(),
          }];
        });

        toast({
          title: t('chat.page.continueChat.success.title'),
          description: t('chat.page.continueChat.success.description'),
        });

        // Increment usage for free users only
        if (!hasActiveSubscription) {
          incrementUsage();
        }

        // Update session timestamp
        await supabase
          .from('chat_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', selectedSession.id);

        // Refresh sessions list to update order
        loadChatSessions();
      }

    } catch (error) {
      console.error('Error continuing chat:', error);

      // Remove loading message if it exists
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('loading-')));

      toast({
        title: t('chat.page.continueChat.error.title'),
        description: t('chat.page.continueChat.error.description'),
        variant: 'destructive',
      });
    } finally {
      setIsContinuingChat(false);
    }
  };

  const createNewSession = async (petId: string) => {
    if (!user) return;

    try {
      const trainerName = assignTrainerForSession();
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: `${t('chat.session.titlePrefix')} ${trainerName}`,
          pet_id: petId !== 'none' ? petId : null
        })
        .select()
        .single();

      if (error) throw error;

      // Add to sessions list and select it
      const newSession = {
        ...data,
        pet_profiles: petId !== 'none' ? pets.find(p => p.id === petId) : undefined
      };

      setSessions(prev => [newSession, ...prev]);
      setSelectedSession(newSession);
      setMessages([]);
      setHasStartedChat(false);
      setSelectedPet(petId);

      toast({
        title: t('chat.page.success.newSession.title'),
        description: t('chat.page.success.newSession.description')
      });
    } catch (error) {
      console.error('Error creating new session:', error);
      toast({
        title: t('chat.page.error.creatingSession.title'),
        description: t('chat.page.error.creatingSession.description'),
        variant: 'destructive'
      });
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedSession || isSending) return;

    // Check if free user has reached limit
    if (!hasActiveSubscription && usage.hasReachedLimit) {
      toast({
        title: t('chat.validation.freeTrialEnded.title'),
        description: t('chat.validation.freeTrialEnded.description'),
        variant: 'destructive'
      });
      return;
    }

    // Set chat as started when first message is sent
    setHasStartedChat(true);

    const userMessage = message.trim();
    setMessage('');
    setIsSending(true);

    // Add user message immediately
    const userMessageObj: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessageObj]);

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: `loading-${Date.now()}`,
      role: 'assistant',
      content: `💭 ${t('chat.thinking')}...`,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, loadingMessage]);

    try {
      const selectedPetData = selectedSession.pet_id && selectedSession.pet_id !== 'none'
        ? selectedSession.pet_profiles
        : null;

      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message: userMessage,
          sessionId: selectedSession.id,
          petId: selectedSession.pet_id || null,
          petProfile: selectedPetData,
          trainerName: selectedSession.title.replace(currentLanguage === 'en' ? 'Chat with ' : 'Chat mit ', ''),
          language: currentLanguage
        }
      });

      if (error) {
        throw new Error(`Edge Function Error: ${error.message || 'Unknown error'}`);
      }

      if (!data || !data.response) {
        throw new Error(t('chat.page.error.noResponse'));
      }

      // Remove loading message and add AI response
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => msg.id !== loadingMessage.id);
        return [...withoutLoading, {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          created_at: new Date().toISOString()
        }];
      });

      // Update session timestamp
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedSession.id);

      // Increment usage for free users only
      if (!hasActiveSubscription) {
        incrementUsage();
      }

      // Refresh sessions list to update order
      loadChatSessions();

    } catch (error: any) {
      console.error('Chat error:', error);

      // Remove loading message and add error message
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => msg.id !== loadingMessage.id);
        return [...withoutLoading, {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: t('chat.page.error.sendingMessage.description'),
          created_at: new Date().toISOString()
        }];
      });

      toast({
        title: t('chat.page.error.sendingMessage.title'),
        description: error.message || t('chat.page.error.sendingMessage.description'),
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
      // Restore focus to input field after sending message
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      // Prevent sending if already processing
      if (isSending) {
        return;
      }

      // Check if free user has reached limit before sending
      if (!hasActiveSubscription && usage.hasReachedLimit) {
        toast({
          title: t('chat.validation.freeTrialEnded.title'),
          description: t('chat.validation.freeTrialEnded.description'),
          variant: 'destructive'
        });
        return;
      }

      sendMessage();
    }
  };

  const handleDeleteClick = (session: ChatSession) => {
    setSessionToDelete(session);
    setDeleteDialogOpen(true);
  };

  const handleCreatePlan = async () => {
    if (!planReason.trim() || !selectedSession || isCreatingPlan || isSending) return;

    setIsCreatingPlan(true);
    const userMessage = `Create plan::${planReason.trim()}`;
    setMessage(userMessage);
    setCreatePlanModalOpen(false);
    setPlanReason('');

    // Add user message immediately
    const userMessageObj: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessageObj]);

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: `loading-${Date.now()}`,
      role: 'assistant',
      content: `💭 ${t('chat.createPlan.modal.loading')}...`,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, loadingMessage]);

    try {
      const selectedPetData = selectedSession.pet_id && selectedSession.pet_id !== 'none'
        ? selectedSession.pet_profiles
        : null;

      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message: userMessage,
          sessionId: selectedSession.id,
          petId: selectedSession.pet_id || null,
          petProfile: selectedPetData,
          trainerName: selectedSession.title.replace(currentLanguage === 'en' ? 'Chat with ' : 'Chat mit ', ''),
          language: currentLanguage
        }
      });

      if (error) {
        throw new Error(`Edge Function Error: ${error.message || 'Unknown error'}`);
      }

      if (!data || !data.response) {
        throw new Error(t('chat.page.error.noResponse'));
      }

      // Remove loading message and add AI response
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => msg.id !== loadingMessage.id);
        return [...withoutLoading, {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          created_at: new Date().toISOString()
        }];
      });

      // Update session timestamp
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedSession.id);

      // Increment usage for free users only
      if (!hasActiveSubscription) {
        incrementUsage();
      }

      // Refresh sessions list to update order
      loadChatSessions();

      setMessage("");

      toast({
        title: t('chat.createPlan.modal.success')
      });

    } catch (error: any) {
      console.error('Plan creation error:', error);

      // Remove loading message and add error message
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => msg.id !== loadingMessage.id);
        return [...withoutLoading, {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: t('chat.createPlan.modal.error'),
          created_at: new Date().toISOString()
        }];
      });

      toast({
        title: t('chat.createPlan.modal.error'),
        description: error.message || t('chat.createPlan.modal.error'),
        variant: 'destructive'
      });
    } finally {
      setIsCreatingPlan(false);
      // Restore focus to input field after creating plan
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const deleteSession = async () => {
    if (!sessionToDelete) return;

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionToDelete.id);

      if (error) throw error;

      setSessions(prev => prev.filter(s => s.id !== sessionToDelete.id));

      if (selectedSession?.id === sessionToDelete.id) {
        setSelectedSession(null);
        setMessages([]);
      }

      toast({
        title: t('chat.page.success.deleteSession.title'),
        description: t('chat.page.success.deleteSession.description')
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: t('chat.page.error.deleteSession.title'),
        description: t('chat.page.error.deleteSession.description'),
        variant: 'destructive'
      });
    } finally {
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleString([], {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } else {
      return date.toLocaleString([], {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Filter sessions based on search query
  const filteredSessions = sessions;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">{t('chat.page.authRequired.title')}</h2>
            <p className="text-muted-foreground mb-4">{t('chat.page.authRequired.description')}</p>
            <Button onClick={() => navigate('/login')}>
              {t('chat.page.authRequired.login')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[100vh] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Page Header */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/mein-tiertraining')}
                className="text-muted-foreground hover:text-foreground p-1.5 sm:p-2 h-8 sm:h-9"
              >
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{t('chat.page.back')}</span>
              </Button>
              <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary flex-shrink-0" />
                <h1 className="text-base sm:text-lg lg:text-xl font-semibold truncate">{t('chat.page.title')}</h1>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
              {/* Theme Toggle */}
              <ThemeToggle
                variant="ghost"
                size="sm"
                className="p-1.5 sm:p-2 h-8 sm:h-9 hover:bg-muted/50 transition-colors"
              />

              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1.5 sm:p-2 h-8 sm:h-9 hover:bg-muted/50 transition-colors"
                  >
                    <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={() => {
                      i18n.changeLanguage('en');
                      localStorage.setItem('language', 'en');
                    }}
                    className={`flex items-center justify-between ${i18n.language === 'en' ? 'bg-muted' : ''}`}
                  >
                    <div className="flex items-center">
                      <span className="text-base mr-2">🇺🇸</span>
                      <span className="text-sm font-medium">English</span>
                    </div>
                    {i18n.language === 'en' && <Check className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      i18n.changeLanguage('de');
                      localStorage.setItem('language', 'de');
                    }}
                    className={`flex items-center justify-between ${i18n.language === 'de' ? 'bg-muted' : ''}`}
                  >
                    <div className="flex items-center">
                      <span className="text-base mr-2">🇩🇪</span>
                      <span className="text-sm font-medium">Deutsch</span>
                    </div>
                    {i18n.language === 'de' && <Check className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-1.5 sm:p-2 h-8 sm:h-9 hover:bg-muted/50 transition-colors"
              >
                {isSidebarOpen ? (
                  <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                ) : (
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6 h-[calc(100vh-7rem)] sm:h-[calc(100vh-8rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 h-full">
          {/* Left Sidebar - Chat History */}
          <div className={`lg:col-span-1 ${isSidebarOpen
            ? 'fixed top-0 left-0 w-[80vw] h-full z-50 lg:relative lg:block lg:w-auto animate-in slide-in-from-left duration-300'
            : 'hidden lg:block'
            }`}>
            <Card className="h-full overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 lg:relative shadow-2xl lg:shadow-none rounded-none lg:rounded-lg">
              {/* Mobile Header */}
              <div className="lg:hidden flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 hover:bg-muted/50 transition-colors"
                  >
                    <X className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <div className="flex items-center space-x-2">
                    <History className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2 className="font-semibold text-lg text-blue-900 dark:text-blue-100">
                      {t('chat.page.history.title')}
                    </h2>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleCreateNewSession}
                  className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Desktop Header */}
              <CardHeader className="pb-4 hidden lg:block">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                    <History className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>{t('chat.page.history.title')}</span>
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={handleCreateNewSession}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-0 flex-1">
                <ScrollArea className="h-[calc(100vh-9rem)] sm:h-[calc(100vh-10rem)] lg:h-[calc(100vh-16rem)]">
                  {isLoadingSessions ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2 text-sm text-muted-foreground">
                        <AnimatedDots text={t('chat.loading.sessions')} />
                      </span>
                    </div>
                  ) : filteredSessions.length === 0 ? (
                    <div className="text-center p-6 sm:p-8 text-muted-foreground">
                      <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm sm:text-base">
                        {t('chat.page.history.empty')}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCreateNewSession}
                        className="mt-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t('chat.page.history.startChat')}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-1 p-2">
                      {filteredSessions.map((session) => (
                        <div
                          key={session.id}
                          className={`group relative p-3 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 ${selectedSession?.id === session.id
                            ? 'bg-primary/10 border border-primary/20 shadow-sm'
                            : 'hover:bg-muted/50 border border-transparent hover:border-border/30'
                            }`}
                          onClick={() => setSelectedSession(session)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-medium text-sm sm:text-sm truncate text-foreground">
                                  {session.title}
                                </h3>
                                {session.pet_profiles && (
                                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                    {session.pet_profiles.name}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(session.updated_at)}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(session);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-6rem)] sm:h-[calc(100vh-7rem)] bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 flex flex-col">
              {!selectedSession ? (
                <div className="flex-1 flex items-center justify-center p-4">
                  <div className="text-center max-w-md">
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      <MessageSquare className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
                      {t('chat.page.welcome.title')}
                    </h2>
                    <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">
                      {t('chat.page.welcome.description')}
                    </p>
                    <Button
                      onClick={handleCreateNewSession}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      size="lg"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      {t('chat.page.history.startChat')}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <CardHeader className="pb-3 sm:pb-4 border-b border-border/50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8 bg-gradient-to-br from-blue-200 to-indigo-200 p-1 py-0.5">
                          <AvatarImage src="/favicon.ico" />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <img src="/favicon.ico" alt="Placeholder" className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base sm:text-lg truncate">{selectedSession.title}</CardTitle>
                          {selectedSession.pet_profiles && (
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              {selectedSession.pet_profiles.name} • {selectedSession.pet_profiles.species}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {selectedSession.pet_profiles && (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2">
                            <div className="flex items-center space-x-2">
                              <PawPrint className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <div className="text-sm">
                                <span className="font-medium text-blue-900 dark:text-blue-100">
                                  {selectedSession.pet_profiles.name}
                                </span>
                                <span className="text-blue-600 dark:text-blue-400 ml-1">
                                  • {selectedSession.pet_profiles.species}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        {/* Show Create Plan button when user can chat (either active chat or new chat ready to start) */}
                        {(hasStartedChat || messages.length === 0) && (
                          <Button
                            onClick={() => setCreatePlanModalOpen(true)}
                            variant="outline"
                            size="sm"
                            disabled={isSending || isCreatingPlan}
                            className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/40 dark:hover:to-emerald-900/40 text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            {isCreatingPlan ? (
                              t('chat.createPlan.modal.loading')
                            ) : (
                              t('chat.createPlan.button')
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full p-3 sm:p-4">
                      {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span className="ml-2 text-sm text-muted-foreground">
                            <AnimatedDots text={t('chat.loading.messages')} />
                          </span>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="text-center py-8 sm:py-12">
                          <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <h3 className="text-base sm:text-lg font-semibold mb-2">{t('chat.page.welcome.title')}</h3>
                          <p className="text-sm sm:text-base text-muted-foreground">{t('chat.page.welcome.description')}</p>
                        </div>
                      ) : (
                        <div className="space-y-3 sm:space-y-4">
                          {messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-2 sm:p-3 ${msg.role === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                                  }`}
                              >
                                <div className="flex items-start space-x-2">
                                  {msg.role === 'user' ? (
                                    <Avatar className="h-6 w-6 sm:h-7 sm:w-7 mt-0.5 flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
                                      <AvatarFallback className="text-xs text-white font-medium bg-gradient-to-br from-blue-500 to-indigo-600">
                                        <User className="h-3 w-3 sm:h-4 sm:w-4" />
                                      </AvatarFallback>
                                    </Avatar>
                                  ) : (
                                    <Avatar className="h-5 w-5 sm:h-6 sm:w-6 mt-0.5 flex-shrink-0 bg-gradient-to-br from-blue-200 to-indigo-200 p-0.5">
                                      <AvatarImage src="/favicon.ico" />
                                      <AvatarFallback className="text-xs">
                                        <img src="/favicon.ico" alt="Placeholder" className="h-3 w-3" />
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs sm:text-sm whitespace-pre-wrap break-words">
                                      {msg.content.startsWith('💭') ? (
                                        <ThinkingAnimation trainerName="Trainer" />
                                      ) : (
                                        <div className="text-xs sm:text-sm whitespace-pre-wrap break-words">{msg.content}</div>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-1 mt-1 text-xs opacity-70">
                                      <Clock className="h-3 w-3" />
                                      <span>{formatDate(msg.created_at)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </ScrollArea>
                  </div>

                  {/* Input Area */}
                  <div className="p-3 sm:p-4 border-t border-border/50">
                    {/* Show limit reached message for free users */}
                    {!hasActiveSubscription && usage.hasReachedLimit && (
                      <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                              {t('chat.freeChatLimit.limitReached.title')}
                            </p>
                            <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                              {t('chat.freeChatLimit.limitReached.description')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {hasStartedChat && messages.length > 0 ? (
                      <div className="flex space-x-2">
                        <Input
                          ref={inputRef}
                          placeholder={!hasActiveSubscription && usage.hasReachedLimit ? t('chat.freeChatLimit.limitReached.inputPlaceholder') : t('chat.page.input.placeholder')}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          disabled={isSending || (!hasActiveSubscription && usage.hasReachedLimit)}
                          className="flex-1 text-sm"
                        />
                        <Button
                          onClick={sendMessage}
                          disabled={!message.trim() || isSending || (!hasActiveSubscription && usage.hasReachedLimit)}
                          className="px-3 sm:px-6"
                        >
                          {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ) : messages.length > 0 ? (
                      // Show Continue Chat button only when there are existing messages
                      <div className="text-center">
                        <Button
                          onClick={continueChat}
                          disabled={isContinuingChat || (!hasActiveSubscription && usage.hasReachedLimit)}
                          className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                          size="lg"
                        >
                          {isContinuingChat ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              <AnimatedDots text={t('chat.page.continueChat.loading')} />
                            </>
                          ) : (
                            <>
                              <MessageSquare className="h-5 w-5 mr-2" />
                              {t('chat.page.continueChat.button')}
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          {t('chat.page.continueChat.description')}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {t('chat.page.continueChat.createPlanHint')}
                        </p>
                      </div>
                    ) : (
                      // Show normal input for new chats (no existing messages)
                      <div className="flex space-x-2">
                        <Input
                          ref={inputRef}
                          placeholder={!hasActiveSubscription && usage.hasReachedLimit ? t('chat.freeChatLimit.limitReached.inputPlaceholder') : t('chat.page.input.placeholder')}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          disabled={isSending || (!hasActiveSubscription && usage.hasReachedLimit)}
                          className="flex-1 text-sm"
                        />
                        <Button
                          onClick={sendMessage}
                          disabled={!message.trim() || isSending || (!hasActiveSubscription && usage.hasReachedLimit)}
                          className="px-3 sm:px-6"
                        >
                          {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile overlay for sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-all duration-300 ease-in-out"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t('chat.page.confirm.deleteSession.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              {sessionToDelete && (
                <div className="space-y-3">
                  <p>{t('chat.page.confirm.deleteSession.description')}</p>
                  <div className="bg-muted/50 p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{sessionToDelete.title}</span>
                    </div>
                    {sessionToDelete.pet_profiles && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {sessionToDelete.pet_profiles.name} • {sessionToDelete.pet_profiles.species}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(sessionToDelete.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-muted-foreground/20 hover:bg-muted/50">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteSession}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pet Selection Modal */}
      <Dialog open={petSelectionOpen} onOpenChange={setPetSelectionOpen}>
        <DialogContent className="max-w-md rounded-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PawPrint className="h-5 w-5 text-blue-600" />
              {t('chat.petSelection.title')}
            </DialogTitle>
            <DialogDescription>
              {t('chat.petSelection.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => {
                  createNewSession(pet.id);
                  setPetSelectionOpen(false);
                }}
                className="w-full p-4 text-left border border-border rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center">
                      <PawPrint className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {pet.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {pet.species}
                      {pet.breed && ` • ${pet.breed}`}
                      {pet.age && ` • ${pet.age} ${t('common.years')} ${t('common.old')}`}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={false} onOpenChange={() => { }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              {t('chat.settings.title')}
            </DialogTitle>
            <DialogDescription>
              {t('chat.settings.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6">
                {/* Chat Preferences */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <h3 className="font-semibold text-sm">{t('chat.settings.chatPreferences.title')}</h3>
                  </div>

                  <div className="space-y-4 pl-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">
                          {t('chat.settings.chatPreferences.autoScroll.title')}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {t('chat.settings.chatPreferences.autoScroll.description')}
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">
                          {t('chat.settings.chatPreferences.typingIndicator.title')}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {t('chat.settings.chatPreferences.typingIndicator.description')}
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">
                          {t('chat.settings.chatPreferences.messageSound.title')}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {t('chat.settings.chatPreferences.messageSound.description')}
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* AI Preferences */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-green-600" />
                    <h3 className="font-semibold text-sm">{t('chat.settings.aiPreferences.title')}</h3>
                  </div>

                  <div className="space-y-4 pl-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">
                          {t('chat.settings.aiPreferences.detailedResponses.title')}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {t('chat.settings.aiPreferences.detailedResponses.description')}
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">
                          {t('chat.settings.aiPreferences.autoPlanCreation.title')}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {t('chat.settings.aiPreferences.autoPlanCreation.description')}
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">
                          {t('chat.settings.aiPreferences.contextMemory.title')}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {t('chat.settings.aiPreferences.contextMemory.description')}
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Privacy & Data */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-orange-600" />
                    <h3 className="font-semibold text-sm">{t('chat.settings.privacy.title')}</h3>
                  </div>

                  <div className="space-y-4 pl-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">
                          {t('chat.settings.privacy.chatHistory.title')}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {t('chat.settings.privacy.chatHistory.description')}
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">
                          {t('chat.settings.privacy.analytics.title')}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {t('chat.settings.privacy.analytics.description')}
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Session Management */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-purple-600" />
                    <h3 className="font-semibold text-sm">{t('chat.settings.sessionManagement.title')}</h3>
                  </div>

                  <div className="space-y-4 pl-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">
                          {t('chat.settings.sessionManagement.autoSave.title')}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {t('chat.settings.sessionManagement.autoSave.description')}
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">
                          {t('chat.settings.sessionManagement.sessionLimit.title')}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {t('chat.settings.sessionManagement.sessionLimit.description')}
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => { }}>
                {t('common.cancel')}
              </Button>
              <Button onClick={() => { }}>
                {t('common.save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Plan Modal */}
      <Dialog open={createPlanModalOpen} onOpenChange={setCreatePlanModalOpen}>
        <DialogContent className="max-w-2xl rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              {t('chat.createPlan.modal.title')}
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed text-muted-foreground">
              {t('chat.createPlan.modal.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Professional description with icons */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg flex-shrink-0">
                  <PawPrint className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                    Professional Training Plan Creation
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Our expert trainers will create a personalized training plan tailored to your pet's specific needs, behavior, and learning style. Be as detailed as possible to get the best results.
                  </p>
                </div>
              </div>
            </div>

            {/* Input field */}
            <div className="space-y-3">
              <Label htmlFor="plan-reason" className="text-sm font-medium">
                What would you like to train your pet for?
              </Label>
              <textarea
                id="plan-reason"
                value={planReason}
                onChange={(e) => setPlanReason(e.target.value)}
                placeholder={t('chat.createPlan.modal.placeholder')}
                className="w-full min-h-[120px] p-4 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all duration-200"
                disabled={isCreatingPlan || isSending}
              />
              <p className="text-xs text-muted-foreground">
                Be specific about the behavior, skill, or goal you want to achieve. The more details you provide, the better your training plan will be.
              </p>
            </div>

            {/* Example suggestions */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                <Check className="h-4 w-4" />
                Example Training Goals
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 dark:text-green-300">Basic obedience commands</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 dark:text-green-300">Leash training</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 dark:text-green-300">Behavior modification</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 dark:text-green-300">Socialization skills</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 dark:text-green-300">Trick training</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 dark:text-green-300">Problem solving</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setCreatePlanModalOpen(false);
                setPlanReason('');
              }}
              disabled={isCreatingPlan}
              className="border-muted-foreground/20 hover:bg-muted/50"
            >
              {t('chat.createPlan.modal.cancelButton')}
            </Button>
            <Button
              onClick={handleCreatePlan}
              disabled={!planReason.trim() || isCreatingPlan || isSending}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isCreatingPlan ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <AnimatedDots text={t('chat.createPlan.modal.loading')} />
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  {t('chat.createPlan.modal.createButton')}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};