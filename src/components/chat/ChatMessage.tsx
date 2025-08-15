
import { User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "@/hooks/useTranslations";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ChatMessageProps {
  message: Message;
  trainerName?: string;
}

const formatMessage = (content: string, t: any) => {
  // Highlight plan creation confirmation for both German and English
  let formattedContent = content
    // German plan creation message
    .replace(/✅\s\*\*Trainingsplan erfolgreich erstellt!\*\*/g, 
      `<span class="text-green-600 font-semibold">${t('chat.messages.message.planCreated')}</span>`)
    // English plan creation message
    .replace(/✅\s\*\*Training Plan Successfully Created!\*\*/g, 
      `<span class="text-green-600 font-semibold">${t('chat.messages.message.planCreated')}</span>`);

  // Format bold text
  formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  return formattedContent;
};

export const ChatMessage = ({ message, trainerName }: ChatMessageProps) => {
  const { user } = useAuth();
  const { t } = useTranslations();
  
  // Use translated default names
  const defaultTrainerName = trainerName || t('chat.messages.message.defaultTrainerName');
  
  // Hole den Namen des Users (falls verfügbar)
  const userName = user?.user_metadata?.first_name || 
                   user?.user_metadata?.name || 
                   user?.email?.split('@')[0] || 
                   t('chat.messages.message.defaultUserName');

  return (
    <div className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {message.role === 'assistant' && (
        <div className="flex-shrink-0">
          <Avatar className="h-6 w-6 bg-white p-1">
            <AvatarImage src="/favicon.ico" alt={defaultTrainerName} />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
              {defaultTrainerName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          message.role === 'user'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {message.role === 'user' && (
          <div className="text-xs opacity-75 mb-1">{userName}</div>
        )}
        <div 
          className="text-sm whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: formatMessage(message.content, t) }}
        />
      </div>
      {message.role === 'user' && (
        <div className="flex-shrink-0">
          <User className="h-6 w-6 text-blue-600" />
        </div>
      )}
    </div>
  );
};
