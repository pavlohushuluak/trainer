
import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

interface ChatInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
}

export const ChatInput = ({ 
  newMessage, 
  setNewMessage, 
  onSendMessage, 
  isLoading 
}: ChatInputProps) => {
  const { t } = useTranslations();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Maintain focus after sending message
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);
  
  const handleSendMessage = () => {
    onSendMessage();
    // Focus input after sending
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-4">
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          placeholder={t('support.chatInput.placeholder')}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          className="flex-1"
          autoFocus
        />
        <Button
          onClick={handleSendMessage}
          disabled={isLoading || !newMessage.trim()}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        {t('support.chatInput.helpMessage')} ❤️
      </p>
    </div>
  );
};
