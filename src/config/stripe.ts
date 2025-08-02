// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: 'pk_test_51RZGy3RAqWgk7sOJnxUYHoSIPAZhTFxDnTSI0mkyN77L3cRdce3djEXTUUQzfFAuzSJmjhzifuLhWMJCoYJgxJH100AyFUvtkf',
  
  // Price configurations
  prices: {
    monthly: {
      amount: 999, // €9.99 in cents
      currency: 'eur',
      interval: 'month'
    },
    yearly: {
      amount: 8900, // €89.00 in cents
      currency: 'eur',
      interval: 'year'
    }
  }
} as const;