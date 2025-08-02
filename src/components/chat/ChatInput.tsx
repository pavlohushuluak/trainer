
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

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
  placeholder = "💬 Ihre Frage an den Tiertrainer..."
}: ChatInputProps) => {
  return (
    <div className="flex gap-2">
      <Input
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        disabled={loading}
        className="flex-1"
      />
      <Button onClick={onSendMessage} disabled={loading || !message.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};
