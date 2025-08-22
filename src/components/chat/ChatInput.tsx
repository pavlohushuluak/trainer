
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useRef, useEffect } from "react";

interface ChatInputProps {
  message: string;
  loading: boolean;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  placeholder?: string;
}

export const ChatInput = ({ 
  message, 
  loading, 
  onMessageChange, 
  onSendMessage, 
  onKeyPress,
  placeholder
}: ChatInputProps) => {
  const { t } = useTranslations();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Maintain focus after sending message
  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);
  
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
    } else {
      onKeyPress(e);
    }
  };
  
  return (
    <div className="flex gap-2">
      <Input
        ref={inputRef}
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder || t('chat.chatInput.placeholder')}
        disabled={loading}
        className="flex-1"
        autoFocus
      />
      <Button onClick={handleSendMessage} disabled={loading || !message.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};
