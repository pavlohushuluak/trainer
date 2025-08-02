
import { useState } from "react";

export const useChatTracking = () => {
  const [chatStarted, setChatStarted] = useState(false);

  const trackChatStart = () => {
    // Only track in production, not on admin pages
    if (typeof window !== 'undefined' && 
        window.dataLayer && 
        !window.location.pathname.includes('/admin')) {
      window.dataLayer.push({ event: 'start_chat' });
    }
  };

  return {
    chatStarted,
    setChatStarted,
    trackChatStart
  };
};
