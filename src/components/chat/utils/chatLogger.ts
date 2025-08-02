
// Centralized chat logging with admin page detection
export const chatLogger = {
  log: (message: string, data?: any) => {
    // Skip logging on admin pages to reduce console spam
    if (window.location.pathname.includes('/admin')) {
      return;
    }
    
    // Only log important chat events, not every state change
    if (message.includes('Chat Logic State') || message.includes('effect triggered')) {
      return;
    }
    
  },
  
  error: (message: string, error?: any) => {
  },
  
  warn: (message: string, data?: any) => {

  }
};
