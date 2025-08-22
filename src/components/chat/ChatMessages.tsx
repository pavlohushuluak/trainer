
import { useRef, useEffect, memo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChatMessage } from "./ChatMessage";
import { ThinkingAnimation } from "./ThinkingAnimation";
import { useTranslations } from "@/hooks/useTranslations";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ChatMessagesProps {
  messages: Message[];
  loading: boolean;
  selectedPetName: string | null;
  trainerName: string;
}

export const ChatMessages = memo(({ messages, loading, selectedPetName, trainerName }: ChatMessagesProps) => {
  const { t } = useTranslations();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const EmptyState = () => (
    <div className="text-center text-muted-foreground py-8">
      <Avatar className="h-16 w-16 mx-auto mb-4 bg-white p-2 px-3">
        <AvatarImage src="/favicon.ico" alt={trainerName} />
        <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
          {trainerName.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>
      <p className="text-lg">{t('chat.messages.emptyState.greeting')} <strong>{trainerName}</strong></p>
      <p>{t('chat.messages.emptyState.trainer')}</p>
      {selectedPetName ? (
        <p className="mt-2">{t('chat.messages.emptyState.trainingWith')} <strong>{selectedPetName}</strong>!</p>
      ) : (
        <p className="mt-2">{t('chat.messages.emptyState.generalAdvice')}</p>
      )}
    </div>
  );

  const LoadingIndicator = () => (
    <ThinkingAnimation trainerName={trainerName} />
  );

  return (
    <ScrollArea className="h-full w-full">
      <div className="space-y-4 p-4">
        {messages.length === 0 && !loading ? (
          <EmptyState />
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} trainerName={trainerName} />
            ))}
            {loading && <LoadingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
});

ChatMessages.displayName = 'ChatMessages';
