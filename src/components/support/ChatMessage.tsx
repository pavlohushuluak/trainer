
import React from 'react';

interface Message {
  id: string;
  sender_type: 'user' | 'ai' | 'admin';
  sender_id: string | null;
  message: string;
  message_type: string;
  created_at: string;
  metadata?: any;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div
      className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          message.sender_type === 'user'
            ? 'bg-primary text-primary-foreground'
            : message.message_type === 'system'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
            : 'bg-muted'
        }`}
      >
        <div className="whitespace-pre-wrap text-sm">
          {message.message}
        </div>
        <div className="text-xs opacity-70 mt-1">
          {new Date(message.created_at).toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
};
