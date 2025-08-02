
// Admin-specific logging utility to reduce console spam
export const adminLogger = {
  log: (message: string, data?: any) => {
    // Only log important admin events
    if (message.includes('Test') || message.includes('Error') || message.includes('Success')) {
    }
  },
  
  error: (message: string, error?: any) => {
  },
  
  success: (message: string, data?: any) => {
  }
};
